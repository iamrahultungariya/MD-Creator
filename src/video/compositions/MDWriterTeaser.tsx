import React from 'react';
import { Sequence } from 'remotion';
import { Scene1Hook } from '../scenes/Scene1Hook';
import { Scene2EditorDemo } from '../scenes/Scene2EditorDemo';
import { Scene3MimoAi } from '../scenes/Scene3MimoAi';
import { Scene4FeatureBlitz } from '../scenes/Scene4FeatureBlitz';
import { Scene5Outro } from '../scenes/Scene5Outro';

/**
 * MD Writer Motionimo-Grade Product Teaser Master Composition
 * Total Duration: 2400 frames (40 seconds @ 60 FPS)
 * Resolution: 1920x1080 (Landscape)
 */
export const MDWriterTeaser: React.FC = () => {
  return (
    <div className="relative h-full w-full bg-neutral-950 text-white overflow-hidden select-none font-sans">
      {/* Scene 1: Kinetic Hook (Frames 0 - 300 / 0s - 5s) */}
      <Sequence from={0} durationInFrames={300} name="Scene 1: Kinetic Hook">
        <Scene1Hook />
      </Sequence>

      {/* Scene 2: Flat Window & Auto-Typing Editor (Frames 300 - 900 / 5s - 15s) */}
      <Sequence from={300} durationInFrames={600} name="Scene 2: Editor Demo">
        <Scene2EditorDemo />
      </Sequence>

      {/* Scene 3: Mimo AI Assistant & Smooth Cursor (Frames 900 - 1500 / 15s - 25s) */}
      <Sequence from={900} durationInFrames={600} name="Scene 3: Mimo AI">
        <Scene3MimoAi />
      </Sequence>

      {/* Scene 4: Precision Feature Blitz (Frames 1500 - 1980 / 25s - 33s) */}
      <Sequence from={1500} durationInFrames={480} name="Scene 4: Feature Blitz">
        <Scene4FeatureBlitz />
      </Sequence>

      {/* Scene 5: Hero Studio Outro & CTA (Frames 1980 - 2400 / 33s - 40s) */}
      <Sequence from={1980} durationInFrames={420} name="Scene 5: Hero Outro">
        <Scene5Outro />
      </Sequence>
    </div>
  );
};
