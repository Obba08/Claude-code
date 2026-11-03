# Makes clean cut-outs: removes the plain white background around a picture (only the white
# that is connected to the border, so white highlights inside the object stay solid).
# Usage: python3 tools/cutout.py in.png out.png
import sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

src, dst = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
g = np.asarray(im.convert('L'))
mask = Image.fromarray(np.where(g > 238, 255, 0).astype(np.uint8)).copy()  # copy: fromarray images are read-only
w, h = mask.size
for x in range(0, w, 8):
    for y in (0, h - 1):
        if mask.getpixel((x, y)) == 255:
            ImageDraw.floodfill(mask, (x, y), 128)
for y in range(0, h, 8):
    for x in (0, w - 1):
        if mask.getpixel((x, y)) == 255:
            ImageDraw.floodfill(mask, (x, y), 128)
bg = np.asarray(mask) == 128
alpha = Image.fromarray(np.where(bg, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
out = im.convert('RGBA')
out.putalpha(alpha)
out.save(dst)
print(dst, 'background removed:', round(bg.mean() * 100, 1), '%')
