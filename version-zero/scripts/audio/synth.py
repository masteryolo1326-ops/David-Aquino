"""Tiny deterministic synthesis toolkit for Version Zero sound design.

Everything here is generated from math (no samples), so every sound in the series is
original and license-free, and a re-render is bit-identical.
"""
import numpy as np
from scipy import signal

SR = 48000
_rng = np.random.default_rng(1234)


def seconds(n):
    return np.arange(int(n * SR)) / SR


def midi_hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


def env_adsr(n_sec, a=0.01, d=0.1, s=0.7, r=0.2):
    n = int(n_sec * SR)
    e = np.zeros(n)
    ia, idd, ir = int(a * SR), int(d * SR), int(r * SR)
    ia = max(1, min(ia, n))
    e[:ia] = np.linspace(0, 1, ia)
    j = ia
    k = min(n, j + idd)
    e[j:k] = np.linspace(1, s, k - j)
    e[k:] = s
    if ir > 0 and n > ir:
        e[-ir:] *= np.linspace(1, 0, ir)
    return e


def env_exp(n_sec, decay, attack=0.002):
    t = seconds(n_sec)
    e = np.exp(-t / decay)
    ia = max(1, int(attack * SR))
    e[:ia] *= np.linspace(0, 1, ia)
    return e


def sine(freq, n_sec, phase=0.0):
    t = seconds(n_sec)
    if np.isscalar(freq):
        return np.sin(2 * np.pi * freq * t + phase)
    ph = 2 * np.pi * np.cumsum(freq) / SR
    return np.sin(ph + phase)


def glide(f0, f1, n_sec, curve="exp"):
    n = int(n_sec * SR)
    if curve == "exp":
        return f0 * (f1 / f0) ** np.linspace(0, 1, n)
    return np.linspace(f0, f1, n)


def saw_additive(freq, n_sec, max_h=24, cutoff=9000.0):
    """Band-limited sawtooth by additive synthesis (fine for pads)."""
    t = seconds(n_sec)
    out = np.zeros_like(t)
    for h in range(1, max_h + 1):
        if freq * h > cutoff:
            break
        out += np.sin(2 * np.pi * freq * h * t) / h
    return out * 0.6


def noise(n_sec):
    return _rng.standard_normal(int(n_sec * SR))


def _sos(kind, f, order=2):
    f = np.atleast_1d(f)
    wn = np.clip(f / (SR / 2), 1e-4, 0.999)
    return signal.butter(order, wn if len(wn) > 1 else wn[0], btype=kind, output="sos")


def lowpass(x, f, order=2):
    return signal.sosfilt(_sos("lowpass", f, order), x)


def highpass(x, f, order=2):
    return signal.sosfilt(_sos("highpass", f, order), x)


def bandpass(x, lo, hi, order=2):
    return signal.sosfilt(_sos("bandpass", [lo, hi], order), x)


def swept_lowpass(x, f_start, f_end, block=0.02):
    """Time-varying low-pass: 50%-overlapped Hann blocks, each filtered at its own cutoff."""
    bs = int(block * SR)
    pad = np.concatenate([np.zeros(bs), x, np.zeros(2 * bs)])
    out = np.zeros(len(pad))
    win = signal.windows.hann(2 * bs, sym=False)
    nblocks = (len(pad) - 2 * bs) // bs + 1
    freqs = f_start * (f_end / f_start) ** np.linspace(0, 1, nblocks)
    for i in range(nblocks):
        a = i * bs
        seg = pad[a:a + 2 * bs]
        if len(seg) < 2 * bs:
            break
        out[a:a + 2 * bs] += lowpass(seg, freqs[i]) * win
    return out[bs:bs + len(x)]


def bitcrush(x, bits=5, hold=6):
    q = 2 ** bits
    y = np.round(x * q) / q
    idx = (np.arange(len(y)) // hold) * hold
    return y[np.minimum(idx, len(y) - 1)]


def pan_stereo(x, pan=0.0):
    """Equal-power pan, pan in [-1, 1]."""
    a = (pan + 1) * np.pi / 4
    return np.stack([x * np.cos(a), x * np.sin(a)], axis=1)


def place(buf, t, x, gain=1.0, pan=0.0):
    """Mix mono/stereo x into stereo buf at time t (seconds)."""
    if x.ndim == 1:
        x = pan_stereo(x, pan)
    i = int(round(t * SR))
    if i >= len(buf):
        return
    if i < 0:
        x = x[-i:]
        i = 0
    j = min(len(buf), i + len(x))
    buf[i:j] += x[: j - i] * gain


def reverb_ir(seconds_len=2.4, decay=0.55, seed=7, damp=5000.0):
    r = np.random.default_rng(seed)
    n = int(seconds_len * SR)
    t = np.arange(n) / SR
    ir = np.stack([r.standard_normal(n), r.standard_normal(n)], axis=1)
    ir *= np.exp(-t / decay)[:, None]
    ir[:, 0] = lowpass(ir[:, 0], damp)
    ir[:, 1] = lowpass(ir[:, 1], damp)
    ir[: int(0.012 * SR)] = 0  # pre-delay
    return ir / np.sqrt(np.sum(ir ** 2, axis=0, keepdims=True))


def apply_reverb(x, ir, wet=0.25):
    out = np.zeros_like(x)
    for c in range(2):
        out[:, c] = signal.fftconvolve(x[:, c], ir[:, c])[: len(x)]
    return x * (1 - wet * 0.5) + out * wet


def db(v):
    return 10 ** (v / 20)


def follower(x_mono, attack=0.03, release=0.3):
    """Envelope follower (used for sidechain ducking)."""
    rect = np.abs(x_mono)
    a = np.exp(-1 / (attack * SR))
    r = np.exp(-1 / (release * SR))
    # Vectorised-enough: downsample, follow, upsample.
    hop = 240
    m = rect[: len(rect) // hop * hop].reshape(-1, hop).max(axis=1)
    m = np.append(m, rect[len(rect) // hop * hop:].max() if len(rect) % hop else 0)
    env = np.zeros_like(m)
    prev = 0.0
    a_h, r_h = a ** hop, r ** hop
    for i, v in enumerate(m):
        coef = a_h if v > prev else r_h
        prev = coef * prev + (1 - coef) * v
        env[i] = prev
    return np.interp(np.arange(len(x_mono)), np.arange(len(env)) * hop, env)
