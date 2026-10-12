import React from 'react';
import {AbsoluteFill} from 'remotion';
import {IconCamera, IconCard, IconChart, IconCheck, IconCloud, IconGamepad, IconPlay, IconRetry} from '../../../series/devices/Card';
import {popIn, Tile, VideoPlayer} from '../../../series/devices/LocalTiles';
import {VideoCall} from '../../../series/devices/VideoCall';
import {GameView} from '../../../series/devices/GameView';
import {Dashboard} from '../../../series/devices/Dashboard';
import {PaymentTerminal} from '../../../series/devices/Payment';
import {CloudApp} from '../../../series/devices/Phone';
import {Pill} from '../../../series/hud/Pill';
import {ease, prog} from '../../../series/anim';
import {palette} from '../../../series/theme';
import {useEvents, useTime} from '../../../series/timeline';

// Scene 5 — the internet returns everywhere at once; apps don't.
const TW = 420;
const TH = 214;
const X0 = 70;
const Y0 = 430;
const GAP = 20;

const Status: React.FC<{ok: boolean; t: number; text: string}> = ({ok, t, text}) =>
  ok ? (
    <Pill color={palette.cyan} size={17} dot={false} icon={<IconCheck size={18} />}>
      {text}
    </Pill>
  ) : (
    <Pill color={palette.amber} size={17} dot={false} icon={<IconRetry size={18} spin={(t * 300) % 360} />}>
      {text}
    </Pill>
  );

export const Return: React.FC = () => {
  const t = useTime();
  const ev = useEvents();
  if (t < ev.recoverInstant - 0.2 || t > ev.scenePayoff + 0.5) return null;
  const exit = prog(t, ev.scenePayoff - 0.15, ev.scenePayoff + 0.3, ease.inCubic);
  const dim = Math.min(prog(t, ev.recoverInstant - 0.1, ev.recoverInstant + 0.3), 1 - exit) * 0.4;

  const pos = (c: number, r: number) => ({left: X0 + c * (TW + GAP), top: Y0 + r * (TH + GAP)});
  const a1 = ev.recoverInstant;
  const a2 = ev.recoverInstant + 0.15;
  const a3 = ev.recoverInstant + 0.3;
  const b1 = ev.retrying;
  const b2 = ev.retrying + 0.15;
  const b3 = ev.retrying + 0.3;
  const retryIn = 3 - (t - b3) * 0.5;

  const inner = {position: 'absolute' as const, left: 10, right: 10, top: 52, bottom: 10, borderRadius: 16, overflow: 'hidden' as const};
  const tile = (at: number, c: number, r: number, node: React.ReactNode) => {
    const p = popIn(t, at, 0.42);
    return (
      <div style={{position: 'absolute', ...pos(c, r), opacity: p.opacity, transform: p.transform}}>
        {node}
      </div>
    );
  };

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: palette.void, opacity: dim}} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - exit, transform: `translateY(${-exit * 220}px)`}}>
        {tile(
          a1,
          0,
          0,
          <Tile width={TW} height={TH} label="VIDEO CALL" icon={<IconCamera size={22} />} badge={<Status ok t={t} text="resumed" />}>
            <div style={inner}>
              <VideoCall t={t} width={TW - 20} height={TH - 62} freezeAt={-1} resumeAt={a1 + 0.3} compact />
            </div>
          </Tile>,
        )}
        {tile(
          a2,
          1,
          0,
          <Tile width={TW} height={TH} label="ONLINE GAME" icon={<IconGamepad size={22} />} tone={palette.violet} badge={<Status ok t={t} text="snapped back" />}>
            <div style={inner}>
              <GameView t={t} width={TW - 20} height={TH - 62} freezeAt={ev.gameFreeze} resumeAt={a2 + 0.45} compact />
            </div>
          </Tile>,
        )}
        {tile(
          a3,
          0,
          1,
          <Tile width={TW} height={TH} label="VIDEO" icon={<IconPlay size={20} color={palette.cyan} />} badge={<Status ok t={t} text="never paused" />}>
            <div style={inner}>
              <VideoPlayer t={t} width={TW - 20} height={TH - 62} playStart={ev.tileVideo - 1.2} downloadStopAt={ev.tileVideo - 3} downloadResumeAt={ev.reconnect} barScale={0.62} />
            </div>
          </Tile>,
        )}
        {tile(
          b1,
          1,
          1,
          <Tile width={TW} height={TH} label="CARD PAYMENT" icon={<IconCard size={22} />} tone={palette.amber} badge={<Status ok={false} t={t} text="retrying" />}>
            <div style={{...inner, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{width: 380 * 0.25, height: 620 * 0.25, marginTop: 2}}>
                <PaymentTerminal t={t} state="retrying" scale={0.25} />
              </div>
            </div>
          </Tile>,
        )}
        {tile(
          b2,
          0,
          2,
          <Tile width={TW} height={TH} label="DASHBOARD" icon={<IconChart size={22} />} tone={palette.amber} badge={<Status ok={false} t={t} text="reconnecting" />}>
            <div style={inner}>
              <Dashboard t={ev.dashStall + 2.6 + (t - b2) * 0.15} width={TW - 20} height={TH - 62} stallAt={ev.dashStall} staleFor={0} compact />
            </div>
          </Tile>,
        )}
        {tile(
          b3,
          1,
          2,
          <Tile width={TW} height={TH} label="CLOUD PHOTOS" icon={<IconCloud size={22} color={palette.amber} />} tone={palette.amber} badge={<Status ok={false} t={t} text={`retry in ${Math.max(1, Math.ceil(retryIn))}s`} />}>
            <div style={{...inner, background: 'linear-gradient(180deg, #10174A, #0A0F33)'}}>
              <CloudApp t={t} width={TW - 20} height={TH - 62} state="retrying" retryIn={retryIn} compact />
            </div>
          </Tile>,
        )}
      </div>
    </AbsoluteFill>
  );
};
