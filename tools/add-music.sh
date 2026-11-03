#!/usr/bin/env bash
# Puts the channel music under the voice of a finished video.
# The music dips automatically whenever the narrator speaks (sidechain ducking), has a small cut around
# 2.5 kHz so it never competes with the voice, and is looped with a 4 s crossfade if the video is longer.
# Usage: tools/add-music.sh [video-with-voice.mp4] [out.mp4]
set -euo pipefail
IN=${1:-out/video_voice.mp4}
OUT=${2:-out/video.mp4}
VOICE=$(python3 -c "import json;print(json.load(open('video.json'))['audio'])")
MUSIC=public/audio/music.mp3
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
FADE_AT=$(python3 -c "print(round($DUR-2.7,2))")
ffmpeg -v error -y -i "$VOICE" -i "$MUSIC" -i "$MUSIC" -filter_complex "\
[1:a]aformat=sample_rates=48000:channel_layouts=stereo[m1];\
[2:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=start=20,asetpts=PTS-STARTPTS[m2];\
[m1][m2]acrossfade=d=4:c1=tri:c2=tri,atrim=0:$DUR,highpass=f=50,equalizer=f=2500:width_type=o:width=2:g=-6,\
volume=-16dB,afade=t=in:d=1.5,afade=t=out:st=$FADE_AT:d=2.7[m];\
[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur=$DUR,asplit=2[voice][sc];\
[m][sc]sidechaincompress=threshold=0.02:ratio=5:attack=60:release=700[duck];\
[voice][duck]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[out]" \
  -map "[out]" -ar 48000 -c:a pcm_s16le /tmp/mix.wav
ffmpeg -v error -y -i "$IN" -i /tmp/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 192k -shortest -movflags +faststart "$OUT"
ls -la "$OUT"
