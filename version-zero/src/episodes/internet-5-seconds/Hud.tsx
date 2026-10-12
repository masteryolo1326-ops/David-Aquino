import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Countdown} from '../../series/hud/Countdown';
import {Pill} from '../../series/hud/Pill';
import {Monogram, Wordmark} from '../../series/hud/Brand';
import {glitchOffset} from '../../series/fx/Effects';
import {ease, keys, lerp, prog} from '../../series/anim';
import {fonts, palette} from '../../series/theme';
import {useEvents, useTime} from '../../series/timeline';
import {timerValue} from './state';

// The countdown is the episode's spine: hero-sized in the hook, docked at the top while we
// examine the outage, hero again for the last moments, then gone once the internet is back.
export const Hud: React.FC = () => {
  const t = useTime();
  const ev = useEvents();
  const value = timerValue(t, ev);
  const offline = t >= ev.blackout && t < ev.reconnect;
  const back = t >= ev.reconnect;

  // hero ↔ docked
  const hero = keys(t, [
    [0, 1],
    [ev.diveStart + 0.55, 1],
    [ev.sceneFirstSecond + 0.35, 0, ease.inOutCubic],
    [ev.sceneReturn + 0.1, 0],
    [ev.sceneReturn + 0.75, 1, ease.inOutCubic],
    [ev.reconnect + 0.4, 1],
    [ev.reconnect + 0.95, 0, ease.inOutCubic],
  ]);
  const heroY = t < ev.sceneReturn ? 418 : 760;
  const dockY = 262;
  const y = lerp(dockY, heroY, hero);
  const size = lerp(86, 214, hero);
  const pillY = y - size * 0.5 - lerp(48, 92, hero);
  const timerFade = 1 - prog(t, ev.reconnect + 0.45, ev.reconnect + 0.85, ease.inCubic);
  const hudFade = 1 - prog(t, ev.scenePayoff - 0.2, ev.scenePayoff + 0.2);
  const color = back ? palette.cyan : offline ? palette.coral : palette.cream;
  const [jx, jy] = glitchOffset(t, ev.blackout, 0.32, 16 + 10 * hero);
  const split = t >= ev.blackout && t < ev.blackout + 0.3 ? 10 * (1 - (t - ev.blackout) / 0.3) : 0;
  const zeroPop = back ? 1 + 0.12 * (1 - prog(t, ev.reconnect, ev.reconnect + 0.4, ease.outCubic)) : 1;
  const intro = 1; // the very first frame must already read: no fade-in

  const pillText = back ? 'INTERNET: BACK ONLINE' : offline ? 'INTERNET: OFFLINE' : 'INTERNET: ONLINE';
  const slowTag = offline ? prog(t, ev.blackout + 0.5, ev.blackout + 0.9) : 0;
  const factor = (ev.reconnect - ev.blackout) / 5;

  const bug = Math.min(prog(t, ev.sceneFirstSecond + 0.4, ev.sceneFirstSecond + 0.9), 1 - prog(t, ev.scenePayoff - 0.2, ev.scenePayoff + 0.2));
  const brand = prog(t, ev.brand, ev.brand + 0.6, ease.outCubic);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      {hudFade > 0 && t > ev.sceneReturn && hero > 0 && (
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: y - 340,
            height: 620,
            opacity: hero * timerFade,
            background: 'radial-gradient(ellipse 52% 44% at 50% 50%, rgba(3,5,15,0.82) 0%, rgba(3,5,15,0.55) 55%, rgba(3,5,15,0) 100%)',
          }}
        />
      )}
      {hudFade > 0 && (
        <>
          <div style={{position: 'absolute', left: 0, right: 0, top: pillY, display: 'flex', justifyContent: 'center', opacity: hudFade * intro}}>
            <div style={{transform: `scale(${lerp(0.82, 1.08, hero)})`}}>
              <Pill color={offline ? palette.coral : palette.cyan} size={24} dotPulse={0.5 + 0.5 * Math.sin(t * 7)}>
                {pillText}
              </Pill>
            </div>
          </div>
          <div
            style={{
              position: 'absolute',
              left: 0,
              right: 0,
              top: y - size * 0.5,
              display: 'flex',
              justifyContent: 'center',
              opacity: hudFade * timerFade * intro,
              transform: `scale(${zeroPop * (0.92 + 0.08 * intro)})`,
            }}
          >
            <Countdown value={value} color={color} size={size} jitter={[jx, jy]} split={split} glowStrength={0.6 + 0.6 * hero} />
          </div>
          {slowTag > 0 && (
            <div
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: y + size * 0.52 + 6,
                display: 'flex',
                justifyContent: 'center',
                opacity: slowTag * hudFade * timerFade,
              }}
            >
              <span style={{fontFamily: fonts.mono, fontWeight: 500, fontSize: lerp(19, 26, hero), letterSpacing: '0.16em', color: palette.creamDim}}>
                ◷ SLOWED DOWN ≈{factor.toFixed(0)}×
              </span>
            </div>
          )}
        </>
      )}
      {bug > 0 && (
        <div style={{position: 'absolute', left: 74, top: 196, opacity: 0.55 * bug}}>
          <Monogram size={50} />
        </div>
      )}
      {brand > 0 && (
        <div style={{position: 'absolute', left: 0, right: 0, top: 176, display: 'flex', justifyContent: 'center', transform: `translateY(${(1 - brand) * -16}px)`}}>
          <Wordmark reveal={brand} subtitle="WHAT IF · EPISODE 01" />
        </div>
      )}
    </AbsoluteFill>
  );
};
