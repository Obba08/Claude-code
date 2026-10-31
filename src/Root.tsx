import React from 'react';
import {Composition} from 'remotion';
import {Scene} from './engine/Scene';
// To make a new video, point this import at a new settings file.
import settings from './settings/immune-system';

export const Root: React.FC = () => (
  <Composition
    id="Explainer"
    component={Scene}
    width={settings.width}
    height={settings.height}
    fps={settings.fps}
    durationInFrames={Math.ceil((settings.timings.duration + settings.tail) * settings.fps)}
    defaultProps={{settings}}
  />
);
