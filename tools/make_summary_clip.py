"""Builds one short version of the full video that keeps the whole message, for TikTok / Reels.

Usage: python3 tools/make_summary_clip.py [full|90s]
  full: about 2:20 at normal speed.  90s: a few repeating sentences dropped, played 1.3x faster.
Picks whole sentences from across the video (so the voice and subtitles stay intact), joins them
with short soft crossfades, puts a hook at the start and a small heading at the start of each part.
Output: out/social/summary_<name>.mp4 (1080x1920, 30 fps).
"""
import json
import os
import subprocess
import tempfile

SRC = 'out/video.mp4'
FONT = 'public/fonts/ttf/Inter-Bold.ttf'
NAME = 'hole-in-the-heart'
VARIANT = __import__('sys').argv[1] if len(__import__('sys').argv) > 1 else 'full'
S = json.load(open(subprocess.check_output(['node', 'tools/active.mjs'], text=True).strip()))['sentences']

# (sentence, heading shown when this sentence starts)
PLAN = [
    (1, None), (3, None), (4, None),
    (28, 'WHAT IT IS'),
    (36, 'WHY IT HAPPENS'), (37, None), (43, None),
    (45, 'WHAT IT DOES'), (46, None), (49, None), (51, None), (52, None),
    (61, 'HOW DOCTORS FIND IT'), (64, None),
    (70, 'HOW IT IS TREATED'), (75, None), (77, None), (78, None), (79, None), (80, None), (82, None), (84, None), (87, None),
    # No heading for prevention: the video already shows 'PREVENTION' at this point.
    (88, None), (89, None), (91, None), (92, None), (93, None), (94, None),
    (105, None), (106, None),
]
HOOK = ['A HOLE IN THE HEART,', 'EXPLAINED SIMPLY']
SPEED = 1.0
if VARIANT == '90s':
    # Drop sentences whose point is already made elsewhere, then speed up gently.
    drop = {80, 88, 89, 37, 93}
    PLAN = [(n, h) for n, h in PLAN if n not in drop]
    PLAN = [(n, 'PREVENTION' if n == 91 else h) for n, h in PLAN]  # the video's own heading was in a dropped sentence
    SPEED = 1.3
    NAME += '_90s'
XF = 0.3  # crossfade length
PAD_IN, PAD_OUT = (0.1, 0.2) if VARIANT == '90s' else (0.12, 0.25)

tmp = tempfile.mkdtemp(dir=os.environ.get('TMPDIR', 'out'))
segs = []
for i, (n, _) in enumerate(PLAN):
    s = S[n - 1]
    start = max(0, s['start'] - PAD_IN)
    dur = s['end'] + PAD_OUT - start
    f = os.path.join(tmp, f'seg{i:02}.mp4')
    subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{start:.3f}', '-t', f'{dur:.3f}', '-i', SRC,
                    '-vf', f'setpts=PTS/{SPEED}', '-af', f'atempo={SPEED}', '-r', '30',
                    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '14', '-c:a', 'pcm_s16le', '-ar', '48000', f], check=True)
    real = float(subprocess.check_output(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]))
    segs.append((f, real))

# Where each segment starts in the joined clip (each crossfade overlaps XF seconds).
starts, t = [], 0.0
for k, (_, d) in enumerate(segs):
    starts.append(t)
    t += d - XF
total = t + XF

inputs = sum((['-i', f] for f, _ in segs), [])
fc, v, a = [], '0:v', '0:a'
for k in range(1, len(segs)):
    off = starts[k]
    fc.append(f'[{v}][{k}:v]xfade=transition=fade:duration={XF}:offset={off:.3f}[v{k}]')
    fc.append(f'[{a}][{k}:a]acrossfade=d={XF}:c1=tri:c2=tri[a{k}]')
    v, a = f'v{k}', f'a{k}'


def esc(x):
    return x.replace("'", "\\'").replace(':', '\\:')


def text(line, y, t0, t1, size):
    al = f"if(lt(t,{t0}+0.3),(t-{t0})/0.3,if(lt(t,{t1}-0.4),1,max(0,({t1}-t)/0.4)))"
    return (f"drawtext=fontfile={FONT}:text='{esc(line)}':fontsize={size}:fontcolor=0x2c2925:box=1:boxcolor=0xefe6d4@1.0:"
            f"boxborderw=22:x=(w-text_w)/2:y={y}:alpha='{al}':enable='between(t,{t0},{t1})'")


draws = [text(line, 210 + i * 92, 0, 3.8, 54) for i, line in enumerate(HOOK)]
for (n, head), st in zip(PLAN, starts):
    if head:
        draws.append(text(head, 210, st + 0.1, st + 2.6, 46))
fc.append(f"[{v}]{','.join(draws)},fade=t=in:st=0:d=0.4,fade=t=out:st={total - 0.6:.2f}:d=0.6,format=yuv420p[vout]")
fc.append(f'[{a}]afade=t=in:st=0:d=0.3,afade=t=out:st={total - 0.6:.2f}:d=0.6[aout]')

os.makedirs('out/social', exist_ok=True)
out = f'out/social/summary_{NAME}.mp4'
subprocess.run(['ffmpeg', '-v', 'error', '-y', *inputs, '-filter_complex', ';'.join(fc), '-map', '[vout]', '-map', '[aout]',
                '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-c:a', 'aac', '-b:a', '160k', '-movflags', '+faststart', out],
               check=True)
for f, _ in segs:
    os.remove(f)
os.rmdir(tmp)
print(f'{out}  {total:.1f}s  {os.path.getsize(out) / 1e6:.1f} MB  ({len(segs)} sentences)')
for (n, head), st in zip(PLAN, starts):
    if head:
        print(f'  {int(st // 60)}:{st % 60:04.1f}  {head}')
