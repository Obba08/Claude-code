"""Cut a drawing out of its plain or parchment background.

Usage: python3 tools/cutout.py in.png out.png [edge]

edge (default 40): lower it (e.g. 22) when pale parts of the drawing are close to the paper colour.

- The paper colour is read from the image border.
- Background = paper-coloured pixels joined to the border (flood fill), so paper-coloured
  areas inside the drawing stay solid.
- Edges fade softly instead of being cut hard.
- Loose specks of dust away from the drawing are dropped.
"""
import sys
from collections import deque

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

LOW, HIGH = 12, 40  # difference from paper: below LOW = paper, above HIGH = ink


def main(src, dst, high=HIGH):
    im = Image.open(src).convert("RGB")
    a = np.asarray(im).astype(np.float32)
    h, w, _ = a.shape

    border = np.concatenate([a[:8].reshape(-1, 3), a[-8:].reshape(-1, 3),
                             a[:, :8].reshape(-1, 3), a[:, -8:].reshape(-1, 3)])
    paper = np.median(border, axis=0)

    lum = a @ np.array([0.299, 0.587, 0.114], np.float32)
    plum = float(paper @ np.array([0.299, 0.587, 0.114], np.float32))
    chroma = np.abs((a - lum[..., None]) - (paper - plum)).max(axis=2)
    diff = np.maximum(plum - lum, 0) + 0.7 * chroma
    diff = np.asarray(Image.fromarray(np.clip(diff, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2)),
                      np.float32)

    # Flood fill the paper from the border.
    paperlike = np.where(diff < high, 255, 0).astype(np.uint8)
    pad = np.pad(paperlike, 1, constant_values=255)
    m = Image.fromarray(pad).copy()  # copy: floodfill does nothing on a numpy-backed image
    ImageDraw.floodfill(m, (0, 0), 128)
    outside = np.asarray(m)[1:-1, 1:-1] == 128

    alpha = np.where(outside, np.clip((diff - LOW) / (high - LOW), 0, 1), 1.0)

    # Keep only big connected pieces (drop dust).
    s = 4
    small = np.asarray(Image.fromarray((alpha > 0.5).astype(np.uint8) * 255).resize((w // s, h // s), Image.BOX)) > 40
    sh, sw = small.shape
    label = np.zeros(small.shape, np.int32)
    sizes = [0]
    for y0, x0 in zip(*np.nonzero(small)):
        if label[y0, x0]:
            continue
        n = len(sizes)
        label[y0, x0] = n
        q, c = deque([(y0, x0)]), 0
        while q:
            y, x = q.popleft()
            c += 1
            for yy, xx in ((y + 1, x), (y - 1, x), (y, x + 1), (y, x - 1)):
                if 0 <= yy < sh and 0 <= xx < sw and small[yy, xx] and not label[yy, xx]:
                    label[yy, xx] = n
                    q.append((yy, xx))
        sizes.append(c)
    sizes = np.array(sizes)
    keep_ids = np.nonzero(sizes >= max(sizes.max() * 0.02, 30))[0]
    keep = np.isin(label, keep_ids[keep_ids > 0])
    keep = Image.fromarray(keep.astype(np.uint8) * 255).filter(ImageFilter.MaxFilter(9)).resize((w, h), Image.NEAREST)
    alpha *= np.asarray(keep) > 0

    out = np.dstack([a, alpha * 255]).astype(np.uint8)
    img = Image.fromarray(out, "RGBA")
    bbox = img.getbbox()
    if bbox:  # trim to the drawing with a small margin
        m = 24
        bbox = (max(bbox[0] - m, 0), max(bbox[1] - m, 0), min(bbox[2] + m, w), min(bbox[3] + m, h))
        img = img.crop(bbox)
    img.save(dst)
    print(dst, img.size, "paper", paper.round().tolist())


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], *(float(x) for x in sys.argv[3:4]))
