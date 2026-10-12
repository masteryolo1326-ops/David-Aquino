import React from 'react';
import {AbsoluteFill} from 'remotion';
import {IconCheck} from '../../../series/devices/Card';
import {ease, prog} from '../../../series/anim';
import {fonts, palette} from '../../../series/theme';
import {useEvents, useTime} from '../../../series/timeline';

// Scene 6 — the takeaway as one picture: connectivity is a step, recovery is a staircase.
// Illustrative shape (not measured data): apps notice at different moments, and after the
// network returns they come back as their retries/reconnects succeed.
const CW = 860;
const CH = 368;
const CX = 70;
const CY = 838;
const PLOT_L = 40;
const PLOT_R = CW - 30;
const T0 = -1.2;
const T1 = 11.5;
const tx = (s: number) => PLOT_L + ((s - T0) / (T1 - T0)) * (PLOT_R - PLOT_L);

const laneA = {top: 78, bottom: 150};
const laneB = {top: 230, bottom: 318};

const stepPath = (pts: Array<[number, number]>, lane: {top: number; bottom: number}) => {
  const y = (v: number) => lane.bottom - v * (lane.bottom - lane.top);
  let d = `M ${tx(pts[0][0])} ${y(pts[0][1])}`;
  for (let i = 1; i < pts.length; i++) {
    d += ` L ${tx(pts[i][0])} ${y(pts[i - 1][1])} L ${tx(pts[i][0])} ${y(pts[i][1])}`;
  }
  return d;
};

const CONNECTION: Array<[number, number]> = [
  [T0, 1],
  [0, 0],
  [5, 1],
  [T1, 1],
];
const RECOVERY: Array<[number, number]> = [
  [T0, 1],
  [0.05, 0.72],
  [0.35, 0.45],
  [0.9, 0.22],
  [1.6, 0.08],
  [5.05, 0.45],
  [5.6, 0.6],
  [6.9, 0.74],
  [8.1, 0.86],
  [9.6, 0.95],
  [10.7, 1],
  [T1, 1],
];
const CHECKS = [5.05, 6.9, 9.6, 10.7];

export const Payoff: React.FC = () => {
  const t = useTime();
  const ev = useEvents();
  if (t < ev.chartLaneA - 0.4) return null;
  const enter = prog(t, ev.chartLaneA - 0.35, ev.chartLaneA + 0.15, ease.outCubic);
  const drawA = prog(t, ev.chartLaneA + 0.05, ev.chartLaneB - 0.15, ease.inOutQuad);
  const drawB = prog(t, ev.chartLaneB, ev.brand - 0.35, ease.inOutSine);
  const yB = (v: number) => laneB.bottom - v * (laneB.bottom - laneB.top);
  const yA = (v: number) => laneA.bottom - v * (laneA.bottom - laneA.top);
  const band = prog(t, ev.chartLaneA - 0.1, ev.chartLaneA + 0.4, ease.outCubic);
  // pen position along the time axis for the glowing heads
  const headA = T0 + (T1 - T0) * drawA;
  const headB = T0 + (T1 - T0) * drawB;
  const valueAt = (pts: Array<[number, number]>, s: number) => {
    let v = pts[0][1];
    for (const [ts, vs] of pts) if (s >= ts) v = vs;
    return v;
  };

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          left: CX,
          top: CY,
          width: CW,
          height: CH,
          borderRadius: 30,
          background: 'linear-gradient(180deg, rgba(14,20,58,0.9), rgba(7,10,32,0.92))',
          border: `2px solid ${palette.cream}22`,
          boxShadow: '0 40px 90px rgba(0,0,0,0.5)',
          opacity: enter,
          transform: `translateY(${(1 - enter) * 120}px)`,
        }}
      >
        <svg width={CW} height={CH} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
          <defs>
            <clipPath id="clipA">
              <rect x={0} y={0} width={tx(headA)} height={CH} />
            </clipPath>
            <clipPath id="clipB">
              <rect x={0} y={0} width={tx(headB)} height={CH} />
            </clipPath>
          </defs>
          {/* outage window */}
          <rect x={tx(0)} y={24} width={(tx(5) - tx(0)) * band} height={CH - 70} rx={14} fill={palette.coral} opacity={0.12} />
          <text x={(tx(0) + tx(5)) / 2} y={CH - 20} textAnchor="middle" fontFamily="JetBrains Mono" fontWeight={700} fontSize={20} fill={palette.coral} opacity={band} letterSpacing="2">
            5 s OFFLINE
          </text>
          {/* lane labels */}
          <text x={PLOT_L} y={laneA.top - 30} fontFamily="JetBrains Mono" fontWeight={700} fontSize={25} letterSpacing="2" fill={palette.cyan} opacity={enter}>
            INTERNET CONNECTION
          </text>
          <text x={PLOT_L} y={laneB.top - 30} fontFamily="JetBrains Mono" fontWeight={700} fontSize={25} letterSpacing="2" fill={palette.amber} opacity={prog(t, ev.chartLaneB - 0.3, ev.chartLaneB + 0.1)}>
            APPLICATION RECOVERY
          </text>
          {/* baselines */}
          {[laneA, laneB].map((l, i) => (
            <line key={i} x1={PLOT_L} x2={PLOT_R} y1={l.bottom} y2={l.bottom} stroke={palette.cream} strokeOpacity={0.12} strokeWidth={2} />
          ))}
          <g clipPath="url(#clipA)">
            <path d={stepPath(CONNECTION, laneA)} fill="none" stroke={palette.cyan} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" style={{filter: `drop-shadow(0 0 10px ${palette.cyan})`}} />
          </g>
          <g clipPath="url(#clipB)">
            <path d={stepPath(RECOVERY, laneB)} fill="none" stroke={palette.amber} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" style={{filter: `drop-shadow(0 0 10px ${palette.amber})`}} />
          </g>
          {drawA > 0 && drawA < 1 && <circle cx={tx(headA)} cy={yA(valueAt(CONNECTION, headA))} r={9} fill="#fff" style={{filter: `drop-shadow(0 0 10px ${palette.cyan})`}} />}
          {drawB > 0 && drawB < 1 && <circle cx={tx(headB)} cy={yB(valueAt(RECOVERY, headB))} r={9} fill="#fff" style={{filter: `drop-shadow(0 0 10px ${palette.amber})`}} />}
          {/* "back online" marker on lane A */}
          {drawA > (5 - T0) / (T1 - T0) && (
            <text x={tx(5) + 14} y={laneA.top + 30} fontFamily="JetBrains Mono" fontWeight={700} fontSize={20} fill={palette.cyan}>
              back instantly
            </text>
          )}
        </svg>
        {CHECKS.map((s, i) => {
          const k = prog(headB, s, s + 0.4, ease.outBack);
          if (k <= 0) return null;
          return (
            <div key={i} style={{position: 'absolute', left: tx(s) - 15, top: yB(valueAt(RECOVERY, s)) - 46, transform: `scale(${k})`}}>
              <IconCheck size={30} color={palette.cyan} />
            </div>
          );
        })}
        {drawB > 0.62 && (
          <div
            style={{
              position: 'absolute',
              left: tx(5.1),
              top: laneB.bottom + 8,
              width: tx(10.7) - tx(5.1),
              borderTop: `3px dashed ${palette.amber}`,
              opacity: prog(drawB, 0.62, 0.8),
            }}
          >
            <div style={{textAlign: 'center', marginTop: 4, fontFamily: fonts.mono, fontWeight: 700, fontSize: 19, color: palette.amber}}>still catching up</div>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
