# Picture prompts

## A Hole in the Heart

Model: GPT Image 2.5 (Sunburst), text to image, 2K. Paper background removed afterwards with `tools/cutout.py` (clean transparent cut-outs; paper-coloured areas inside a drawing stay solid).

All five passed the check on the first image that came back, so none were redone.

- `heart_exterior.png` was made at **high** quality (130 credits). High quality turned out to cost 130 credits a picture, not 40, so the other four were made at **medium** (35 each, about 40 for the taller chest) to fit the balance.
- `chest.png`, first try (high quality, prompt below) was **blocked by OpenAI's safety filter** (an opened bare torso was flagged). No credits were charged. The reworded prompt shows only the ribcage and organs.
- Your style line says "of a human heart"; for pictures that aren't a heart, that phrase is swapped for the object's name.
- `chest.png` was cut out with `python3 tools/cutout.py out/heart_raw/chest.png images/chest.png 20` (the breastbone is close to the paper colour).

Total: 275 credits (374 → 99).

### chest.png

Aspect ratio: 3:4 · quality: medium · credits: about 40 (taller shape; first try blocked and refunded) · OpenArt history ID `x8gBcAIqobXvRiGiOZ4z`

```
An anatomical plate of the human chest cavity with all skin and muscle removed: the rib cage and breastbone, both lungs, the heart in the middle, and the dome-shaped diaphragm right under the heart and lungs, seen straight on from the front. Only the ribs and organs, no skin, no body outline, no head, no arms, no other objects, lots of empty space around it, nothing touching the edges. A vintage scientific medical illustration of a human chest cavity, fine ink lines, cross-hatching, stippling, detailed anatomical etching, soft smudged graphite shading. Set against a clean, lightly textured cream parchment paper background. Black ink and graphite only, no color, no text, no labels, a single object on its own. Academic textbook aesthetic, minimalist composition, crisp details, high contrast, 8k resolution. suitable background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

Attempt 1 (blocked by the safety filter, not charged):

```
A front view of an adult human torso as one anatomical figure, from the base of the neck to the waist, seen straight on from the front. The front of the chest is opened to show the ribcage, both lungs, the heart in the middle, and the dome-shaped diaphragm right under the heart and lungs. No head, no arms below the shoulders, no other objects, lots of empty space around it, nothing touching the edges. A vintage scientific medical illustration of a human torso, fine ink lines, cross-hatching, stippling, detailed anatomical etching, soft smudged graphite shading. Set against a clean, lightly textured cream parchment paper background. Black ink and graphite only, no color, no text, no labels, a single object on its own. Academic textbook aesthetic, minimalist composition, crisp details, high contrast, 8k resolution. suitable background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### heart_exterior.png

Aspect ratio: 1:1 · quality: high · credits: 130 · OpenArt history ID `S0QHN0gvL2yZ7Ir4j3BU`

```
A single whole human heart seen straight on from the front, with the large blood vessels at the top cut short. Smooth closed outer surface, no cut-open parts, lots of empty space around it, nothing touching the edges. A vintage scientific medical illustration of a human heart, fine ink lines, cross-hatching, stippling, detailed anatomical etching, soft smudged graphite shading. Set against a clean, lightly textured cream parchment paper background. Black ink and graphite only, no color, no text, no labels, a single object on its own. Academic textbook aesthetic, minimalist composition, crisp details, high contrast, 8k resolution. suitable background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### heart_cutaway.png

Aspect ratio: 1:1 · quality: medium · credits: 35 · OpenArt history ID `hVobXY4YAFMJrk7U9MPK`

```
A single human heart cut open from the front in a clean flat cross-section, showing all four chambers, the valves, and the thick wall of muscle (septum) running down the middle between the left and right sides. The upper part of that wall has a small, slightly thinner oval spot. The lower part of that wall has one small, round, clean hole going right through it. Seen straight on from the front, lots of empty space around it, nothing touching the edges. A vintage scientific medical illustration of a human heart, fine ink lines, cross-hatching, stippling, detailed anatomical etching, soft smudged graphite shading. Set against a clean, lightly textured cream parchment paper background. Black ink and graphite only, no color, no text, no labels, a single object on its own. Academic textbook aesthetic, minimalist composition, crisp details, high contrast, 8k resolution. suitable background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### closure_device.png

Aspect ratio: 1:1 · quality: medium · credits: 35 · OpenArt history ID `OTQl6DKPezVV8CzI56fb`

```
A single small medical heart-hole closure device on its own: two round flat discs of fine woven wire mesh joined at the centre by a short narrow waist, fully opened, seen at a three-quarter angle from the side. No hands, no heart, no other objects, lots of empty space around it, nothing touching the edges. A vintage scientific medical illustration of a medical heart-hole closure device, fine ink lines, cross-hatching, stippling, detailed anatomical etching, soft smudged graphite shading. Set against a clean, lightly textured cream parchment paper background. Black ink and graphite only, no color, no text, no labels, a single object on its own. Academic textbook aesthetic, minimalist composition, crisp details, high contrast, 8k resolution. suitable background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### surgical_patch.png

Aspect ratio: 1:1 · quality: medium · credits: 35 · OpenArt history ID `9zlCJuWQr1qKRNwaBenk`

```
A single small oval patch of fine woven surgical fabric, lying flat, seen straight on from above, with a slightly frayed edge. No needle, no thread, no heart, no other objects, lots of empty space around it, nothing touching the edges. A vintage scientific medical illustration of a surgical fabric patch, fine ink lines, cross-hatching, stippling, detailed anatomical etching, soft smudged graphite shading. Set against a clean, lightly textured cream parchment paper background. Black ink and graphite only, no color, no text, no labels, a single object on its own. Academic textbook aesthetic, minimalist composition, crisp details, high contrast, 8k resolution. suitable background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

---

## How the Immune System Works

Only the finger was redone (once). All other pictures passed on the first try.

Model: GPT Image 2.5 (Sunburst), text to image, quality high, 2K. White background removed afterwards (clean transparent cut-outs).

### finger.png

Aspect ratio: 16:9

Used (attempt 2):

```
A single human index finger pointing to the left, seen from the side with the fingernail on top, slightly bent, natural adult proportions, smooth skin with only faint fine knuckle wrinkles on the top of the joints, no wounds, no sores, no bumps, the base of the finger ending in a soft pencil fade, lots of empty space around it, nothing touching the edges. Black and white scientific illustration, fine ink lines and soft graphite shading, like an old textbook, a single object isolated on a plain white background, no text, no labels, no color. plain white background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

Attempt 1 (rejected: knuckle creases looked like a sore, base looked like a tube):

```
A single human index finger, seen from the side, from the fingertip to just past the middle knuckle, cut off cleanly at the base, clean healthy skin with no wound, fingernail visible, lots of empty space around it, nothing touching the edges. Black and white scientific illustration, fine ink lines and soft graphite shading, like an old textbook, a single object isolated on a plain white background, no text, no labels, no color. plain white background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### splinter.png

Aspect ratio: 16:9

```
A single thin wooden splinter lying horizontally, seen from the side, sharp pointed at one end, rough broken at the other, visible wood grain, lots of empty space around it, nothing touching the edges. Black and white scientific illustration, fine ink lines and soft graphite shading, like an old textbook, a single object isolated on a plain white background, no text, no labels, no color. plain white background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### skin_section.png

Aspect ratio: 3:2

```
A rectangular cross-section block of human skin seen from a three-quarter front angle, showing the thin outer surface layer, the thicker deeper layer below, and one small blood vessel running horizontally through the deeper layer, no wound, lots of empty space around it, nothing touching the edges. Black and white scientific illustration, fine ink lines and soft graphite shading, like an old textbook, a single object isolated on a plain white background, no text, no labels, no color. plain white background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### bacterium.png

Aspect ratio: 1:1

```
A single rod-shaped bacterium, seen from the side at a slight angle, smooth capsule-shaped body, lots of empty space around it, nothing touching the edges. Black and white scientific illustration, fine ink lines and soft graphite shading, like an old textbook, a single object isolated on a plain white background, no text, no labels, no color. plain white background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### neutrophil.png

Aspect ratio: 1:1

```
A single neutrophil white blood cell, seen from the front, round cell with a nucleus divided into three to five connected lobes, finely grainy cytoplasm, lots of empty space around it, nothing touching the edges. Black and white scientific illustration, fine ink lines and soft graphite shading, like an old textbook, a single object isolated on a plain white background, no text, no labels, no color. plain white background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### macrophage.png

Aspect ratio: 1:1

```
A single macrophage cell, seen from above, large irregular cell body with a few short blunt extensions reaching outward, one rounded nucleus, lots of empty space around it, nothing touching the edges. Black and white scientific illustration, fine ink lines and soft graphite shading, like an old textbook, a single object isolated on a plain white background, no text, no labels, no color. plain white background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### dendritic_cell.png

Aspect ratio: 1:1

```
A single dendritic cell, seen from above, small central cell body with long thin branching arms spreading out in several directions, lots of empty space around it, nothing touching the edges. Black and white scientific illustration, fine ink lines and soft graphite shading, like an old textbook, a single object isolated on a plain white background, no text, no labels, no color. plain white background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### lymph_node.png

Aspect ratio: 1:1

```
A single human lymph node cut in half, seen from the front in cross-section, bean-shaped with a small indent on one side, showing the outer capsule, round follicles near the edge and the inner region, lots of empty space around it, nothing touching the edges. Black and white scientific illustration, fine ink lines and soft graphite shading, like an old textbook, a single object isolated on a plain white background, no text, no labels, no color. plain white background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### b_cell.png

Aspect ratio: 1:1

```
A single B lymphocyte cell, seen from the front, small round cell with a large round nucleus filling most of it and a thin rim of cytoplasm, lots of empty space around it, nothing touching the edges. Black and white scientific illustration, fine ink lines and soft graphite shading, like an old textbook, a single object isolated on a plain white background, no text, no labels, no color. plain white background, no text, no labels, no numbers, no arrows, no shadows, no frame
```

### antibody.png

Aspect ratio: 1:1

```
A single antibody protein molecule, seen from the front, Y-shaped, built from rounded bead-like segments, two arms and one stem, lots of empty space around it, nothing touching the edges. Black and white scientific illustration, fine ink lines and soft graphite shading, like an old textbook, a single object isolated on a plain white background, no text, no labels, no color. plain white background, no text, no labels, no numbers, no arrows, no shadows, no frame
```
