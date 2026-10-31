import type {CameraKey, Item, VideoSettings, Vec} from './types';

/**
 * Adapts a settings file (designed for its main frame) to another frame shape, e.g. square.
 * The world, pictures, paths and timings stay the same; the frame size, safe areas and camera
 * zoom change. Screen-placed things (fixed labels, the orbit dial) are moved into the new safe area,
 * and pixel sizes/offsets shrink with the zoom so everything keeps its proportions.
 */
export const applyFormat = (s: VideoSettings, name?: string): VideoSettings => {
  const f = name ? s.formats?.[name] : undefined;
  if (!f) return s;
  const k = f.zoomScale;
  const srcTop = s.height * s.safe.top;
  const srcBottom = s.height * (1 - s.safe.bottom);
  const dstTop = f.height * f.safe.top;
  const dstBottom = f.height * (1 - f.safe.bottom);
  const mapScreen = ([x, y]: Vec): Vec => [
    f.width / 2 + (x - s.width / 2) * (f.width / s.width),
    dstTop + ((y - srcTop) / (srcBottom - srcTop)) * (dstBottom - dstTop),
  ];
  const camera: CameraKey[] = s.camera.map((c) => {
    const o = c.formats?.[name!];
    return {...c, zoom: o?.zoom ?? c.zoom * k, x: o?.x ?? c.x, y: o?.y ?? c.y};
  });
  const adapt = (it: Item): Item => {
    switch (it.type) {
      case 'label':
        return {
          ...it,
          screen: it.screen ? mapScreen(it.screen) : undefined,
          offset: it.offset ? [it.offset[0] * k, it.offset[1] * k] : undefined,
          size: (it.size ?? s.style.labelSize) * Math.max(0.85, k),
        };
      case 'orbit':
        return {...it, screen: mapScreen(it.screen), radius: it.radius * Math.max(0.8, k)};
      case 'light':
        return {...it, size: (it.size ?? 38) * Math.max(0.8, k)};
      case 'magnifier':
        return {...it, children: it.children.map(adapt)};
      default:
        return it;
    }
  };
  return {
    ...s,
    width: f.width,
    height: f.height,
    fps: f.fps ?? s.fps,
    safe: f.safe,
    style: {...s.style, labelSize: s.style.labelSize},
    camera,
    items: s.items.map(adapt),
  };
};
