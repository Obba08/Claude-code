# Builds src/data/timings.json (every word and sentence with start/end seconds).
#
#   python3 tools/timings.py estimate
#       No voice yet: estimates a natural reading pace from the narration in script.md,
#       so the animation can be built and checked before the voice exists.
#
#   python3 tools/timings.py words <words.json> <audio-file>
#       Real voice: takes the word list from a transcription (ElevenLabs Scribe "words":
#       [{text, start, end}, ...]) and lines it up with the script word for word, so the
#       sentence and word text always match the script exactly.
import json
import re
import subprocess
import sys

OUT = 'src/data/timings.json'


def script_sentences():
    text = open('script.md').read()
    part = text.split('## 1. Narration', 1)[1].split('\n---', 1)[0]
    paras = [p.strip() for p in part.split('\n\n') if p.strip() and not p.strip().startswith('(')]
    # One "sentence" per narration line, so the numbers match the shot list.
    return [p.replace('\n', ' ') for p in paras]


def build(sentences, word_times, duration, meta):
    words, out_sentences, i = [], [], 0
    for n, s in enumerate(sentences, 1):
        ws = s.split()
        first = i
        for wtext in ws:
            a, b = word_times[i]
            words.append({'i': i, 'text': wtext, 'start': round(a, 3), 'end': round(b, 3)})
            i += 1
        out_sentences.append({'n': n, 'text': s, 'start': words[first]['start'], 'end': words[-1]['end'], 'firstWord': first})
    data = {**meta, 'duration': round(duration, 3), 'sentences': out_sentences, 'words': words}
    json.dump(data, open(OUT, 'w'), indent=1)
    print(f'{OUT}: {len(out_sentences)} sentences, {len(words)} words, {duration:.2f}s')


def estimate():
    sentences = script_sentences()
    t, times = 0.35, []
    for s in sentences:
        ws = s.split()
        for k, wtext in enumerate(ws):
            core = re.sub(r'[^A-Za-z0-9]', '', wtext)
            d = 0.09 + 0.05 * len(core)
            times.append((t, t + d))
            t += d + 0.045
            if wtext.endswith(','):
                t += 0.22
            elif wtext.endswith('.') and k < len(ws) - 1:
                t += 0.34
        t += 0.5  # pause between sentences
    build(sentences, times, t - 0.3, {'audio': '', 'voice': 'ESTIMATED (no voice yet)', 'estimated': True})


norm = lambda s: re.sub(r'[^a-z0-9]', '', s.lower())


def from_words(words_file, audio):
    sentences = script_sentences()
    raw = json.load(open(words_file))
    raw = raw.get('words', raw) if isinstance(raw, dict) else raw
    heard = [w for w in raw if w.get('type', 'word') == 'word' and norm(w['text'])]
    script_words = [w for s in sentences for w in s.split()]
    # Align by sequence matching on normalised words; fill any gaps by interpolation.
    import difflib
    a = [norm(w) for w in script_words]
    b = [norm(w['text']) for w in heard]
    times = [None] * len(a)
    for blk in difflib.SequenceMatcher(None, a, b, autojunk=False).get_matching_blocks():
        for k in range(blk.size):
            h = heard[blk.b + k]
            times[blk.a + k] = (float(h['start']), float(h['end']))
    missing = [script_words[k] for k, v in enumerate(times) if v is None]
    for k, v in enumerate(times):
        if v is None:
            prev = next((times[j][1] for j in range(k - 1, -1, -1) if times[j]), 0.0)
            nxt = next((times[j][0] for j in range(k + 1, len(times)) if times[j]), prev + 0.3)
            times[k] = (prev, max(prev + 0.05, nxt))
    dur = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', audio]))
    rel = audio.split('public/', 1)[-1]
    build(sentences, times, dur, {'audio': rel, 'estimated': False})
    print('words not heard (interpolated):', missing or 'none')


if __name__ == '__main__':
    if sys.argv[1] == 'estimate':
        estimate()
    else:
        from_words(sys.argv[2], sys.argv[3])
