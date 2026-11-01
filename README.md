# Explainer video template (Remotion)

A reusable template for calm, vertical (1080×1920, 60 fps) explainer videos filmed by **one camera** moving over a page of illustrations.

Videos made with it:
- *How the immune system works* (`scripts/immune-system.md`, `src/settings/immune-system.ts`)
- *A Hole in the Heart* (`script.md`, `src/settings/heart-hole.ts`)

## How it fits together

| Path | What it is |
|------|------------|
| `src/settings/<video>.ts` | **The only file that changes per video.** Pictures, where they sit, camera moves, lights, labels, magnifier, and every timing (tied to words of the narration). |
| `src/settings/active.ts` | One line that picks which video is rendered. |
| `src/data/<video>.timings.json` | Exact start/end time of every word and sentence of the voice. |
| `public/audio/` | The voices (and music). |
| `images/` (linked as `public/images`) | Cut-out pictures. |
| `src/engine/` | The engine: camera, depth layers, fades, lights, lines, circles, labels, magnifier, subtitles, dot grid. No video-specific content. |
| `tools/cutout.py` | Cuts a drawing out of its paper background. |
| `tools/make_timings.py` | Builds the timings file from the script and a speech-to-text word list. |
| `tools/render-stills.mjs` | Renders a check frame every 0.5 s and at every sentence start into `out/stills/`. |
| `tools/contact_sheet.py` | Tiles those frames into sheets in `out/sheets/` with the safe-area lines drawn in. |

## Making a new video

1. Cut out the pictures (`python3 tools/cutout.py raw.png images/name.png`) and put the voice in `public/audio/`.
2. Transcribe the voice (ElevenLabs speech-to-text gives a `words.json`), then build the timings:
   `python3 tools/make_timings.py script.md words.json src/data/<video>.timings.json audio/<voice>.mp3`
   (the words and sentence numbers come from the script; only the times come from the transcript).
3. Copy a settings file to `src/settings/<video>.ts` and change pictures, positions, camera moves and items.
   - `w(sentence, 'word')` gives the time a word starts. Use it for every timing so visuals land on their words.
   - `placed(picture, center, width).pt(px, py)` turns a pixel in a picture into a world position, so paths can be traced straight from the image.
   - `move(start, end, x, y, zoom)` adds one eased camera move; moves never overlap, so each flows into the next.
4. Point `src/settings/active.ts` at the new settings file.
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
- `circle`: a circle or ellipse that draws itself (solid or dashed), or a soft filled disc.
- Pictures can also `beat` (a gentle lub-dub swell), and lines can be dashed or end in an arrow.
- `subtitles` (in the settings, not an item): captions built from the word timings, shown just above the bottom safe area.

## Motion rules built into the engine

- One camera for everything; zooms keep a fixed point still, like a real lens.
- Every move eases in and out (gentle sine curve). Nothing moves at constant speed or stops suddenly.
- Everything fades in with a little scale and blur (0.5 s). Nothing pops.
- Top 8 % and bottom 18 % of the frame are kept free (labels are clamped into the free area).
