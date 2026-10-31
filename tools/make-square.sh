#!/usr/bin/env bash
# Square (1:1) Instagram version: renders the "square" format from the settings file,
# then adds the voice + music mix and burned-in subtitles. Output: out/video_square.mp4
# Needs /tmp/mix.wav from tools/make-30fps.sh (run that first).
set -euo pipefail
npx remotion render Explainer-square out/square_raw.mp4 --concurrency=4 --muted
python3 tools/make_subtitles.py square
VF="subtitles=out/subtitles-square.ass:fontsdir=public/fonts/ttf"
ffmpeg -v error -y -i out/square_raw.mp4 -an -vf "$VF" -c:v libx264 -preset slow -b:v 3500k -pass 1 -passlogfile /tmp/psq -f mp4 /dev/null
ffmpeg -v error -y -i out/square_raw.mp4 -i /tmp/mix.wav -map 0:v -map 1:a -vf "$VF" -c:v libx264 -preset slow -b:v 3500k \
  -maxrate 5500k -bufsize 7000k -pix_fmt yuv420p -pass 2 -passlogfile /tmp/psq -c:a aac -b:a 160k -shortest -movflags +faststart \
  out/video_square.mp4
ls -la out/video_square.mp4
