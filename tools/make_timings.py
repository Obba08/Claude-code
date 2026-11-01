"""Builds the word timings file a video needs from the script and a transcript.

Usage: python3 tools/make_timings.py script.md transcript_words.json out.timings.json [audio] [voice] [model]

- The narration text comes from section "## 1. Narration" of the script (numbered sentences),
  so the timings always use the script's exact words, punctuation and sentence numbers.
- Start/end times come from the transcript (ElevenLabs speech-to-text words.json).
- Words are matched in order; where the transcript splits or joins words differently
  ("open-heart" vs "open heart"), times are shared or interpolated.
"""
import difflib
import json
import re
import sys

script_md, words_json, out = sys.argv[1:4]
audio = sys.argv[4] if len(sys.argv) > 4 else 'audio/narration.mp3'
voice = sys.argv[5] if len(sys.argv) > 5 else ''
model = sys.argv[6] if len(sys.argv) > 6 else ''

narr = open(script_md).read().split('## 1. Narration')[1].split('\n## ')[0]
sentences = [m.group(2).strip() for m in re.finditer(r'^(\d+)\. (.+)$', narr, re.M)]

spoken = [w for w in json.load(open(words_json))['words'] if w.get('type', 'word') == 'word']
norm = lambda s: re.sub(r"[^a-z0-9']", '', s.lower())


def pieces(word):
    """Split on hyphens so 'open-heart' can match 'open' + 'heart'."""
    return [p for p in re.split(r'-', word) if norm(p)]


# Flatten both sides into hyphen-free pieces, remembering which word each piece came from.
sp, sp_of = [], []
for i, w in enumerate(spoken):
    for p in pieces(w['text']):
        sp.append(norm(p))
        sp_of.append(i)
words = []  # script words
sc, sc_of = [], []
for n, s in enumerate(sentences, 1):
    for t in s.split():
        words.append({'i': len(words), 'text': t, 'sentence': n})
        for p in pieces(t):
            sc.append(norm(p))
            sc_of.append(len(words) - 1)

match = {}  # script piece -> spoken piece
for a, b, size in difflib.SequenceMatcher(None, sc, sp, autojunk=False).get_matching_blocks():
    for k in range(size):
        match[a + k] = b + k

# Each script word: start of its first matched piece, end of its last.
for wi, w in enumerate(words):
    ps = [k for k, o in enumerate(sc_of) if o == wi]
    hits = [match[k] for k in ps if k in match]
    if hits:
        w['start'] = spoken[sp_of[hits[0]]]['start']
        w['end'] = spoken[sp_of[hits[-1]]]['end']
unmatched = [w['text'] for w in words if 'start' not in w]
# Fill any gaps by interpolating between neighbours.
for wi, w in enumerate(words):
    if 'start' in w:
        continue
    prev = next((words[j] for j in range(wi - 1, -1, -1) if 'start' in words[j]), None)
    nxt = next((words[j] for j in range(wi + 1, len(words)) if 'start' in words[j]), None)
    a = prev['end'] if prev else 0.0
    b = nxt['start'] if nxt else a + 0.4
    w['start'], w['end'] = a, max(a + 0.05, b)

out_sentences, i = [], 0
for n, s in enumerate(sentences, 1):
    count = len(s.split())
    ws = words[i:i + count]
    out_sentences.append({'n': n, 'text': s, 'start': ws[0]['start'], 'end': ws[-1]['end'], 'firstWord': i})
    i += count

result = {
    'audio': audio,
    'voice': voice,
    'model': model,
    'duration': round(spoken[-1]['end'] + 0.3, 3),
    'sentences': out_sentences,
    'words': [{'i': w['i'], 'text': w['text'], 'start': round(w['start'], 3), 'end': round(w['end'], 3)} for w in words],
}
json.dump(result, open(out, 'w'), indent=1)
print(f'{len(sentences)} sentences, {len(words)} words, duration {result["duration"]}s -> {out}')
print('words not found in transcript (interpolated):', unmatched or 'none')
