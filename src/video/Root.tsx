import React from 'react';
import { Composition } from 'remotion';
import { MDWriterTeaser } from './compositions/MDWriterTeaser';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="MDWriterTeaserLandscape"
        component={MDWriterTeaser}
        durationInFrames={2400}
        fps={60}
        width={1920}
        height={1080}
      />
      <Composition
        id="MDWriterTeaserPortrait"
        component={MDWriterTeaser}
        durationInFrames={1800}
        fps={60}
        width={1080}
        height={1920}
      />
    </>
  );
};
