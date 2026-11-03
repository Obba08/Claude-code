# Your Heart Runs Itself — Script

Format: vertical 9:16 · 1:33 · one calm narrator · 249 words

Voice: ElevenLabs "Brian – Deep, Resonant and Comforting" (`nPczCjzI2devNBz1zQrb`), Multilingual v2,
stability 0.48, clarity + similarity 0.78, style exaggeration 0.05, speaker boost on.
Word timings: `src/data/heart-timings.json` (ElevenLabs Scribe transcription of the same take; it matches the script word for word).

---

## 1. Narration (word for word)

1. Since you started scrolling, your heart has beaten hundreds of times… and you never told it to once.
2. And it's never waited for you.
3. So who's been running the show?
4. Tucked in the heart's upper right chamber is a tiny patch of cells called the SA node.
5. It's your built-in pacemaker.
6. It fires its own electrical spark, about 100,000 times a day.
7. It never asked you once.
8. Heart cells grown in a dish, with no body and no brain, start beating on their own.
9. So what does your brain do?
10. You know that jolt from a jump scare, when your heart races before you even think?
11. That's your brain cranking the volume up.
12. Falling asleep, it turns it down.
13. Try it now: breathe in slowly and your pulse speeds up slightly.
14. Breathe out, it slows.
15. Here's the twist: most of the time, your brain is pressing the brake.
16. In a heart transplant, the nerves are cut.
17. The new heart still beats… just faster.
18. It even has backups, like your phone's low-power mode.
19. If the main spark fails, a second spot takes over, slower.
20. If that fails, a third, slower still.
21. And when backups aren't enough, doctors fit a pacemaker.
22. That small bump some grandparents have under the collarbone?
23. That's it, doing the SA node's job.
24. The one catch: your heart still needs oxygen, and breathing is your brain's job.
25. But the beat?
26. It's doing that right now.
27. Without asking.
28. Follow for more things your body does without asking you.

---

## 2. Shot list

One camera over one page. Everything is timed to words in `src/settings/heart.ts`.

| # | On screen | Camera | Label |
|---|-----------|--------|-------|
| 1 | `seated_phone.png`; a soft blue glow beats at the chest | Slow push toward chest and phone | YOU NEVER TOLD IT TO BEAT |
| 2 | — | Glides along the page to `body.png` | — |
| 3 | A line draws from brain to heart; a light travels down it | Holds on the full body | WHO'S IN CONTROL? |
| 4 | The body's heart dissolves into `heart_section.png`; the upper right chamber glows; the SA node lights up and pulses | Push deep into the heart | SA NODE |
| 5 | SA node beats | Close on the SA node | YOUR BUILT-IN PACEMAKER |
| 6 | Each beat: a spark runs SA node → AV node → down the middle wall → up both outer walls; the heart swells with it | Eases back to the whole heart | ≈100,000 BEATS A DAY |
| 7 | Sparks continue | Slow drift out | — |
| 8 | `petri_dish.png`; a magnifier grows out of one cell cluster; on "start beating" all clusters glow and the cells swell in rhythm | Pulls out of the body, travels down to the dish | NO BODY · NO BRAIN → STILL BEATING |
| 9 | `brain.png` above `heart.png`; the brain glows | Over to brain and heart | — |
| 10 | A nerve draws from brain to heart; a light shoots down; the heart's beat speeds up; rings spread | Holds | JUMP SCARE |
| 11 | A volume dial turns up | Holds | VOLUME KNOB |
| 12 | The dial turns down; the heart slows | Holds | — |
| 13 | `seated_pulse.png`; a magnifier grows out of the wrist with the pulse beating in it, speeding up a little | Over to the person | BREATHE IN… |
| 14 | The pulse slows | Holds | …AND OUT |
| 15 | Steady lights flow down the nerve (the brake); the brain glows | Back to brain and heart | THE BRAKE |
| 16 | The nerve breaks with a soft ring | Holds | NERVES CUT |
| 17 | The heart keeps beating, faster | Slow drift | STILL BEATING JUST FASTER |
| 18 | The cut-open heart again; SA node beating with sparks | Back into the body's heart | BACKUPS |
| 19 | SA node fades; the AV node takes over, slower | Holds | BACKUP 1 |
| 20 | AV node fades; the lower wall takes over, slower still | Holds | BACKUP 2 |
| 21 | `chest.png` with `heart.png` inside; a magnifier grows out of the spot under the collarbone showing `pacemaker.png` | Over to the chest | PACEMAKER |
| 22 | That spot glows | Holds | UNDER THE COLLARBONE |
| 23 | A lead draws from the spot to the heart; sparks run along it and along the pacemaker's wire with every beat | Holds | DOING THE SA NODE'S JOB |
| 24 | `lungs.png` fades in over the body's lungs and breathes; lights run from the brain to the lungs | Head and chest of the body | NEEDS OXYGEN → BREATHING: YOUR BRAIN'S JOB |
| 25–26 | The heart beats with rings | Push in on the heart | THE BEAT IS ALL HEART |
| 27–28 | Back to the opening frame (loops) | Long pull back | FOLLOW @FINGERTIPFACTS |

Captions are burned in (Montserrat Black, the word being spoken in blue) in the band just above the bottom 18 %.
A faint `@fingertipfacts` watermark sits in the middle of the frame.

---

## 3. Picture list

All in `images/`, made with GPT Image 2.5 (prompts in `images/prompts.md`).

`seated_phone.png`, `body.png`, `heart_section.png`, `lungs.png`, `petri_dish.png`, `brain.png`, `heart.png`,
`seated_pulse.png`, `chest.png`, `pacemaker.png`

---

## 4. Style line

Black and white scientific illustration, fine ink lines and soft graphite shading, like an old textbook, a single object isolated on a plain white background, no text, no labels, no color.

(The soft blue accent for light and movement is added by the animation, not drawn in the pictures.)
