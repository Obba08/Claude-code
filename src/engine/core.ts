import type {CameraKey, Ease, MotionKey, PictureDef, Show, Timings, Vec} from './types';

// ---------- easing ----------

// Gentle "slow – faster – slow" curve (sine based), and its halves.
export const ease = (e: Ease | undefined, t: number): number => {
  const u = Math.min(1, Math.max(0, t));
  switch (e) {
    case 'linear':
      return u;
    case 'in':
      return 1 - Math.cos((u * Math.PI) / 2);
    case 'out':
      return Math.sin((u * Math.PI) / 2);
    default:
      return 0.5 - 0.5 * Math.cos(u * Math.PI);
  }
};

export const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const progress = (t: number, a: number, b: number) => clamp((t - a) / (b - a), 0, 1);

// ---------- timing helpers for settings files ----------

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9'-]/g, '');

/** Builds helpers that turn words of the narration into seconds. */
export const timeHelpers = (timings: Timings) => {
  const find = (sentence: number, word: string, nth = 1) => {
    const s = timings.sentences[sentence - 1];
    if (!s) throw new Error(`No sentence ${sentence}`);
    const count = s.text.split(/\s+/).length;
    let seen = 0;
    for (let i = s.firstWord; i < s.firstWord + count; i++) {
      if (norm(timings.words[i].text) === norm(word)) {
        seen++;
        if (seen === nth) return timings.words[i];
      }
    }
    throw new Error(`Word "${word}" (#${nth}) not found in sentence ${sentence}: ${s.text}`);
  };
  return {
    /** Start time of a word in a sentence. */
    w: (sentence: number, word: string, nth = 1) => find(sentence, word, nth).start,
    /** End time of a word in a sentence. */
    we: (sentence: number, word: string, nth = 1) => find(sentence, word, nth).end,
    /** Start / end of a sentence. */
    s: (sentence: number) => timings.sentences[sentence - 1].start,
    se: (sentence: number) => timings.sentences[sentence - 1].end,
  };
};

/** Maps image pixels of a placed picture to world coordinates. */
export const placed = (pic: PictureDef, center: Vec, width: number) => {
  const k = width / pic.w;
  return {
    center,
    width,
    scale: k,
    pt: (px: number, py: number): Vec => [center[0] + (px - pic.w / 2) * k, center[1] + (py - pic.h / 2) * k],
    pts: (list: Vec[]): Vec[] => list.map(([x, y]) => [center[0] + (x - pic.w / 2) * k, center[1] + (y - pic.h / 2) * k]),
  };
};

// ---------- camera ----------

export interface Cam {
  x: number;
  y: number;
  zoom: number;
}

// Move between two camera states. When zoom changes, zoom around the one point that
// stays still on screen, like a real lens — so nothing swings sideways.
const camBetween = (a: CameraKey, b: CameraKey, u: number): Cam => {
  const zoom = Math.exp(lerp(Math.log(a.zoom), Math.log(b.zoom), u));
  const dz = b.zoom - a.zoom;
  if (Math.abs(dz) / Math.max(a.zoom, b.zoom) < 0.02) {
    return {x: lerp(a.x, b.x, u), y: lerp(a.y, b.y, u), zoom};
  }
  const fx = (b.x * b.zoom - a.x * a.zoom) / dz;
  const fy = (b.y * b.zoom - a.y * a.zoom) / dz;
  const k = a.zoom / zoom;
  return {x: fx + (a.x - fx) * k, y: fy + (a.y - fy) * k, zoom};
};

export const cameraAt = (keys: CameraKey[], t: number): Cam => {
  if (t <= keys[0].at) return keys[0];
  for (let i = 1; i < keys.length; i++) {
    const b = keys[i];
    if (t <= b.at) {
      const a = keys[i - 1];
      return camBetween(a, b, ease(b.ease, progress(t, a.at, b.at)));
    }
  }
  return keys[keys.length - 1];
};

// ---------- item motion ----------

export interface Pose {
  x: number;
  y: number;
  scale: number;
  rotate: number;
  opacity: number;
}

export const motionAt = (base: Pose, keys: MotionKey[] | undefined, t: number): Pose => {
  if (!keys || keys.length === 0) return base;
  // Walk the keys; each property animates from its last defined value.
  const props: (keyof Pose)[] = ['x', 'y', 'scale', 'rotate', 'opacity'];
  const out = {...base};
  for (const p of props) {
    let prevVal = base[p];
    let prevAt = -Infinity;
    for (const k of keys) {
      const v = k[p as keyof MotionKey] as number | undefined;
      if (v === undefined) continue;
      if (t >= k.at) {
        prevVal = v;
        prevAt = k.at;
        out[p] = v;
        continue;
      }
      // t is before this key: animate from prev to this one
      const from = prevAt === -Infinity ? k.at : prevAt;
      out[p] = from === k.at ? prevVal : lerp(prevVal, v, ease(k.ease, progress(t, from, k.at)));
      break;
    }
  }
  return out;
};

// ---------- show / fade ----------

/** 0..1 visibility from a Show definition (fades are eased). */
export const visibility = (show: Show | undefined, t: number, defaultFade: number): number => {
  if (!show) return 1;
  const f = show.fade ?? defaultFade;
  let v = 1;
  if (show.in !== undefined) v = Math.min(v, ease('inOut', progress(t, show.in, show.in + f)));
  if (show.out !== undefined) v = Math.min(v, 1 - ease('inOut', progress(t, show.out, show.out + f)));
  return v;
};

// ---------- paths ----------

/** Smooth a polyline with Catmull-Rom so lights and lines flow along curves. */
export const smoothPath = (pts: Vec[], samplesPerSeg = 12): Vec[] => {
  if (pts.length < 3) return pts;
  const out: Vec[] = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let s = 0; s < samplesPerSeg; s++) {
      const t = s / samplesPerSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const f = (a: number, b: number, c: number, d: number) =>
        0.5 * (2 * b + (-a + c) * t + (2 * a - 5 * b + 4 * c - d) * t2 + (-a + 3 * b - 3 * c + d) * t3);
      out.push([f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])]);
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
};

const lengths = new WeakMap<Vec[], number[]>();
const cumLengths = (pts: Vec[]) => {
  let c = lengths.get(pts);
  if (!c) {
    c = [0];
    for (let i = 1; i < pts.length; i++) {
      c.push(c[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    }
    lengths.set(pts, c);
  }
  return c;
};

/** Point at fraction u (0..1) of a path's length. */
export const pointOnPath = (pts: Vec[], u: number): Vec => {
  const c = cumLengths(pts);
  const total = c[c.length - 1];
  const d = clamp(u, 0, 1) * total;
  for (let i = 1; i < c.length; i++) {
    if (d <= c[i]) {
      const k = (d - c[i - 1]) / (c[i] - c[i - 1] || 1);
      return [lerp(pts[i - 1][0], pts[i][0], k), lerp(pts[i - 1][1], pts[i][1], k)];
    }
  }
  return pts[pts.length - 1];
};

export const pathLength = (pts: Vec[]) => {
  const c = cumLengths(pts);
  return c[c.length - 1];
};

// ---------- heartbeat ----------

/**
 * Times of heartbeats between start and end, for a rate that can change.
 * keys: beats per minute at given times; the rate glides smoothly between keys.
 */
export const beatTimes = (start: number, end: number, keys: {at: number; bpm: number}[], phase = 0): number[] => {
  const bpmAt = (t: number) => {
    if (t <= keys[0].at) return keys[0].bpm;
    for (let i = 1; i < keys.length; i++) {
      if (t <= keys[i].at) return lerp(keys[i - 1].bpm, keys[i].bpm, ease('inOut', progress(t, keys[i - 1].at, keys[i].at)));
    }
    return keys[keys.length - 1].bpm;
  };
  const out: number[] = [];
  let t = start + phase;
  while (t < end) {
    out.push(t);
    t += 60 / bpmAt(t);
  }
  return out;
};

// One soft swell: up in 0.1 s, down in 0.3 s (eased both ways, so it never pops).
const swellAt = (x: number) => {
  if (x < 0 || x > 0.4) return 0;
  return x < 0.1 ? ease('inOut', x / 0.1) : 1 - ease('inOut', (x - 0.1) / 0.3);
};

/** 0..1 "lub-dub" strength at time t for a list of beat times. */
export const beatSwell = (beats: number[] | undefined, t: number): number => {
  if (!beats || beats.length === 0) return 0;
  let v = 0;
  for (let i = beats.length - 1; i >= 0; i--) {
    const d = t - beats[i];
    if (d < 0) continue;
    if (d > 0.8) break;
    v = Math.max(v, swellAt(d), 0.55 * swellAt(d - 0.24));
  }
  return v;
};
