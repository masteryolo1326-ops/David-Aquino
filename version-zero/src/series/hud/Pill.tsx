import React from 'react';
import {fonts, palette} from '../theme';

export const Pill: React.FC<{
  color: string;
  children: React.ReactNode;
  size?: number;
  dot?: boolean;
  dotPulse?: number; // 0..1 glow of the status dot
  style?: React.CSSProperties;
  icon?: React.ReactNode;
}> = ({color, children, size = 26, dot = true, dotPulse = 1, style, icon}) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: size * 0.42,
      padding: `${size * 0.32}px ${size * 0.7}px`,
      borderRadius: 999,
      background: `${color}1F`,
      border: `2px solid ${color}80`,
      color,
      fontFamily: fonts.mono,
      fontWeight: 700,
      fontSize: size,
      letterSpacing: '0.06em',
      textTransform: 'uppercase',
      whiteSpace: 'nowrap',
      boxShadow: `0 0 24px ${color}22`,
      ...style,
    }}
  >
    {dot && (
      <span
        style={{
          width: size * 0.42,
          height: size * 0.42,
          borderRadius: 999,
          background: color,
          boxShadow: `0 0 ${10 + 14 * dotPulse}px ${color}`,
          opacity: 0.55 + 0.45 * dotPulse,
        }}
      />
    )}
    {icon}
    <span style={{color: color === palette.cream ? palette.cream : color}}>{children}</span>
  </div>
);
