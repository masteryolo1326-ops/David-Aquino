"""Tighten the raw ElevenLabs narration and build the shared timeline.

- Shortens every pause (scene breaks keep a slightly longer beat).
- Speeds the read up with ffmpeg's pitch-preserving atempo.
- Maps the per-word timestamps through the same edit so the visuals
  stay in sync, then writes src/timeline.json (scenes + cues) that both
  the renderer and the sound-design script read.
"""
import json
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
RAW = ROOT / "assets" / "narration_raw.mp3"
WORDS = ROOT / "assets" / "narration_words.json"
BUILD = ROOT / "build"
TIMELINE = ROOT / "src" / "timeline.json"

SR = 44100
SPEED = 1.17          # final read speed
LEAD_IN = 0.25        # seconds of room tone before the first word
SILENCE_DB = -40.0
MIN_SILENCE = 0.22    # only pauses longer than this get shortened
PAUSE_KEEP = 0.24     # target length for ordinary pauses (pre-speedup)
SCENE_KEEP = 0.55     # target length for pauses at scene breaks (pre-speedup)
TAIL = 1.9            # ending beat after the last word (final-time seconds)

# First words of each scene, in order.
SCENE_STARTS = [
    ("hook", ["what", "if"]),
    ("rule", ["the", "rule"]),
    ("nickname", ["fans", "call"]),
    ("moment", ["then", "the", "stream"]),
    ("theory1", ["theory", "one"]),
    ("theory2", ["theory", "two"]),
    ("theory3", ["theory", "three"]),
    ("problem", ["but", "heres"]),
    ("ending", ["maybe", "thats"]),
]


def norm(s):
    return "".join(c for c in s.lower() if c.isalnum())


def decode(path):
    raw = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(path), "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
        check=True, capture_output=True,
    ).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def write_wav(path, data):
    pcm = (np.clip(data, -1, 1) * 32767).astype(np.int16)
    with wave.open(str(path), "wb") as f:
        f.setnchannels(1)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes(pcm.tobytes())


def find_silences(x):
    win = int(0.01 * SR)
    n = len(x) // win
    rms = np.sqrt(np.mean(x[: n * win].reshape(n, win) ** 2, axis=1) + 1e-12)
    silent = 20 * np.log10(rms) < SILENCE_DB
    out, start = [], None
    for i, s in enumerate(silent):
        if s and start is None:
            start = i
        elif not s and start is not None:
            if (i - start) * 0.01 >= MIN_SILENCE:
                out.append((start * 0.01, i * 0.01))
            start = None
    return out


def main():
    x = decode(RAW)
    words = [w for w in json.load(open(WORDS)) if not w["text"].startswith("[") and not w["text"].endswith("]")]
    spoken = [norm(w["text"]) for w in words]

    scene_idx = []
    for name, seq in SCENE_STARTS:
        for i in range(len(spoken)):
            if spoken[i : i + len(seq)] == seq and (not scene_idx or i > scene_idx[-1][1]):
                scene_idx.append((name, i))
                break
        else:
            sys.exit(f"scene start not found: {name}")
    break_times = [words[i]["start"] for _, i in scene_idx[1:]]

    # Build the cut list: keep everything except the middle of long pauses.
    silences = find_silences(x)
    keep, cursor = [], 0.0
    for a, b in silences:
        if a < 0.05:  # leading silence: trim fully, LEAD_IN is added later
            cursor = b
            continue
        is_break = any(a - 0.4 <= t <= b + 0.4 for t in break_times)
        target = SCENE_KEEP if is_break else PAUSE_KEEP
        if b - a <= target:
            continue
        keep.append((cursor, a + target / 2))
        cursor = b - target / 2
    keep.append((cursor, len(x) / SR))

    fade = int(0.008 * SR)
    pieces, segmap, out_t = [], [], 0.0
    for a, b in keep:
        seg = x[int(a * SR) : int(b * SR)].copy()
        if len(seg) > 2 * fade:
            seg[:fade] *= np.linspace(0, 1, fade)
            seg[-fade:] *= np.linspace(1, 0, fade)
        pieces.append(seg)
        segmap.append((a, b, out_t))
        out_t += len(seg) / SR
    tight = np.concatenate(pieces)

    def remap(t):
        for a, b, o in segmap:
            if t < a:
                return o / SPEED + LEAD_IN
            if t <= b:
                return (o + t - a) / SPEED + LEAD_IN
        return out_t / SPEED + LEAD_IN

    BUILD.mkdir(exist_ok=True)
    write_wav(BUILD / "narration_tight.wav", tight)
    subprocess.run(
        ["ffmpeg", "-v", "error", "-y", "-i", str(BUILD / "narration_tight.wav"),
         "-af", f"atempo={SPEED},adelay={int(LEAD_IN * 1000)}:all=1,apad=pad_dur={TAIL + 0.5}",
         "-ar", str(SR), "-ac", "1", str(BUILD / "narration.wav")],
        check=True,
    )

    final_words = [
        {"w": w["text"], "k": norm(w["text"]), "s": round(remap(w["start"]), 3), "e": round(remap(w["end"]), 3)}
        for w in words
    ]
    speech_end = final_words[-1]["e"]
    duration = round(speech_end + TAIL, 3)

    scenes = []
    for n, (name, i) in enumerate(scene_idx):
        start = 0.0 if n == 0 else round(final_words[i]["s"] - 0.12, 3)
        scenes.append({"id": name, "start": start, "firstWord": i})
    for n, s in enumerate(scenes):
        s["end"] = scenes[n + 1]["start"] if n + 1 < len(scenes) else duration

    def at(scene, key, which="s", nth=0):
        sc = next(s for s in scenes if s["id"] == scene)
        hits = [w for w in final_words if w["k"] == key and sc["start"] - 0.2 <= w["s"] < sc["end"]]
        return hits[nth][which]

    cues = {
        "tripodIn": at("hook", "camera"),
        "hookBody": at("hook", "a"),
        "ruleLooking": at("rule", "while"),
        "ruleBlink": at("rule", "blink"),
        "ruleMoves": at("rule", "moves"),
        "ruleScreen": at("rule", "but"),
        "nickFlicker1": at("nickname", "concrete") - 0.1,
        "nickFlicker2": at("nickname", "stone") + 0.1,
        "momentLive": at("moment", "live"),
        "momentMillion": at("moment", "in", "e"),
        "t1Watching": at("theory1", "always"),
        "t2Buf1": at("theory2", "buffers"),
        "t2Buf2": at("theory2", "does"),
        "t2Buf3": at("theory2", "blinks"),
        "t3Move": at("theory3", "then"),
        "pBehind": at("problem", "every"),
        "pCatch": at("problem", "isnt"),
        "pOffline": at("problem", "now", "e"),
        "endDirect": at("ending", "direct"),
        "endTwo": at("ending", "two"),
        "finalBlink": round(speech_end + 0.55, 3),
        "finalFace": round(speech_end + 0.75, 3),
    }

    TIMELINE.write_text(json.dumps(
        {"fps": 30, "duration": duration, "speechEnd": speech_end, "scenes": scenes, "cues": cues, "words": final_words},
        indent=1,
    ))
    print(f"narration {out_t / SPEED:.2f}s -> video {duration:.2f}s")
    for s in scenes:
        print(f"  {s['id']:9s} {s['start']:6.2f} - {s['end']:6.2f}  ({s['end'] - s['start']:.2f}s)")


if __name__ == "__main__":
    main()
