"""Synthesised sound design + final mix, driven by src/timeline.json.

Everything is generated with numpy (no samples), so the whole soundtrack is
reproducible. Output: build/mix.wav (narration + drone + SFX, loudness-normalised).
"""
import json
import subprocess
import wave
from pathlib import Path

import numpy as np
import sys

ROOT = Path(__file__).resolve().parent.parent
BUILD = ROOT / "build"
TL = json.loads((ROOT / "src" / "timeline.json").read_text())
SR = 44100
STEMS = "--stems" in sys.argv
DUR = TL["duration"]
N = int(DUR * SR) + SR
C = TL["cues"]
SC = {s["id"]: s for s in TL["scenes"]}
rs = np.random.default_rng(173)
t_all = np.arange(N) / SR


# ------------------------------------------------------------ primitives
def noise(n):
    return rs.standard_normal(n).astype(np.float64)


def band(x, lo, hi, soft=0.15):
    X = np.fft.rfft(x)
    f = np.fft.rfftfreq(len(x), 1 / SR)
    lo_m = 1 / (1 + np.exp(-(f - lo) / max(lo * soft, 1)))
    hi_m = 1 / (1 + np.exp((f - hi) / max(hi * soft, 1)))
    return np.fft.irfft(X * lo_m * hi_m, n=len(x))


def smooth(x, k):
    """Centred moving average (O(n), unlike np.convolve with a long kernel)."""
    k = max(1, int(k))
    c = np.cumsum(np.pad(x, (k // 2, k - k // 2), mode="edge"))
    return (c[k:] - c[:-k]) / k


def norm(x):
    m = np.max(np.abs(x)) or 1
    return x / m


def env_exp(n, attack, decay):
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1)
    return a * np.exp(-np.maximum(t - attack, 0) / decay)


class Bus:
    def __init__(self):
        self.l = np.zeros(N)
        self.r = np.zeros(N)

    def add(self, at, x, gain=1.0, pan=0.0):
        i = int(at * SR)
        if i >= N or i + len(x) <= 0:
            return
        if i < 0:
            x, i = x[-i:], 0
        x = x[: N - i]
        gl, gr = gain * np.sqrt((1 - pan) / 2) * 1.414, gain * np.sqrt((1 + pan) / 2) * 1.414
        self.l[i : i + len(x)] += x * gl
        self.r[i : i + len(x)] += x * gr


# ------------------------------------------------------------ sound makers
def hit(length=2.2, f0=58, f1=30, punch=1.0):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = f1 + (f0 - f1) * np.exp(-t * 9)
    body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / (length * 0.33))
    click = band(noise(n), 800, 6000) * np.exp(-t / 0.012) * 0.6 * punch
    tail = band(noise(n), 60, 900) * np.exp(-t / (length * 0.25)) * 0.25
    return norm(body + click + tail)


def whoosh(length=0.55, lo=250, hi=4200):
    n = int(length * SR)
    t = np.linspace(0, 1, n)
    x = noise(n)
    out = np.zeros(n)
    steps = 12
    for k in range(steps):  # sweep the band upward in chunks
        a, b = int(k * n / steps), int((k + 1) * n / steps)
        c = lo * (hi / lo) ** (k / steps)
        seg = band(x, c * 0.6, c * 1.6)[a:b]
        out[a:b] = seg
    e = np.sin(np.pi * t) ** 2
    return norm(out * e)


def scrape(length=0.8, seed=0):
    n = int(length * SR)
    t = np.arange(n) / SR
    g = np.random.default_rng(seed)
    grains = np.repeat(g.random(int(length * 70) + 2), SR // 70 + 1)[:n]
    am = 0.35 + 0.65 * grains * (0.5 + 0.5 * np.sin(2 * np.pi * 31 * t + g.random() * 6))
    x = band(noise(n), 180, 1700) * am + 0.4 * band(noise(n), 2500, 6000) * am ** 3
    e = np.minimum(1, t / 0.05) * np.minimum(1, (length - t) / 0.12)
    return norm(x * e)


def snap():
    n = int(0.35 * SR)
    t = np.arange(n) / SR
    crack = band(noise(n), 1500, 9000) * np.exp(-t / 0.008)
    thump = np.sin(2 * np.pi * 75 * t) * np.exp(-t / 0.08)
    return norm(crack * 0.9 + thump)


def glitch(length=0.22, seed=1):
    n = int(length * SR)
    g = np.random.default_rng(seed)
    out = np.zeros(n)
    i = 0
    while i < n:
        L = int(g.uniform(0.008, 0.03) * SR)
        f = g.choice([220, 440, 880, 1760, 3520])
        tt = np.arange(L) / SR
        sq = np.sign(np.sin(2 * np.pi * f * tt)) * g.uniform(0.3, 1)
        if g.random() < 0.35:
            sq = band(noise(L), 2000, 9000)
        out[i : i + L] = sq[: n - i]
        i += L + int(g.uniform(0, 0.012) * SR)
    return norm(out) * 0.8


def static(length):
    n = int(length * SR)
    t = np.arange(n) / SR
    x = band(noise(n), 900, 9000) * (0.7 + 0.3 * np.sign(np.sin(2 * np.pi * 13 * t)))
    return norm(x) * np.minimum(1, t / 0.01) * np.minimum(1, (length - t) / 0.02)


def blip(f=900, length=0.06):
    n = int(length * SR)
    t = np.arange(n) / SR
    return np.sin(2 * np.pi * f * t * (1 + 0.6 * t / length)) * np.exp(-t / 0.018)


def tick():
    n = int(0.02 * SR)
    t = np.arange(n) / SR
    return band(noise(n), 2500, 7000) * np.exp(-t / 0.003)


def riser(length):
    n = int(length * SR)
    t = np.arange(n) / SR
    p = t / length
    f = 110 * 2 ** (p * 2.2)
    tone = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.5 * np.sin(2 * np.pi * np.cumsum(f * 1.5) / SR)
    air = band(noise(n), 1500, 8000)
    return norm((tone * 0.6 + air * 0.5) * p ** 2.2)


def screech(length=1.3):
    n = int(length * SR)
    t = np.arange(n) / SR
    f = 2300 + 400 * np.sin(2 * np.pi * 7 * t) + 300 * np.sin(2 * np.pi * 2.3 * t)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) + 0.6 * np.sin(2 * np.pi * np.cumsum(f * 1.41) / SR)
    x = np.tanh(3 * x) + 0.5 * band(noise(n), 2000, 7000)
    return norm(x) * np.exp(-t / 0.45) * np.minimum(1, t / 0.01)


# ------------------------------------------------------------------ beds
def scene_curve(levels, fade=0.25):
    """Piecewise level per scene id with short crossfades."""
    curve = np.zeros(N)
    for s in TL["scenes"]:
        a, b = int(s["start"] * SR), int(s["end"] * SR)
        curve[a:b] = levels.get(s["id"], 0)
    return smooth(curve, fade * SR)


def drone():
    t = t_all
    lfo = 0.6 + 0.4 * np.sin(2 * np.pi * 0.11 * t)
    low = (np.sin(2 * np.pi * 46.25 * t) + 0.7 * np.sin(2 * np.pi * 69.3 * t + 1) + 0.35 * np.sin(2 * np.pi * 92.5 * t + 2)) * lfo
    rumble = band(noise(N), 40, 260) * 2.5
    high = np.sin(2 * np.pi * (1108 + 6 * np.sin(2 * np.pi * 0.3 * t)) * t) * 0.12 * (0.5 + 0.5 * np.sin(2 * np.pi * 0.07 * t))
    detune = 0.04 * (np.sin(2 * np.pi * 554 * t) + np.sin(2 * np.pi * 556.8 * t))
    return low * 0.5 + rumble * 0.25 + high + detune


def hum():  # fluorescent buzz for the cell, cut during blackouts
    t = t_all
    x = sum(np.sin(2 * np.pi * 120 * k * t) / k for k in range(1, 8))
    return x * 0.18 + band(noise(N), 3000, 8000) * 0.05


# ------------------------------------------------------------------ build
def main():
    music, sfx = Bus(), Bus()

    lvl = scene_curve({"hook": 0.8, "rule": 0.7, "nickname": 0.85, "moment": 1.0, "theory1": 1.05,
                       "theory2": 0.9, "theory3": 1.0, "problem": 1.1, "ending": 0.9})
    d = drone() * lvl
    # buffering and the final blink drop the bed out completely
    gate = np.ones(N)
    for b in (C["t2Buf1"], C["t2Buf2"], C["t2Buf3"]):
        gate[int(b * SR) : int((b + 0.55) * SR)] = 0.15
    gate[int(C["finalBlink"] * SR) : int(C["finalFace"] * SR)] = 0
    gate[int(C["finalFace"] * SR) :] = 0.5
    gate = smooth(gate, 400)
    music.add(0, d * gate * 0.08, pan=-0.05)
    music.add(0, d * gate * 0.08, pan=0.05)

    h = hum() * scene_curve({"hook": 1, "nickname": 1.2, "theory3": 0.8, "problem": 0.8, "ending": 0.9})
    for a, L in ((C["nickFlicker1"], 0.3), (C["nickFlicker2"], 0.34)):
        h[int(a * SR) : int((a + L) * SR)] = 0
    sfx.add(0, h * 0.05)

    # whoosh + soft hit on every cut
    for s in TL["scenes"][1:]:
        sfx.add(s["start"] - 0.35, whoosh(0.5), 0.22, pan=0.2)
        sfx.add(s["start"] - 0.02, hit(1.6, 52, 32, 0.4), 0.28)

    # hook
    sfx.add(0.02, hit(2.6, 60, 28), 0.75)
    sfx.add(C["tripodIn"] - 0.7, scrape(1.1, 3) * 0.6, 0.18, pan=-0.6)  # tripod dragged in
    sfx.add(C["tripodIn"] + 0.45, snap(), 0.25, pan=-0.5)

    # rule: the blink
    sfx.add(C["ruleBlink"] - 0.05, whoosh(0.4, 400, 2500), 0.25)
    sfx.add(C["ruleBlink"] + 0.2, scrape(0.25, 7), 0.4)
    sfx.add(C["ruleBlink"] + 0.32, snap(), 0.65)
    sfx.add(C["ruleBlink"] + 0.32, hit(2.0, 70, 30), 0.6)
    sfx.add(C["ruleScreen"] - 0.05, blip(620, 0.12), 0.15)

    # nickname: breaker clunks, scraping in the dark
    for a, L, seed in ((C["nickFlicker1"], 0.3, 11), (C["nickFlicker2"], 0.34, 12)):
        sfx.add(a, hit(0.5, 120, 60, 1.2), 0.35)
        sfx.add(a + 0.02, scrape(L + 0.45, seed), 0.6, pan=0.3)
        sfx.add(a + L, hit(1.2, 65, 30, 0.6), 0.4)

    # moment: viewer counter ticking up, then a slam at one million
    a, b = C["momentLive"], C["momentMillion"]
    tt = a
    while tt < b:
        sfx.add(tt, tick(), 0.25, pan=0.3)
        tt += max(0.025, 0.14 * (1 - (tt - a) / (b - a)) ** 1.5)
    sfx.add(a - 0.05, blip(1200, 0.08), 0.2)
    sfx.add(b - 1.0, riser(1.0), 0.2)
    sfx.add(b, hit(2.4, 62, 28), 0.7)

    # theory 1: low heartbeat under the wall of eyes
    s1 = SC["theory1"]
    beat = s1["start"] + 0.3
    while beat < s1["end"] - 0.3:
        sfx.add(beat, hit(0.45, 70, 40, 0.1), 0.35)
        sfx.add(beat + 0.22, hit(0.45, 62, 38, 0.1), 0.25)
        beat += 0.85
    sfx.add(C["t1Watching"], blip(440, 0.2), 0.08)

    # theory 2: buffering stutter, silence, glitch + scrape on resume
    for k, bt in enumerate((C["t2Buf1"], C["t2Buf2"], C["t2Buf3"])):
        sfx.add(bt, glitch(0.18, 20 + k), 0.3)
        sfx.add(bt + 0.2, scrape(0.3, 30 + k), 0.12)
        sfx.add(bt + 0.55, glitch(0.12, 40 + k), 0.35)
        sfx.add(bt + 0.55, hit(1.4, 66, 30, 0.8), 0.5 + 0.1 * k)

    # theory 3: every snap of movement + chat pops
    s3 = SC["theory3"]
    for k in range(1, 6):
        at = s3["start"] + 0.45 + (k - 1) * 0.55
        if at < s3["end"]:
            sfx.add(at - 0.04, scrape(0.18, 50 + k), 0.35, pan=(k % 2) * 0.6 - 0.3)
            sfx.add(at, snap(), 0.3)
    for i in range(6):
        sfx.add(s3["start"] + 0.4 + i * 0.52, blip(950 + 80 * i), 0.12, pan=0.5)

    # problem: the catch-up, static, stream dies
    sfx.add(C["pBehind"], blip(500, 0.15), 0.1)
    sfx.add(C["pCatch"], hit(2.0, 64, 28), 0.65)
    sfx.add(C["pCatch"] - 0.03, scrape(0.25, 77), 0.3, pan=-0.4)
    sfx.add(C["pOffline"] - 0.35, static(0.35), 0.35)
    sfx.add(C["pOffline"], blip(180, 0.25), 0.2)

    # ending: riser, the blink, the face
    sfx.add(C["endDirect"] - 0.02, hit(1.4, 70, 40, 0.5), 0.3)
    rise = C["finalBlink"] - C["endTwo"]
    sfx.add(C["endTwo"], riser(rise), 0.32)
    sfx.add(C["finalFace"], hit(3.0, 55, 22, 1.4), 1.0)
    sfx.add(C["finalFace"], screech(1.2), 0.35)
    sfx.add(C["finalFace"], band(noise(int(0.8 * SR)), 100, 4000) * np.exp(-np.arange(int(0.8 * SR)) / SR / 0.2), 0.35)

    # narration + sidechain duck of the bed
    with wave.open(str(BUILD / "narration.wav")) as f:
        vo = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float64) / 32768
    vo = vo[:N] if len(vo) >= N else np.pad(vo, (0, N - len(vo)))
    envw = int(0.05 * SR)
    venv = np.sqrt(smooth(vo ** 2, envw))
    duck = 1 - 0.45 * np.clip(venv / 0.05, 0, 1)
    duck = smooth(duck, 0.12 * SR)

    if STEMS:
        for name, a in (("vo", vo), ("bed", music.l * duck), ("sfx", sfx.l * 0.62 * (0.6 + 0.4 * duck))):
            with wave.open(str(BUILD / f"stem_{name}.wav"), "wb") as f:
                f.setnchannels(1); f.setsampwidth(2); f.setframerate(SR)
                f.writeframes((np.clip(a, -1, 1) * 32767).astype(np.int16).tobytes())
    SFX_GAIN = 0.62
    L = vo * 1.0 + music.l * duck + sfx.l * SFX_GAIN * (0.6 + 0.4 * duck)
    R = vo * 1.0 + music.r * duck + sfx.r * SFX_GAIN * (0.6 + 0.4 * duck)
    end = int(DUR * SR)
    fade = int(0.05 * SR)
    for ch in (L, R):
        ch[end - fade : end] *= np.linspace(1, 0, fade)
    st = np.stack([L[:end], R[:end]], axis=1)
    st = np.tanh(st * 1.1) / np.tanh(1.1)  # gentle safety saturation
    raw = BUILD / "mix_raw.wav"
    with wave.open(str(raw), "wb") as f:
        f.setnchannels(2)
        f.setsampwidth(2)
        f.setframerate(SR)
        f.writeframes((np.clip(st, -1, 1) * 32767).astype(np.int16).tobytes())
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(raw), "-af", "loudnorm=I=-14:TP=-1.5:LRA=11",
                    "-ar", str(SR), str(BUILD / "mix.wav")], check=True)
    print("wrote", BUILD / "mix.wav")


if __name__ == "__main__":
    main()
