import React from 'react';
import {fonts, palette} from '../theme';

// Shared chrome for every on-screen "app": glassy navy panel, header with icon + title,
// optional status slot. Border tone signals state (cyan live / amber waiting / coral failed).
export const Card: React.FC<{
  width: number;
  height: number;
  title?: string;
  icon?: React.ReactNode;
  status?: React.ReactNode;
  tone?: string;
  headerSize?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
  dim?: number; // 0..1 desaturate/darken (stalled look)
}> = ({width, height, title, icon, status, tone = palette.cyan, headerSize = 30, children, style, dim = 0}) => {
  const header = title ? headerSize * 2.5 : 0;
  return (
    <div
      style={{
        width,
        height,
        borderRadius: 34,
        background: 'linear-gradient(180deg, rgba(22,29,78,0.96) 0%, rgba(10,14,40,0.97) 100%)',
        border: `2px solid ${tone}8C`,
        boxShadow: `0 40px 90px rgba(0,0,0,0.55), inset 0 1px 0 rgba(255,255,255,0.08), 0 0 50px ${tone}26`,
        overflow: 'hidden',
        position: 'relative',
        filter: dim > 0 ? `saturate(${1 - 0.6 * dim}) brightness(${1 - 0.3 * dim})` : undefined,
        ...style,
      }}
    >
      {title && (
        <div
          style={{
            height: header,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: `0 ${headerSize * 0.9}px`,
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div style={{display: 'flex', alignItems: 'center', gap: headerSize * 0.5}}>
            {icon}
            <span style={{fontFamily: fonts.display, fontWeight: 700, fontSize: headerSize, color: palette.cream}}>{title}</span>
          </div>
          {status}
        </div>
      )}
      <div style={{position: 'absolute', top: header, left: 0, right: 0, bottom: 0}}>{children}</div>
    </div>
  );
};

export const Spinner: React.FC<{t: number; size?: number; color?: string; stroke?: number}> = ({
  t,
  size = 60,
  color = palette.amber,
  stroke = 6,
}) => {
  const r = size / 2 - stroke;
  const c = 2 * Math.PI * r;
  return (
    <svg width={size} height={size} style={{transform: `rotate(${(t * 360 * 1.1) % 360}deg)`}}>
      <circle cx={size / 2} cy={size / 2} r={r} stroke={`${color}33`} strokeWidth={stroke} fill="none" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        stroke={color}
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
        strokeDasharray={`${c * 0.28} ${c}`}
      />
    </svg>
  );
};

// ---- Icons (simple, original line icons) ----
type IconProps = {size?: number; color?: string};
export const IconCamera: React.FC<IconProps> = ({size = 36, color = palette.cyan}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="6" width="14" height="12" rx="3" />
    <path d="M16 10l6-3v10l-6-3z" />
  </svg>
);
export const IconGamepad: React.FC<IconProps> = ({size = 36, color = palette.violet}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8h12a4 4 0 014 4v1a4 4 0 01-7 2.6L14 15h-4l-1 .6A4 4 0 012 13v-1a4 4 0 014-4z" />
    <path d="M7 11v3M5.5 12.5h3" />
    <circle cx="16" cy="11.5" r="0.6" fill={color} />
    <circle cx="18" cy="13.5" r="0.6" fill={color} />
  </svg>
);
export const IconChart: React.FC<IconProps> = ({size = 36, color = palette.cyan}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 3v18h18" />
    <path d="M6 15l4-5 4 3 5-7" />
  </svg>
);
export const IconCloud: React.FC<IconProps & {off?: boolean}> = ({size = 36, color = palette.cyan, off}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M7 18h10a4 4 0 00.6-7.96A6 6 0 006.2 9.1 4.5 4.5 0 007 18z" />
    {off && <path d="M3 3l18 18" />}
  </svg>
);
export const IconChip: React.FC<IconProps> = ({size = 36, color = palette.cyan}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <rect x="9.5" y="9.5" width="5" height="5" rx="1" />
    <path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3" />
  </svg>
);
export const IconBank: React.FC<IconProps> = ({size = 36, color = palette.cream}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 10l9-6 9 6" />
    <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8" />
    <path d="M3 21h18M3 18h18" />
  </svg>
);
export const IconCheck: React.FC<IconProps> = ({size = 28, color = palette.cyan}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const IconRetry: React.FC<IconProps & {spin?: number}> = ({size = 28, color = palette.amber, spin = 0}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth={2.6}
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{transform: `rotate(${spin}deg)`}}
  >
    <path d="M20 11a8 8 0 10-2.3 6.3" />
    <path d="M20 4v7h-7" />
  </svg>
);
export const IconWarn: React.FC<IconProps> = ({size = 28, color = palette.coral}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 3l10 18H2z" />
    <path d="M12 10v5M12 18v.01" />
  </svg>
);
export const IconBolt: React.FC<IconProps> = ({size = 28, color = palette.warmLight}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M13 2L4 14h7l-1 8 9-12h-7z" />
  </svg>
);
export const IconPlay: React.FC<IconProps> = ({size = 28, color = palette.cream}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color} stroke="none">
    <path d="M7 4.5v15l13-7.5z" />
  </svg>
);
export const IconCard: React.FC<IconProps> = ({size = 36, color = palette.cream}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="3" />
    <path d="M2 10h20" />
  </svg>
);
export const IconNotes: React.FC<IconProps> = ({size = 36, color = palette.cream}) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <rect x="4" y="3" width="16" height="18" rx="3" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
);
