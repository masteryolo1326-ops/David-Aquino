import React from 'react';
import {AbsoluteFill, Audio, staticFile} from 'remotion';
import {TimelineContext, Timeline, useEvents, useTime} from '../../series/timeline';
import {Captions, CaptionBackdrop} from '../../series/hud/Captions';
import {Flash, Glitch, Vignette} from '../../series/fx/Effects';
import {ease, prog} from '../../series/anim';
import {palette} from '../../series/theme';
import timelineJson from './timeline.json';
import {World} from './World';
import {Hud} from './Hud';
import {FirstSecond} from './scenes/FirstSecond';
import {Ripple} from './scenes/Ripple';
import {Surprise} from './scenes/Surprise';
import {Return} from './scenes/Return';
import {Payoff} from './scenes/Payoff';
import {StatusLegend} from './scenes/StatusLegend';

export const timeline = timelineJson as unknown as Timeline;

export type EpisodeProps = {audio: 'mix' | 'narration' | 'none'; hideCaptions?: boolean};

const Accents: React.FC = () => {
  const t = useTime();
  const ev = useEvents();
  // "But not everything would stop": the city's (electric) light swells.
  const warm = Math.min(prog(t, ev.notEverything, ev.notEverything + 0.5, ease.outCubic), 1 - prog(t, ev.notEverything + 0.9, ev.sceneSurprise + 0.2));
  return (
    <>
      <Glitch t={t} at={ev.blackout} dur={0.36} />
      <Flash t={t} at={ev.blackout} dur={0.25} color={palette.coral} peak={0.22} />
      <Flash t={t} at={ev.sceneFirstSecond - 0.06} dur={0.4} color={palette.cyan} peak={0.5} />
      <Flash t={t} at={ev.reconnect} dur={0.7} color={palette.cyan} peak={0.55} />
      <Flash t={t} at={ev.scenePayoff} dur={0.45} color={palette.cream} peak={0.35} />
      {warm > 0 && (
        <AbsoluteFill
          style={{
            pointerEvents: 'none',
            mixBlendMode: 'screen',
            opacity: warm * 0.5,
            background: `radial-gradient(ellipse 70% 45% at 50% 62%, ${palette.warmLight}55, transparent 70%)`,
          }}
        />
      )}
    </>
  );
};

export const Episode: React.FC<EpisodeProps> = ({audio, hideCaptions = false}) => (
  <TimelineContext.Provider value={timeline}>
    <AbsoluteFill style={{background: palette.void}}>
      <World />
      <Accents />
      <FirstSecond />
      <Ripple />
      <Surprise />
      <Return />
      <Payoff />
      <Vignette />
      {!hideCaptions && <CaptionBackdrop />}
      <Hud />
      {!hideCaptions && <Captions />}
      <StatusLegend />
      {audio !== 'none' && <Audio src={staticFile(`audio/${timeline.episode}/${audio}.wav`)} />}
    </AbsoluteFill>
  </TimelineContext.Provider>
);
