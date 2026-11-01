# Channel: Fingertip Facts

**Handle (all platforms):** @fingertipfacts
**Tagline:** Facts at your fingertips.
**Pronouns:** leave empty (brand channel, no on-camera presenter)

## TikTok bio (max 80 characters)

```
Facts at your fingertips. 🔬 Calm science explainers in 90 seconds.
```

## Instagram bio (max 150 characters)

```
Facts at your fingertips 🔬
Your body · nature · everyday science, explained calmly
Also on TikTok & YouTube: @fingertipfacts
```

## YouTube channel description (max 1,000 characters)

```
Facts at your fingertips.

Short, calm explainers about how things work: your body, nature and the science behind everyday life. Each video starts with something you already know, zooms into the detail that explains it, and pulls back to see the whole picture again. Everything is drawn in the style of an old science textbook and read by a calm narrator.

We only use well-established facts. If something isn't certain, it's left out.

Subscribe for new explainers.

Also on TikTok and Instagram: @fingertipfacts
```

## Profile picture

**Chosen: thumb scrolling a phone**
- `brand/fingertipfacts_profile_thumb_1080.png`: use on TikTok, Instagram and YouTube (all crop it to a circle).
- `brand/fingertipfacts_profile_thumb_800.png`: smaller copy (YouTube's recommended 800×800).
- `brand/logo_thumb_raw.png`: full original (OpenArt history ID `NZvWQlA6aoOeKa1PwSMs`).

Earlier option, pointing finger: `brand/fingertipfacts_profile_1080.png` (OpenArt `X6WXmI7xCUg9P2bJplpZ`).

## YouTube banner

- `brand/fingertipfacts_youtube_banner.png`: 2560×1440. Drawing, name and tagline all sit inside YouTube's
  safe strip (1546×423 in the centre), so nothing is cut off on phones; TVs and desktops show more of the dot grid.
- `brand/banner_raw.png`: the drawing without text (OpenArt history ID `znw69WIFgfmqnquZu0OP`).
- All made with GPT Image 2.5 (Sunburst), high quality. The text is added afterwards in Inter ExtraBold.

## Brand ideas

- **Logo:** a single fingertip in the same ink-and-graphite style, with a soft blue glow at the tip.
- **Signature opening:** every video starts on a fingertip touching or pointing at the subject, then the camera zooms in.
- **Look:** black and white scientific illustration, fine ink lines, soft graphite shading; one soft blue accent (#5E9BE0) for light and movement.

## Posting kit: "How the immune system works"

Which file to post:
- TikTok, YouTube Shorts, Instagram Reels: `out/video_30fps_subtitled.mp4` (9:16, subtitles, music)
- Instagram feed post / carousel: `out/video_square.mp4` (1:1)

On-screen hook (first 1–2 s, add as text in the app or bake in): **"What happens after a splinter?"**
Cover frame: the skin cross-section with the blue glow (around 0:20).

### TikTok
Caption:
```
What your body does in the seconds after a splinter 🔬 From the first white blood cells to the memory cells that remember the germ for next time. #immunesystem #biology #science #learnontiktok #howthebodyworks
```

### Instagram Reels
Caption:
```
A splinter is all it takes to start your immune system.
Watch it go from first responders to memory cells. 🔬

Save this for the next time someone asks how vaccines work.

#immunesystem #biology #sciencefacts #humanbody #learnsomethingnew
```

### YouTube Shorts
Title (keep it under ~60 characters):
```
How Your Immune System Fights a Splinter #shorts
```
Description:
```
What happens inside your finger after a splinter: inflammation, white blood cells, antibodies and memory cells, explained in 90 seconds.

#immunesystem #biology #science
```
Tags (YouTube settings): immune system, how the immune system works, white blood cells, antibodies, B cells, memory cells, inflammation, how vaccines work, biology explained, human body facts

Pinned comment (all platforms):
```
Which part of your body should we zoom into next? 👇
```

## Posting kit: "A Hole in the Heart"

Full video: `out/video.mp4` (8:24, 9:16, voice + subtitles). Phone copy: `out/video_phone.mp4`.
Short clips (made with `python3 tools/make_clips.py`, hook text baked into the first 3.6 s): `out/social/`

| Clip | File | Length | Covers |
|------|------|--------|--------|
| 1 | `clip1_born-with-a-hole.mp4` | 0:48 | The opening every baby has before birth, and why 1 in 4 adults still have it |
| 2 | `clip2_same-blood-twice.mp4` | 0:31 | Why blood leaks left to right, and the heart pumps the same blood twice |
| 3 | `clip3_no-open-chest.mp4` | 0:34 | Closing a hole with a catheter and a two-disc device |

Suggested order: the main clip first (it carries the whole message), then the short clips as follow-ups: 1, 3, 2.
Every caption ends with the same line, because this is health content: *General education, not medical advice.*

### Main clip: "A hole in the heart, explained simply" (post this one first)

**90-second version (recommended for TikTok / Reels):** `out/social/summary_hole-in-the-heart_90s.mp4` (1:34,
`python3 tools/make_summary_clip.py 90s`). Same message, played 1.3x faster, with five sentences dropped
whose point is already made elsewhere ("Together, they plug the gap", "Can it be prevented? Not always…",
"Genes play a part…", and the diabetes step). The captions below fit both versions.

Longer version: `out/social/summary_hole-in-the-heart.mp4` (2:25, made with `python3 tools/make_summary_clip.py`).
It keeps the whole message in the video's own words: what it is, why it happens (and that it's usually
nobody's fault), what it does to the blood, how doctors find it, how it's treated (wait and watch,
catheter device, surgery with a patch), prevention, and that most people go on to live full lives.
Headings on screen: WHAT IT IS · WHY IT HAPPENS · WHAT IT DOES · HOW DOCTORS FIND IT · HOW IT IS TREATED.

TikTok:
```
A hole in the heart is one of the most common heart problems people are born with, and very often it turns out fine 🫀 What it is, why it happens, what it does to your blood, how doctors find and fix it, and what lowers the risk.
General education, not medical advice.
#heart #congenitalheartdefect #anatomy #learnontiktok #health
```
Instagram Reels:
```
A hole in the heart, explained simply 🫀

✔️ What it is: a gap in the wall between the two sides of the heart
✔️ Why it happens: usually no single reason, and usually not something a parent did wrong
✔️ What it does: blood leaks through and the heart works harder
✔️ How it's fixed: watching and waiting, a device through a catheter, or surgery with a patch
✔️ Lowering the risk: rubella vaccine, folic acid, no smoking or alcohol

Most people who have one repaired go on to live full, active lives.

General education, not medical advice.
#heart #congenitalheartdefect #anatomy #humanbody #healtheducation
```

### Clip 1: "Everyone is born with a hole in their heart"

TikTok:
```
Before you were born, your heart had a small opening with a flap like a door 🫀 It lets blood skip the lungs. At birth it usually seals… but in about 1 in 4 adults it never fully does. Most never know.
General education, not medical advice.
#heart #anatomy #humanbody #learnontiktok #science
```
Instagram Reels:
```
Every one of us had a hole in our heart before birth.

It's called the foramen ovale: a small opening with a flap that lets blood skip the lungs while we're in the womb. After the first breath it usually seals. In about 1 in 4 adults it never fully does, and most of them never know. 🫀

General education, not medical advice.
#heart #anatomy #humanbody #sciencefacts #learnsomethingnew
```

### Clip 2: "What a hole in the heart does to your blood"

TikTok:
```
The left side of your heart pushes harder than the right. So if there's a hole between them, blood leaks through, goes back to the lungs, and gets pumped twice 🔁 Small holes often barely matter, and some close on their own.
General education, not medical advice.
#heart #anatomy #biology #learnontiktok #science
```
Instagram Reels:
```
Why a hole in the heart makes the heart work harder 🫀

The left side pushes harder than the right, so blood leaks through the gap from left to right, straight back to the lungs. The heart ends up pumping the same blood twice. Many small holes cause no symptoms, and some close on their own.

General education, not medical advice.
#heart #anatomy #biology #humanbody #sciencefacts
```

### Clip 3: "Closing a heart hole without opening the chest"

TikTok:
```
How doctors can close a hole in the heart without opening the chest: a thin tube goes up a blood vessel from the leg, and a small folded device opens into two discs that plug the gap 🩺
General education, not medical advice.
#heart #medicine #anatomy #learnontiktok #science
```
Instagram Reels:
```
Some holes in the heart can be closed without opening the chest. 🩺

A thin tube called a catheter is guided up a blood vessel, usually from the top of the leg, into the heart. A small folded device travels through it and opens on both sides of the wall like two discs, plugging the gap.

General education, not medical advice.
#heart #medicine #anatomy #humanbody #sciencefacts
```

Pinned comment (all clips):
```
Full 8-minute explainer on the channel: causes, how the body reacts, treatment and prevention 👇
```

### YouTube (full video)

Title options (all under 60 characters, pick one):
1. `Everyone Is Born With a Hole in Their Heart` (43)
2. `1 in 4 Adults Still Have This Gap in Their Heart` (48)
3. `How Doctors Close a Heart Hole Without Opening the Chest` (56)
4. `A Hole in the Heart: Why It Happens and How It's Fixed` (54)
5. `What a Hole in the Heart Actually Does to Your Blood` (52)

Why each one is honest: every baby has the foramen ovale before birth (1); it stays partly open in about 1 in 4 adults (2); catheter closure is covered in the video (3); causes and treatment are both covered (4); the left-to-right leak and "pumped twice" are covered (5).

Thumbnail concepts (mock-ups in `thumbnails/`):
- **A, "YOU WERE BORN WITH A HOLE IN YOUR HEART"** (`thumbnails/heart-hole_thumb_A.png`): the cut-open heart, close up, with a soft blue ring around the foramen ovale (the oval spot in the upper wall) and a line from the text to it. Pairs with titles 1 or 2.
- **B, "CLOSED WITHOUT OPENING THE CHEST"** (`thumbnails/heart-hole_thumb_B.png`): the whole cut-open heart with the hole ringed, and a magnifying circle showing the two-disc closure device. Pairs with titles 3 or 4.

Description:
```
A hole in the heart is one of the most common heart problems people are born with, and very often it turns out fine. This calm, illustrated explainer follows the blood through the heart to show what the hole is, why it happens, how the body reacts, how doctors find and treat it, and what lowers the risk.

0:00 The chest and the heart
1:14 A door before birth (the foramen ovale)
2:01 A true hole: ASD and VSD
2:28 Why it happens
3:22 How the body reacts
4:44 How doctors find it
5:30 How doctors treat it
7:03 Prevention
7:49 Stepping back

General education, not medical advice. If you have questions about your own heart, talk to a doctor.

#heart #anatomy #humanbody
```
Tags (YouTube settings): hole in the heart, atrial septal defect, ventricular septal defect, ASD, VSD, foramen ovale, PFO, congenital heart defect, heart anatomy, how the heart works, catheter closure, heart explained
