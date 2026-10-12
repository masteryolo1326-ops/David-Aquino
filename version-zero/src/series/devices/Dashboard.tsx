import React from 'react';
import {noise1} from '../anim';
import {fonts, palette} from '../theme';

// Cloud-connected live dashboard. It doesn't crash when data stops; the line simply ends
// and the "last update" age keeps growing. `staleFor` is supplied by the episode in real
// (un-slowed) seconds so it agrees with the countdown.
const series = (x: number) => 0.55 + 0.22 * noise1(x * 0.9, 2) + 0.1 * noise1(x * 3.1, 5);

export const Dashboard: React.FC<{
  t: number;
  width: number;
  height: number;
  stallAt: number;
  resumeAt?: number;
  staleFor: number;
  compact?: boolean;
}> = ({t, width, height, stallAt, resumeAt = Infinity, staleFor, compact = false}) => {
  const stalled = t >= stallAt && t < resumeAt;
  const dataT = stalled ? stallAt : t; // newest sample time
  const pad = compact ? 14 : 30;
  const statsH = compact ? 0 : 120;
  const chartW = width - pad * 2;
  const chartH = height - statsH - pad * 2 - (compact ? 0 : 50);
  const span = 6; // seconds of history shown
  const pts: string[] = [];
  const steps = 90;
  // While live, newest sample sits at the right edge. When stalled, the axis keeps moving
  // but no new samples arrive, so the line ends short of the edge.
  const edgeT = t;
  for (let i = 0; i <= steps; i++) {
    const st = edgeT - span + (i / steps) * span;
    if (st > dataT) break;
    const x = (i / steps) * chartW;
    const y = chartH - series(st) * chartH;
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  const lastX = ((dataT - (edgeT - span)) / span) * chartW;
  const lastY = chartH - series(dataT) * chartH;
  const orders = Math.round(1284 + 40 * noise1(dataT * 0.7, 1));
  const users = Math.round(8912 + 120 * noise1(dataT * 0.5, 7));
  return (
    <div style={{position: 'relative', width, height, background: compact ? '#0B1035' : undefined, borderRadius: compact ? 18 : 0, overflow: 'hidden'}}>
      {!compact && (
        <div style={{display: 'flex', gap: 18, padding: `${pad}px ${pad}px 0`}}>
          {[
            ['ORDERS / MIN', orders.toLocaleString('en-US')],
            ['ACTIVE USERS', users.toLocaleString('en-US')],
          ].map(([k, v]) => (
            <div key={k} style={{flex: 1, background: '#121A4E', borderRadius: 18, padding: '14px 20px', opacity: stalled ? 0.65 : 1}}>
              <div style={{fontFamily: fonts.mono, fontSize: 18, letterSpacing: '0.1em', color: palette.creamDim}}>{k}</div>
              <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 42, color: palette.cream}}>{v}</div>
            </div>
          ))}
        </div>
      )}
      <svg width={chartW} height={chartH} style={{position: 'absolute', left: pad, top: statsH + pad}}>
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={0} x2={chartW} y1={chartH * g} y2={chartH * g} stroke="#1E2766" strokeWidth={1.5} />
        ))}
        {stalled && (
          <>
            <rect x={lastX} y={0} width={Math.max(0, chartW - lastX)} height={chartH} fill={`${palette.amber}14`} />
            <line x1={lastX} x2={lastX} y1={0} y2={chartH} stroke={palette.amber} strokeWidth={2} strokeDasharray="6 6" />
          </>
        )}
        <polyline points={pts.join(' ')} fill="none" stroke={palette.cyan} strokeWidth={compact ? 3 : 5} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={lastX} cy={lastY} r={compact ? 5 : 9} fill={stalled ? palette.amber : palette.cyan} />
      </svg>
      {!compact && (
        <div
          style={{
            position: 'absolute',
            left: pad,
            right: pad,
            bottom: 18,
            display: 'flex',
            justifyContent: 'space-between',
            fontFamily: fonts.mono,
            fontSize: 22,
            color: stalled ? palette.amber : palette.creamDim,
          }}
        >
          <span>Last update</span>
          <span style={{fontWeight: 700}}>{stalled ? `${staleFor.toFixed(1)} s ago` : 'just now'}</span>
        </div>
      )}
    </div>
  );
};
