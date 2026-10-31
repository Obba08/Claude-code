import React from 'react';
import {Composition} from 'remotion';
import {Scene} from './engine/Scene';
import {applyFormat} from './engine/format';
// To make a new video, point this import at a new settings file.
import settings from './settings/immune-system';

const duration = settings.timings.duration + settings.tail;

export const Root: React.FC = () => (
  <>
    <Composition
      id="Explainer"
      component={Scene}
      width={settings.width}
      height={settings.height}
      fps={settings.fps}
      durationInFrames={Math.ceil(duration * settings.fps)}
      defaultProps={{settings}}
    />
    {Object.keys(settings.formats ?? {}).map((name) => {
      const f = applyFormat(settings, name);
      const id = `Explainer-${name}`;
      return (
        <Composition
          key={id}
          id={id}
          component={Scene}
          width={f.width}
          height={f.height}
          fps={f.fps}
          durationInFrames={Math.ceil(duration * f.fps)}
          defaultProps={{settings, format: name}}
        />
      );
    })}
  </>
);
