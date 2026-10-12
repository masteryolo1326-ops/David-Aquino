import React, {useCallback} from 'react';
import {AbsoluteFill} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Globe, GlobeCamera} from '../../series/three/Globe';
import {City, CityCamera} from '../../series/three/City';
import {cameraAt, CamKey} from '../../series/camera';
import {ease, keys, lerp, prog} from '../../series/anim';
import {palette} from '../../series/theme';
import {useEvents, useTime} from '../../series/timeline';
import {beaconState, linkAlarm, linkFlash, linkLive, netTime} from './state';

const W = 1080;
const H = 1920;
const DIVE_TARGET = {lat: 40.7, lon: -74.0};

// ---------- Globe (hook + dive, and the final pull-back) ----------
const GlobeLayer: React.FC<{phase: 'hook' | 'payoff'}> = ({phase}) => {
  const t = useTime();
  const ev = useEvents();
  let cam = {lat: 0, lon: 0, dist: 8, lift: 0};
  if (phase === 'hook') {
    const dive = prog(t, ev.diveStart + 0.15, ev.sceneFirstSecond + 0.12, ease.inCubic);
    const drift = {lat: lerp(18, 30, t / 3.2), lon: lerp(-34, -56, t / 3.2)};
    cam = {
      lat: lerp(drift.lat, DIVE_TARGET.lat, ease.inOutQuad(dive)),
      lon: lerp(drift.lon, DIVE_TARGET.lon, ease.inOutQuad(dive)),
      dist: lerp(lerp(9.4, 8.7, prog(t, 0, ev.diveStart, ease.outQuad)), 1.07, dive),
      lift: lerp(-0.42, 0, dive),
    };
  } else {
    const pull = prog(t, ev.scenePayoff - 0.1, ev.scenePayoff + 2.0, ease.outCubic);
    cam = {
      lat: lerp(DIVE_TARGET.lat, 26, pull),
      lon: lerp(DIVE_TARGET.lon, -58, pull) - Math.max(0, t - ev.scenePayoff) * 1.6,
      dist: lerp(1.12, 10.4, pull),
      lift: lerp(0, -1.55, pull),
    };
  }
  return (
    <ThreeCanvas width={W} height={H} gl={{antialias: true}} style={{background: palette.void}}>
      <GlobeCamera {...cam} />
      <Globe live={linkLive(t, ev)} netTime={netTime(t, ev)} alarm={linkAlarm(t, ev)} flash={linkFlash(t, ev)} />
    </ThreeCanvas>
  );
};

// ---------- City (scenes 2–5) ----------
const cityKeys = (ev: Record<string, number>): CamKey[] => [
  {t: ev.sceneFirstSecond - 0.2, pos: [0, 31, 29], look: [0, 0, -5]},
  {t: ev.sceneFirstSecond + 1.4, pos: [-3, 19, 25], look: [0, 2, -3]},
  {t: ev.callIn, pos: [-7, 12.5, 20], look: [0, 3, -2]},
  {t: ev.gameIn + 0.2, pos: [-2, 11, 17.5], look: [2, 3, -3]},
  {t: ev.sceneRipple, pos: [4.5, 10, 15.5], look: [3, 3, -3]},
  {t: ev.cloudTimeout, pos: [8.5, 11, 13.5], look: [2, 2.6, -2]},
  {t: ev.notEverything + 1.1, pos: [8, 18, 21], look: [0, 1.8, -3]},
  {t: ev.tileVideo, pos: [0, 19, 23], look: [0, 2, -2]},
  {t: ev.sceneReturn + 0.2, pos: [-9, 13, 18], look: [0, 3, -3]},
  {t: ev.reconnect, pos: [-7, 7, 13], look: [1, 4.4, -3]},
  {t: ev.retrying, pos: [-2, 8.5, 13.5], look: [2, 4, -3]},
  {t: ev.scenePayoff - 0.15, pos: [1.5, 11, 14.5], look: [2, 4, -3]},
  {t: ev.scenePayoff + 0.45, pos: [2, 46, 24], look: [0, 0, -2]},
];

const CityLayer: React.FC = () => {
  const t = useTime();
  const ev = useEvents();
  const cam = cameraAt(t, cityKeys(ev));
  const beacon = useCallback((i: number, s: number) => beaconState(t, ev, i, s), [t, ev]);
  return (
    <ThreeCanvas width={W} height={H} gl={{antialias: true}} style={{background: palette.void}}>
      <CityCamera pos={cam.pos} look={cam.look} fov={50} />
      <City t={t} live={linkLive(t, ev)} netTime={netTime(t, ev)} flash={linkFlash(t, ev)} beacon={beacon} />
    </ThreeCanvas>
  );
};

// ---------- Layer scheduling + zoom-through transitions ----------
export const World: React.FC = () => {
  const t = useTime();
  const ev = useEvents();
  const hookEnd = ev.sceneFirstSecond + 0.15;
  const cityStart = ev.sceneFirstSecond - 0.18;
  const cityEnd = ev.scenePayoff + 0.3;
  const payoffStart = ev.scenePayoff - 0.12;

  // globe → city: punch through the target city light
  const hookOut = prog(t, ev.sceneFirstSecond - 0.22, hookEnd, ease.inCubic);
  const cityIn = prog(t, cityStart, ev.sceneFirstSecond + 0.35, ease.outCubic);
  // city → globe: rise and pull out
  const cityOut = prog(t, ev.scenePayoff - 0.05, cityEnd, ease.inCubic);
  const payoffIn = prog(t, payoffStart, ev.scenePayoff + 0.45, ease.outCubic);

  return (
    <AbsoluteFill style={{background: palette.void}}>
      {t < hookEnd && (
        <AbsoluteFill style={{transform: `scale(${1 + hookOut * 0.6})`, opacity: 1 - hookOut}}>
          <GlobeLayer phase="hook" />
        </AbsoluteFill>
      )}
      {t >= cityStart && t < cityEnd && (
        <AbsoluteFill style={{transform: `scale(${keys(t, [[cityStart, 1.35], [ev.sceneFirstSecond + 0.35, 1, ease.outCubic]]) * (1 - cityOut * 0.25)})`, opacity: cityIn * (1 - cityOut)}}>
          <CityLayer />
        </AbsoluteFill>
      )}
      {t >= payoffStart && (
        <AbsoluteFill style={{transform: `scale(${1.35 - 0.35 * payoffIn})`, opacity: payoffIn}}>
          <GlobeLayer phase="payoff" />
        </AbsoluteFill>
      )}
    </AbsoluteFill>
  );
};
