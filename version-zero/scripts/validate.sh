#!/usr/bin/env bash
# Validate a rendered episode. Exits non-zero if any hard check fails.
#   scripts/validate.sh [video.mp4] [episode-id]
set -uo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
EP="${2:-internet-5-seconds}"
VIDEO="${1:-$ROOT/deliverables/$EP/version-zero-$EP.mp4}"
TL="$ROOT/src/episodes/$EP/timeline.json"
fail=0
ok()   { printf '  \033[32mPASS\033[0m %s\n' "$*"; }
bad()  { printf '  \033[31mFAIL\033[0m %s\n' "$*"; fail=1; }
info() { printf '  info %s\n' "$*"; }

echo "Validating $VIDEO"
[ -s "$VIDEO" ] && ok "file exists ($(du -h "$VIDEO" | cut -f1))" || { bad "file missing"; exit 1; }

probe() { ffprobe -v error -select_streams "$1" -show_entries "$2" -of default=nw=1:nk=1 "$VIDEO"; }
vcodec=$(probe v:0 stream=codec_name); acodec=$(probe a:0 stream=codec_name)
w=$(probe v:0 stream=width); h=$(probe v:0 stream=height)
fps=$(probe v:0 stream=r_frame_rate); pix=$(probe v:0 stream=pix_fmt)
asr=$(probe a:0 stream=sample_rate); ach=$(probe a:0 stream=channels)
dur=$(ffprobe -v error -show_entries format=duration -of default=nw=1:nk=1 "$VIDEO")
exp_frames=$(python3 -c "import json;print(json.load(open('$TL'))['durationInFrames'])")
exp_dur=$(python3 -c "import json;t=json.load(open('$TL'));print(t['durationInFrames']/t['fps'])")

[ "$vcodec" = h264 ] && ok "video codec h264" || bad "video codec $vcodec"
[ "$acodec" = aac ] && ok "audio codec aac ($asr Hz, $ach ch)" || bad "audio codec $acodec"
[ "$w" = 1080 ] && [ "$h" = 1920 ] && ok "resolution 1080x1920 (9:16)" || bad "resolution ${w}x${h}"
[ "$fps" = 30/1 ] && ok "frame rate 30 fps" || bad "frame rate $fps"
[ "$pix" = yuv420p ] && ok "pixel format yuv420p" || bad "pixel format $pix"
python3 -c "import sys; sys.exit(0 if abs($dur-$exp_dur) < 0.1 else 1)" && ok "duration ${dur}s (expected ${exp_dur}s)" || bad "duration $dur vs $exp_dur"
python3 -c "import sys; sys.exit(0 if 30 <= $dur <= 40 else 1)" && ok "duration within 30–40 s target" || bad "duration outside 30–40 s"

echo "Decoding every frame…"
errs=$(ffmpeg -v error -i "$VIDEO" -f null - 2>&1 | head -5)
[ -z "$errs" ] && ok "full decode: no errors" || bad "decode errors: $errs"
nframes=$(ffprobe -v error -count_frames -select_streams v:0 -show_entries stream=nb_read_frames -of default=nw=1:nk=1 "$VIDEO")
[ "$nframes" = "$exp_frames" ] && ok "frame count $nframes" || bad "frame count $nframes (expected $exp_frames)"

black=$(ffmpeg -v info -i "$VIDEO" -vf "blackdetect=d=0.05:pic_th=0.995:pix_th=0.02" -an -f null - 2>&1 | grep -c black_start)
[ "$black" = 0 ] && ok "no black frames" || bad "$black black segment(s)"
frozen=$(ffmpeg -v info -i "$VIDEO" -vf "freezedetect=n=0.0008:d=1.2" -an -f null - 2>&1 | grep -c freeze_start)
[ "$frozen" = 0 ] && ok "no frozen (static >1.2 s) segments" || bad "$frozen frozen segment(s)"

silent=$(ffmpeg -v info -i "$VIDEO" -af "silencedetect=n=-45dB:d=1.2" -vn -f null - 2>&1 | grep -c silence_start)
[ "$silent" = 0 ] && ok "audio present throughout (no silence >1.2 s)" || bad "$silent silent gap(s)"
loud=$(ffmpeg -v info -i "$VIDEO" -af ebur128=peak=true -vn -f null - 2>&1 | grep -A1 "Integrated loudness" | grep -oE "\-?[0-9]+\.[0-9]+ LUFS" | tail -1)
info "integrated loudness: $loud (target -14)"

MIX="$ROOT/public/audio/$EP/mix.wav"
if [ -f "$MIX" ]; then
  sync=$(python3 "$ROOT/scripts/av_sync.py" "$VIDEO" "$MIX")
  off=$(echo "$sync" | sed -E 's/offset_ms=(-?[0-9.]+).*/\1/')
  python3 -c "import sys; sys.exit(0 if abs($off) <= 25 else 1)" && ok "audio in sync with timeline mix ($sync)" || bad "audio offset ($sync)"
fi

[ $fail = 0 ] && echo "ALL CHECKS PASSED" || echo "SOME CHECKS FAILED"
exit $fail
