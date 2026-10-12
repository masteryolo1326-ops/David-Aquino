import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PaymentTerminal} from '../../../series/devices/Payment';
import {CloudApp, Phone} from '../../../series/devices/Phone';
import {IconBank} from '../../../series/devices/Card';
import {ease, lerp, prog} from '../../../series/anim';
import {fonts, palette} from '../../../series/theme';
import {useEvents, useTime} from '../../../series/timeline';
import {outageSeconds} from '../state';

// Scene 3 — "Card payments could stall. Online services could time out. But not everything would stop."
export const Ripple: React.FC = () => {
  const t = useTime();
  const ev = useEvents();
  if (t < ev.sceneRipple - 0.1 || t > ev.notEverything + 0.7) return null;

  const termIn = prog(t, ev.sceneRipple, ev.sceneRipple + 0.5, (x) => ease.outBack(x, 1.2));
  const termA = prog(t, ev.sceneRipple, ev.sceneRipple + 0.25);
  const shift = prog(t, ev.cloudIn - 0.1, ev.cloudIn + 0.4, ease.inOutCubic);
  const phoneIn = prog(t, ev.cloudIn - 0.1, ev.cloudIn + 0.45, ease.outCubic);
  const exit = prog(t, ev.notEverything - 0.05, ev.notEverything + 0.45, ease.inCubic);
  const dim = Math.min(prog(t, ev.sceneRipple - 0.1, ev.sceneRipple + 0.3), 1 - exit) * 0.45;

  const authorizing = t >= ev.cardTap + 0.3;
  const waited = Math.max(0, outageSeconds(t, ev) - outageSeconds(ev.cardTap + 0.3, ev));

  // terminal placement: centred-left, then slides left and shrinks when the phone arrives
  const termScale = lerp(1, 0.84, shift);
  const termX = lerp(130, 72, shift);
  const termY = lerp(560, 600, shift);
  const linkDraw = prog(t, ev.sceneRipple + 0.25, ev.sceneRipple + 0.6, ease.outCubic);
  const linkA = 1 - shift;
  const broken = prog(t, ev.cardTap + 0.35, ev.cardTap + 0.55, ease.outBack);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: palette.void, opacity: dim}} />
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${exit * 260}px)`, opacity: 1 - exit}}>
        {/* link from terminal to the card network — broken mid-way */}
        {linkA > 0 && (
          <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, opacity: linkA}}>
            <path
              d="M 505 655 C 600 610, 680 510, 736 462"
              fill="none"
              stroke={palette.cream}
              strokeOpacity={0.55}
              strokeWidth={5}
              strokeDasharray="4 14"
              strokeLinecap="round"
              pathLength={1}
              style={{strokeDashoffset: 0}}
              opacity={linkDraw}
            />
            {broken > 0 && (
              <g transform={`translate(624 566) scale(${broken})`}>
                <circle r={34} fill={palette.void} stroke={palette.coral} strokeWidth={4} />
                <path d="M -12 -12 L 12 12 M 12 -12 L -12 12" stroke={palette.coral} strokeWidth={6} strokeLinecap="round" />
              </g>
            )}
          </svg>
        )}
        {linkA > 0 && (
          <div style={{position: 'absolute', left: 742, top: 400, opacity: linkA * linkDraw, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6}}>
            <div style={{width: 112, height: 112, borderRadius: 28, background: '#141B4E', border: `2px solid ${palette.cream}44`, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <IconBank size={64} />
            </div>
            <span style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 20, letterSpacing: '0.08em', color: palette.creamDim}}>CARD NETWORK</span>
          </div>
        )}
        {broken > 0 && linkA > 0 && (
          <div style={{position: 'absolute', left: 552, top: 612, opacity: linkA * broken, fontFamily: fonts.mono, fontWeight: 700, fontSize: 22, color: palette.coral, letterSpacing: '0.06em'}}>
            NO RESPONSE
          </div>
        )}
        <div
          style={{
            position: 'absolute',
            left: termX,
            top: termY,
            opacity: termA,
            transform: `translateY(${(1 - termIn) * 260}px)`,
          }}
        >
          <PaymentTerminal t={t} state={authorizing ? 'authorizing' : 'ready'} tapAt={ev.cardTap} waited={waited} scale={termScale} />
        </div>
        {phoneIn > 0 && (
          <div style={{position: 'absolute', left: lerp(1100, 528, phoneIn), top: 470}}>
            <Phone width={380} height={720} tone={t >= ev.cloudTimeout ? palette.coral : '#2A3480'}>
              <CloudApp t={t} width={356} height={696} state={t >= ev.cloudTimeout ? 'timeout' : 'loading'} />
            </Phone>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
