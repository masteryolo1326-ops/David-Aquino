// Time-keyed camera splines. Non-uniform Catmull-Rom through keyframes gives continuous,
// non-robotic motion (no stop at every key), while staying a pure function of time.
export type Vec3 = [number, number, number];
export type CamKey = {t: number; pos: Vec3; look: Vec3; fov?: number};

const hermite = (p0: number, p1: number, m0: number, m1: number, s: number) => {
  const s2 = s * s;
  const s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * p0 + (s3 - 2 * s2 + s) * m0 + (-2 * s3 + 3 * s2) * p1 + (s3 - s2) * m1;
};

export const splineAt = (t: number, times: number[], values: number[]) => {
  const n = times.length;
  if (t <= times[0]) return values[0];
  if (t >= times[n - 1]) return values[n - 1];
  let i = 0;
  while (t > times[i + 1]) i++;
  const t0 = times[i];
  const t1 = times[i + 1];
  const dt = t1 - t0;
  const slope = (a: number, b: number) => (values[b] - values[a]) / (times[b] - times[a]);
  // Tangents: zero at the ends (ease in/out of the whole move), averaged slopes inside.
  const m0 = i === 0 ? 0 : 0.5 * (slope(i - 1, i) + slope(i, i + 1)) * dt;
  const m1 = i + 1 === n - 1 ? 0 : 0.5 * (slope(i, i + 1) + slope(i + 1, i + 2)) * dt;
  return hermite(values[i], values[i + 1], m0, m1, (t - t0) / dt);
};

export const cameraAt = (t: number, keys: CamKey[]) => {
  const times = keys.map((k) => k.t);
  const comp = (sel: (k: CamKey) => number) => splineAt(t, times, keys.map(sel));
  return {
    pos: [comp((k) => k.pos[0]), comp((k) => k.pos[1]), comp((k) => k.pos[2])] as Vec3,
    look: [comp((k) => k.look[0]), comp((k) => k.look[1]), comp((k) => k.look[2])] as Vec3,
    fov: comp((k) => k.fov ?? 50),
  };
};
