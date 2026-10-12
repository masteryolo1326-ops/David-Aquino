"""Score + sound effects for "What If the Entire Internet Disappeared for 5 Seconds?"

Every sound is anchored to a named timeline event (timeline.json), the same events the
visuals use, so picture and sound cannot drift apart when the edit changes.
Musical idea: busy D-minor pulse (the living internet) → hard cut to a sub drone (outage)
→ warm F/Bb major pad for the reveal (things that keep working) → riser into a bright
D-major sparkle at reconnection → pulse returns, resolving on Bbmaj9 → Fmaj9.
"""
import numpy as np

from .synth import (SR, apply_reverb, bandpass, bitcrush, env_adsr, env_exp, glide, highpass, lowpass, midi_hz,
                    noise, place, reverb_ir, saw_additive, seconds, sine, swept_lowpass)

rng = np.random.default_rng(42)

# ---------------------------------------------------------------- instruments

def pad(notes, dur, cutoff=1400.0, attack=0.8, release=1.2, detune=0.006):
    out = np.zeros(int(dur * SR))
    for m in notes:
        f = midi_hz(m)
        for d in (-detune, 0.0, detune):
            out += saw_additive(f * (1 + d), dur, max_h=18, cutoff=cutoff * 2.5)
    out = lowpass(out, cutoff) / (len(notes) * 3)
    return out * env_adsr(dur, a=attack, d=0.2, s=1.0, r=release)


def pluck(m, dur=0.35, bright=1.0):
    f = midi_hz(m)
    x = sine(f, dur) + 0.35 * bright * sine(f * 2, dur) + 0.12 * bright * sine(f * 3, dur)
    return x * env_exp(dur, 0.09 + 0.05 * bright) * 0.5


def bell(m, dur=1.2, decay=0.45):
    f = midi_hz(m)
    x = sine(f, dur) + 0.5 * sine(f * 2.76, dur) * env_exp(dur, decay * 0.4) + 0.25 * sine(f * 5.4, dur) * env_exp(dur, decay * 0.2)
    return x * env_exp(dur, decay, attack=0.004) * 0.45


def kick(dur=0.35, f0=120.0, f1=42.0):
    x = sine(glide(f0, f1, dur), dur) * env_exp(dur, 0.12)
    click = highpass(noise(0.01), 2000) * 0.15
    x[: len(click)] += click
    return x * 0.9


def hat(dur=0.05):
    return highpass(noise(dur), 7000) * env_exp(dur, 0.012) * 0.25


def blip(f, dur=0.04):
    return sine(f, dur) * env_exp(dur, 0.012) * 0.3


def whoosh(dur, f0=300.0, f1=3500.0, peak=0.6):
    x = swept_lowpass(noise(dur), f0, f1)
    t = np.linspace(0, 1, len(x))
    shape = np.sin(np.pi * np.clip(t / peak, 0, 1) * 0.5) ** 2 * np.clip((1 - t) / (1 - peak), 0, 1) ** 1.5
    return highpass(x, 120) * shape * 0.6


def riser(dur):
    x = swept_lowpass(noise(dur), 200.0, 9000.0)
    t = np.linspace(0, 1, len(x))
    tone = sine(glide(110, 880, dur), dur) * 0.25
    return (highpass(x, 150) * 0.5 + tone) * t ** 2.2


def sub_drone(dur, m=38):
    f = midi_hz(m)
    x = sine(f, dur) + 0.5 * sine(f * 2, dur) + 0.15 * sine(f * 3.01, dur)
    wob = 1 + 0.15 * np.sin(2 * np.pi * 0.23 * seconds(dur))
    return x * wob * 0.35


def glitch_burst(dur=0.42):
    n = noise(dur)
    crushed = bitcrush(bandpass(n, 400, 6000) * 0.9, bits=4, hold=24)
    grain = crushed[: int(0.03 * SR)]
    stutter = np.concatenate([grain] * 4)
    sweep = sine(glide(1400, 60, 0.38), 0.38) * env_exp(0.38, 0.16) * 0.7
    out = np.zeros(int(dur * SR))
    out[: len(stutter)] += stutter * 0.8
    out[: len(sweep)] += sweep
    out[: int(0.25 * SR)] += kick(0.25, 90, 30)[: int(0.25 * SR)] * 0.9
    return out * env_adsr(dur, a=0.001, d=0.05, s=0.8, r=0.12)


def tick(pitch=1.0, weight=1.0):
    dur = 0.18
    x = bandpass(noise(dur), 1800 * pitch, 3400 * pitch) * env_exp(dur, 0.012) * 0.7
    x += sine(70 * pitch, dur) * env_exp(dur, 0.06) * 0.6 * weight
    return x * 0.55


def ui_pop(f=880.0):
    dur = 0.12
    return sine(glide(f, f * 1.5, dur), dur) * env_exp(dur, 0.035) * 0.35


def swipe(dur=0.32, up=True):
    return whoosh(dur, 500 if up else 4000, 4000 if up else 500, peak=0.5) * 0.7


def chime_down():
    out = np.zeros(int(0.8 * SR))
    a = bell(76, 0.5, 0.18)
    b = bell(72, 0.6, 0.22)
    out[: len(a)] += a
    o = int(0.16 * SR)
    out[o:o + len(b)] += b
    return out * 0.6


def error_bonk():
    dur = 0.4
    x = sine(glide(240, 150, dur), dur) * env_exp(dur, 0.09)
    x += lowpass(noise(dur), 600) * env_exp(dur, 0.03) * 0.3
    return x * 0.6


def beep(f=2000.0, dur=0.09):
    return sine(f, dur) * env_adsr(dur, a=0.002, d=0.02, s=0.8, r=0.02) * 0.25


def sparkle(root=62, dur=2.0):
    out = np.zeros(int(dur * SR))
    for k, m in enumerate([root, root + 4, root + 7, root + 12, root + 16, root + 19]):
        b = bell(m + 12, dur - k * 0.05, 0.6)
        o = int(k * 0.045 * SR)
        out[o:o + len(b)] += b[: len(out) - o]
    return out * 0.55


def typing(dur=1.6, rate=16):
    out = np.zeros(int(dur * SR))
    for i in range(int(dur * rate)):
        c = bandpass(noise(0.02), 2500, 6000) * env_exp(0.02, 0.004) * (0.5 + 0.5 * rng.random())
        o = int((i / rate + rng.random() * 0.01) * SR)
        out[o:o + len(c)] += c[: len(out) - o]
    return out * 0.25


def chatter(dur, density=28.0):
    """The sound of a busy network: tiny random blips."""
    out = np.zeros((int(dur * SR), 2))
    n = int(dur * density)
    for _ in range(n):
        f = 1800 + rng.random() * 4200
        b = blip(f, 0.02 + rng.random() * 0.03) * (0.25 + 0.5 * rng.random())
        place(out, rng.random() * (dur - 0.06), b, gain=0.5, pan=rng.uniform(-0.8, 0.8))
    return out


# ---------------------------------------------------------------- score

DM9 = [38, 45, 53, 60, 64]          # D2 A2 F3 C4 E4
BBMAJ9 = [34, 46, 53, 57, 60]       # Bb1 Bb2 F3 A3 C4
FMAJ9 = [41, 48, 55, 57, 64]        # F2 C3 G3 A3 E4
FMAJ7 = [41, 48, 57, 60, 64]        # F2 C3 A3 C4 E4
ARP_DM = [62, 65, 69, 72, 76, 72, 69, 65]
ARP_F = [65, 69, 72, 76, 79, 76, 72, 69]


def arp_pattern(t0, t1, notes, step, gain, out, bright=1.0, pan_spread=0.35):
    t = t0
    i = 0
    while t < t1 - 0.05:
        p = pluck(notes[i % len(notes)], 0.32, bright)
        place(out, t, p, gain=gain, pan=pan_spread * np.sin(i * 0.9))
        t += step
        i += 1


def beat(t0, t1, bpm, out, kick_gain=0.5, hat_gain=0.35):
    step = 60.0 / bpm
    t = t0
    i = 0
    while t < t1 - 0.02:
        if i % 4 == 0:
            place(out, t, kick(), gain=kick_gain)
        if i % 2 == 1:
            place(out, t, hat(), gain=hat_gain, pan=0.2)
        t += step / 2
        i += 1


def render(tl):
    ev = tl["events"]
    dur = tl["duration"] + 0.6
    n = int(dur * SR)
    music = np.zeros((n, 2))
    sfx = np.zeros((n, 2))
    B, R = ev["blackout"], ev["reconnect"]
    span = R - B

    # --- 1. the living internet (0 → blackout): pulse + arp + pad, hard-cut at blackout
    hook = np.zeros((n, 2))
    place(hook, 0.0, pad(DM9, B + 0.4, cutoff=1500, attack=0.05, release=0.05), gain=0.55)
    arp_pattern(0.0, B, ARP_DM, 0.125, 0.33, hook, bright=1.0)
    beat(0.0, B, 120, hook, kick_gain=0.45, hat_gain=0.3)
    cut = int(B * SR)
    # tape-stop: the last 0.2 s before the cut pitch-drops (time-stretch by resampling)
    seg = hook[cut - int(0.06 * SR):cut + int(0.25 * SR)].copy()
    idx = np.cumsum(np.linspace(1.0, 0.15, len(seg))).astype(int)
    idx = idx[idx < len(seg)]
    stop = seg[idx] * np.linspace(1, 0, len(idx))[:, None]
    hook[cut - int(0.06 * SR):] = 0
    hook[cut - int(0.06 * SR):cut - int(0.06 * SR) + len(stop)] += stop * 0.8
    music += hook
    place(sfx, 0.0, chatter(B), gain=0.5)

    # --- 2. outage (blackout → notEverything): sub drone + glassy tension + slowed-clock ticks
    t_ne = ev["notEverything"]
    drone_d = R - B + 0.6
    d = sub_drone(drone_d)
    d *= env_adsr(drone_d, a=0.6, d=0.1, s=1.0, r=0.8)
    place(music, B + 0.05, d, gain=0.4)
    glass = (sine(midi_hz(81), t_ne - B) + 0.7 * sine(midi_hz(88) * 1.002, t_ne - B)) * 0.12
    glass *= (0.6 + 0.4 * np.sin(2 * np.pi * 0.7 * seconds(t_ne - B))) * env_adsr(t_ne - B, a=2.5, d=0.1, s=1, r=0.6)
    place(music, B + 0.8, glass, gain=0.45, pan=0.1)
    wind = lowpass(noise(R - B), 500) * env_adsr(R - B, a=1.5, d=0.1, s=1, r=0.5) * 0.05
    place(music, B, wind, gain=1.0)
    # the countdown's whole and half "seconds": slowed clock ticks
    for k in range(1, 10):
        val = 5 - 0.5 * k  # 4.5, 4.0, ... 0.5
        tt = B + (5 - val) / 5 * span
        whole = abs(val - round(val)) < 1e-6
        place(sfx, tt, tick(1.0 if whole else 1.35, 1.0 if whole else 0.4), gain=0.8 if whole else 0.4)
    for val in (0.3, 0.15):  # accelerating last ticks into reconnection
        place(sfx, B + (5 - val) / 5 * span, tick(1.6, 0.3), gain=0.35)

    # --- 3. the reveal (notEverything → sceneReturn): warm major pad + gentle plucks
    t_sr = ev["sceneReturn"]
    warm1 = pad(FMAJ7, ev["tileVideo"] - t_ne + 0.8, cutoff=1800, attack=0.4, release=0.8)
    place(music, t_ne - 0.05, warm1, gain=0.5)
    warm2 = pad(BBMAJ9, t_sr - ev["tileVideo"] + 0.6, cutoff=2000, attack=0.6, release=0.6)
    place(music, ev["tileVideo"], warm2, gain=0.5)
    arp_pattern(ev["sceneSurprise"], t_sr - 0.1, ARP_F, 0.333, 0.16, music, bright=0.5, pan_spread=0.5)

    # --- 4. return: riser → silence beat → bright sparkle + the pulse returns
    rs = R - 2.2
    place(music, rs, riser(2.2), gain=0.32)
    place(music, R, pad(DM9, 0.9, cutoff=3000, attack=0.01, release=0.8), gain=0.4)
    back_end = ev["scenePayoff"] + 0.5
    pulse = np.zeros((n, 2))
    place(pulse, R + 0.4, pad(FMAJ9, back_end - R, cutoff=1700, attack=0.5, release=0.6), gain=0.5)
    arp_pattern(R + 0.05, back_end, ARP_DM, 0.125, 0.24, pulse, bright=0.9)
    beat(R + 0.05, back_end, 120, pulse, kick_gain=0.38, hat_gain=0.24)
    music += pulse
    place(sfx, R, sparkle(62, 2.4), gain=0.45)
    place(sfx, R, kick(0.5, 80, 40), gain=0.6)
    place(sfx, R + 0.3, chatter(3.0, density=22), gain=0.35)

    # --- 5. payoff: resolve Bbmaj9 → Fmaj9, thinning arp, final sparkle at the brand
    P = ev["scenePayoff"]
    end = tl["duration"]
    place(music, P - 0.1, pad(BBMAJ9, ev["chartLaneB"] - P + 0.6, cutoff=1600, attack=0.3, release=0.7), gain=0.55)
    place(music, ev["chartLaneB"], pad(FMAJ9, end - ev["chartLaneB"] + 0.4, cutoff=1500, attack=0.5, release=1.6), gain=0.55)
    arp_pattern(P, end - 0.6, ARP_F, 0.25, 0.14, music, bright=0.6, pan_spread=0.5)
    place(sfx, ev["brand"], bell(77, 2.2, 0.9), gain=0.45, pan=-0.1)
    place(sfx, ev["brand"] + 0.06, bell(84, 2.0, 0.8), gain=0.3, pan=0.15)
    place(sfx, ev["brand"], kick(0.45, 70, 30), gain=0.45)

    # --- SFX locked to visual events
    place(sfx, B, glitch_burst(), gain=0.85)
    place(sfx, ev["diveStart"] + 0.15, whoosh(ev["sceneFirstSecond"] - ev["diveStart"] + 0.2, 250, 6000, peak=0.85), gain=0.75)
    place(sfx, ev["sceneFirstSecond"], kick(0.6, 70, 28), gain=0.55)
    place(sfx, ev["callIn"], ui_pop(880), gain=0.7)
    place(sfx, ev["callFreeze"], bitcrush(sine(glide(320, 90, 0.18), 0.18) * env_exp(0.18, 0.08), 4, 30) * 0.5, gain=0.6)
    place(sfx, ev["gameIn"], swipe(), gain=0.5)
    place(sfx, ev["gameFreeze"], bandpass(noise(0.05), 1500, 3500) * env_exp(0.05, 0.012) * 0.8, gain=0.6, pan=-0.2)
    place(sfx, ev["dashIn"], swipe(), gain=0.5)
    place(sfx, ev["dashStall"], chime_down(), gain=0.5)
    place(sfx, ev["sceneRipple"], swipe(0.35), gain=0.45)
    place(sfx, ev["cardTap"], beep(), gain=0.8, pan=-0.2)
    t = ev["cardTap"] + 0.45
    while t < ev["cloudIn"]:
        place(sfx, t, blip(1100, 0.05), gain=0.35, pan=-0.3)  # pending pulse
        t += 0.45
    place(sfx, ev["cloudIn"], swipe(0.3), gain=0.45, pan=0.3)
    place(sfx, ev["cloudTimeout"], error_bonk(), gain=0.7, pan=0.25)
    place(sfx, ev["notEverything"], whoosh(0.9, 3000, 300, peak=0.2), gain=0.35)
    place(sfx, ev["sceneSurprise"], swipe(0.45, up=False), gain=0.45)
    place(sfx, ev["tilePower"], pluck(72, 0.5, 0.6), gain=0.55)
    place(sfx, ev["tilePower"], sine(60, 0.9) * env_adsr(0.9, 0.1, 0.1, 0.6, 0.5) * 0.25, gain=0.5)
    place(sfx, ev["tileOffline"], pluck(76, 0.4, 0.6), gain=0.5)
    place(sfx, ev["tileOffline"] + 0.18, pluck(79, 0.4, 0.6), gain=0.5)
    place(sfx, ev["tileOffline"] + 0.2, typing(1.8), gain=0.6, pan=0.25)
    place(sfx, ev["tileVideo"], pluck(81, 0.5, 0.6), gain=0.5)
    place(sfx, ev["bufferExplain"], whoosh(0.7, 400, 5000, peak=0.6), gain=0.45)
    place(sfx, ev["bufferExplain"] + 0.55, bell(88, 1.0, 0.4), gain=0.3)
    place(sfx, t_sr, swipe(0.45), gain=0.4)
    for k, m in enumerate([81, 85, 88]):
        place(sfx, ev["recoverInstant"] + 0.15 * k, bell(m, 0.9, 0.35), gain=0.45, pan=-0.3 + 0.3 * k)
    for k, m in enumerate([64, 65, 64]):
        place(sfx, ev["retrying"] + 0.15 * k, pluck(m, 0.4, 0.3), gain=0.5, pan=0.3 - 0.3 * k)
    place(sfx, P - 0.5, riser(0.5) * 0.8, gain=0.35)
    place(sfx, P, whoosh(1.2, 4000, 250, peak=0.15), gain=0.55)
    # chart sonification: connection steps (instant), recovery staircase (ticks per check)
    a0, a1 = ev["chartLaneA"] + 0.05, ev["chartLaneB"] - 0.15
    to_t = lambda s, t0, t1: t0 + (s + 1.2) / (11.5 + 1.2) * (t1 - t0)
    place(sfx, to_t(0, a0, a1), pluck(57, 0.3, 0.4), gain=0.35)
    place(sfx, to_t(5, a0, a1), pluck(69, 0.3, 0.8), gain=0.45)
    b0, b1 = ev["chartLaneB"], ev["brand"] - 0.35
    for k, s in enumerate([5.05, 6.9, 9.6, 10.7]):
        place(sfx, to_t(s, b0, b1), bell(69 + [0, 4, 7, 12][k], 0.7, 0.3), gain=0.32)

    ir = reverb_ir(2.6, 0.6)
    music = apply_reverb(music, ir, wet=0.28)
    sfx = apply_reverb(sfx, reverb_ir(1.6, 0.35, seed=9), wet=0.18)
    return {"music": music[:n], "sfx": sfx[:n]}
