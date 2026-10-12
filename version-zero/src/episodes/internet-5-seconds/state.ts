import {clamp, ease, hash, prog} from '../../series/anim';

// Episode "physics": every derived quantity is a pure function of time + timeline events.
export type Ev = Record<string, number>;

/** Countdown value. 5 real seconds are stretched (slowed) across the blackout→reconnect span. */
export const timerValue = (t: number, ev: Ev) => 5 * (1 - clamp((t - ev.blackout) / (ev.reconnect - ev.blackout)));

/** Real (un-slowed) seconds since the outage began, 0..5. */
export const outageSeconds = (t: number, ev: Ev) => 5 - timerValue(t, ev);

export const isOffline = (t: number, ev: Ev) => t >= ev.blackout && t < ev.reconnect;

/** Internet link state: 1 live, 0 dead. Snaps off at blackout, snaps on at reconnect. */
export const linkLive = (t: number, ev: Ev) => {
  if (t < ev.blackout) {
    // single anticipation flicker on "entire internet"
    const f = ev.blackout - 1.25;
    return t > f && t < f + 0.07 ? 0.45 : 1;
  }
  if (t < ev.reconnect) return 1 - prog(t, ev.blackout, ev.blackout + 0.12);
  return prog(t, ev.reconnect, ev.reconnect + 0.08);
};

/** Network clock: packets freeze in place during the outage. */
export const netTime = (t: number, ev: Ev) => {
  if (t < ev.blackout) return t;
  if (t < ev.reconnect) return ev.blackout;
  return ev.blackout + (t - ev.reconnect);
};

export const linkAlarm = (t: number, ev: Ev) =>
  t >= ev.blackout && t < ev.blackout + 0.3 ? 1 - prog(t, ev.blackout, ev.blackout + 0.3, ease.inQuad) : 0;

export const linkFlash = (t: number, ev: Ev) =>
  t >= ev.reconnect ? 1 - prog(t, ev.reconnect, ev.reconnect + 0.7, ease.outCubic) : 0;

// ---- App status beacons above the city (one per app/service) ----
const CYAN: [number, number, number] = [0.18, 0.9, 1.0];
const AMBER: [number, number, number] = [1.0, 0.71, 0.28];
const CORAL: [number, number, number] = [1.0, 0.42, 0.3];

/**
 * Each app notices the outage at its own moment (same outage, different timeouts), and after
 * reconnect some recover at once while others wait for their next retry.
 * Times are scattered at random — not a spreading wave — because nothing is physically spreading.
 */
export const beaconState = (t: number, ev: Ev, i: number, s: number): [number, number, number, number] => {
  const notice = ev.sceneFirstSecond + 0.5 + hash(i * 3.7) * 2.8; // goes "waiting"
  const timesOut = s < 0.45;
  const timeoutAt = ev.cloudIn + hash(i * 9.1) * 2.6;
  const instant = hash(i * 5.3) < 0.42;
  const recoverAt = instant ? ev.reconnect + 0.1 + hash(i * 2.2) * 0.35 : ev.recoverInstant + 0.4 + hash(i * 7.7) * 5.5;
  let col = CYAN;
  let changed = -100;
  if (t >= notice) {
    col = AMBER;
    changed = notice;
  }
  if (timesOut && t >= timeoutAt) {
    col = CORAL;
    changed = timeoutAt;
  }
  if (t >= ev.reconnect) {
    col = AMBER; // retrying
    changed = Math.max(changed, ev.reconnect);
  }
  if (t >= recoverAt) {
    col = CYAN;
    changed = recoverAt;
  }
  const pop = t - changed < 0.35 ? 1 - (t - changed) / 0.35 : 0;
  const pulse = col === AMBER ? 0.15 * Math.sin(t * 6 + i) : 0;
  return [col[0], col[1], col[2], 0.95 + pop * 0.9 + pulse];
};
