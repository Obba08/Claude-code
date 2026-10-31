// Types for a video settings file. One settings file = one video.
// All positions are in "world units": 1 unit = 1 px when the camera zoom is 1.

export type Vec = [number, number];

export type Ease = 'inOut' | 'in' | 'out' | 'linear';

export interface Timings {
  duration: number;
  sentences: {n: number; text: string; start: number; end: number; firstWord: number}[];
  words: {i: number; text: string; start: number; end: number}[];
}

export interface PictureDef {
  src: string; // path inside /public
  w: number; // pixel size of the file
  h: number;
}

/** A keyframe for the one camera. x/y is the world point shown at the focus point of the frame. */
export interface CameraKey {
  at: number;
  x: number;
  y: number;
  zoom: number;
  /** How the move INTO this key is eased. Default 'inOut'. */
  ease?: Ease;
}

/** A keyframe for an item's own movement. Missing values keep the previous value. */
export interface MotionKey {
  at: number;
  x?: number;
  y?: number;
  scale?: number;
  rotate?: number;
  opacity?: number;
  ease?: Ease;
}

/** When an item is visible: fades in at `in`, fades out at `out` (both optional). */
export interface Show {
  in?: number;
  out?: number;
  /** Fade length in seconds. Default 0.5. */
  fade?: number;
}

interface Base {
  id?: string;
  show?: Show;
  /** Depth layer. 1 = the page. Bigger = farther away: moves slower, smaller zoom, blurred. */
  depth?: number;
  opacity?: number;
}

export interface PictureItem extends Base {
  type: 'picture';
  pic: string;
  /** World position of the anchor point. */
  at: Vec;
  /** Width of the whole image file in world units. */
  width: number;
  /** Pixel in the image that sits at `at`. Default: image center. */
  anchor?: Vec;
  rotate?: number;
  motion?: MotionKey[];
  /** Follow a path (world points) between start and end, eased. Overrides x/y from motion while active. */
  pathMotion?: {path: Vec[]; start: number; end: number; ease?: Ease};
  /** Shrink + fade into a point, e.g. a germ being swallowed. */
  swallow?: {at: number; duration?: number; into: Vec};
}

export interface LightItem extends Base {
  type: 'light';
  path: Vec[];
  start: number;
  end: number;
  /** Several lights following each other. */
  count?: number;
  /** Seconds between lights. */
  gap?: number;
  /** Diameter in screen px of the bright core. */
  size?: number;
  ease?: Ease;
  /** 0..1 – brightness. */
  intensity?: number;
}

export interface LineItem extends Base {
  type: 'line';
  path: Vec[];
  drawStart: number;
  drawEnd: number;
  width?: number; // screen px
  color?: string;
  smooth?: boolean;
}

export interface PulseItem extends Base {
  type: 'pulse';
  at: Vec;
  radius: number; // world units
  start: number;
  count?: number;
  interval?: number;
  duration?: number;
}

export interface GlowItem extends Base {
  type: 'glow';
  at: Vec;
  radius: number; // world units
  /** Gentle breathing of the glow. */
  breathe?: boolean;
  motion?: MotionKey[];
}

export interface LabelItem extends Base {
  type: 'label';
  text: string;
  /** World point the label belongs to … */
  anchor?: Vec;
  /** … or a fixed screen position. */
  screen?: Vec;
  /** Screen px offset from the anchor. */
  offset?: Vec;
  size?: number;
  /** Follow a picture item's current position. */
  follow?: string;
}

export interface MagnifierItem extends Base {
  type: 'magnifier';
  /** The detail it grows out of. */
  source: Vec;
  sourceRadius: number;
  center: Vec;
  radius: number;
  /** When the lines draw and the circle grows. */
  grow: number;
  children: Item[];
}

export interface OrbitItem extends Base {
  type: 'orbit';
  screen: Vec;
  radius: number; // px
  start: number;
  end: number;
  turns: number;
  text?: string;
}

export type Item =
  | PictureItem
  | LightItem
  | LineItem
  | PulseItem
  | GlowItem
  | LabelItem
  | MagnifierItem
  | OrbitItem;

export interface VideoSettings {
  id: string;
  width: number;
  height: number;
  fps: number;
  audio: string;
  timings: Timings;
  /** Extra seconds after the voice ends. */
  tail: number;
  style: {
    background: string;
    ink: string;
    accent: string;
    font: string;
    dotGrid: {spacing: number; size: number; color: string; parallax: number};
    labelSize: number;
    fade: number;
  };
  /** Fractions of the frame kept free of anything important. */
  safe: {top: number; bottom: number};
  pictures: Record<string, PictureDef>;
  camera: CameraKey[];
  items: Item[];
}
