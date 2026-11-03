// Settings for "Apoptosis" (script.md).
// Everything specific to this video lives here: pictures, where they sit in the world,
// the camera path, lights, labels and all timings (tied to words of the narration).
// To make a new video: copy this file, swap pictures/timings/positions, and point Root.tsx at it.

import timingsJson from '../data/timings.json';
import {placed, timeHelpers} from '../engine/core';
import type {CameraKey, Item, LabelItem, LightItem, LineItem, PictureItem, Timings, Vec, VideoSettings} from '../engine/types';

const timings = timingsJson as unknown as Timings & {audio?: string};
const {w, s, se} = timeHelpers(timings);

const pictures = {
  hand: {src: 'images/hand.png', w: 1344, h: 1792},
  embryo: {src: 'images/embryo_hand.png', w: 1344, h: 1792},
  cell: {src: 'images/cell.png', w: 1360, h: 1360},
  fragments: {src: 'images/cell_fragments.png', w: 1360, h: 1360},
  macrophage: {src: 'images/macrophage.png', w: 1360, h: 1360},
};

// ---------------------------------------------------------------- helpers

const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];
const pic = (p: Omit<PictureItem, 'type'>): PictureItem => ({type: 'picture', ...p});
const label = (l: Omit<LabelItem, 'type'>): LabelItem => ({type: 'label', ...l});
const light = (l: Omit<LightItem, 'type'>): LightItem => ({type: 'light', ...l});
const line = (l: Omit<LineItem, 'type'>): LineItem => ({type: 'line', ...l});
/** Points on a tilted ellipse (image pixels), closed — for tracing round outlines. */
const ellipse = (c: Vec, a: number, b: number, deg: number, n = 28, from = 0): Vec[] => {
  const r = (deg * Math.PI) / 180;
  return Array.from({length: n + 1}, (_, i) => {
    const t = from + (i / n) * Math.PI * 2;
    const x = a * Math.cos(t);
    const y = b * Math.sin(t);
    return [c[0] + x * Math.cos(r) - y * Math.sin(r), c[1] + x * Math.sin(r) + y * Math.cos(r)] as Vec;
  });
};
// Small deterministic "random" so the tissue looks natural but renders the same every time.
const rand = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ---------------------------------------------------------------- layout (world units)

// The adult hand is the page. 1 world unit = 1 px at camera zoom 1.
const H = placed(pictures.hand, [0, 0], 1000);
// The embryo hand sits so its web (between the 2nd and 3rd ridge) lies in the gap
// between the index and middle finger of the adult hand.
const EW = 940;
const kE = EW / pictures.embryo.w;
const gapH = H.pt(600, 560);
const E = placed(pictures.embryo, [gapH[0] - (496 - 672) * kE, gapH[1] - (336 - 896) * kE], EW);

// The web tissue: everything at cell scale happens around this point.
const P = E.pt(520, 440);

// Gap between index and middle finger, traced on hand.png (down one side, around, up the other).
const gapPath = H.pts([
  [524, 330], [533, 390], [548, 444], [566, 500], [585, 564], [600, 615], [612, 660], [628, 683], [643, 688],
  [655, 672], [659, 615], [656, 545], [656, 480], [660, 420], [665, 345],
]);
// Rim of the web between the 2nd and 3rd ridge, traced on embryo_hand.png.
const rimPath = E.pts([
  [392, 284], [416, 289], [440, 306], [464, 328], [496, 337], [528, 329], [552, 312], [576, 278], [600, 230], [628, 207], [656, 197],
]);

// One cell of the web, then its insides (pixels traced on cell.png).
const CW = 16; // file width of one cell in world units (the cell itself is ~11.6 wide)
const C = placed(pictures.cell, P, CW);
const M1px: Vec = [528, 383];
const M1 = C.pt(...M1px);
const mito = {
  m1: {c: M1px, a: 100, b: 50, deg: -45},
  m2: {c: [935, 440] as Vec, a: 100, b: 52, deg: 35},
  m3: {c: [475, 815] as Vec, a: 100, b: 52, deg: 50},
  m4: {c: [945, 830] as Vec, a: 105, b: 55, deg: -35},
};
const SHRINK = 0.82;
const Cs = (px: number, py: number): Vec => [P[0] + (px - 680) * C.scale * SHRINK, P[1] + (py - 680) * C.scale * SHRINK];

// Fragments (the cell after it breaks apart) and the macrophage.
const FW = 19;
const F0 = P;
const DRIFT = 3.4; // how far the pieces drift down "like leaves"
const F1 = add(F0, [0, DRIFT]);
const Fr = placed(pictures.fragments, F0, FW);
const MW = 40;
const mk = MW / pictures.macrophage.w;
const bodyPx: Vec = [920, 630];
const body: Vec = add(F1, [15.5, -0.5]); // where the macrophage body ends up
const Mcenter: Vec = [body[0] - (bodyPx[0] - 680) * mk, body[1] - (bodyPx[1] - 680) * mk];
const Mac = placed(pictures.macrophage, Mcenter, MW);

// ---------------------------------------------------------------- timings (all tied to words)

const T = {
  gaps: w(1, 'gaps'),
  born: w(2, 'born'),
  paddle: w(2, 'paddle'),
  web: w(3, 'web'),
  cells: w(4, 'cells'),
  signal: w(4, 'signal'),
  shut: w(5, 'shut'),
  purpose: w(5, 'purpose'),
  apoptosis: w(6, 'apoptosis'),
  programmed: w(6, 'programmed'),
  how: w(7, 'how'),
  mitochondria: w(8, 'mitochondria'),
  energy: w(8, 'energy'),
  release: w(9, 'release'),
  cytochrome: w(9, 'cytochrome'),
  switches: w(10, 'switches'),
  caspases: w(10, 'caspases'),
  scissors: w(11, 'scissors'),
  cut: w(11, 'cut'),
  shrinks: w(12, 'shrinks'),
  dna: w(12, 'dna'),
  chopped: w(12, 'chopped'),
  breaks: w(13, 'breaks'),
  wrapped: w(13, 'wrapped'),
  name: w(14, 'name'),
  falling: w(14, 'falling'),
  inflammation: w(15, 'inflammation'),
  macrophage: w(16, 'macrophage'),
  eats: w(16, 'eats'),
  notJust: w(17, 'not'),
  damaged: w(18, 'damaged'),
  infected: w(18, 'infected'),
  needed: w(18, 'needed'),
  billions: w(19, 'billions'),
  every: w(19, 'every'),
  damaged2: w(20, 'damaged'),
  dividing: w(20, 'dividing'),
  cancer: w(20, 'cancer'),
  everyTime: w(21, 'every'),
  spread: w(21, 'spread'),
  end: timings.duration,
};

// ---------------------------------------------------------------- camera

const OPEN = {x: 0, y: -28, zoom: 0.9};
const Pc = add(P, [0.3, 0.9]); // cell slightly high, leaves room for the magnifier
const D0: Vec = add(P, [6.8, -11.8]); // the damaged cell that will not die (S20)

const cam = (at: number, p: Vec | {x: number; y: number}, zoom: number, ease?: CameraKey['ease']): CameraKey => {
  const [x, y] = Array.isArray(p) ? p : [p.x, p.y];
  return {at, x, y, zoom, ease};
};

const camera: CameraKey[] = [
  cam(0, OPEN, OPEN.zoom),
  cam(0.5, OPEN, 0.905), // S1 a breath, then a slow push toward the gap
  cam(se(1) + 0.3, H.pt(615, 600), 1.75),
  cam(se(2) + 0.3, E.pt(520, 400), 2.3), // S2 keep pushing while the hand becomes a paddle
  cam(se(3) + 0.2, E.pt(525, 380), 3.8), // S3 the web
  cam(T.signal + 0.4, P, 9), // S4 into the web: cells
  cam(se(5) + 0.2, P, 30), // S5 toward one cell
  cam(se(6) + 0.2, P, 42), // S6 slow drift while the name appears
  cam(se(7) + 0.3, Pc, 72), // S7 push into the cell
  cam(se(8) + 0.2, Pc, 76), // S8 hold on the mitochondria
  cam(se(9) + 0.2, Pc, 73), // S9
  cam(T.caspases + 0.6, add(P, [0.4, 0.3]), 62), // S10 ease back to see the whole cell
  cam(se(11) + 0.2, add(P, [0.4, 0.3]), 64), // S11
  cam(T.shrinks + 1.4, add(P, [0.3, 0.25]), 74), // S12 follow the shrinking cell in
  cam(se(13) + 0.2, P, 70), // S13
  cam(se(14) + 0.3, add(F0, [0, 1.2]), 60), // S14 tilt down with the falling pieces
  cam(se(15) + 0.1, add(F0, [0, 1.4]), 58), // S15
  cam(T.macrophage + 2.0, add(F1, [8.5, -0.5]), 30), // S16 make room for the macrophage
  cam(se(16) + 0.2, add(F1, [8.5, -0.5]), 31),
  cam(se(17) + 0.3, add(P, [2, 1]), 15), // S17 the pull back starts
  cam(se(18) + 0.2, add(P, [1, 0]), 9.5), // S18 tissue again
  cam(se(19) + 0.2, P, 7.5), // S19 many cells
  cam(T.dividing + 1.0, add(P, [3.4, -5]), 10), // S20 toward the cell that will not die
  cam(se(20) + 0.1, add(P, [3, -4]), 10.3),
  cam(se(21) + 0.2, OPEN, OPEN.zoom), // S21 all the way back to the opening frame (loops)
];

// ---------------------------------------------------------------- items

const items: Item[] = [];

// --- far layer: faint, blurred cells drifting behind the cell-scale scenes (slower = farther) ---
const far: [Vec, number][] = [
  [[-55, -40], 34], [[48, -62], 28], [[62, 20], 36], [[-60, 38], 30], [[10, 70], 26], [[-20, -78], 24], [[35, 52], 22], [[-75, -5], 26],
];
far.forEach(([o, size], i) => {
  const at = add(P, o);
  items.push(
    pic({
      pic: 'cell',
      at,
      width: size,
      rotate: rand(i) * 360,
      depth: 2.4,
      opacity: 0.13,
      show: {in: T.shut - 0.4, out: se(20) - 0.4, fade: 1.4},
      motion: [
        {at: 0, x: at[0], y: at[1]},
        {at: T.end, x: at[0] + (i % 2 ? 6 : -6), y: at[1] + (i % 3 ? -8 : 8), rotate: rand(i) * 360 + 30, ease: 'linear'},
      ],
    }),
  );
});

// --- the hands (opening and closing frame) ---
items.push(
  pic({
    id: 'embryo',
    pic: 'embryo',
    at: E.center,
    width: E.width,
    motion: [
      {at: 0, opacity: 0},
      {at: T.born - 0.2, opacity: 0},
      {at: T.born + 1.4, opacity: 1},
      {at: T.cells, opacity: 1},
      {at: T.signal + 0.2, opacity: 0.35},
      {at: se(5), opacity: 0},
      {at: T.everyTime - 0.6, opacity: 0},
      {at: T.everyTime + 0.8, opacity: 1},
      {at: T.spread - 0.3, opacity: 1},
      {at: T.spread + 1.1, opacity: 0},
    ],
  }),
  pic({
    id: 'hand',
    pic: 'hand',
    at: H.center,
    width: H.width,
    motion: [
      {at: 0, opacity: 1},
      {at: T.born - 0.2, opacity: 1},
      {at: T.born + 1.2, opacity: 0},
      {at: T.spread - 0.3, opacity: 0},
      {at: T.spread + 1.1, opacity: 1},
    ],
  }),
);

// S1 light runs along the gap between two fingers.
items.push(light({path: gapPath, start: T.gaps, end: T.gaps + 2.4, size: 34}));
// S3 light runs along the rim of the web.
items.push(
  light({path: rimPath, start: T.web - 0.1, end: T.web + 2.0, size: 30}),
  label({text: 'WEB OF TISSUE', anchor: E.pt(528, 330), offset: [0, -215], show: {in: T.web, out: se(3) + 0.4}}),
);

// --- the tissue: a patch of cells in the web (hexagonal grid around P) ---
interface Cell {
  o: Vec;
  d: number;
  i: number;
  edge: number;
}
const grid: Cell[] = [];
const SPX = 13.6;
const SPY = 11.8;
let gi = 0;
for (let r = -13; r <= 13; r++) {
  for (let c = -7; c <= 7; c++) {
    const o: Vec = [c * SPX + (Math.abs(r) % 2 ? SPX / 2 : 0) + (rand(gi + 7) - 0.5) * 1.6, r * SPY + (rand(gi + 3) - 0.5) * 1.4];
    const e = Math.hypot(o[0] / 84, o[1] / 148);
    if (e <= 1) grid.push({o, d: Math.hypot(o[0], o[1]), i: gi, edge: e});
    gi++;
  }
}
const isMain = (g: Cell) => g.d < 3;
const cellPic = (g: Cell, show: PictureItem['show'], extra: Partial<PictureItem> = {}, strength = 1) =>
  pic({
    pic: 'cell',
    at: add(P, g.o),
    width: CW * (0.92 + rand(g.i) * 0.14),
    rotate: (rand(g.i + 11) - 0.5) * 70,
    opacity: (g.edge > 0.72 ? Math.max(0, 1 - (g.edge - 0.72) / 0.28) : 1) * strength, // patch fades into the page
    show,
    ...extra,
  });

// S4: the cells of the web appear (a soft wave outward); they leave when we go into one cell.
grid
  .filter((g) => !isMain(g) && g.d < 32)
  .forEach((g) => items.push(cellPic(g, {in: T.cells + g.d * 0.012, out: T.purpose - 0.2, fade: 1.0})));

// S17–S21: the whole patch, appearing as the camera pulls back; a few blink out (S19).
const near = (dx: number, dy: number) => grid.reduce((b, g) => (Math.hypot(g.o[0] - dx, g.o[1] - dy) < Math.hypot(b.o[0] - dx, b.o[1] - dy) ? g : b));
const blinkers = [
  [-40, -47],
  [28, -24],
  [-14, 35],
  [41, 35],
  [-41, 12],
  [14, 59],
  [-27, -71],
].map(([x, y]) => near(x, y));
const d0Cell = near(D0[0] - P[0], D0[1] - P[1]);
grid
  .filter((g) => !isMain(g))
  .forEach((g) => {
    const b = blinkers.indexOf(g);
    const bt = T.billions + 0.15 + b * 0.36;
    items.push(
      cellPic(
        g,
        {in: T.notJust + 0.2 + g.d * 0.014, out: T.everyTime - 0.3, fade: 1.0},
        b >= 0 ? {motion: [{at: bt, opacity: 1}, {at: bt + 1.0, opacity: 0}]} : {},
        0.55,
      ),
    );
    if (b >= 0) {
      items.push({type: 'glow', at: add(P, g.o), radius: 8.5, show: {in: bt - 0.3, out: bt + 0.7, fade: 0.6}});
    }
  });

// --- the one cell we follow ---
items.push(
  pic({
    id: 'main',
    pic: 'cell',
    at: P,
    width: CW,
    show: {in: T.cells - 0.1, out: T.breaks, fade: 0.8},
    motion: [
      {at: T.shrinks, scale: 1},
      {at: T.shrinks + 1.4, scale: SHRINK},
    ],
  }),
);

// S4 a signal travels through the web to our cell, then the cell glows softly.
const signalPath: Vec[] = [add(P, [-46, -30]), add(P, [-32, -16]), add(P, [-18, -9]), add(P, [-8, -3]), P];
items.push(
  light({path: signalPath, start: T.signal - 0.15, end: T.signal + 1.3, count: 3, gap: 0.22, size: 30}),
  {type: 'pulse', at: P, radius: 9, start: T.signal + 1.0, count: 2, interval: 0.7, duration: 1.8},
  {type: 'glow', at: P, radius: 8, breathe: true, show: {in: T.signal + 1.0, out: T.shut, fade: 0.8}},
);

// S5–S6 labels.
items.push(
  label({text: 'ON PURPOSE', screen: [540, 330], show: {in: T.purpose, out: se(5) + 0.25}}),
  label({text: 'APOPTOSIS', screen: [540, 300], size: 56, show: {in: T.apoptosis, out: se(6) + 0.5}}),
  label({text: 'PROGRAMMED CELL DEATH', screen: [540, 384], size: 30, show: {in: T.programmed, out: se(6) + 0.5}}),
);

// S8 a magnifier grows out of one mitochondrion; light runs along its membrane.
const MAG = 2.2; // magnification inside the circle
const magCenter: Vec = add(Pc, [3.5, -5.85]); // screen ~(805, 430) at zoom ~74
const local = (px: number, py: number): Vec => [(px - M1px[0]) * C.scale * MAG, (py - M1px[1]) * C.scale * MAG];
items.push({
  type: 'magnifier',
  source: M1,
  sourceRadius: 1.35,
  center: magCenter,
  radius: 3.0,
  grow: T.mitochondria,
  show: {in: T.mitochondria - 0.3, out: se(8) + 0.2, fade: 0.6},
  children: [
    pic({pic: 'cell', at: [-(M1[0] - P[0]) * MAG, -(M1[1] - P[1]) * MAG], width: CW * MAG}),
    light({path: ellipse(mito.m1.c, mito.m1.a, mito.m1.b, mito.m1.deg, 32, Math.PI).map(([x, y]) => local(x, y)), start: T.energy - 0.2, end: T.energy + 2.2, size: 26}),
  ],
});
items.push(label({text: 'MITOCHONDRIA', screen: [540, 1330], show: {in: T.mitochondria + 0.2, out: se(8) + 0.1}}));

// S9 cytochrome c leaves all four mitochondria (small soft lights into the cell).
const cyto: Vec[][] = [
  [[545, 365], [585, 395], [615, 430], [640, 470]],
  [[980, 470], [930, 498], [890, 515], [860, 540]],
  [[480, 815], [520, 805], [560, 795], [600, 785]],
  [[930, 830], [905, 800], [885, 780], [870, 760]],
];
cyto.forEach((pts, i) =>
  items.push(light({path: C.pts(pts), start: T.release + 0.1 + i * 0.18, end: T.release + 1.6 + i * 0.18, count: 3, gap: 0.3, size: 18, intensity: 0.9})),
);
items.push(label({text: 'CYTOCHROME C', screen: [540, 1330], show: {in: T.cytochrome, out: se(9) + 0.1}}));

// S10 caspases switch on: a soft blue wave spreads through the cell.
const cellMid = C.pt(690, 660);
items.push(
  {
    type: 'glow',
    at: cellMid,
    radius: 6.2,
    opacity: 0.5,
    breathe: true,
    show: {in: T.switches, out: T.shrinks, fade: 0.8},
    motion: [
      {at: T.switches, scale: 0.3},
      {at: T.switches + 1.8, scale: 1.15},
    ],
  },
  {type: 'pulse', at: cellMid, radius: 6.2, start: T.caspases, count: 2, interval: 0.8, duration: 2.0},
  label({text: 'CASPASES', screen: [540, 1330], show: {in: T.caspases, out: se(11) + 0.1}}),
);

// S11 like scissors: a small scissors icon draws itself, then cuts appear inside the cell.
const SC = add(P, [5.6, -6.4]);
const sc = (pts: Vec[]): Vec[] => pts.map(([x, y]) => [SC[0] + x * 0.95, SC[1] + y * 0.95]);
const ring = (c: Vec, r: number) => ellipse(c, r, r, 0, 20);
const scissors: Vec[][] = [
  sc([[1.8, -0.55], [0, 0], [-0.95, 0.5]]),
  sc([[1.8, 0.55], [0, 0], [-0.95, -0.5]]),
  sc(ring([-1.3, 0.72], 0.38)),
  sc(ring([-1.3, -0.72], 0.38)),
];
scissors.forEach((p, i) =>
  items.push(line({path: p, drawStart: T.scissors + i * 0.15, drawEnd: T.scissors + 0.7 + i * 0.15, width: 3, smooth: false, opacity: 0.7, show: {out: se(11) + 0.2}})),
);
const cuts: Vec[][] = [
  [[400, 600], [480, 520]],
  [[800, 300], [900, 282]],
  [[960, 620], [1075, 585]],
  [[590, 892], [700, 918]],
  [[420, 700], [500, 742]],
];
cuts.forEach((p, i) =>
  items.push(
    line({path: C.pts(p as Vec[]), drawStart: T.cut + i * 0.22, drawEnd: T.cut + 0.35 + i * 0.22, width: 7, color: '#5E9BE0', opacity: 0.95, smooth: false, show: {out: T.shrinks - 0.1, fade: 0.6}}),
  ),
);

// S12 the cell shrinks; light runs round the nucleus (DNA), then it is cut into pieces.
const nucleus = ellipse([750, 642], 152, 150, 0, 32, -Math.PI / 2).map(([x, y]) => Cs(x, y));
items.push(
  light({path: nucleus, start: T.dna - 0.1, end: T.dna + 1.6, size: 24}),
  label({text: 'DNA', screen: [540, 1330], show: {in: T.dna, out: se(12) + 0.2}}),
);
const chops: Vec[][] = [
  [[630, 610], [870, 570]],
  [[650, 705], [855, 728]],
  [[745, 498], [765, 790]],
];
chops.forEach((p, i) =>
  items.push(
    line({path: p.map(([x, y]) => Cs(x, y)), drawStart: T.chopped + i * 0.2, drawEnd: T.chopped + 0.35 + i * 0.2, width: 6, color: '#5E9BE0', opacity: 0.95, smooth: false, show: {out: T.breaks - 0.1, fade: 0.5}}),
  ),
);

// S13 it breaks into small packages; light runs round one membrane.
// S14 they drift down like leaves; S16 the macrophage eats them.
items.push(
  pic({
    id: 'fragments',
    pic: 'fragments',
    at: F0,
    width: FW,
    show: {in: T.breaks - 0.1, fade: 0.9},
    motion: [
      {at: T.breaks - 0.1, scale: 0.86, x: F0[0], y: F0[1], rotate: 0},
      {at: T.breaks + 1.2, scale: 1},
      {at: T.name, x: F0[0], y: F0[1], rotate: 0},
      {at: se(14) + 0.4, x: F1[0], y: F1[1], rotate: 10},
    ],
    swallow: {at: T.eats, duration: 1.4, into: body},
  }),
  light({path: ellipse([560, 485], 195, 195, 0, 32, Math.PI).map(([x, y]) => Fr.pt(x, y)), start: T.wrapped - 0.1, end: T.wrapped + 1.8, size: 24}),
  label({text: 'APO · PTOSIS', screen: [540, 300], size: 46, show: {in: T.name, out: se(14) + 0.4}}),
  label({text: 'FALLING OFF', screen: [540, 380], size: 30, show: {in: T.falling, out: se(14) + 0.4}}),
  label({text: 'NO INFLAMMATION', screen: [540, 330], show: {in: T.inflammation, out: se(15) + 0.3}}),
);

const macStart = add(Mac.center, [42, -3]);
const macEnd = add(Mac.center, [48, -4]);
items.push(
  pic({
    id: 'macrophage',
    pic: 'macrophage',
    at: Mac.center,
    width: MW,
    show: {in: T.macrophage - 0.3, fade: 0.8},
    motion: [
      {at: 0, x: macStart[0], y: macStart[1]},
      {at: T.macrophage - 0.3, x: macStart[0], y: macStart[1]},
      {at: T.macrophage + 2.0, x: Mac.center[0], y: Mac.center[1], ease: 'out'},
      {at: T.notJust, x: Mac.center[0], y: Mac.center[1], opacity: 1},
      {at: T.notJust + 2.4, x: macEnd[0], y: macEnd[1], opacity: 0, ease: 'in'},
    ],
  }),
  light({
    path: Mac.pts([[130, 680], [240, 705], [330, 735], [450, 700], [560, 672], [680, 662], [800, 650]]),
    start: T.eats - 0.2,
    end: T.eats + 1.4,
    count: 2,
    gap: 0.3,
    size: 24,
  }),
  label({text: 'MACROPHAGE', screen: [540, 330], show: {in: T.macrophage + 0.3, out: se(16) + 0.3}}),
);

// S18 why cells do it (one word at a time).
items.push(
  label({text: 'DAMAGED', screen: [540, 300], show: {in: T.damaged, out: se(18) + 0.3}}),
  label({text: 'INFECTED', screen: [540, 370], show: {in: T.infected, out: se(18) + 0.3}}),
  label({text: 'NOT NEEDED', screen: [540, 440], show: {in: T.needed - 0.1, out: se(18) + 0.3}}),
  label({text: 'BILLIONS EVERY DAY', screen: [540, 330], show: {in: T.every, out: se(19) + 0.3}}),
);

// S20 one damaged cell survives and copies itself: 1 → 2 → 4.
const d0 = add(P, d0Cell.o);
const copyTo: Vec[] = [add(P, [0.4, 0.6]), add(P, [-7.5, 7.0]), add(P, [9.0, 6.0])];
const copyAt = [T.dividing, T.dividing + 0.75, T.dividing + 0.75];
items.push({type: 'glow', at: d0, radius: 9, breathe: true, show: {in: T.damaged2, out: T.everyTime - 0.3, fade: 0.8}});
copyTo.forEach((to, i) =>
  items.push(
    pic({
      pic: 'cell',
      at: to,
      width: CW,
      rotate: (rand(d0Cell.i + 11) - 0.5) * 70,
      opacity: 0.9,
      show: {in: copyAt[i] - 0.1, out: T.everyTime - 0.3, fade: 0.7},
      motion: [
        {at: 0, x: i === 0 ? d0[0] : copyTo[0][0], y: i === 0 ? d0[1] : copyTo[0][1]},
        {at: copyAt[i], x: i === 0 ? d0[0] : copyTo[0][0], y: i === 0 ? d0[1] : copyTo[0][1]},
        {at: copyAt[i] + 1.1, x: to[0], y: to[1]},
      ],
    }),
  ),
);
items.push(label({text: 'CANCER', screen: [540, 330], show: {in: T.cancer, out: se(20) + 0.3}}));

// ---------------------------------------------------------------- settings

const settings: VideoSettings = {
  id: 'apoptosis',
  width: 1080,
  height: 1920,
  fps: 60,
  audio: timings.audio ?? '',
  timings,
  tail: 1,
  fonts: [
    {family: 'Montserrat', file: 'fonts/montserrat-latin-800-normal.woff2', weight: 800},
    {family: 'Montserrat', file: 'fonts/montserrat-latin-900-normal.woff2', weight: 900},
  ],
  subtitles: {font: 'Montserrat', weight: 900, size: 58, y: 1452, maxChars: 22, color: '#1d1d1f', upcoming: 0.28},
  watermark: {text: '@fingertipfacts', font: 'Montserrat', weight: 800, size: 40, opacity: 0.075},
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
};

export default settings;
