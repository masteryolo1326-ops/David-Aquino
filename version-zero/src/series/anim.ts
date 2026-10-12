// Deterministic animation helpers. Everything is a pure function of time so any frame can be
// rendered in isolation (Remotion renders frames out of order across parallel tabs).
export const clamp = (x: number, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const mix = lerp;

export const ease = {
  linear: (t: number) => t,
  inQuad: (t: number) => t * t,
  outQuad: (t: number) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t: number) => t * t * t,
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t: number) => 1 - Math.pow(1 - t, 4),
  inQuart: (t: number) => t * t * t * t,
  inOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  outExpo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: (t: number) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  inOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  // Overshoot for pop-ins (anticipation/follow-through).
  outBack: (t: number, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  // Critically-damped-ish settle with a single soft overshoot.
  outElastic: (t: number) =>
    t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -9 * t) * Math.sin((t * 10 - 0.75) * ((2 * Math.PI) / 3.2)) + 1,
};
export type Ease = (t: number) => number;

/** 0→1 progress of t through [a, b], eased. */
export const prog = (t: number, a: number, b: number, e: Ease = ease.linear) =>
  e(clamp((t - a) / Math.max(1e-6, b - a)));

/** Piecewise-linear keyframes: [[t0, v0], [t1, v1], ...] with optional easing per segment. */
export const keys = (t: number, kf: Array<[number, number, Ease?]>) => {
  if (t <= kf[0][0]) return kf[0][1];
  for (let i = 1; i < kf.length; i++) {
    const [t1, v1, e] = kf[i];
    const [t0, v0] = kf[i - 1];
    if (t <= t1) return lerp(v0, v1, (e ?? ease.inOutCubic)((t - t0) / Math.max(1e-6, t1 - t0)));
  }
  return kf[kf.length - 1][1];
};

/** Fade window: rises over `inDur` from a, falls over `outDur` ending at b. */
export const window01 = (t: number, a: number, b: number, inDur = 0.25, outDur = 0.25, e: Ease = ease.outCubic) =>
  Math.min(prog(t, a, a + inDur, e), 1 - prog(t, b - outDur, b, ease.inCubic));

// Seeded PRNG (mulberry32) — stable across renders and machines.
export const rng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let r = Math.imul(s ^ (s >>> 15), 1 | s);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};
/** Stateless hash noise in [0,1). */
export const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return x - Math.floor(x);
};
/** Smooth 1D value noise in [-1,1]. */
export const noise1 = (x: number, seed = 0) => {
  const i = Math.floor(x);
  const f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 57.3), hash(i + 1 + seed * 57.3), u) * 2 - 1;
};
