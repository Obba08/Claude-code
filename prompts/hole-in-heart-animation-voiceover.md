# Prompt Pack: "How a Hole in the Heart Is Closed" style

Recreates the look and sound of the source video: a calm documentary voice over glossy 3D medical animation, about 65 s.
Source transcript: https://www.youtube.com/watch?v=oobmCJ4SlhI
Use these prompts in any image/video model (OpenArt, Kling, Veo, Runway, Sora) and any TTS (ElevenLabs).

---

## 1. Master style prompt (paste at the start of every visual prompt)

```
Photorealistic 3D medical animation, educational surgical visualization style.
Glossy, translucent anatomical heart tissue in rich crimson and soft pink with subsurface scattering,
moist specular highlights, visible fine blood vessels. Dark navy-to-black background with soft
volumetric haze. Cinematic studio lighting: cool blue rim light, warm key light, gentle bloom.
Shallow depth of field, slow smooth camera moves, clean and clinical, not gory.
Metal devices are fine nitinol wire mesh, silver with a faint gold sheen.
Vertical 9:16, 4K, 24 fps.
```

**Negative prompt (use everywhere):**
```
gore, real surgery footage, blood splatter, cartoon, low poly, flat shading, text, watermark,
logos, labels with misspelled words, extra chambers, distorted anatomy, human faces, hands, jitter, flicker
```

---

## 2. Scene-by-scene prompts

Each scene has a **still** prompt (for the first frame) and a **motion** prompt (for image-to-video). Generate the still first, then animate it.

| # | Time | Narration |
|---|---|---|
| 1 | 0:00–0:07 | "If the heart has a hole, doctors place an umbrella-like closure device made from a flexible metal mesh across it." |
| 2 | 0:07–0:12 | "This hole in the heart can develop before birth, when the wall separating the two upper chambers doesn't form completely." |
| 3 | 0:12–0:22 | "Called an atrial septal defect, or ASD, it allows blood to flow between the chambers, potentially putting extra strain on the heart and lungs." |
| 4 | 0:22–0:26 | "When the defect is large or causes problems, doctors may close it." |
| 5 | 0:26–0:36 | "In many cases, a thin catheter is guided through a blood vessel into the heart." |
| 6 | 0:36–0:43 | "A small umbrella-like closure device made from a flexible metal mesh is then positioned across the hole. Once released, the device expands on both sides of the septum," |
| 7 | 0:43–0:48 | "trapping the opening between two discs and stopping abnormal blood flow." |
| 8 | 0:48–0:53 | "Over time, heart tissue grows over the device, permanently sealing the defect." |
| 9 | 0:53–1:05 | "For larger defects that cannot be closed with a device, surgeons may use open heart surgery to sew the opening shut, or cover it with a patch of surgical material." |

### Scene 1: Hook (0:00–0:07). Also the thumbnail and first frame.
- **Still:** `[MASTER STYLE] Cutaway cross-section of a human heart, front view, the wall between the two upper chambers has a clear round hole in the center. A silver nitinol mesh double-disc umbrella device hovers half-open in front of the hole, glowing faintly. Hero composition, heart centered, device in sharp focus.`
- **Motion:** `Slow push-in toward the hole while the heart beats gently; the mesh umbrella rotates slightly and catches the light. Subtle particles drift. 7 seconds.`

### Scene 2: Before birth (0:07–0:12)
- **Still:** `[MASTER STYLE] Small developing fetal heart floating in warm amber-pink amniotic light, the dividing wall between the upper chambers growing inward from both sides but leaving a gap in the middle.`
- **Motion:** `Time-lapse of the septum tissue growing from both edges and stopping short, leaving an open gap. Slow orbit camera. 5 seconds.`

### Scene 3: The defect and the strain (0:12–0:22)
- **Still:** `[MASTER STYLE] Close-up cutaway of the left and right atria with a hole in the atrial septum. Bright red oxygenated blood (left) and darker blue-tinted blood (right), shown as glowing flow streams.`
- **Motion:** `Red blood stream pushes through the hole from left to right and mixes with the blue stream; the right side of the heart swells slightly with each beat; camera pulls back to reveal the lungs pulsing harder in the background. 10 seconds.`
- **On-screen text (add in edit, not in the AI prompt):** `Atrial Septal Defect (ASD)`

### Scene 4: Pivot (0:22–0:26)
- **Still:** `[MASTER STYLE] Wide shot of the whole heart in the chest, ribs and lungs as faint translucent blue-gray glass shapes, the hole highlighted with a soft pulsing ring of light.`
- **Motion:** `Slow dolly out with the highlight ring pulsing in time with the heartbeat. 4 seconds.`

### Scene 5: Catheter journey (0:26–0:36)
- **Still:** `[MASTER STYLE] Inside a large vein, a thin flexible translucent catheter with a metal tip glides through the vessel, red blood cells flowing around it, tunnel-like perspective.`
- **Motion:** `Camera follows behind the catheter tip as it travels up the vein and emerges into the right atrium, the hole visible ahead. Smooth fly-through. 10 seconds.`

### Scene 6: Device deploys (0:36–0:43). The climax.
- **Still:** `[MASTER STYLE] Catheter tip passing through the hole in the atrial septum, a folded silver mesh device just starting to push out of the catheter on the far side.`
- **Motion:** `The mesh device springs open into a flat round disc on the left side of the wall, the catheter pulls back, and a second disc opens on the right side. Elegant, satisfying unfolding like an umbrella. Slight slow motion at the moment of expansion. 7 seconds.`

### Scene 7: Seal (0:43–0:48)
- **Still:** `[MASTER STYLE] Side cross-section of the atrial septum with the double-disc mesh device clamped on both sides of the hole, like a rivet.`
- **Motion:** `The two discs gently squeeze together and lock; the blood flow stream through the hole stops and fades; blood now flows normally on each side. 5 seconds.`

### Scene 8: Tissue heals over (0:48–0:53)
- **Still:** `[MASTER STYLE] Close-up of the mesh device in the septum, a thin layer of smooth pink tissue beginning to creep over the wire edges.`
- **Motion:** `Time-lapse: glossy pink tissue grows from the edges inward and fully covers the device until only a smooth bump remains. Soft warm light increases. 5 seconds.`

### Scene 9: Open-heart alternative (0:53–1:05)
- **Still:** `[MASTER STYLE] Cutaway heart with a large hole in the septum, a curved surgical needle and fine suture thread hovering beside it, and a separate thin white fabric patch floating nearby. Clinical, no hands, no gore.`
- **Motion:** `Needle and thread stitch the large hole closed in neat stitches; then a match cut shows the same hole being covered by the white patch, sutured around its edge. Final slow pull-back to the whole healthy heart beating calmly. 12 seconds.`

---

## 3. Voiceover prompt

### Option A: ElevenLabs preset voice (matches this repo's other videos)
- **Voice:** "Brian – Deep, Resonant and Comforting" (`nPczCjzI2devNBz1zQrb`)
- **Model:** Multilingual v2
- **Settings:** stability 0.50, similarity 0.78, style exaggeration 0.05, speaker boost on, speed 1.0

### Option B: Voice-design prompt (to create a new voice)
```
A calm, warm adult male narrator with a neutral American accent, mid-low pitch, in the style of
a hospital patient-education documentary. Clear diction, unhurried but efficient, reassuring
and authoritative, never dramatic or salesy. Studio-quality, close-mic, no reverb.
```

### Delivery direction
- Target pace: about 185 words per minute (the full script runs ~65 s).
- Gentle downward inflection at sentence ends, with no upspeak.
- Add a slight emphasis to: **"umbrella-like"**, **"before birth"**, **"ASD"**, **"expands"**, **"permanently"**.
- Pauses: ~0.4 s after "…doesn't form completely." and after "…doctors may close it." (where the music lifts); ~0.6 s before the final "For larger defects…".

### Script with pause tags (paste straight into ElevenLabs)
```
If the heart has a hole, doctors place an umbrella-like closure device made from a flexible metal mesh across it.
This hole in the heart can develop before birth, when the wall separating the two upper chambers doesn't form completely. <break time="0.4s" />
Called an atrial septal defect, or A.S.D., it allows blood to flow between the chambers, potentially putting extra strain on the heart and lungs.
When the defect is large or causes problems, doctors may close it. <break time="0.4s" />
In many cases, a thin catheter is guided through a blood vessel into the heart.
A small umbrella-like closure device made from a flexible metal mesh is then positioned across the hole.
Once released, the device expands on both sides of the septum, trapping the opening between two discs and stopping abnormal blood flow.
Over time, heart tissue grows over the device, permanently sealing the defect. <break time="0.6s" />
For larger defects that cannot be closed with a device, surgeons may use open heart surgery to sew the opening shut, or cover it with a patch of surgical material.
```

---

## 4. Music and sound

**Music prompt (ElevenLabs Music, Suno, Udio):**
```
Ambient cinematic science-documentary underscore, 65 seconds, 80 BPM. Soft felt piano, warm
synth pads and gentle pulsing low heartbeat-like bass. Starts minimal; a subtle lift with light
strings at 0:26; a soft shimmer swell at 0:40; resolves calmly at 0:52 and fades out at the end.
Hopeful, clinical, unobtrusive, no vocals, no drums.
```
Mix the music about −20 dB under the voice.

**Sound effects (optional):**
- 0:00: soft low heartbeat thump (loop quietly under scenes 1–3)
- 0:30: subtle liquid whoosh for the catheter
- 0:40: a soft metallic "unfurl" plus a gentle click when the discs lock
- 0:48: a warm airy shimmer while tissue grows

---

## 5. Assembly checklist
1. Generate the voiceover first, then cut each scene to its narration time (the table in §2).
2. Animate each still with its motion prompt and keep a consistent seed or style reference for all scenes.
3. Add the "Atrial Septal Defect (ASD)" label at 0:12 and burned-in captions.
4. Make sure frame 1 is the Scene 1 hero shot (in the Shorts feed, frame 1 works as the thumbnail).
5. End on Scene 9 with no outro so the Short loops cleanly.
