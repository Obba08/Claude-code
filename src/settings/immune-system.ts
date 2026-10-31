// Settings for "How the immune system works".
// Everything that is specific to this video lives here: pictures, where they sit in the
// world, the camera path, lights, labels and all timings (tied to words of the narration).
// To make a new video: copy this file, swap pictures/timings/positions, and point Root.tsx at it.

import timingsJson from '../data/timings.json';
import {ease, placed, pointOnPath, smoothPath, timeHelpers} from '../engine/core';
import type {CameraKey, Item, LabelItem, PictureItem, Timings, Vec, VideoSettings} from '../engine/types';

const timings = timingsJson as unknown as Timings;
const {w, we, s} = timeHelpers(timings);

const pictures = {
  finger: {src: 'images/finger.png', w: 2304, h: 1296},
  splinter: {src: 'images/splinter.png', w: 2304, h: 1296},
  skin: {src: 'images/skin_section.png', w: 2016, h: 1344},
  bacterium: {src: 'images/bacterium.png', w: 1360, h: 1360},
  neutrophil: {src: 'images/neutrophil.png', w: 1360, h: 1360},
  macrophage: {src: 'images/macrophage.png', w: 1360, h: 1360},
  dendritic: {src: 'images/dendritic_cell.png', w: 1360, h: 1360},
  node: {src: 'images/lymph_node.png', w: 1360, h: 1360},
  bcell: {src: 'images/b_cell.png', w: 1360, h: 1360},
  antibody: {src: 'images/antibody.png', w: 1360, h: 1360},
};

// ---------------------------------------------------------------- layout (world units)

const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
const mul = (a: Vec, k: number): Vec => [a[0] * k, a[1] * k];
const dirOf = (deg: number): Vec => [Math.cos((deg * Math.PI) / 180), Math.sin((deg * Math.PI) / 180)];

// The finger is the big "page"; everything else is a zoomed-in detail of it.
const F = placed(pictures.finger, [0, 0], 2000);
const entry = F.pt(560, 632); // where the splinter goes into the fingertip pad

// Splinter at finger scale: tip pixel (174,646), pointing up-right into the pad.
const SPLINTER_TIP: Vec = [174, 646];
const splDir = dirOf(-50);
const splTip = add(entry, mul(splDir, 40));

// Skin block, sitting right at the entry point.
const S = placed(pictures.skin, [-514, 40], 230);
const tip2 = S.pt(950, 560); // splinter tip inside the skin
const spl2Dir = dirOf(47.7);
const wound: Vec = [-520, 27];

// Blood vessel traced on skin_section.png (image pixels).
const vessel = S.pts([
  [455, 695], [490, 700], [530, 705], [610, 710], [690, 715], [740, 730], [830, 740], [930, 755],
  [1000, 770], [1080, 780], [1180, 788], [1280, 805], [1380, 820], [1405, 825], [1440, 812], [1480, 795], [1520, 780],
]);

// Lymph node below the skin.
const L = placed(pictures.node, [-516.2, 255.4], 163.5);
const nodeTop = L.pt(650, 198);
const follicle = L.pt(930, 540);

// Lymph vessel the dendritic cell travels along (drawn by the animation).
const lymphPath: Vec[] = [[-530, 46], [-525, 62], [-514, 90], [-506, 120], [-512, 155], [-519, 180], nodeTop];
const lymphBack = [...lymphPath].reverse();

// Magnifier next to the lymph node.
const MAG_C: Vec = [-425, 200];
const MAG_R = 36;
const A1_LOCAL: Vec = [23, -19];
const A1_AT: Vec = [MAG_C[0] + A1_LOCAL[0], MAG_C[1] + A1_LOCAL[1]];
const local = (p: Vec): Vec => [MAG_C[0] + p[0], MAG_C[1] + p[1]]; // magnifier space -> world

// Germs
const B1: Vec = [-537, 21];
const B2: Vec = [-505, 18];
const B3: Vec = [-527, 36];
const B4: Vec = [-499, 37];
const B5: Vec = [-519, 22];
const N1_AT: Vec = [-553, 33];
const M1_EAT: Vec = [-503, 21];
const M1_EAT2: Vec = [-526, 35];

// Sizes (width of the whole image file, in world units)
const SIZE = {bacterium: 18, neutrophil: 34, macrophage: 36, dendritic: 44, antibodySkin: 7, bcell: 22, antibodyMag: 14};

// ---------------------------------------------------------------- timings

const T = {
  pushSkin: w(2, 'skin'),
  splinterIn: w(3, 'splinter'),
  bacteria: w(3, 'bacteria'),
  signals: w(4, 'cells'),
  vessels: w(5, 'blood'),
  widen: w(5, 'widen'),
  more: w(5, 'more'),
  red: w(6, 'red'),
  warm: w(6, 'warm'),
  swollen: w(6, 'swollen'),
  squeeze: w(7, 'squeeze'),
  neutrophils: w(8, 'neutrophils'),
  swallow: w(8, 'swallow'),
  macrophages: w(9, 'macrophages'),
  eat: w(9, 'eat'),
  dendritic: w(11, 'dendritic'),
  grabs: w(11, 'grabs'),
  carries: w(11, 'carries'),
  lymph: w(11, 'lymph'),
  checked: w(12, 'checked'),
  bcells: w(13, 'b'),
  fit: w(13, 'fit'),
  copies: w(14, 'copies'),
  again1: w(14, 'again', 1),
  again2: w(14, 'again', 2),
  antibodies: w(15, 'antibodies'),
  yshaped: w(15, 'y-shaped'),
  coat: w(16, 'coat'),
  coated: w(17, 'coated'),
  find: w(17, 'find'),
  first: w(18, 'first'),
  days: w(18, 'days'),
  stay: w(19, 'stay'),
  memory: w(19, 'memory'),
  same: w(20, 'same'),
  faster: w(20, 'faster'),
  vaccines: w(21, 'vaccines'),
  back: w(22, 'back'),
  end: timings.duration,
};

// Dendritic cell trip
const D_START = T.carries - 0.1;
const D_END = D_START + 3.6;

// ---------------------------------------------------------------- helpers

const pic = (p: Omit<PictureItem, 'type'>): PictureItem => ({type: 'picture', ...p});
const label = (l: Omit<LabelItem, 'type'>): LabelItem => ({type: 'label', ...l});

// Camera keys that follow a moving item along a path (linear between samples = smooth).
const followPath = (path: Vec[], start: number, end: number, z0: number, z1: number, offset: Vec = [0, 0]): CameraKey[] => {
  const pts = smoothPath(path);
  const keys: CameraKey[] = [];
  const n = 14;
  for (let i = 0; i <= n; i++) {
    const t = start + ((end - start) * i) / n;
    const p = pointOnPath(pts, ease('inOut', i / n));
    keys.push({at: t, x: p[0] + offset[0], y: p[1] + offset[1], zoom: Math.exp(Math.log(z0) + (Math.log(z1) - Math.log(z0)) * (i / n)), ease: 'linear'});
  }
  return keys;
};

// ---------------------------------------------------------------- camera

const camera: CameraKey[] = [
  {at: 0, x: -125, y: -24, zoom: 0.85, formats: {square: {zoom: 1.0}}},
  {at: 2.9, x: -430, y: -8, zoom: 1.75}, // S1 slow push toward the splinter
  {at: 4.9, x: -514, y: 38, zoom: 7.0}, // S2 into the skin
  {at: 6.4, x: -515, y: 37, zoom: 7.3},
  {at: 9.9, x: -523, y: 26, zoom: 9.6}, // S3 follow the splinter tip down
  {at: 13.4, x: -521, y: 28, zoom: 10.1}, // S4 drift while signals pulse
  {at: 15.9, x: -513, y: 42, zoom: 7.6}, // S5 tilt down to the vessel
  {at: 17.6, x: -513, y: 42, zoom: 7.75},
  {at: 20.6, x: -514, y: 37, zoom: 7.0}, // S6 small pull back
  {at: 21.6, x: -514, y: 37, zoom: 7.05},
  {at: 25.2, x: -534, y: 31, zoom: 10}, // S7 track the cells
  {at: 28.3, x: B1[0], y: B1[1] + 1, zoom: 28}, // S8 push close on the neutrophil
  {at: 30.0, x: B1[0], y: B1[1] + 1, zoom: 29.5},
  {at: 32.6, x: -520, y: 24, zoom: 15}, // S9 ease back for the macrophage
  {at: 34.9, x: -520, y: 24, zoom: 15.8},
  {at: 36.9, x: -518, y: 32, zoom: 11}, // S10
  {at: 39.4, x: -529, y: 44, zoom: 14}, // S11 to the dendritic cell
  ...followPath(lymphPath, D_START, D_END, 14, 7.5), // ride along
  {at: 45.3, x: -516, y: 255, zoom: 6.6, ease: 'out'}, // arrive at the lymph node
  {at: 45.8, x: -516, y: 255, zoom: 6.65},
  {at: 47.6, x: -472, y: 250, zoom: 5.4}, // S12 make room for the magnifier
  {at: 49.6, x: -472, y: 250, zoom: 5.5},
  {at: 51.4, x: MAG_C[0], y: MAG_C[1], zoom: 12.5}, // S13 push into the magnifier
  {at: 52.9, x: MAG_C[0], y: MAG_C[1], zoom: 12.9},
  {at: 55.9, x: MAG_C[0], y: MAG_C[1], zoom: 11}, // S14 pull back as the group grows
  {at: 58.7, x: MAG_C[0], y: MAG_C[1], zoom: 11.3},
  {at: 60.8, x: A1_AT[0], y: A1_AT[1], zoom: 30}, // S15 push in on one antibody
  {at: 62.5, x: A1_AT[0], y: A1_AT[1], zoom: 31.5},
  {at: 64.4, x: -497, y: 120, zoom: 8, ease: 'in'}, // S16 travel back along the path…
  {at: 66.1, x: -515, y: 32, zoom: 14, ease: 'out'}, // …landing in the skin
  {at: 67.5, x: -522, y: 32, zoom: 17}, // S17 hold close on the coated germ
  {at: 69.9, x: -523, y: 33, zoom: 18},
  {at: 73.4, x: -483, y: 155, zoom: 4.0, formats: {square: {zoom: 2.55}}}, // S18 pull back while days pass
  {at: 75.6, x: -470, y: 214, zoom: 5.6}, // S19 drift toward the memory cells
  {at: 75.9, x: -470, y: 214, zoom: 5.65},
  {at: 77.5, x: -519, y: 26, zoom: 14}, // S20 quick smooth push to the new germ
  {at: 79.2, x: -519, y: 26, zoom: 14.6},
  {at: 81.2, x: -483, y: 155, zoom: 4.0, formats: {square: {zoom: 2.55}}}, // S21 back out to see the memory cells
  {at: 81.4, x: -483, y: 155, zoom: 3.97, formats: {square: {zoom: 2.53}}},
  {at: 85.7, x: -125, y: -24, zoom: 0.85, formats: {square: {zoom: 1.0}}}, // S22 long pull back to the opening frame
  {at: 86.2, x: -124, y: -24, zoom: 0.84, ease: 'linear', formats: {square: {zoom: 0.99}}},
];

// ---------------------------------------------------------------- items

const items: Item[] = [];

// Far layer: faint, blurred cells drifting behind everything (depth > 1 = slower, softer).
const far: [string, Vec, number, number][] = [
  ['bcell', [-700, -60], 60, 10],
  ['bacterium', [-350, -20], 50, -30],
  ['neutrophil', [-650, 180], 70, 0],
  ['bcell', [-380, 260], 50, 0],
  ['bacterium', [-720, 380], 45, 60],
  ['neutrophil', [-330, 420], 55, 0],
  ['bcell', [-600, -200], 45, 0],
  ['bacterium', [-420, -180], 40, -70],
];
far.forEach(([p, at, width, rot], i) =>
  items.push(
    pic({
      pic: p,
      at,
      width: width * 1.8,
      rotate: rot,
      depth: 2.6,
      opacity: 0.08,
      show: {in: 5.2, out: T.back, fade: 1.2},
      motion: [
        {at: 0, x: at[0], y: at[1], rotate: rot},
        {at: T.end, x: at[0] + (i % 2 ? 25 : -25), y: at[1] + (i % 3 ? -30 : 30), rotate: rot + 25, ease: 'linear'},
      ],
    }),
  ),
);

// --- finger + splinter (the opening and closing frame) ---
const fingerOpacity = [
  {at: 0, opacity: 1},
  {at: 3.2, opacity: 1},
  {at: 4.1, opacity: 0},
  {at: 82.6, opacity: 0},
  {at: 83.8, opacity: 1},
];
items.push(
  pic({
    id: 'splinter',
    pic: 'splinter',
    at: splTip,
    anchor: SPLINTER_TIP,
    width: 420,
    rotate: 130,
    motion: [
      ...fingerOpacity,
      {at: 83.9, x: splTip[0], y: splTip[1]},
      {at: 85.4, x: splTip[0] - splDir[0] * 230, y: splTip[1] - splDir[1] * 230, opacity: 0},
    ],
  }),
  pic({id: 'finger', pic: 'finger', at: F.center, width: F.width, motion: fingerOpacity}),
);

// --- skin ---
items.push(
  pic({
    id: 'skin',
    pic: 'skin',
    at: S.center,
    width: S.width,
    motion: [
      {at: 0, opacity: 0},
      {at: 3.4, opacity: 0},
      {at: 4.2, opacity: 1},
      // dim the skin while cells do their work, so they stand out
      {at: T.squeeze - 0.9, opacity: 1},
      {at: T.squeeze, opacity: 0.5},
      {at: 81.3, opacity: 0.5},
      {at: 82.2, opacity: 1},
      {at: 82.5, opacity: 1},
      {at: 83.6, opacity: 0},
    ],
  }),
  label({text: 'SKIN', anchor: S.pt(1000, 256), offset: [0, -70], show: {in: T.pushSkin, out: s(3) - 0.2}}),
);

// --- S3 splinter pierces the skin, germs ride in ---
const tip2Start = add(tip2, mul(spl2Dir, -45));
items.push(
  pic({
    id: 'splinter2',
    pic: 'splinter',
    at: tip2,
    anchor: SPLINTER_TIP,
    width: 118,
    rotate: -132.3,
    show: {in: T.splinterIn - 0.3, fade: 0.6},
    motion: [
      {at: 0, x: tip2Start[0], y: tip2Start[1]},
      {at: T.splinterIn - 0.3, x: tip2Start[0], y: tip2Start[1]},
      {at: T.splinterIn + 1.1, x: tip2[0], y: tip2[1], ease: 'out'},
      {at: T.back + 0.1, x: tip2[0], y: tip2[1], opacity: 1},
      {at: T.back + 1.3, x: tip2[0] - spl2Dir[0] * 120, y: tip2[1] - spl2Dir[1] * 120, opacity: 0},
    ],
  }),
);

const germs: {id: string; end: Vec; rot: number; along: number; out?: number; swallow?: PictureItem['swallow']}[] = [
  {id: 'B1', end: B1, rot: 20, along: 85, swallow: {at: T.swallow, duration: 1.2, into: B1}},
  {id: 'B2', end: B2, rot: -35, along: 70, swallow: {at: T.eat, duration: 1.2, into: M1_EAT}},
  {id: 'B3', end: B3, rot: 60, along: 95, swallow: {at: 68.8, duration: 1.0, into: M1_EAT2}},
  {id: 'B4', end: B4, rot: -10, along: 78, out: 72.6},
];
germs.forEach((g, i) => {
  const start = add(tip2, mul(spl2Dir, -g.along));
  const mid = add(tip2, mul(spl2Dir, -12));
  const t0 = T.bacteria + i * 0.25;
  items.push(
    pic({
      id: g.id,
      pic: 'bacterium',
      at: start,
      width: SIZE.bacterium,
      rotate: g.rot,
      show: {in: t0 - 0.1, out: g.out},
      pathMotion: {path: [start, mid, g.end], start: t0, end: t0 + 1.7},
      swallow: g.swallow,
    }),
  );
});

// --- S4 chemical signals ---
items.push({type: 'pulse', at: wound, radius: 34, start: T.signals, count: 2, interval: 0.9, duration: 2.1});

// --- S5 vessels widen, more blood flows ---
items.push(
  {
    type: 'line',
    path: vessel,
    drawStart: T.widen - 0.2,
    drawEnd: T.widen + 0.9,
    width: 22,
    color: '#5E9BE0',
    opacity: 0.3,
    show: {out: 20.8, fade: 0.8},
  },
  {type: 'light', path: vessel, start: T.vessels - 0.1, end: T.vessels + 2.4, count: 2, gap: 0.7, size: 20, show: {out: 21.3}},
  {type: 'light', path: vessel, start: T.more - 0.2, end: T.more + 2.0, count: 6, gap: 0.3, size: 30, show: {out: 21.3}},
);

// --- S6 red, warm, swollen ---
items.push(
  {type: 'glow', at: [-520, 30], radius: 34, breathe: true, show: {in: T.red - 0.3, out: s(7) - 0.4, fade: 0.8}},
  label({text: 'RED', screen: [250, 1390], show: {in: T.red, out: s(7) - 0.3}}),
  label({text: 'WARM', screen: [540, 1390], show: {in: T.warm, out: s(7) - 0.3}}),
  label({text: 'SWOLLEN', screen: [830, 1390], show: {in: T.swollen, out: s(7) - 0.3}}),
);

// --- S7–S9 white blood cells ---
items.push(
  pic({
    id: 'N1',
    pic: 'neutrophil',
    at: N1_AT,
    width: SIZE.neutrophil,
    show: {in: T.squeeze - 0.2, out: 62},
    motion: [
      {at: 0, x: -562, y: 54, scale: 0.8},
      {at: T.squeeze - 0.2, x: -562, y: 54, scale: 0.8},
      {at: s(7) + 3.2, x: N1_AT[0], y: N1_AT[1], scale: 1},
      {at: T.swallow - 1.2, x: N1_AT[0], y: N1_AT[1]},
      {at: T.swallow, x: B1[0], y: B1[1]},
    ],
  }),
  pic({
    id: 'N2',
    pic: 'neutrophil',
    at: [-484, 51],
    width: SIZE.neutrophil * 0.92,
    rotate: 70,
    show: {in: T.squeeze + 0.2, out: 60},
    motion: [
      {at: 0, x: -480, y: 60, scale: 0.8},
      {at: T.squeeze + 0.2, x: -480, y: 60, scale: 0.8},
      {at: s(7) + 3.4, x: -484, y: 51, scale: 1},
    ],
  }),
  label({text: 'NEUTROPHIL', follow: 'N1', offset: [0, 340], show: {in: T.neutrophils, out: s(9) - 0.2}}),
  pic({
    id: 'M1',
    pic: 'macrophage',
    at: M1_EAT,
    width: SIZE.macrophage,
    show: {in: s(9), out: 72.8},
    motion: [
      {at: 0, x: -466, y: 38, scale: 0.85},
      {at: s(9), x: -466, y: 38, scale: 0.85},
      {at: T.eat - 0.1, x: M1_EAT[0], y: M1_EAT[1], scale: 1},
      {at: 67.0, x: M1_EAT[0], y: M1_EAT[1]},
      {at: 68.8, x: M1_EAT2[0], y: M1_EAT2[1]},
    ],
  }),
  label({text: 'MACROPHAGE', follow: 'M1', offset: [0, 300], show: {in: T.macrophages, out: s(10) + 0.2}}),
);

// --- S11 dendritic cell carries a piece to the lymph node ---
items.push(
  {type: 'line', path: lymphPath, drawStart: T.grabs + 0.6, drawEnd: D_START + 2.6, width: 2.5, show: {out: T.back + 0.3, fade: 0.8}},
  // a soft light travels with the dendritic cell
  {type: 'light', path: lymphPath, start: D_START, end: D_END, size: 60, intensity: 0.8},
  pic({
    id: 'D',
    pic: 'dendritic',
    at: lymphPath[0],
    width: SIZE.dendritic,
    show: {in: T.dendritic, out: D_END + 0.9},
    motion: [{at: 0, rotate: 0}, {at: D_END, rotate: 40, ease: 'linear'}],
    pathMotion: {path: lymphPath, start: D_START, end: D_END},
  }),
  pic({
    id: 'piece',
    pic: 'bacterium',
    at: B3,
    width: 8,
    rotate: 60,
    show: {in: T.grabs - 0.1, out: D_END + 0.6},
    motion: [
      {at: 0, x: B3[0] - 3, y: B3[1] + 2},
      {at: T.grabs, x: B3[0] - 3, y: B3[1] + 2},
      {at: T.grabs + 1.0, x: lymphPath[0][0], y: lymphPath[0][1]},
    ],
    pathMotion: {path: lymphPath, start: D_START, end: D_END},
  }),
  pic({id: 'node', pic: 'node', at: L.center, width: L.width, show: {in: T.lymph - 0.6, out: T.back + 0.3, fade: 0.9}}),
  label({text: 'LYMPH NODE', anchor: L.pt(700, 1192), offset: [0, 70], show: {in: we(11, 'station') - 0.2, out: s(12) + 0.9}}),
);

// --- S12–S15 the magnifier: B cells, copies, antibodies ---
const mag: Item[] = [];

// A crowd of B cells on a hex grid; the one in the middle is the match.
const crowd: Vec[] = [];
for (let row = -4; row <= 4; row++) {
  for (let col = -4; col <= 4; col++) {
    const x = col * 12.4 + (row % 2 ? 6.2 : 0);
    const y = row * 10.8;
    if (Math.hypot(x, y) < 29 && !(x === 0 && y === 0)) crowd.push([x, y]);
  }
}
crowd.forEach((p, i) =>
  mag.push(
    pic({
      pic: 'bcell',
      at: p,
      width: SIZE.bcell,
      rotate: (i * 47) % 360,
      show: {out: T.copies - 0.9, fade: 0.8},
      motion: [{at: 0, opacity: 1}, {at: T.fit, opacity: 1}, {at: T.fit + 0.6, opacity: 0.3}],
    }),
  ),
);
mag.push({type: 'glow', at: [0, 0], radius: 15, breathe: true, show: {in: T.fit, out: T.copies + 0.4, fade: 0.6}});

// Copies: 1 → 2 → 4 → 8
const R8 = (deg: number): Vec => [18 * Math.cos((deg * Math.PI) / 180), 18 * Math.sin((deg * Math.PI) / 180)];
const t1 = T.copies;
const t2 = T.again1;
const t3 = T.again2;
interface Copy {
  id: string;
  born: number;
  path: {at: number; p: Vec}[];
  out?: number;
  memory?: boolean;
}
const copies: Copy[] = [
  {id: 'c0', born: -1, path: [{at: 0, p: [0, 0]}, {at: t1, p: [-7, 0]}, {at: t2, p: [-8, -8]}, {at: t3, p: R8(247.5)}], memory: true},
  {id: 'c1', born: t1, path: [{at: t1, p: [7, 0]}, {at: t2, p: [8, -8]}, {at: t3, p: R8(292.5)}]},
  {id: 'c2', born: t2, path: [{at: t2, p: [-8, 8]}, {at: t3, p: R8(157.5)}]},
  {id: 'c3', born: t2, path: [{at: t2, p: [8, 8]}, {at: t3, p: R8(22.5)}], memory: true},
  {id: 'c4', born: t3, path: [{at: t3, p: R8(202.5)}]},
  {id: 'c5', born: t3, path: [{at: t3, p: R8(112.5)}], memory: true},
  {id: 'c6', born: t3, path: [{at: t3, p: R8(337.5)}]},
  {id: 'c7', born: t3, path: [{at: t3, p: R8(67.5)}]},
];
const parentOf: Record<string, string> = {c1: 'c0', c2: 'c0', c3: 'c1', c4: 'c0', c5: 'c2', c6: 'c1', c7: 'c3'};
const posAt = (c: Copy, t: number): Vec => {
  let p = c.path[0].p;
  for (const k of c.path) if (t >= k.at) p = k.p;
  return p;
};
const byId = Object.fromEntries(copies.map((c) => [c.id, c]));
copies.forEach((c, i) => {
  const motion: NonNullable<PictureItem['motion']> = [];
  // Each step: hold where it is until the split, then glide to the new place in 0.7 s.
  let prev: Vec = c.born > 0 ? posAt(byId[parentOf[c.id]], c.born - 0.01) : [0, 0];
  motion.push({at: 0, x: prev[0], y: prev[1]});
  const steps = c.born > 0 ? c.path : c.path.slice(1);
  steps.forEach((k) => {
    motion.push({at: k.at, x: prev[0], y: prev[1]}, {at: k.at + 0.7, x: k.p[0], y: k.p[1]});
    prev = k.p;
  });
  mag.push(
    pic({
      id: c.id,
      pic: 'bcell',
      at: [0, 0],
      width: SIZE.bcell,
      rotate: (i * 63) % 360,
      show: {in: c.born > 0 ? c.born : undefined, out: c.memory ? undefined : T.stay - 0.4, fade: c.born > 0 ? 0.45 : 0.8},
      motion,
    }),
  );
});

// Antibodies stream out from the copies.
const abodies: {from: string; to: Vec; rot: number}[] = [
  {from: 'c6', to: A1_LOCAL, rot: 15}, // the one the camera pushes in on
  {from: 'c3', to: [30, 4], rot: 80},
  {from: 'c7', to: [13, 27], rot: 140},
  {from: 'c5', to: [-11, 28], rot: 200},
  {from: 'c2', to: [-28, 11], rot: 250},
  {from: 'c4', to: [-29, -9], rot: 290},
  {from: 'c0', to: [-14, -27], rot: 330},
  {from: 'c1', to: [4, -30], rot: 0},
];
abodies.forEach((a, i) => {
  const born = T.antibodies + i * 0.14;
  const from = posAt(byId[a.from], born);
  mag.push(
    pic({
      id: i === 0 ? 'A1' : undefined,
      pic: 'antibody',
      at: from,
      width: SIZE.antibodyMag,
      show: {in: born, out: 66.5, fade: 0.45},
      motion: [
        {at: 0, x: from[0], y: from[1], rotate: a.rot - 30, scale: 0.6},
        {at: born, x: from[0], y: from[1], rotate: a.rot - 30, scale: 0.6},
        {at: born + 1.8, x: a.to[0], y: a.to[1], rotate: a.rot, scale: 1},
      ],
    }),
  );
});

// Memory cells keep a soft glow.
['c0', 'c3', 'c5'].forEach((id) => {
  const p = posAt(byId[id], 80);
  mag.push({type: 'glow', at: p, radius: 14, breathe: true, show: {in: T.stay, fade: 0.8}});
});
// Glows go under the cells: draw them first.
const magOrdered = [...mag.filter((m) => m.type === 'glow'), ...mag.filter((m) => m.type !== 'glow' && m.type !== 'label')];

items.push({
  type: 'magnifier',
  source: follicle,
  sourceRadius: 9.6,
  center: MAG_C,
  radius: MAG_R,
  grow: T.checked,
  show: {out: T.back + 0.3, fade: 0.8},
  // children use magnifier space (0,0 = circle center)
  children: magOrdered,
});
// Labels for magnifier content live in world space so they stay crisp.
items.push(
  label({text: 'B CELL', anchor: [MAG_C[0], MAG_C[1] + MAG_R], offset: [0, 70], show: {in: T.bcells, out: s(14) - 0.1}}),
  label({text: 'ANTIBODY', anchor: A1_AT, offset: [0, -240], show: {in: T.yshaped, out: s(16) + 0.2}}),
  label({text: 'MEMORY CELLS', anchor: [MAG_C[0] + 8, MAG_C[1] + MAG_R], offset: [0, 60], show: {in: T.memory, out: s(20) + 0.2}}),
  label({text: 'VACCINES', anchor: [MAG_C[0], MAG_C[1] + MAG_R], offset: [0, 55], show: {in: T.vaccines, out: T.back + 0.6}}),
);

// --- S16 antibodies travel back and coat the germs ---
items.push(
  {type: 'light', path: lymphBack, start: 63.3, end: 65.4, count: 4, gap: 0.22, size: 30},
);
const coat = (target: Vec, offs: Vec[], start: number, swallow?: PictureItem['swallow'], out?: number) =>
  offs.forEach((o, i) => {
    const to = add(target, o);
    const rot = (Math.atan2(-o[1], -o[0]) * 180) / Math.PI + 90; // stem points away from the germ
    items.push(
      pic({
        pic: 'antibody',
        at: to,
        width: SIZE.antibodySkin,
        rotate: rot,
        show: {in: start + i * 0.12, out, fade: 0.45},
        motion: [
          {at: 0, x: lymphPath[0][0], y: lymphPath[0][1]},
          {at: start + i * 0.12, x: lymphPath[0][0], y: lymphPath[0][1]},
          {at: start + i * 0.12 + 1.1, x: to[0], y: to[1]},
        ],
        swallow,
      }),
    );
  });
coat(B3, [[-7, -4], [6, 5], [-3, 7]], T.coat - 0.2, {at: 68.8, duration: 1.0, into: M1_EAT2});
coat(B4, [[-6, -5], [7, 4]], T.coat + 0.1, undefined, 72.6);
items.push(label({text: 'COATED', anchor: B3, offset: [0, 240], show: {in: T.coated, out: T.find - 0.1}}));

// --- S18 days pass ---
items.push({type: 'orbit', screen: [880, 300], radius: 64, start: T.first, end: T.days + 0.7, turns: 3, text: 'DAYS', show: {in: T.first - 0.2, out: s(19) + 0.5}});

// --- S20 the same germ comes back ---
items.push(
  pic({id: 'B5', pic: 'bacterium', at: B5, width: SIZE.bacterium, rotate: 25, show: {in: T.same, out: T.back + 0.4, fade: 0.6}}),
  {type: 'light', path: lymphBack, start: T.faster - 1.0, end: T.faster - 0.1, count: 3, gap: 0.12, size: 26},
);
coat(B5, [[-6, -5], [6.5, 4.5], [1, -8]], T.faster - 0.3, undefined, T.back + 0.4);

// ---------------------------------------------------------------- settings

const settings: VideoSettings = {
  id: 'immune-system',
  width: 1080,
  height: 1920,
  fps: 60,
  audio: 'audio/narration.mp3',
  timings,
  tail: 1,
  style: {
    background: '#ffffff',
    ink: '#1d1d1f',
    accent: '#5E9BE0',
    font: 'Inter',
    dotGrid: {spacing: 46, size: 1.6, color: 'auto', parallax: 0.85},
    labelSize: 34,
    fade: 0.5,
  },
  safe: {top: 0.08, bottom: 0.18},
  pictures,
  camera,
  items,
  // Square feed version (Instagram): same journey, re-framed.
  formats: {
    square: {width: 1080, height: 1080, fps: 30, safe: {top: 0.05, bottom: 0.15}, zoomScale: 0.75},
  },
};

export default settings;
