import React from 'react';
import {fonts, palette} from '../theme';

// The recurring Version Zero mark: a "V0" monogram in a ring, plus wordmark.
export const Monogram: React.FC<{size?: number; color?: string; opacity?: number}> = ({
  size = 64,
  color = palette.cyan,
  opacity = 1,
}) => (
  <svg width={size} height={size} viewBox="0 0 64 64" style={{opacity, overflow: 'visible'}}>
    <circle cx="32" cy="32" r="29" fill="none" stroke={color} strokeWidth="3" />
    <circle cx="32" cy="32" r="29" fill={color} opacity="0.08" />
    <text
      x="32"
      y="41"
      textAnchor="middle"
      fontFamily="Space Grotesk"
      fontWeight={700}
      fontSize="26"
      fill={palette.cream}
      letterSpacing="-1"
    >
      V0
    </text>
  </svg>
);

export const Wordmark: React.FC<{reveal?: number; subtitle?: string}> = ({reveal = 1, subtitle}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 22, opacity: reveal}}>
    <Monogram size={78} />
    <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
      <div
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 40,
          letterSpacing: `${0.28 - 0.14 * reveal}em`,
          color: palette.cream,
        }}
      >
        VERSION ZERO
      </div>
      {subtitle && (
        <div style={{fontFamily: fonts.mono, fontWeight: 500, fontSize: 22, letterSpacing: '0.18em', color: palette.creamDim}}>
          {subtitle}
        </div>
      )}
    </div>
  </div>
);
