# Tiles the check stills into sheets (with safe-area guides) so they are quick to review.
import glob, json, os, sys
from PIL import Image, ImageDraw
fps = int(os.environ.get('FPS', 60))
src = os.environ.get('STILLS', 'out/stills')
sheets = os.environ.get('SHEETS', 'out/sheets')
t = json.load(open('src/data/timings.json'))
starts = {round(s['start'] * fps): s['n'] for s in t['sentences']}
files = sorted(glob.glob(src + '/f*.jpeg'))
lo = float(sys.argv[1]) if len(sys.argv) > 1 else 0
hi = float(sys.argv[2]) if len(sys.argv) > 2 else 1e9
files = [f for f in files if lo <= int(os.path.basename(f)[1:6]) / fps <= hi]
first = Image.open(files[0]) if files else None
cols, rows, W = 6, 2, 300
H = int(W * first.height / first.width) if first else 533
os.makedirs(sheets, exist_ok=True)
for si in range(0, len(files), cols * rows):
    batch = files[si:si + cols * rows]
    sheet = Image.new('RGB', (cols * W, rows * (H + 34)), (90, 90, 90))
    d = ImageDraw.Draw(sheet)
    for i, f in enumerate(batch):
        fr = int(os.path.basename(f)[1:6])
        im = Image.open(f).resize((W - 4, H - 4))
        x, y = (i % cols) * W, (i // cols) * (H + 34)
        sheet.paste(im, (x + 2, y + 2))
        for gy in [float(g) for g in os.environ.get('GUIDES', '0.08,0.82').split(',')]:
            d.line([(x + 2, y + 2 + gy * (H - 4)), (x + W - 2, y + 2 + gy * (H - 4))], fill=(255, 120, 120), width=1)
        tag = f'{fr / fps:.2f}s' + (f'  S{starts[fr]} start' if fr in starts else '')
        d.text((x + 6, y + H + 8), tag, fill=(255, 255, 255))
    out = f'{sheets}/sheet_{fr / fps:06.2f}.png'
    sheet.save(out)
    print(out)
