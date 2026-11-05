---
name: youtube-teardown
description: Reverse-engineer a YouTube video's hook, retention pacing, psychological triggers and replicable script formula from its transcript. Use when the user says "teardown this video", "reverse-engineer this YouTube video", "analyze this video's retention/hook/growth strategy", "why did this video do well", or gives a YouTube transcript (.txt, .docx, .srt, .vtt or pasted text) and asks how to copy its format. Produces a 4-section markdown report plus a reusable script template, 3 title formulas and a thumbnail concept.
argument-hint: "<transcript file path or YouTube URL>"
---

# YouTube Teardown

Turns one video transcript into a growth and retention breakdown plus a playbook the user can reuse for their own videos.

**Trigger:** `/youtube-teardown <file>`, or phrases like "teardown this video" or "reverse-engineer this YouTube video".

## Step 1: Get the transcript

- Accept `.txt`, `.srt`, `.vtt`, `.docx`, or pasted text. If none is given, look for `video_data.txt` or recent uploads, then ask.
- For `.docx`, extract the text with `python3 -I .claude/skills/youtube-teardown/scripts/extract_docx.py <file>`.
- Keep the timestamps. If there are none, estimate them at about 2.5 spoken words per second and say they are estimates.
- Note what's missing (thumbnail, views, retention graph). Say plainly that any visual or thumbnail claims are inferred.

## Step 2: Classify the format first

Count the words and runtime. Decide which it is:
- **Short** (under 90 s): hook = first 1–3 s; re-hooks every 5–8 s.
- **Long-form**: hook = first 30 s; re-hooks every 30–90 s.

Don't force a framework onto the video. If there's no social proof, CTA or agitation, say so. What's absent is a finding too.

## Step 3: Write the report

Save to `analysis/<video-slug>.md` using these exact sections. The full outline is in `references/report-template.md`.

0. **TL;DR**: the core formula in 2–3 sentences.
1. **THE HOOK MECHANICS (0:00–0:30)**
   - The curiosity gap or problem in the first 5 s (quote the line).
   - Title/thumbnail ↔ opening-line alignment (a table).
   - Micro-commitments and stakes, timestamped.
2. **RETENTION & PACING BREAKDOWN**
   - The narrative arc as named beats in a table.
   - Re-engagement triggers: topic shifts, new visuals, stake changes, music cues.
   - Key transition timestamps and pacing notes (words per minute, filler, CTA placement).
3. **COGNITIVE & PSYCHOLOGICAL TRIGGERS**
   - A table of emotional levers with where and how each is used. List levers that are *not* used.
   - How authority and credibility are built early.
4. **THE REPLICABLE PLAYBOOK**
   - A reusable markdown script template in a code block, with timed sections, `[placeholders]`, VISUAL/AUDIO cues and style rules.
   - 3 title formulas, each with a filled-in example.
   - A high-retention thumbnail concept: subject, contrast, ≤3 words of text, eye cue. For Shorts, tell them to use it as frame 1.

## Rules

- Quote the transcript for every claim, with a timestamp.
- Use plain language and short tables, written to be read on a phone.
- Strip transcript noise such as `[music]` from quotes, but treat music cues as possible re-hooks.
- Only commit and push if the repo workflow asks for it. Then give the user a 5-line summary, outcome first.

## Example

`analysis/how-a-hole-in-the-heart-is-closed.md` is a finished report made with this skill. Match its depth and format.
