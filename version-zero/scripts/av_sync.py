#!/usr/bin/env python3
"""Measure the offset between a rendered MP4's audio and the source mix (cross-correlation).
    python3 scripts/av_sync.py <video.mp4> <mix.wav>   → prints offset in ms (0 = in sync)
"""
import subprocess
import sys

import numpy as np
from scipy import signal

SR = 8000


def load(path):
    raw = subprocess.run(["ffmpeg", "-v", "error", "-i", path, "-ac", "1", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32)


a, b = load(sys.argv[1]), load(sys.argv[2])
n = min(len(a), len(b), SR * 20)
corr = signal.correlate(a[:n], b[:n], mode="full", method="fft")
lag = np.argmax(corr) - (n - 1)
peak = corr.max() / (np.linalg.norm(a[:n]) * np.linalg.norm(b[:n]) + 1e-9)
print(f"offset_ms={lag / SR * 1000:.1f} correlation={peak:.3f}")
