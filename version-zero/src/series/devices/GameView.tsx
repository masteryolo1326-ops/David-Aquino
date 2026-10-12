import React from 'react';
import {ease, prog} from '../anim';
import {fonts, palette} from '../theme';
import {IconWarn} from './Card';

// Top-down multiplayer arena. Your character is simulated locally (client-side prediction),
// so it keeps moving; the other player is only known from server updates, so it freezes
// when they stop and snaps to the server's position when they resume.
const youPath = (t: number) => ({x: 0.5 + 0.3 * Math.sin(t * 0.95), y: 0.55 + 0.28 * Math.sin(t * 1.4 + 1)});
const p2Path = (t: number) => ({x: 0.5 + 0.33 * Math.sin(t * 0.8 + 2.4), y: 0.5 + 0.3 * Math.cos(t * 1.15 + 0.3)});

export const GameView: React.FC<{
  t: number;
  width: number;
  height: number;
  freezeAt: number;
  resumeAt?: number;
  compact?: boolean;
}> = ({t, width, height, freezeAt, resumeAt = Infinity, compact = false}) => {
  const frozen = t >= freezeAt && t < resumeAt;
  const you = youPath(t);
  // Rubber-band: after resume, ease from the stale position to the live one over 0.18 s.
  let p2 = p2Path(Math.min(t, freezeAt));
  if (t >= resumeAt) {
    const k = prog(t, resumeAt, resumeAt + 0.18, ease.outCubic);
    const stale = p2Path(freezeAt);
    const live = p2Path(t);
    p2 = {x: stale.x + (live.x - stale.x) * k, y: stale.y + (live.y - stale.y) * k};
  }
  const snapping = t >= resumeAt && t < resumeAt + 0.3;
  const W = width;
  const H = height;
  const r = compact ? 13 : 22;
  const trail = Array.from({length: 7}, (_, i) => youPath(t - (i + 1) * 0.06));
  const p2trail = frozen ? [] : Array.from({length: 7}, (_, i) => p2Path(Math.min(t, freezeAt) - (i + 1) * 0.06));
  const stale = p2Path(freezeAt);
  return (
    <div style={{position: 'relative', width: W, height: H, overflow: 'hidden', borderRadius: compact ? 18 : 0, background: '#0B1035'}}>
      <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
        <defs>
          <pattern id="grid" width={compact ? 22 : 40} height={compact ? 22 : 40} patternUnits="userSpaceOnUse">
            <path d={`M ${compact ? 22 : 40} 0 L 0 0 0 ${compact ? 22 : 40}`} fill="none" stroke="#1C2566" strokeWidth="1.5" />
          </pattern>
        </defs>
        <rect width={W} height={H} fill="url(#grid)" />
        <circle cx={W / 2} cy={H / 2} r={H * 0.22} fill="none" stroke="#2A3480" strokeWidth={3} strokeDasharray="10 10" />
        {[
          [0.16, 0.22, 0.12, 0.1],
          [0.74, 0.2, 0.1, 0.16],
          [0.2, 0.72, 0.16, 0.08],
          [0.72, 0.74, 0.12, 0.1],
        ].map(([x, y, w, h], i) => (
          <g key={i}>
            <rect x={x * W} y={y * H} width={w * W} height={h * H} rx={10} fill="#1A2160" />
            <rect x={x * W} y={y * H} width={w * W} height={6} rx={3} fill="#2E3A9A" />
          </g>
        ))}
        {trail.map((p, i) => (
          <circle key={i} cx={p.x * W} cy={p.y * H} r={r * (1 - i * 0.11)} fill={palette.cyan} opacity={0.18 - i * 0.022} />
        ))}
        {p2trail.map((p, i) => (
          <circle key={i} cx={p.x * W} cy={p.y * H} r={r * (1 - i * 0.11)} fill={palette.violet} opacity={0.18 - i * 0.022} />
        ))}
        {snapping && (
          <line x1={stale.x * W} y1={stale.y * H} x2={p2.x * W} y2={p2.y * H} stroke={palette.violet} strokeWidth={r * 1.2} strokeLinecap="round" opacity={0.35 * (1 - prog(t, resumeAt, resumeAt + 0.3))} />
        )}
        {/* other player */}
        <circle cx={p2.x * W} cy={p2.y * H} r={r} fill={palette.violet} stroke="#fff" strokeWidth={3} opacity={frozen ? 0.85 : 1} />
        {frozen && <circle cx={p2.x * W} cy={p2.y * H} r={r + 10} fill="none" stroke={palette.coral} strokeWidth={3} strokeDasharray="6 6" />}
        {/* you */}
        <circle cx={you.x * W} cy={you.y * H} r={r} fill={palette.cyan} stroke="#fff" strokeWidth={3} />
      </svg>
      <Label x={you.x * W} y={you.y * H - r - (compact ? 22 : 34)} color={palette.cyan} size={compact ? 14 : 20}>
        YOU
      </Label>
      <Label x={p2.x * W} y={p2.y * H - r - (compact ? 22 : 34)} color={frozen ? palette.coral : palette.violet} size={compact ? 14 : 20}>
        {frozen ? (
          <span style={{display: 'inline-flex', alignItems: 'center', gap: 6}}>
            <IconWarn size={compact ? 14 : 20} /> {compact ? 'NO UPDATES' : 'P2 · NO UPDATES'}
          </span>
        ) : (
          'P2'
        )}
      </Label>
      {!compact && (
        <>
          <div style={{position: 'absolute', left: 20, top: 16, fontFamily: fonts.mono, fontWeight: 700, fontSize: 22, color: frozen ? palette.coral : palette.cyan}}>
            PING {frozen ? '———' : `${28 + Math.round(4 * Math.sin(t * 3))} ms`}
          </div>
          <div style={{position: 'absolute', right: 20, top: 14, fontFamily: fonts.mono, fontWeight: 700, fontSize: 26, color: palette.cream}}>3 : 2</div>
        </>
      )}
    </div>
  );
};

const Label: React.FC<{x: number; y: number; color: string; size: number; children: React.ReactNode}> = ({x, y, color, size, children}) => (
  <div
    style={{
      position: 'absolute',
      left: x,
      top: y,
      transform: 'translateX(-50%)',
      fontFamily: fonts.mono,
      fontWeight: 700,
      fontSize: size,
      color,
      background: 'rgba(3,5,15,0.6)',
      padding: '2px 8px',
      borderRadius: 8,
      whiteSpace: 'nowrap',
    }}
  >
    {children}
  </div>
);
