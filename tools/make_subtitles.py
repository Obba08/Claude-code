# Builds subtitles from the word timings: out/subtitles.srt (plain) and out/subtitles.ass (styled, burned in).
# Each caption is a short phrase (max ~30 characters), split at commas where possible,
# shown from its first word to just before the next caption, so it follows the voice exactly.
import json
import os
import sys

# Usage: python3 tools/make_subtitles.py [vertical|square]
FMT = sys.argv[1] if len(sys.argv) > 1 else 'vertical'
LAYOUT = {
    'vertical': dict(w=1080, h=1920, size=54, margin_v=372, outline=7, out='out/subtitles'),
    'square': dict(w=1080, h=1080, size=46, margin_v=62, outline=6, out='out/subtitles-square'),
}[FMT]

MAX_CHARS = 30  # per caption line
t = json.load(open(__import__('subprocess').check_output(['node', 'tools/active.mjs'], text=True).strip()))
words = t['words']

captions = []  # (start, end, text)
from itertools import combinations


def best_split(ws):
    """Split a sentence into evenly sized phrases (no lone words), preferring breaks after commas."""
    text_of = lambda part: ' '.join(x['text'] for x in part)
    total = len(text_of(ws))
    n_min = max(1, -(-total // MAX_CHARS))
    best = None
    for n in range(n_min, n_min + 2):
        target = total / n
        for cuts in combinations(range(1, len(ws)), n - 1):
            parts = [ws[a:b] for a, b in zip((0,) + cuts, cuts + (len(ws),))]
            lens = [len(text_of(p)) for p in parts]
            if max(lens) > MAX_CHARS + 3 or min(len(p) for p in parts) < 2:
                continue
            cost = sum((l - target) ** 2 for l in lens) + 400 * (n - n_min)
            cost -= sum(250 for p in parts[:-1] if p[-1]['text'].endswith(','))
            if best is None or cost < best[0]:
                best = (cost, parts)
    return best[1] if best else [ws]


for s in t['sentences']:
    n = len(s['text'].split())
    ws = words[s['firstWord']:s['firstWord'] + n]
    for part in best_split(ws):
        captions.append([part[0]['start'], part[-1]['end'], ' '.join(x['text'] for x in part)])

# Extend each caption until the next one starts (max +0.6 s), never overlapping.
for i, c in enumerate(captions):
    nxt = captions[i + 1][0] if i + 1 < len(captions) else c[1] + 0.8
    c[1] = min(max(c[1] + 0.25, c[1]), nxt - 0.02, c[1] + 0.6) if nxt - c[1] > 0.02 else c[1]

def srt_time(x):
    ms = int(round(x * 1000))
    return f'{ms // 3600000:02}:{ms // 60000 % 60:02}:{ms // 1000 % 60:02},{ms % 1000:03}'

def ass_time(x):
    cs = int(round(x * 100))
    return f'{cs // 360000}:{cs // 6000 % 60:02}:{cs // 100 % 60:02}.{cs % 100:02}'

os.makedirs('out', exist_ok=True)
with open(LAYOUT['out'] + '.srt', 'w') as f:
    for i, (a, b, text) in enumerate(captions, 1):
        f.write(f'{i}\n{srt_time(a)} --> {srt_time(b)}\n{text}\n\n')

# Dark ink text with a soft white halo (matches the labels), sitting just above the bottom 18% safe band.
ass = """[Script Info]
ScriptType: v4.00+
PlayResX: {w}
PlayResY: {h}
WrapStyle: 2
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Sub,Inter,{size},&H001F1D1D,&H001F1D1D,&H00FFFFFF,&H00FFFFFF,-1,0,0,0,100,100,0.5,0,1,{outline},0,2,80,80,{margin_v},1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
""".format(**LAYOUT)
for a, b, text in captions:
    # soft halo + a short fade so captions never pop
    ass += f'Dialogue: 0,{ass_time(a)},{ass_time(b)},Sub,,0,0,0,,{{\\blur4\\fad(120,120)}}{text}\n'
open(LAYOUT['out'] + '.ass', 'w').write(ass)
print(len(captions), 'captions; longest:', max(len(c[2]) for c in captions), 'chars')
for c in captions[:8]:
    print(f'{c[0]:6.2f}-{c[1]:6.2f}  {c[2]}')
