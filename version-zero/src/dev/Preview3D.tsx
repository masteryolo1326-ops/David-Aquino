import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {ThreeCanvas} from '@remotion/three';
import {Globe, GlobeCamera} from '../series/three/Globe';
import {City, CityCamera} from '../series/three/City';
import {palette} from '../series/theme';

// Development-only compositions for checking 3D look-dev in isolation.
export const GlobePreview: React.FC<{dist?: number; live?: number}> = ({dist = 6.6, live = 1}) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{background: palette.void}}>
      <ThreeCanvas width={1080} height={1920} gl={{antialias: true}}>
        <GlobeCamera lat={22} lon={-50 - f * 0.1} dist={dist} lift={0.32} />
        <Globe live={live} netTime={f / 30} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export const CityPreview: React.FC<{live?: number}> = ({live = 1}) => {
  const f = useCurrentFrame();
  const t = f / 30;
  return (
    <AbsoluteFill style={{background: palette.void}}>
      <ThreeCanvas width={1080} height={1920} gl={{antialias: true}}>
        <CityCamera pos={[-6, 9, 22 - t]} look={[0, 2.5, 0]} />
        <City t={t} live={live} netTime={t} beacon={(i, s) => (s > 0.5 ? [0.18, 0.9, 1, 1] : [1, 0.71, 0.28, 1])} />
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
