#!/usr/bin/env python3
"""Resolve an episode config against its real narration take.

Reads  src/episodes/<id>/episode.json  (script cues, gaps, event anchors)
Writes src/episodes/<id>/timeline.json (absolute times for cues, caption splits, events)
       public/audio/<id>/narration.wav (narration re-spaced onto the video timeline)

The narration take is split at its natural pauses, and the segments are aligned to the script's
cues by expected speaking time (see align_segments). The alignment is printed with a per-cue
duration ratio so a misread or skipped line is caught before rendering.
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


def align_segments(segs, cues, w_internal=2.0):
    """Partition consecutive speech segments into one group per cue.

    Different voices pause in different places, so instead of demanding one segment per cue we
    pick the partition whose groups best match each cue's expected speaking time (from its
    character count) while keeping long pauses *between* cues rather than inside them.
    """
    n, m = len(segs), len(cues)
    chars = np.array([max(1, len(c["text"])) for c in cues], dtype=float)
    speech = np.array([e - s for s, e in segs])
    rate = speech.sum() / chars.sum()
    gaps = np.array([0.0] + [segs[i][0] - segs[i - 1][1] for i in range(1, n)])

    def group_cost(j, a, b):  # cue j takes segments a..b-1
        dur = speech[a:b].sum()
        ratio = np.log(dur / (chars[j] * rate))
        return ratio * ratio + w_internal * gaps[a + 1:b].sum()

    inf = float("inf")
    f = np.full((m + 1, n + 1), inf)
    back = np.zeros((m + 1, n + 1), dtype=int)
    f[0][0] = 0.0
    for j in range(1, m + 1):
        for i in range(j, n - (m - j) + 1):
            for a in range(j - 1, i):
                if f[j - 1][a] == inf:
                    continue
                c = f[j - 1][a] + group_cost(j - 1, a, i)
                if c < f[j][i]:
                    f[j][i], back[j][i] = c, a
    groups, i = [], n
    for j in range(m, 0, -1):
        a = back[j][i]
        groups.append(segs[a:i])
        i = a
    groups.reverse()
    return groups, rate


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
    x = x / (np.max(np.abs(x)) + 1e-9) * 0.9  # level-independent silence threshold
    env = envelope_db(x)
    cues = ep["cues"]
    # Find speech segments; if the take has fewer pauses than cues, look for shorter pauses.
    for min_sil in (nar["minSilence"], 0.13, 0.1, 0.075, 0.06):
        segs = speech_segments(env, nar["silenceThresholdDb"], min_sil / nar["tempo"])
        if len(segs) >= len(cues):
            break
    if len(segs) < len(cues):
        print(f"ERROR: only {len(segs)} speech segments for {len(cues)} cues — check the take.", file=sys.stderr)
        sys.exit(1)
    cue_segs, rate = align_segments(segs, cues)
    print(f"{len(segs)} speech segments aligned to {len(cues)} cues ({1 / rate:.1f} chars/s)")
    for c, g in zip(cues, cue_segs):
        dur = sum(e - s0 for s0, e in g)
        ratio = dur / (len(c["text"]) * rate)
        flag = "  <-- check" if not 0.6 < ratio < 1.6 else ""
        print(f"  {c['id']} {len(g)} seg  {dur:5.2f}s  x{ratio:4.2f}  {c['text'][:48]}{flag}")

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
            total_chars = sum(len(p) for p in parts)
            internal = [ps[0] for ps in parts_src[1:]]  # starts of segments after internal pauses
            acc, bounds = 0, []
            for p in parts[:-1]:
                acc += len(p)
                guess = s + (e - s) * acc / total_chars
                near = [b for b in internal if abs(b - guess) < 0.7]
                # Prefer a real pause near the proportional point; else the quietest moment.
                cut = min(near, key=lambda b: abs(b - guess)) if near else find_split(env, (s, e), acc / total_chars)
                bounds.append(cut - s + start)
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
