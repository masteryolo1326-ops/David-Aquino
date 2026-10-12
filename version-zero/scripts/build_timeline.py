#!/usr/bin/env python3
"""Resolve an episode config against its real narration take.

Reads  src/episodes/<id>/episode.json  (script cues, gaps, event anchors)
Writes src/episodes/<id>/timeline.json (absolute times for cues, caption splits, events)
       public/audio/<id>/narration.wav (narration re-spaced onto the video timeline)

The narration take is split at its natural pauses. Each speech segment must map to
exactly one cue, so the script and the take can never silently drift apart.
"""
import argparse
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SR = 48000
HOP = 0.005  # envelope resolution in seconds


def decode(path: Path, tempo: float) -> np.ndarray:
    af = f"atempo={tempo}" if abs(tempo - 1.0) > 1e-6 else "anull"
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-af", af, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def envelope_db(x: np.ndarray) -> np.ndarray:
    hop = int(SR * HOP)
    win = hop * 4
    n = max(1, (len(x) - win) // hop)
    idx = np.arange(n)[:, None] * hop + np.arange(win)[None, :]
    rms = np.sqrt(np.mean(x[idx] ** 2, axis=1) + 1e-12)
    return 20 * np.log10(rms)


def speech_segments(env: np.ndarray, thresh_db: float, min_sil: float, min_speech: float = 0.12):
    voiced = env > thresh_db
    segs, start, sil_run = [], None, 0
    min_sil_n, min_sp_n = int(min_sil / HOP), int(min_speech / HOP)
    for i, v in enumerate(voiced):
        if v:
            if start is None:
                start = i
            sil_run = 0
        elif start is not None:
            sil_run += 1
            if sil_run >= min_sil_n:
                end = i - sil_run + 1
                if end - start >= min_sp_n:
                    segs.append([start * HOP, end * HOP + HOP * 4])
                start, sil_run = None, 0
    if start is not None:
        segs.append([start * HOP, len(voiced) * HOP])
    return segs


def find_split(env: np.ndarray, seg, frac: float, search: float = 0.45) -> float:
    """Word-boundary estimate: the quietest 40 ms near the char-proportional point."""
    s, e = seg
    guess = s + (e - s) * frac
    lo, hi = max(s + 0.15, guess - search), min(e - 0.15, guess + search)
    a, b = int(lo / HOP), int(hi / HOP)
    if b <= a:
        return guess
    win = 8
    smooth = np.convolve(env, np.ones(win) / win, mode="same")
    region = smooth[a:b]
    # Bias toward the proportional guess so equal dips resolve sensibly.
    dist = np.abs(np.arange(a, b) * HOP - guess)
    score = region + dist * 6.0
    return float((a + int(np.argmin(score))) * HOP)


def write_wav(path: Path, x: np.ndarray):
    path.parent.mkdir(parents=True, exist_ok=True)
    pcm = np.clip(x, -1, 1)
    pcm = (pcm * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episode", default="internet-5-seconds")
    args = ap.parse_args()

    ep_dir = ROOT / "src" / "episodes" / args.episode
    ep = json.loads((ep_dir / "episode.json").read_text())
    nar = ep["narration"]
    x = decode(ROOT / nar["source"], nar["tempo"])
    env = envelope_db(x)
    segs = speech_segments(env, nar["silenceThresholdDb"], nar["minSilence"] / nar["tempo"])
    cues = ep["cues"]
    # A cue may span several speech segments (an internal pause, e.g. "Then, | five seconds later").
    expected = sum(c.get("segments", 1) for c in cues)
    if len(segs) != expected:
        print(f"ERROR: found {len(segs)} speech segments but the cues expect {expected}.", file=sys.stderr)
        for i, (s, e) in enumerate(segs):
            print(f"  seg {i:02d}: {s:6.2f}-{e:6.2f} ({e - s:4.2f}s)", file=sys.stderr)
        sys.exit(1)
    cue_segs, k = [], 0
    for c in cues:
        n = c.get("segments", 1)
        cue_segs.append(segs[k:k + n])
        k += n

    pad_b, pad_a = nar["padBefore"], nar["padAfter"]
    t = ep["leadIn"]
    out_cues = []
    placed = []
    for i, (cue, parts_src) in enumerate(zip(cues, cue_segs)):
        s, e = parts_src[0][0], parts_src[-1][1]
        if i > 0:
            t += cue["gap"]
        dur = e - s
        start, end = t, t + dur
        item = {
            "id": cue["id"], "group": cue["group"], "text": cue["text"],
            "highlight": cue.get("highlight", []),
            "start": round(start, 4), "end": round(end, 4),
            "src": [round(s, 4), round(e, 4)],
        }
        if "captionSplits" in cue:
            parts = cue["captionSplits"]
            if len(parts) == len(parts_src):
                # Each caption part is its own speech segment: split exactly at the pauses.
                bounds = [ps[0] - s + start for ps in parts_src[1:]]
            else:
                total_chars = sum(len(p) for p in parts)
                acc, bounds = 0, []
                for p in parts[:-1]:
                    acc += len(p)
                    bounds.append(find_split(env, (s, e), acc / total_chars) - s + start)
            edges = [start] + bounds + [end]
            item["splits"] = [
                {"text": p, "start": round(edges[k], 4), "end": round(edges[k + 1], 4)} for k, p in enumerate(parts)
            ]
        out_cues.append(item)
        placed.append((s, e, start))
        t = end

    duration = t + ep["tail"]
    fps = ep["fps"]
    frames = int(round(duration * fps))

    by_id = {c["id"]: c for c in out_cues}
    events = {}
    for name, ref in ep["events"].items():
        c = by_id[ref["cue"]]
        edge = ref["edge"]
        if edge.startswith("split"):
            base = c["splits"][int(edge[5:])]["start"]
        else:
            base = c[edge]
        events[name] = round(base + ref.get("offset", 0.0), 4)

    timeline = {
        "episode": ep["id"], "title": ep["title"], "fps": fps,
        "width": ep["width"], "height": ep["height"],
        "duration": round(duration, 4), "durationInFrames": frames,
        "cues": out_cues, "events": events,
    }
    (ep_dir / "timeline.json").write_text(json.dumps(timeline, indent=2) + "\n")

    # Re-space the narration onto the video timeline (short fades avoid clicks).
    out = np.zeros(int((duration + 0.5) * SR), dtype=np.float32)
    fade = int(0.012 * SR)
    for s, e, at in placed:
        a, b = int(max(0, s - pad_b) * SR), int(min(len(x) / SR, e + pad_a) * SR)
        clip = x[a:b].copy()
        ramp = np.linspace(0, 1, fade, dtype=np.float32)
        clip[:fade] *= ramp
        clip[-fade:] *= ramp[::-1]
        o = int((at - (s - max(0, s - pad_b))) * SR)
        out[o:o + len(clip)] += clip
    write_wav(ROOT / "public" / "audio" / args.episode / "narration.wav", out)

    print(f"{len(out_cues)} cues placed; duration {duration:.2f}s = {frames} frames @ {fps}fps")
    for c in out_cues:
        print(f"  {c['id']} {c['start']:6.2f}-{c['end']:6.2f}  {c['text']}")
        for sp in c.get("splits", []):
            print(f"        split {sp['start']:6.2f}-{sp['end']:6.2f}  {sp['text']}")
    for k, v in events.items():
        print(f"  event {k:18s} {v:6.2f}s  (frame {int(round(v * fps))})")


if __name__ == "__main__":
    main()
