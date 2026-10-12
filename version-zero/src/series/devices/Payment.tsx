import React from 'react';
import {ease, prog} from '../anim';
import {fonts, palette} from '../theme';
import {IconCheck, Spinner} from './Card';

// Card terminal. Card-present payments normally wait for an online authorization, so with no
// path to the card network the terminal can only wait ("Authorizing…") or retry later.
export type PaymentState = 'ready' | 'authorizing' | 'retrying' | 'approved';

export const PaymentTerminal: React.FC<{
  t: number;
  state: PaymentState;
  tapAt?: number;
  waited?: number; // real seconds spent waiting, shown on screen
  scale?: number;
}> = ({t, state, tapAt = -100, waited = 0, scale = 1}) => {
  const W = 380;
  const H = 620;
  // Card motion: slide in, tap, slide back out.
  const cin = prog(t, tapAt - 0.45, tapAt, ease.outCubic);
  const cout = prog(t, tapAt + 0.35, tapAt + 0.8, ease.inOutCubic);
  const cardX = 330 - 250 * cin + 300 * cout;
  const cardY = 40 - 30 * cin + 20 * cout;
  const cardRot = 14 - 18 * cin + 10 * cout;
  const cardA = Math.min(prog(t, tapAt - 0.45, tapAt - 0.3), 1 - prog(t, tapAt + 0.6, tapAt + 0.8));
  const waves = prog(t, tapAt, tapAt + 0.7);
  return (
    <div style={{position: 'relative', width: W, height: H, transform: `scale(${scale})`, transformOrigin: 'top left'}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 48,
          background: 'linear-gradient(165deg, #222A63 0%, #12173F 60%, #0C1033 100%)',
          border: '2px solid rgba(255,255,255,0.08)',
          boxShadow: '0 40px 90px rgba(0,0,0,0.6), inset 0 2px 0 rgba(255,255,255,0.08)',
        }}
      />
      {/* screen */}
      <div
        style={{
          position: 'absolute',
          left: 26,
          top: 28,
          width: W - 52,
          height: 300,
          borderRadius: 26,
          background: 'linear-gradient(180deg, #0D1440, #090E2E)',
          border: `2px solid ${state === 'approved' ? palette.cyan : state === 'ready' ? '#2A3480' : palette.amber}88`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          overflow: 'hidden',
        }}
      >
        <div style={{fontFamily: fonts.mono, fontSize: 20, letterSpacing: '0.2em', color: palette.creamDim}}>TOTAL</div>
        <div style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 64, color: palette.cream}}>$12.40</div>
        {state === 'ready' && (
          <div style={{fontFamily: fonts.display, fontWeight: 500, fontSize: 26, color: palette.creamDim}}>Tap card to pay</div>
        )}
        {(state === 'authorizing' || state === 'retrying') && (
          <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
              <Spinner t={t} size={36} stroke={5} />
              <span style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 30, color: palette.amber}}>
                {state === 'authorizing' ? 'Authorizing…' : 'Retrying…'}
              </span>
            </div>
            {state === 'authorizing' && (
              <span style={{fontFamily: fonts.mono, fontSize: 19, color: palette.creamDim}}>waiting for bank · {waited.toFixed(1)} s</span>
            )}
          </div>
        )}
        {state === 'approved' && (
          <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
            <IconCheck size={34} />
            <span style={{fontFamily: fonts.display, fontWeight: 700, fontSize: 32, color: palette.cyan}}>Approved</span>
          </div>
        )}
      </div>
      {/* contactless mark */}
      <svg width={70} height={70} viewBox="0 0 24 24" style={{position: 'absolute', left: W / 2 - 35, top: 350}} fill="none" stroke={palette.creamDim} strokeWidth={1.8} strokeLinecap="round">
        <path d="M8 8.5a5 5 0 010 7" />
        <path d="M11.5 6a9 9 0 010 12" />
        <path d="M15 3.5a13 13 0 010 17" />
      </svg>
      {waves > 0 && waves < 1 && (
        <div style={{position: 'absolute', left: W / 2, top: 385}}>
          {[0, 0.25, 0.5].map((d) => {
            const k = Math.max(0, Math.min(1, (waves - d) / 0.5));
            return (
              <div
                key={d}
                style={{
                  position: 'absolute',
                  left: -60 * k - 20,
                  top: -60 * k - 20,
                  width: 120 * k + 40,
                  height: 120 * k + 40,
                  borderRadius: 999,
                  border: `3px solid ${palette.cyan}`,
                  opacity: (1 - k) * 0.8,
                }}
              />
            );
          })}
        </div>
      )}
      {/* keypad */}
      <div style={{position: 'absolute', left: 60, top: 440, width: W - 120, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14}}>
        {Array.from({length: 6}, (_, i) => (
          <div key={i} style={{height: 46, borderRadius: 14, background: '#1B2258', border: '1px solid rgba(255,255,255,0.06)'}} />
        ))}
      </div>
      {/* card */}
      {cardA > 0 && (
        <div
          style={{
            position: 'absolute',
            left: cardX,
            top: 330 + cardY,
            width: 250,
            height: 158,
            borderRadius: 18,
            background: 'linear-gradient(135deg, #3B5BFF 0%, #7A4DFF 55%, #2EE6FF 130%)',
            boxShadow: '0 24px 50px rgba(0,0,0,0.55)',
            transform: `rotate(${cardRot}deg)`,
            opacity: cardA,
          }}
        >
          <div style={{position: 'absolute', left: 24, top: 46, width: 46, height: 34, borderRadius: 8, background: 'linear-gradient(135deg, #F4D58D, #C9A24F)'}} />
          <div style={{position: 'absolute', left: 24, bottom: 18, fontFamily: fonts.mono, fontSize: 18, color: '#fff', opacity: 0.85, letterSpacing: '0.12em'}}>•••• 4021</div>
        </div>
      )}
    </div>
  );
};
