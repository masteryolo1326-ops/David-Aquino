import React from 'react';
import {ease, prog} from '../../../series/anim';
import {fonts, palette} from '../../../series/theme';
import {useEvents, useTime} from '../../../series/timeline';

// Decodes the rooftop rings the first time the viewer sees them (and again at reconnection):
// each ring is one app's connection status — not a physical thing.
const Dot: React.FC<{color: string; label: string}> = ({color, label}) => (
  <span style={{display: 'inline-flex', alignItems: 'center', gap: 10}}>
    <span style={{width: 20, height: 20, borderRadius: 999, border: `4px solid ${color}`, boxShadow: `0 0 12px ${color}`}} />
    <span style={{color}}>{label}</span>
  </span>
);

export const StatusLegend: React.FC = () => {
  const t = useTime();
  const ev = useEvents();
  const a = Math.min(prog(t, ev.sceneFirstSecond + 0.5, ev.sceneFirstSecond + 0.9, ease.outCubic), 1 - prog(t, ev.callIn - 0.3, ev.callIn, ease.inCubic));
  const b = Math.min(prog(t, ev.reconnect + 0.15, ev.reconnect + 0.45, ease.outCubic), 1 - prog(t, ev.recoverInstant - 0.25, ev.recoverInstant, ease.inCubic));
  const k = Math.max(a, b);
  if (k <= 0) return null;
  return (
    <div style={{position: 'absolute', left: 0, right: 0, top: 1112, display: 'flex', justifyContent: 'center', opacity: k, transform: `translateY(${(1 - k) * 16}px)`}}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 26,
          padding: '14px 26px',
          borderRadius: 999,
          background: 'rgba(3,5,15,0.72)',
          border: '1px solid rgba(247,239,223,0.14)',
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 22,
          letterSpacing: '0.04em',
        }}
      >
        <span style={{color: palette.creamDim}}>APPS:</span>
        <Dot color={palette.cyan} label="online" />
        <Dot color={palette.amber} label="waiting" />
        <Dot color={palette.coral} label="timed out" />
      </div>
    </div>
  );
};
