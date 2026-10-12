import React from 'react';
import {fonts, palette} from '../theme';

// Big monospaced countdown. Purely presentational: the episode decides the value, colour,
// position and scale, so the same component works as a hero number or a docked HUD readout.
export const Countdown: React.FC<{
  value: number;
  color: string;
  size: number;
  glowStrength?: number;
  jitter?: [number, number];
  split?: number; // chromatic split in px (glitch moments)
  suffix?: string;
}> = ({value, color, size, glowStrength = 1, jitter = [0, 0], split = 0, suffix = 's'}) => {
  const text = Math.max(0, value).toFixed(2);
  const base: React.CSSProperties = {
    fontFamily: fonts.mono,
    fontWeight: 700,
    fontSize: size,
    lineHeight: 1,
    letterSpacing: '-0.04em',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  };
  return (
    <div style={{position: 'relative', transform: `translate(${jitter[0]}px, ${jitter[1]}px)`}}>
      {split > 0 && (
        <>
          <div style={{...base, position: 'absolute', left: -split, top: 0, color: palette.cyan, opacity: 0.6, mixBlendMode: 'screen'}}>
            {text}
            <span style={{fontSize: size * 0.32, marginLeft: size * 0.04}}>{suffix}</span>
          </div>
          <div style={{...base, position: 'absolute', left: split, top: 0, color: palette.coral, opacity: 0.6, mixBlendMode: 'screen'}}>
            {text}
            <span style={{fontSize: size * 0.32, marginLeft: size * 0.04}}>{suffix}</span>
          </div>
        </>
      )}
      <div
        style={{
          ...base,
          position: 'relative',
          color,
          textShadow: `0 0 ${30 * glowStrength}px ${color}88, 0 0 ${80 * glowStrength}px ${color}44`,
        }}
      >
        {text}
        <span style={{fontSize: size * 0.32, marginLeft: size * 0.04, opacity: 0.75}}>{suffix}</span>
      </div>
    </div>
  );
};
