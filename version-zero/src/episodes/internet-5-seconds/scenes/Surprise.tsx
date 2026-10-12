import React from 'react';
import {AbsoluteFill} from 'remotion';
import {IconBolt, IconChip, IconCloud, IconNotes, IconPlay} from '../../../series/devices/Card';
import {Bulb, NotesContent, popIn, Tile, TrafficSignal, VideoPlayer} from '../../../series/devices/LocalTiles';
import {PaymentTerminal} from '../../../series/devices/Payment';
import {CloudApp, Phone} from '../../../series/devices/Phone';
import {VideoCall} from '../../../series/devices/VideoCall';
import {Pill} from '../../../series/hud/Pill';
import {ease, lerp, prog} from '../../../series/anim';
import {fonts, palette} from '../../../series/theme';
import {useEvents, useTime} from '../../../series/timeline';

// Scene 4 — the central reveal: split screen of what needs the internet vs. what doesn't,
// then the buffered video zooms up to show *why* it keeps playing.
const LEFT = 70;
const WIDTH = 860;
const TOP_Y = 330;
const TOP_H = 360;
const BOT_Y = 724;
const BOT_H = 470;
const TILE_W = 420;
const TILE_H = 188;

const Header: React.FC<{color: string; icon: React.ReactNode; children: React.ReactNode}> = ({color, icon, children}) => (
  <div style={{display: 'flex', alignItems: 'center', gap: 14}}>
    {icon}
    <span style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 28, letterSpacing: '0.1em', color}}>{children}</span>
  </div>
);

const Mini: React.FC<{label: string; children: React.ReactNode}> = ({label, children}) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10}}>
    <div style={{height: 232, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{children}</div>
    <span style={{fontFamily: fonts.mono, fontWeight: 500, fontSize: 19, letterSpacing: '0.06em', color: palette.creamDim}}>{label}</span>
  </div>
);

export const Surprise: React.FC = () => {
  const t = useTime();
  const ev = useEvents();
  if (t < ev.sceneSurprise - 0.1 || t > ev.sceneReturn + 0.6) return null;

  const enter = prog(t, ev.sceneSurprise, ev.sceneSurprise + 0.5, ease.outCubic);
  const exit = prog(t, ev.sceneReturn - 0.05, ev.sceneReturn + 0.45, ease.inCubic);
  const expand = prog(t, ev.bufferExplain, ev.bufferExplain + 0.6, ease.inOutCubic);
  const explain = prog(t, ev.bufferExplain + 0.5, ev.bufferExplain + 0.95, ease.outCubic);
  const panelsFade = 1 - expand;

  // tile slots (2×2 inside the bottom panel)
  const slot = (c: number, r: number) => ({x: LEFT + c * (TILE_W + 20), y: BOT_Y + 74 + r * (TILE_H + 14)});
  const vSlot = slot(1, 1);
  const vx = lerp(vSlot.x, LEFT, expand);
  const vy = lerp(vSlot.y, TOP_Y + 22, expand);
  const vw = lerp(TILE_W, WIDTH, expand);
  const vh = lerp(TILE_H, BOT_Y + BOT_H - TOP_Y - 22, expand);

  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <AbsoluteFill style={{background: palette.void, opacity: 0.72 * enter * (1 - exit)}} />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - exit, transform: `scale(${1 - exit * 0.06})`}}>
        {/* ---- needs the internet ---- */}
        <div
          style={{
            position: 'absolute',
            left: LEFT,
            top: TOP_Y,
            width: WIDTH,
            height: TOP_H,
            borderRadius: 30,
            background: 'linear-gradient(180deg, rgba(60,20,30,0.55), rgba(20,12,30,0.55))',
            border: `2px solid ${palette.coral}55`,
            transform: `translateY(${(1 - enter) * -500}px)`,
            opacity: panelsFade,
            padding: '20px 26px',
          }}
        >
          <Header color={palette.coral} icon={<IconCloud size={34} color={palette.coral} off />}>
            NEEDS THE INTERNET
          </Header>
          <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'flex-end', marginTop: 10, filter: 'saturate(0.7)'}}>
            <Mini label="cloud app">
              <Phone width={122} height={230} tone={palette.coral}>
                <CloudApp t={t} width={98} height={206} state="timeout" compact />
              </Phone>
            </Mini>
            <Mini label="card payment">
              <div style={{width: 380 * 0.37, height: 620 * 0.37}}>
                <PaymentTerminal t={t} state="authorizing" waited={0} scale={0.37} />
              </div>
            </Mini>
            <Mini label="video call">
              <div style={{width: 250, height: 170, borderRadius: 18, overflow: 'hidden', border: `2px solid ${palette.amber}66`}}>
                <VideoCall t={t} width={250} height={170} freezeAt={-1} compact />
              </div>
            </Mini>
          </div>
        </div>

        {/* ---- works without it ---- */}
        <div
          style={{
            position: 'absolute',
            left: LEFT,
            top: BOT_Y,
            width: WIDTH,
            height: BOT_H,
            borderRadius: 30,
            background: 'linear-gradient(180deg, rgba(12,40,70,0.5), rgba(8,18,46,0.55))',
            border: `2px solid ${palette.cyan}55`,
            transform: `translateY(${(1 - enter) * 700}px)`,
            opacity: panelsFade,
            padding: '20px 26px',
          }}
        >
          <Header color={palette.cyan} icon={<IconChip size={34} />}>
            WORKS WITHOUT IT
          </Header>
        </div>
        {/* tiles are positioned in frame coordinates so the video tile can expand freely */}
        <div style={{position: 'absolute', left: slot(0, 0).x, top: slot(0, 0).y, ...popIn(t, ev.tilePower), opacity: popIn(t, ev.tilePower).opacity * panelsFade}}>
          <Tile width={TILE_W} height={TILE_H} label="POWER" icon={<IconBolt size={24} />} tone={palette.warmLight} badge={<Pill color={palette.warmLight} size={17}>on</Pill>}>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 34, gap: 26}}>
              <Bulb size={110} on={1} />
              <svg width={90} height={110} viewBox="0 0 60 70">
                <rect x="6" y="6" width="48" height="64" rx="3" fill="#1A2160" />
                {Array.from({length: 12}, (_, i) => (
                  <rect key={i} x={12 + (i % 3) * 14} y={13 + Math.floor(i / 3) * 14} width="8" height="9" rx="1.5" fill={[1, 5, 9].includes(i) ? '#2A3270' : palette.warmLight} />
                ))}
              </svg>
            </div>
          </Tile>
        </div>
        <div style={{position: 'absolute', left: slot(1, 0).x, top: slot(1, 0).y, ...popIn(t, ev.tileOffline), opacity: popIn(t, ev.tileOffline).opacity * panelsFade}}>
          <Tile width={TILE_W} height={TILE_H} label="NOTES · ON DEVICE" icon={<IconNotes size={24} />} badge={<Pill color={palette.cyan} size={17}>saved</Pill>}>
            <NotesContent t={t} startAt={ev.tileOffline + 0.2} scale={0.92} />
          </Tile>
        </div>
        <div style={{position: 'absolute', left: slot(0, 1).x, top: slot(0, 1).y, ...popIn(t, ev.tileOffline + 0.18), opacity: popIn(t, ev.tileOffline + 0.18).opacity * panelsFade}}>
          <Tile width={TILE_W} height={TILE_H} label="TRAFFIC SIGNAL" icon={<IconChip size={24} />} badge={<Pill color={palette.cyan} size={17}>local</Pill>}>
            <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 30, gap: 30}}>
              <div style={{transform: 'scale(0.9)'}}>
                <TrafficSignal t={t} height={150} />
              </div>
              <span style={{fontFamily: fonts.display, fontWeight: 500, fontSize: 22, color: palette.creamDim, width: 170, lineHeight: 1.25}}>runs its own timing plan</span>
            </div>
          </Tile>
        </div>
        <div
          style={{
            position: 'absolute',
            left: vx,
            top: vy,
            ...popIn(t, ev.tileVideo),
            transform: expand > 0 ? 'none' : popIn(t, ev.tileVideo).transform,
          }}
        >
          <Tile
            width={vw}
            height={vh}
            label={expand > 0.5 ? 'VIDEO · ON DEMAND' : 'VIDEO'}
            icon={<IconPlay size={22} color={palette.cyan} />}
            badge={<Pill color={palette.cyan} size={lerp(17, 22, expand)}>{expand > 0.5 ? 'still playing' : 'playing'}</Pill>}
          >
            <div style={{position: 'absolute', left: 12, right: 12, top: lerp(50, 70, expand), bottom: 12}}>
              <VideoPlayer
                t={t}
                width={vw - 24}
                height={vh - lerp(62, 82, expand)}
                playStart={ev.tileVideo - 1.2}
                downloadStopAt={ev.tileVideo - 3}
                explain={explain}
                barScale={lerp(0.7, 1.7, expand)}
              />
            </div>
          </Tile>
        </div>
      </div>
    </AbsoluteFill>
  );
};
