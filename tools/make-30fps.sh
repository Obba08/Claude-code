#!/usr/bin/env bash
# Makes out/video_30fps.mp4 (<50 MB) from out/video.mp4: 30 fps video + voice with music
# underneath. The music dips automatically whenever the narrator speaks (sidechain ducking)
# and has a small cut around 2.5 kHz so it never competes with the voice.
set -euo pipefail
DUR=$(ffprobe -v error -show_entries format=duration -of csv=p=0 out/video.mp4)
FADE_AT=$(python3 -c "print(round($DUR-2.7,2))")
ffmpeg -v error -y -i out/video.mp4 -an -vf fps=30 -c:v libx264 -preset slow -b:v 3800k -pass 1 -passlogfile /tmp/p -f mp4 /dev/null
ffmpeg -v error -y -i out/video.mp4 -an -vf fps=30 -c:v libx264 -preset slow -b:v 3800k -maxrate 6000k -bufsize 8000k \
  -pix_fmt yuv420p -pass 2 -passlogfile /tmp/p /tmp/v30.mp4
ffmpeg -v error -y -i public/audio/narration.mp3 -i public/audio/music.mp3 -filter_complex "\
[0:a]aformat=sample_rates=48000:channel_layouts=stereo,apad=whole_dur=$DUR,asplit=2[voice][sc];\
[1:a]aformat=sample_rates=48000:channel_layouts=stereo,atrim=0:$DUR,highpass=f=50,equalizer=f=2500:width_type=o:width=2:g=-6,\
volume=-16dB,afade=t=in:d=1.5,afade=t=out:st=$FADE_AT:d=2.7[m];\
[m][sc]sidechaincompress=threshold=0.02:ratio=5:attack=60:release=700[duck];\
[voice][duck]amix=inputs=2:normalize=0:duration=first,loudnorm=I=-16:TP=-1.5:LRA=11[out]" \
  -map "[out]" -ar 48000 -c:a pcm_s16le /tmp/mix.wav
ffmpeg -v error -y -i /tmp/v30.mp4 -i /tmp/mix.wav -map 0:v -map 1:a -c:v copy -c:a aac -b:a 160k -shortest \
  -movflags +faststart out/video_30fps.mp4
ls -la out/video_30fps.mp4

# Subtitled copy: captions come from the word timings (tools/make_subtitles.py).
python3 tools/make_subtitles.py
VF="subtitles=out/subtitles.ass:fontsdir=public/fonts/ttf,fps=30"
ffmpeg -v error -y -i out/video.mp4 -an -vf "$VF" -c:v libx264 -preset slow -b:v 3800k -pass 1 -passlogfile /tmp/ps -f mp4 /dev/null
ffmpeg -v error -y -i out/video.mp4 -i out/video_30fps.mp4 -map 0:v -map 1:a -vf "$VF" -c:v libx264 -preset slow -b:v 3800k \
  -maxrate 6000k -bufsize 8000k -pix_fmt yuv420p -pass 2 -passlogfile /tmp/ps -c:a copy -shortest -movflags +faststart \
  out/video_30fps_subtitled.mp4
ls -la out/video_30fps_subtitled.mp4
