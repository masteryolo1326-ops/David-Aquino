#!/usr/bin/env bash
# Tile inspection stills into one labelled contact sheet.
#   scripts/contact-sheet.sh <dir-with-pngs> <out.png> [cols]
set -euo pipefail
dir="$1"; out="$2"; cols="${3:-5}"
files=("$dir"/*.png)
n=${#files[@]}
rows=$(( (n + cols - 1) / cols ))
args=(); filt=""
for i in "${!files[@]}"; do
  f="${files[$i]}"; label=$(basename "$f" .png | sed 's/.*-f0*//')
  args+=(-i "$f")
  filt+="[$i:v]scale=360:640,drawtext=text='f${label}':x=10:y=10:fontsize=26:fontcolor=white:box=1:boxcolor=black@0.6[v$i];"
done
inputs=""; for i in $(seq 0 $((n-1))); do inputs+="[v$i]"; done
ffmpeg -v error -y "${args[@]}" -filter_complex "${filt}${inputs}xstack=inputs=$n:layout=$(python3 -c "
c=$cols;n=$n
print('|'.join(f'{(i%c)*360}_{(i//c)*640}' for i in range(n)))
"):fill=black" "$out"
echo "$out"
