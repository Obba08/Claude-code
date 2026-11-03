# Explainer video template (Remotion)

A reusable template for calm, vertical (1080×1920, 60 fps) explainer videos filmed by **one camera** moving over a page of illustrations.

Videos made with it:
- *How the immune system works* (`script.md`, `src/settings/immune-system.ts`)
- *Your heart runs itself* (`heart-script.md`, `src/settings/heart.ts`) ← current

## How it fits together

| Path | What it is |
|------|------------|
| `src/settings/<video>.ts` | **The only file that changes per video.** Pictures, where they sit, camera moves, lights, labels, magnifier, subtitles, watermark and every timing (tied to words of the narration). |
| `src/data/<video>-timings.json` | Exact start/end time of every word and sentence of the voice. |
| `public/audio/<video>-narration.mp3` | The voice. |
| `video.json` | Tells the check tools which video is current (timings, audio, subtitle file). |
| `images/` (linked as `public/images`) | Cut-out pictures. |
| `src/engine/` | The engine: camera, depth layers, fades, lights, lines, labels, magnifier, dot grid. No video-specific content. |
| `tools/render-stills.mjs` | Renders a check frame every 0.5 s and at every sentence start into `out/stills/`. |
| `tools/contact_sheet.py` | Tiles those frames into sheets in `out/sheets/` with the safe-area lines drawn in. |

## Making a new video

1. Put the cut-out pictures in `images/` and the voice in `public/audio/`.
2. Put the word timings in `src/data/timings.json` (same shape: `duration`, `sentences`, `words`).
3. Copy `src/settings/immune-system.ts` to a new file and change pictures, positions, camera keys and items.
   - `w(sentence, 'word')` gives the time a word starts. Use it for every timing so visuals land on their words.
   - `placed(picture, center, width).pt(px, py)` turns a pixel in a picture into a world position, so paths can be traced straight from the image.
4. Point the import in `src/Root.tsx` at the new settings file, and update `video.json`.
5. Check: `node tools/render-stills.mjs && python3 tools/contact_sheet.py`
6. Render: `npx remotion render Explainer out/video.mp4`
   (or render silently with `--props='{"noAudio":true}'` and add the voice with `tools/add-voice.sh`)
   Music under the voice: `cp out/video.mp4 out/video_voice.mp4 && tools/add-music.sh`
7. Subtitle file for uploading: `python3 tools/make_subtitles.py` (the video already has them burned in).

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
- `dial`: a knob in the scene whose glowing arc shows a level that rises and falls (e.g. the brain as a volume knob).
- Heartbeats: `beats` on a picture or glow makes it swell softly ("lub-dub") at those times; `beatTimes()` makes the
  times from a rate that can speed up or slow down.

## Subtitles and watermark

Set `subtitles` in the settings to burn in captions built from the word timings (short phrases, split at commas,
the word being spoken in the accent colour). Set `watermark` for a faint handle in the middle of the frame.

## Motion rules built into the engine

- One camera for everything; zooms keep a fixed point still, like a real lens.
- Every move eases in and out (gentle sine curve). Nothing moves at constant speed or stops suddenly.
- Everything fades in with a little scale and blur (0.5 s). Nothing pops.
- Top 8 % and bottom 18 % of the frame are kept free (labels are clamped into the free area). With burned-in
  subtitles, set `safe.bottom` higher (the heart video uses 0.26) so pictures are framed above the caption band.
