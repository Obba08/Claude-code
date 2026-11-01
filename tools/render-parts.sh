#!/usr/bin/env bash
# Renders the video in chunks (each well under any time limit), then joins them and adds the voice.
# Safe to run again: chunks that are already finished are skipped.
# Usage: tools/render-parts.sh [chunk-size-in-frames]
set -euo pipefail
CHUNK=${1:-5040}
COMP=${COMP:-Explainer}
mkdir -p out/parts
TOTAL=$(npx remotion compositions 2>/dev/null | awk -v c="$COMP" '$1==c {print $4}')
[ -n "$TOTAL" ] || { echo "Could not read the length of $COMP"; exit 1; }
AUDIO=public/$(node -e "const t=require('./'+require('child_process').execSync('node tools/active.mjs').toString().trim());console.log(t.audio)")
echo "Frames: $TOTAL  chunk: $CHUNK  audio: $AUDIO"

: > out/parts/list.txt
for ((start = 0; start < TOTAL; start += CHUNK)); do
  end=$((start + CHUNK - 1)); ((end >= TOTAL)) && end=$((TOTAL - 1))
  part=$(printf 'out/parts/part_%05d.mp4' "$start")
  if [ ! -f "$part.done" ]; then
    echo "Rendering frames $start-$end"
    npx remotion render "$COMP" "$part" --frames="$start-$end" --muted --concurrency=4 --log=error
    touch "$part.done"
  fi
  echo "file '$(basename "$part")'" >> out/parts/list.txt
done

echo "Joining parts and adding the voice"
ffmpeg -v error -y -f concat -safe 0 -i out/parts/list.txt -i "$AUDIO" -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k \
  -movflags +faststart out/video.mp4
ffprobe -v error -show_entries format=duration -of csv=p=0 out/video.mp4
echo "Done: out/video.mp4"
