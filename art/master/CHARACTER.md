# Master character — LOCKED

These two images are the fixed source of truth for this character. Every new
image of him (poses, scenes, expressions) must use them as references and match
them. **Do not edit, regenerate or replace these files.** If the design ever has
to change, make a new version folder (e.g. `art/master/v2/`) instead.

| File | What it is | Size |
|---|---|---|
| `character_anchor.png` | Master anchor: full body, front ¾, talking pose | 1792×2400 |
| `character_turnaround.png` | Turnaround: front, ¾ front, side, ¾ back, back | 3168×1344 |

Checksums are in `LOCKED.sha256`. Check that nothing has changed with:

```bash
cd art/master && sha256sum -c LOCKED.sha256
```

## OpenArt references

Pass both in `visualReferences` for every new generation (image2image mode):

```json
[
  {"type": "image", "id": "Elv7zIrLrCZRmX8wOy1N", "label": "character_anchor.png",
   "url": "https://cdn.openart.ai/openart-uploads/production/2026-11/create-image/m7IBnGqsLLcBx6brAnUy/cartoon_man_1794401309191_5cc011e5.png"},
  {"type": "image", "id": "4PlhiWBFCvXWNEbOBZua", "label": "character_turnaround.png",
   "url": "https://cdn.openart.ai/openart-uploads/production/2026-11/create-image/m7IBnGqsLLcBx6brAnUy/cartoon_man_turnaround_1794402752569_a0e39563.png"}
]
```

Model used: Nano Banana 2.1 (`nano-banana-2-1`).

## Locked design

- **Who:** friendly man, about 27, slim average build.
- **Face:** large expressive brown eyes, thick brown eyebrows, straight nose,
  warm open smile by default.
- **Hair:** medium-length, slightly messy brown hair with loose tufts on top
  and over the ears.
- **Outfit (never changes unless a scene asks for it):**
  - fitted royal blue crew-neck T-shirt, short sleeves, no logo or print
  - brown chino trousers, straight leg, back pockets
  - simple brown low-top sneakers with off-white soles

## Palette (sampled from the anchor)

| Part | Hex |
|---|---|
| T-shirt | `#2D5A9B` |
| Chinos | `#9A7252` |
| Chinos shadow | `#704F39` |
| Sneakers | `#563A2A` |
| Hair | `#7C4B2F` |
| Skin | `#F6C1A3` |
| Outlines | near-black ink |

## Locked style

Classic 1990s hand-drawn 2D cel animation. Clean dark ink outlines, flat cel
shading with one hard-edged shadow tone per colour, no gradients or textures.
Character sheets on a pure white background.

## Prompt prefix for new images

> The exact same character from the reference images — same face, same messy
> brown hair, same expressive brown eyes, same royal blue crew-neck T-shirt,
> brown chino trousers and brown sneakers, same proportions and colours.
> Classic 1990s hand-drawn 2D cel animation style: clean dark ink outlines,
> flat cel shading with one hard-edged shadow tone per colour.

## Other approved sheets (not locked)

- `../cartoon_man_expressions.png`: 12-expression sheet (can still be edited)
