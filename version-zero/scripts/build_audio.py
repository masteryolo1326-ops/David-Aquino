#!/usr/bin/env python3
"""Render an episode's soundtrack: music + SFX stems from its score module, narration from
build_timeline.py, sidechain ducking, mix, and loudness normalisation (-14 LUFS, -1.5 dBTP).

    python3 scripts/build_audio.py [--episode internet-5-seconds]

Outputs public/audio/<episode>/{music,sfx,narration,mix}.wav
"""
import argparse
import importlib
import json
import re
import subprocess
import sys
import wave
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT / "scripts"))
from audio.synth import SR, db, follower, highpass  # noqa: E402


def read_wav(path):
    with wave.open(str(path)) as w:
        assert w.getframerate() == SR, f"{path} must be {SR} Hz"
        data = np.frombuffer(w.readframes(w.getnframes()), dtype=np.int16).astype(np.float64) / 32768
        if w.getnchannels() == 2:
            data = data.reshape(-1, 2)
    return data


def write_wav(path, x):
    path.parent.mkdir(parents=True, exist_ok=True)
    x = np.clip(x, -1, 1)
    if x.ndim == 1:
        x = np.stack([x, x], axis=1)
    with wave.open(str(path), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes((x * 32767).astype(np.int16).tobytes())


def normalize_voice(nar, target_rms_db=-22.0):
    """Level the narration by its *spoken* RMS (not its peak), so the music/SFX balance is the
    same whichever voice reads the script; a soft limiter catches the rare peaks above -1 dBFS."""
    nar = highpass(nar, 75)
    hop = SR // 100
    frames = nar[: len(nar) // hop * hop].reshape(-1, hop)
    rms = np.sqrt(np.mean(frames ** 2, axis=1) + 1e-12)
    voiced = rms > np.max(rms) * db(-30)
    level = np.sqrt(np.mean(rms[voiced] ** 2))
    nar = nar * db(target_rms_db) / level
    ceiling = db(-1)
    over = np.abs(nar) > ceiling * 0.8
    nar[over] = np.sign(nar[over]) * (ceiling * 0.8 + (ceiling * 0.2) * np.tanh((np.abs(nar[over]) - ceiling * 0.8) / (ceiling * 0.2)))
    return nar


def loudnorm(src, dst, target=-14.0, tp=-1.5):
    first = subprocess.run(
        ["ffmpeg", "-hide_banner", "-i", str(src), "-af", f"loudnorm=I={target}:TP={tp}:LRA=11:print_format=json", "-f", "null", "-"],
        capture_output=True, text=True,
    ).stderr
    m = json.loads(re.search(r"\{[^{}]*\"input_i\"[^{}]*\}", first, re.S).group(0))
    af = (
        f"loudnorm=I={target}:TP={tp}:LRA=11:measured_I={m['input_i']}:measured_TP={m['input_tp']}:"
        f"measured_LRA={m['input_lra']}:measured_thresh={m['input_thresh']}:offset={m['target_offset']}:linear=true"
    )
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(src), "-af", af, "-ar", str(SR), "-c:a", "pcm_s16le", str(dst)], check=True)
    return m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--episode", default="internet-5-seconds")
    args = ap.parse_args()
    ep = args.episode
    tl = json.loads((ROOT / "src" / "episodes" / ep / "timeline.json").read_text())
    out_dir = ROOT / "public" / "audio" / ep

    module = importlib.import_module("audio." + ep.replace("-", "_"))
    stems = module.render(tl)
    n = int(round(tl["duration"] * SR))

    nar = read_wav(out_dir / "narration.wav")
    if nar.ndim == 2:
        nar = nar.mean(axis=1)
    nar = normalize_voice(nar)
    nar = np.pad(nar, (0, max(0, n - len(nar))))[:n]

    # Phones can't reproduce deep sub-bass; keep it out of the loudness budget.
    music = np.stack([highpass(stems["music"][:n, c], 32, order=4) for c in range(2)], axis=1)
    sfx = np.stack([highpass(stems["sfx"][:n, c], 32, order=4) for c in range(2)], axis=1)
    music = np.pad(music, ((0, n - len(music)), (0, 0)))
    sfx = np.pad(sfx, ((0, n - len(sfx)), (0, 0)))

    # Sidechain: music dips ~9 dB under the voice, SFX ~8 dB.
    env = follower(nar, attack=0.03, release=0.35)
    env = np.clip(env / (np.percentile(env[env > 1e-4], 90) + 1e-9), 0, 1)
    duck_music = db(-9) ** env
    duck_sfx = db(-8) ** env

    music_gain = db(-14)
    sfx_gain = db(-9)
    mix = (
        np.stack([nar, nar], axis=1) * db(0)
        + music * music_gain * duck_music[:, None]
        + sfx * sfx_gain * duck_sfx[:, None]
    )
    # Fade the very end so the file closes cleanly.
    fade = int(0.6 * SR)
    mix[-fade:] *= np.linspace(1, 0, fade)[:, None] ** 1.5

    peak = np.max(np.abs(mix))
    pre = mix / peak * db(-3) if peak > 0 else mix
    write_wav(out_dir / "music.wav", music * music_gain / max(1e-9, np.max(np.abs(music * music_gain))) * db(-3))
    write_wav(out_dir / "sfx.wav", sfx * sfx_gain / max(1e-9, np.max(np.abs(sfx * sfx_gain))) * db(-3))
    raw = out_dir / "mix.raw.wav"
    write_wav(raw, pre)
    m = loudnorm(raw, out_dir / "mix.wav")
    raw.unlink()
    print(f"mix: {tl['duration']:.2f}s, measured {m['input_i']} LUFS → -14 LUFS (TP -1.5)")


if __name__ == "__main__":
    main()
