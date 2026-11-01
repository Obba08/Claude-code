"""Cuts short social clips (9:16) out of the finished video, with a hook line baked in at the top.

Usage: python3 tools/make_clips.py
Each clip runs from the start of one sentence to the end of another (word timings), with a short
fade in and out. The hook shows for the first few seconds, inside the top safe area.
Output: out/social/<name>.mp4 (1080x1920, 30 fps, H.264 + AAC).
"""
import json
import os
import subprocess

SRC = 'out/video.mp4'
FONT = 'public/fonts/ttf/Inter-Bold.ttf'
timings = json.load(open(subprocess.check_output(['node', 'tools/active.mjs'], text=True).strip()))
S = timings['sentences']

CLIPS = [
    # name, first sentence, last sentence, hook lines
    ('clip1_born-with-a-hole', 17, 26, ['EVERYONE IS BORN WITH', 'A HOLE IN THEIR HEART']),
    ('clip2_same-blood-twice', 45, 51, ['WHAT A HOLE IN THE HEART', 'DOES TO YOUR BLOOD']),
    ('clip3_no-open-chest', 76, 81, ['CLOSING A HEART HOLE', 'WITHOUT OPENING THE CHEST']),
]
HOOK_SECONDS = 3.6
os.makedirs('out/social', exist_ok=True)


def esc(t):
    return t.replace("'", "\\'").replace(':', '\\:')


for name, a, b, hook in CLIPS:
    start = max(0, S[a - 1]['start'] - 0.35)
    end = S[b - 1]['end'] + 0.9
    dur = end - start
    # Hook: fades in over 0.3 s, out over 0.4 s; parchment box behind it for readability.
    alpha = f"if(lt(t,0.3),t/0.3,if(lt(t,{HOOK_SECONDS - 0.4}),1,max(0,({HOOK_SECONDS}-t)/0.4)))"
    draws = []
    for i, line in enumerate(hook):
        draws.append(
            f"drawtext=fontfile={FONT}:text='{esc(line)}':fontsize=54:fontcolor=0x2c2925:"
            f"box=1:boxcolor=0xefe6d4@1.0:boxborderw=22:x=(w-text_w)/2:y={210 + i * 92}:"
            f"alpha='{alpha}':enable='lt(t,{HOOK_SECONDS})'"
        )
    vf = ','.join(draws + [f'fade=t=in:st=0:d=0.4', f'fade=t=out:st={dur - 0.6:.2f}:d=0.6', 'fps=30'])
    af = f'afade=t=in:st=0:d=0.3,afade=t=out:st={dur - 0.6:.2f}:d=0.6'
    out = f'out/social/{name}.mp4'
    subprocess.run(
        ['ffmpeg', '-v', 'error', '-y', '-ss', f'{start:.3f}', '-i', SRC, '-t', f'{dur:.3f}', '-vf', vf, '-af', af,
         '-c:v', 'libx264', '-preset', 'slow', '-crf', '20', '-pix_fmt', 'yuv420p', '-c:a', 'aac', '-b:a', '160k',
         '-movflags', '+faststart', out],
        check=True,
    )
    size = os.path.getsize(out) / 1e6
    print(f'{out}  {dur:.1f}s  {size:.1f} MB  (sentences {a}-{b})')
