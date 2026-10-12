#!/usr/bin/env bash
# Rebuilds out/scp173-livestream.mp4 from source.
#   HANDLE=@you ./build.sh        (WORKERS=3 by default)
set -euo pipefail
cd "$(dirname "$0")"
WORKERS=${WORKERS:-3}

[ -d node_modules/three ] || npm install --no-audit --no-fund

python3 -I tools/prepare_audio.py
python3 -I tools/sound.py

FRAMES=$(python3 -I -c "import json,math;t=json.load(open('src/timeline.json'));print(math.ceil(t['duration']*t['fps']))")
rm -rf build/frames && mkdir -p build/frames build/logs
CHUNK=$(( (FRAMES + WORKERS - 1) / WORKERS ))
for ((w = 0; w < WORKERS; w++)); do
  node tools/render.mjs --frames $((w * CHUNK)):$(((w + 1) * CHUNK)) > "build/logs/w$w.log" 2>&1 &
done
wait

mkdir -p out
ffmpeg -v error -y -framerate 30 -i build/frames/f%05d.jpg -i build/mix.wav \
  -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -profile:v high -movflags +faststart \
  -c:a aac -b:a 192k -shortest out/scp173-livestream.mp4
echo "done: out/scp173-livestream.mp4"
