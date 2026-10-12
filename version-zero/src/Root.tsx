import React from 'react';
import {Composition} from 'remotion';
import './series/fonts';
import {Episode, EpisodeProps, timeline} from './episodes/internet-5-seconds/Episode';
import {CityPreview, GlobePreview} from './dev/Preview3D';

export const Root: React.FC = () => (
  <>
    <Composition
      id="internet-5-seconds"
      component={Episode}
      durationInFrames={timeline.durationInFrames}
      fps={timeline.fps}
      width={timeline.width}
      height={timeline.height}
      defaultProps={{audio: 'mix'} satisfies EpisodeProps}
    />
    <Composition id="dev-globe" component={GlobePreview} durationInFrames={90} fps={30} width={1080} height={1920} />
    <Composition id="dev-city" component={CityPreview} durationInFrames={90} fps={30} width={1080} height={1920} />
  </>
);
