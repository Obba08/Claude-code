# Explainer video template (Remotion)

A reusable template for calm, vertical (1080×1920, 60 fps) explainer videos filmed by **one camera** moving over a page of illustrations.

Videos made with it: *How the immune system works* (`src/settings/immune-system.ts`) and *Apoptosis* (`script.md`, `src/settings/apoptosis.ts`, the current one).

## How it fits together

| Path | What it is |
|------|------------|
| `src/settings/<video>.ts` | **The only file that changes per video.** Pictures, where they sit, camera moves, lights, labels, magnifier, subtitles, watermark and every timing (tied to words of the narration). |
| `src/data/timings.json` | Exact start/end time of every word and sentence (one "sentence" per narration line of `script.md`). |
| `public/audio/<video>.mp3` | The voice (its path is stored in `timings.json`). |
| `images/` (linked as `public/images`) | Cut-out pictures. |
| `src/engine/` | The engine: camera, depth layers, fades, lights, lines, labels, magnifier, dot grid. No video-specific content. |
| `tools/render-stills.mjs` | Renders a check frame every 0.5 s and at every sentence start into `out/stills/`. |
| `tools/contact_sheet.py` | Tiles those frames into sheets in `out/sheets/` with the safe-area lines drawn in. |
| `tools/timings.py` | Builds `timings.json`: `estimate` (from `script.md`, before a voice exists) or `words <words.json> <audio>` (from a transcription, matched to the script word for word). |
| `tools/cutout.py` | Removes the white background around a picture (only the white touching the border). |
| `src/engine/Overlay.tsx` | Subtitles (built from the word timings) and the watermark. |

## Making a new video

1. Put the pictures in `images/` (`python3 tools/cutout.py in.png images/name.png`) and the voice in `public/audio/`.
2. Make the word timings: `python3 tools/timings.py words words.json public/audio/<video>.mp3`
   (or `python3 tools/timings.py estimate` to build and check the animation before the voice exists).
3. Copy `src/settings/immune-system.ts` to a new file and change pictures, positions, camera keys and items.
   - `w(sentence, 'word')` gives the time a word starts. Use it for every timing so visuals land on their words.
   - `placed(picture, center, width).pt(px, py)` turns a pixel in a picture into a world position, so paths can be traced straight from the image.
4. Point the import in `src/Root.tsx` at the new settings file.
5. Check: `node tools/render-stills.mjs && python3 tools/contact_sheet.py`
6. Render: `npx remotion render Explainer out/video.mp4`

## Other frame shapes

A settings file can list extra `formats` (this one has `square`, 1080×1080 at 30 fps). Each format becomes its own
composition (`Explainer-square`) using the same world, pictures and timings. Only the frame, safe areas and camera zoom
change (`zoomScale`, plus optional per-key overrides like `formats: {square: {zoom: 1.0}}`).
Check it with `COMP=Explainer-square OUT=out/stills-square node tools/render-stills.mjs`, build it with `tools/make-square.sh`.

## Building blocks (item types)

- `picture`: a cut-out image. Can move (`motion`), follow a path (`pathMotion`), be swallowed (`swallow`), and sit on a far layer (`depth` > 1 moves slower and blurs).
- `light`: soft glowing lights in the accent colour travelling along a path.
- `line`: a line that draws itself along a path.
- `pulse`: soft rings spreading from a point.
- `glow`: a soft area of accent light.
- `label`: bold, widely spaced text that fades in, stays crisp at any zoom and is kept inside the safe area.
- `magnifier`: a circle that grows out of a detail, joined by two thin lines, with its own content inside.
- `orbit`: a small dial with a light going round (time passing).

Settings-level extras: `subtitles` (font, weight, size, y, max characters; words light up as they are spoken),
`watermark` (text blended into the middle of the frame with multiply), `fonts` (extra font files to load).

## Motion rules built into the engine

- One camera for everything; zooms keep a fixed point still, like a real lens.
- Every move eases in and out (gentle sine curve). Nothing moves at constant speed or stops suddenly.
- Everything fades in with a little scale and blur (0.5 s). Nothing pops.
- Top 8 % and bottom 18 % of the frame are kept free (labels are clamped into the free area).
