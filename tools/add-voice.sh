#!/usr/bin/env bash
# Puts the narration on a video rendered without sound (--props='{"noAudio":true}').
# Usage: tools/add-voice.sh [silent.mp4] [voice.mp3] [out.mp4]
# Same result as rendering with the voice, without re-rendering every frame.
set -euo pipefail
IN=${1:-out/video_silent.mp4}
VOICE=${2:-$(python3 -c "import json;print(json.load(open('video.json'))['audio'])")}
OUT=${3:-out/video.mp4}
ffmpeg -v error -y -i "$IN" -i "$VOICE" -map 0:v -map 1:a -c:v copy \
  -af "apad" -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ls -la "$OUT"
