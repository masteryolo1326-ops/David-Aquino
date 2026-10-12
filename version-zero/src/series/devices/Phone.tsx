import React from 'react';
import {fonts, palette} from '../theme';
import {IconCloud, Spinner} from './Card';

// Phone running a cloud-dependent app (its content lives on a server, not on the device).
export type CloudState = 'loading' | 'timeout' | 'retrying' | 'loaded';

export const Phone: React.FC<{width: number; height: number; children: React.ReactNode; tone?: string}> = ({width, height, children, tone = '#2A3480'}) => (
  <div
    style={{
      position: 'relative',
      width,
      height,
      borderRadius: width * 0.15,
      background: '#0A0D26',
      border: `3px solid ${tone}`,
      boxShadow: '0 40px 90px rgba(0,0,0,0.6), inset 0 0 0 10px #151A42',
      overflow: 'hidden',
    }}
  >
    <div style={{position: 'absolute', inset: 12, borderRadius: width * 0.12, overflow: 'hidden', background: 'linear-gradient(180deg, #10174A, #0A0F33)'}}>
      {children}
    </div>
    <div style={{position: 'absolute', left: '50%', top: 22, width: width * 0.28, height: 20, marginLeft: -width * 0.14, borderRadius: 999, background: '#05071A'}} />
  </div>
);

const PHOTO_COLORS = [
  ['#FF8A5B', '#7A4DFF'],
  ['#2EE6FF', '#2F7BFF'],
  ['#FFC982', '#FF6A4D'],
  ['#5CF2B5', '#2F7BFF'],
  ['#B48CFF', '#FF6A9A'],
  ['#FFB547', '#2EE6FF'],
];

export const CloudApp: React.FC<{
  t: number;
  width: number;
  height: number;
  state: CloudState;
  retryIn?: number;
  compact?: boolean;
}> = ({t, width, height, state, retryIn = 0, compact = false}) => {
  const fs = compact ? 0.62 : 1;
  const shimmer = ((t * 0.9) % 1.4) - 0.2;
  return (
    <div style={{position: 'absolute', inset: 0, padding: `${(compact ? 34 : 64) * 1}px ${18 * fs}px ${18 * fs}px`}}>
      <div style={{display: 'flex', alignItems: 'center', gap: 10 * fs, marginBottom: 18 * fs}}>
        <IconCloud size={34 * fs} color={state === 'loaded' ? palette.cyan : state === 'timeout' ? palette.coral : palette.amber} off={state === 'timeout'} />
        <span style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 32 * fs, color: palette.cream}}>Photos</span>
        <span style={{marginLeft: 'auto', fontFamily: fonts.mono, fontSize: 16 * fs, color: palette.creamDim}}>cloud</span>
      </div>
      {(state === 'loading' || state === 'retrying' || state === 'loaded') && (
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 * fs}}>
          {Array.from({length: 6}, (_, i) => (
            <div
              key={i}
              style={{
                height: (compact ? 70 : 150) * (width / 360),
                borderRadius: 16 * fs,
                background:
                  state === 'loaded'
                    ? `linear-gradient(135deg, ${PHOTO_COLORS[i][0]}, ${PHOTO_COLORS[i][1]})`
                    : `linear-gradient(100deg, #18205A ${(shimmer - 0.25) * 100}%, #27307A ${shimmer * 100}%, #18205A ${(shimmer + 0.25) * 100}%)`,
                opacity: state === 'retrying' ? 0.5 : 1,
              }}
            />
          ))}
        </div>
      )}
      {state === 'timeout' && (
        <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 * fs, marginTop: 60 * fs, textAlign: 'center'}}>
          <div style={{width: 120 * fs, height: 120 * fs, borderRadius: 999, background: `${palette.coral}1F`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
            <IconCloud size={70 * fs} color={palette.coral} off />
          </div>
          <div style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 34 * fs, color: palette.cream}}>Request timed out</div>
          <div style={{fontFamily: fonts.display, fontWeight: 500, fontSize: 22 * fs, color: palette.creamDim}}>Couldn’t reach the server</div>
          <div style={{marginTop: 10 * fs, padding: `${12 * fs}px ${30 * fs}px`, borderRadius: 999, border: `2px solid ${palette.coral}`, color: palette.coral, fontFamily: fonts.display, fontWeight: 700, fontSize: 24 * fs}}>
            Try again
          </div>
        </div>
      )}
      {state === 'retrying' && (
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '55%',
            transform: 'translate(-50%, -50%)',
            display: 'flex',
            alignItems: 'center',
            gap: 12 * fs,
            background: 'rgba(3,5,15,0.85)',
            padding: `${14 * fs}px ${22 * fs}px`,
            borderRadius: 999,
            border: `2px solid ${palette.amber}88`,
            whiteSpace: 'nowrap',
          }}
        >
          <Spinner t={t} size={30 * fs} stroke={4} />
          <span style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 22 * fs, color: palette.amber}}>
            retry in {Math.max(1, Math.ceil(retryIn))} s
          </span>
        </div>
      )}
    </div>
  );
};
