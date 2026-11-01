#!/usr/bin/env bash
# Adds a soft music bed under a finished clip. The music sits well below the voice and dips
# further whenever the narrator speaks (sidechain ducking), with a cut around 2.5 kHz so it
# never competes with speech (default level puts the music about 18 dB under the voice).
# The music loops if the clip is longer than the track.
# Usage: tools/add_music.sh in.mp4 out.mp4 [music.mp3] [music level in dB, default -7]
set -euo pipefail
IN=$1; OUT=$2; MUSIC=${3:-public/audio/music.mp3}; LEVEL=${4:--7}
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 "$IN")
FADE_AT=$(python3 -c "print(round($DUR-2.0,2))")
ffmpeg -v error -y -i "$IN" -stream_loop -1 -i "$MUSIC" -filter_complex "\
[0:a]aformat=sample_rates=48000:channel_layouts=stereo,asplit=2[voice][sc];\
[1:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:$DUR,highpass=f=60,\
equalizer=f=2500:width_type=o:width=2:g=-8,volume=${LEVEL}dB,afade=t=in:d=1.5,afade=t=out:st=$FADE_AT:d=2.0[m];\
[m][sc]sidechaincompress=threshold=0.03:ratio=4:attack=60:release=700[duck];\
[voice][duck]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-14:TP=-1.5:LRA=11[out]" \
  -map 0:v -map "[out]" -c:v copy -c:a aac -b:a 192k -ar 48000 -movflags +faststart "$OUT"
echo "$OUT"
