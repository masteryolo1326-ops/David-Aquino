import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Card, IconCamera, IconChart, IconGamepad} from '../../../series/devices/Card';
import {VideoCall} from '../../../series/devices/VideoCall';
import {GameView} from '../../../series/devices/GameView';
import {Dashboard} from '../../../series/devices/Dashboard';
import {Pill} from '../../../series/hud/Pill';
import {ease, prog} from '../../../series/anim';
import {palette} from '../../../series/theme';
import {useEvents, useTime} from '../../../series/timeline';
import {outageSeconds} from '../state';

// Scene 2 — "Mid-sentence. Mid-game. Mid-update."
// Three cards, pushed through like a lateral camera move across the city.
const CARD_W = 860;
const CARD_X = 500 - CARD_W / 2;
const CARD_Y = 492;

export const FirstSecond: React.FC = () => {
  const t = useTime();
  const ev = useEvents();
  if (t < ev.callIn - 0.1 || t > ev.sceneRipple + 0.5) return null;

  const push1 = prog(t, ev.gameIn - 0.05, ev.gameIn + 0.38, ease.inOutCubic);
  const push2 = prog(t, ev.dashIn - 0.05, ev.dashIn + 0.38, ease.inOutCubic);
  const out = prog(t, ev.sceneRipple - 0.2, ev.sceneRipple + 0.2, ease.inCubic);

  // Call "rises" out of the city with overshoot.
  const rise = prog(t, ev.callIn, ev.callIn + 0.55, (x) => ease.outBack(x, 1.3));
  const riseA = prog(t, ev.callIn, ev.callIn + 0.25);
  const dimCity = Math.min(prog(t, ev.callIn, ev.callIn + 0.4), 1 - out) * 0.42;

  const slot = (k: number) => {
    // position of card k relative to the push sequence
    const x = (k - push1 - push2) * 1120;
    return x;
  };
  const stale = outageSeconds(t, ev) - 0.2;

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: palette.void, opacity: dimCity}} />
      <div style={{position: 'absolute', left: 0, top: 0, width: 1080, height: 1920, transform: `translateY(${out * 140}px)`, opacity: 1 - out}}>
        {/* 1: video call */}
        {push1 < 1 && (
          <div
            style={{
              position: 'absolute',
              left: CARD_X + slot(0),
              top: CARD_Y,
              opacity: riseA,
              transform: `scale(${0.25 + 0.75 * rise}) translateY(${(1 - rise) * 300}px)`,
              transformOrigin: '50% 100%',
            }}
          >
            <Card
              width={CARD_W}
              height={600}
              title="Video call"
              icon={<IconCamera />}
              tone={t >= ev.callFreeze ? palette.amber : palette.cyan}
              status={t >= ev.callFreeze ? <Pill color={palette.coral} size={20}>frozen</Pill> : <Pill color={palette.cyan} size={20}>live</Pill>}
            >
              <VideoCall t={t} width={CARD_W - 4} height={600 - 75 - 2} freezeAt={ev.callFreeze} />
            </Card>
          </div>
        )}
        {/* 2: online game */}
        {push1 > 0 && push2 < 1 && (
          <div style={{position: 'absolute', left: CARD_X + slot(1), top: CARD_Y}}>
            <Card
              width={CARD_W}
              height={600}
              title="Online match"
              icon={<IconGamepad />}
              tone={t >= ev.gameFreeze ? palette.amber : palette.violet}
              status={t >= ev.gameFreeze ? <Pill color={palette.coral} size={20}>no server updates</Pill> : <Pill color={palette.cyan} size={20}>connected</Pill>}
            >
              <GameView t={t} width={CARD_W - 4} height={600 - 75 - 2} freezeAt={ev.gameFreeze} />
            </Card>
          </div>
        )}
        {/* 3: cloud dashboard */}
        {push2 > 0 && (
          <div style={{position: 'absolute', left: CARD_X + slot(2), top: CARD_Y}}>
            <Card
              width={CARD_W}
              height={600}
              title="Live dashboard"
              icon={<IconChart />}
              tone={t >= ev.dashStall ? palette.amber : palette.cyan}
              status={
                t >= ev.dashStall ? (
                  <Pill color={palette.amber} size={20} dotPulse={0.5 + 0.5 * Math.sin(t * 8)}>
                    waiting for data
                  </Pill>
                ) : (
                  <Pill color={palette.cyan} size={20} dotPulse={0.5 + 0.5 * Math.sin(t * 8)}>
                    live
                  </Pill>
                )
              }
            >
              <Dashboard t={t} width={CARD_W - 4} height={600 - 75 - 2} stallAt={ev.dashStall} staleFor={Math.max(0.1, stale)} />
            </Card>
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};
