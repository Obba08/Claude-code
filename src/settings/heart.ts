// Settings for "Your heart runs itself".
// Everything specific to this video lives here: pictures, where they sit on the page, the camera,
// lights, labels and all timings (tied to words of the narration with w()).
// To make a new video: copy this file, change it, and point src/Root.tsx at the copy.

import timingsJson from '../data/heart-timings.json';
import {beatTimes, placed, timeHelpers} from '../engine/core';
import type {CameraKey, Item, LabelItem, LightItem, PictureItem, Timings, Vec, VideoSettings} from '../engine/types';

const timings = timingsJson as unknown as Timings;
const {w, we, s} = timeHelpers(timings);

const pictures = {
  phone: {src: 'images/seated_phone.png', w: 1344, h: 1792},
  pulse: {src: 'images/seated_pulse.png', w: 1344, h: 1792},
  body: {src: 'images/body.png', w: 1344, h: 2016},
  section: {src: 'images/heart_section.png', w: 1360, h: 1360},
  lungs: {src: 'images/lungs.png', w: 1360, h: 1360},
  heart: {src: 'images/heart.png', w: 1360, h: 1360},
  brain: {src: 'images/brain.png', w: 1792, h: 1344},
  petri: {src: 'images/petri_dish.png', w: 1792, h: 1344},
  chest: {src: 'images/chest.png', w: 1360, h: 1360},
  pacemaker: {src: 'images/pacemaker.png', w: 1360, h: 1360},
};

// ---------------------------------------------------------------- the page (world units)
//
//   seated_pulse (-1500,1600)   brain + heart (0,1350/1900)   petri dish (1500,1600)
//   seated_phone (0,0)          body (1500,0)                 chest (3000,0)

const add = (a: Vec, b: Vec): Vec => [a[0] + b[0], a[1] + b[1]];

const P = placed(pictures.phone, [0, 0], 1000);
const PHONE_HEART = P.pt(505, 615);

const PU = placed(pictures.pulse, [-1500, 1600], 1000);
const WRIST = PU.pt(808, 790);
const MAG3_C: Vec = [-1150, 1200];
const MAG3_R = 150;
const MAG3_PIC_W = 3200; // the same drawing, much closer, centred on the wrist
const MAG3_PIC_AT: Vec = [-(808 - 672) * (MAG3_PIC_W / 1344), -(790 - 896) * (MAG3_PIC_W / 1344)];

const B = placed(pictures.body, [1500, 0], 1150);
const BODY_HEART = B.pt(688, 640);

// The cut-open heart sits exactly over the body's heart (traced: its outline matches at this size).
const SEC = placed(pictures.section, B.pt(687.7, 640.1), 1360 * 0.137 * B.scale);
const SA = SEC.pt(488, 405); // where the big vein meets the upper right chamber
const AV = SEC.pt(655, 615); // bottom of the wall between the upper chambers
const VENT = SEC.pt(765, 990); // low in the wall between the lower chambers
const RA = SEC.pt(525, 505); // the upper right chamber
const HEART_MID = SEC.pt(690, 700);

// Electrical paths traced on heart_section.png.
const toAV = SEC.pts([[488, 405], [530, 470], [600, 560], [655, 615]]);
const septum = SEC.pts([[655, 615], [690, 700], [705, 820], [725, 950], [755, 1080], [790, 1120]]);
const wallL = SEC.pts([[790, 1120], [880, 1110], [950, 1010], [985, 870], [990, 720]]); // viewer's right
const wallR = SEC.pts([[785, 1118], [680, 1110], [560, 1030], [450, 900], [400, 760]]); // viewer's left
const fromVentL = SEC.pts([[765, 990], [790, 1120], [880, 1110], [950, 1010], [985, 870], [990, 720]]);
const fromVentR = SEC.pts([[765, 990], [770, 1100], [680, 1110], [560, 1030], [450, 900], [400, 760]]);

// Lungs drawn over the body's lungs for the "oxygen" moment.
const LU = placed(pictures.lungs, B.pt(675.5, 619), 1360 * 0.265 * B.scale);
const LUNG_L = B.pt(606, 646);
const LUNG_R = B.pt(737, 656);
const brainToHeartBody = B.pts([[668, 388], [664, 450], [662, 520], [672, 565]]);
const brainToLungL = B.pts([[668, 388], [662, 480], [645, 560], [606, 625]]);
const brainToLungR = B.pts([[668, 388], [662, 480], [690, 560], [735, 630]]);
const BODY_BRAIN = B.pt(670, 300);

const PD = placed(pictures.petri, [1500, 1600], 1000);
const clusters: Vec[] = [PD.pt(649, 522), PD.pt(1171, 506), PD.pt(886, 696), PD.pt(578, 807), PD.pt(1203, 783)];
const MAG1_C: Vec = [1500, 1060];
const MAG1_R = 170;
const MAG1_PIC_W = 2600; // the dish, seen much closer inside the magnifier
const MAG1_PIC_AT: Vec = [-(886 - 896) * (MAG1_PIC_W / 1792), -(696 - 672) * (MAG1_PIC_W / 1792)];

const BR = placed(pictures.brain, [0, 1350], 760);
const H = placed(pictures.heart, [0, 1900], 640);
const BRAIN_MID = BR.pt(880, 560);
const HEART2_MID = H.pt(688, 760);
const nerve: Vec[] = [BR.pt(1048, 1170), [55, 1620], [36, 1688], [20, 1750], H.pt(704, 482)];
const nerveTop: Vec[] = [BR.pt(1048, 1170), [59, 1590]];
const nerveBottom: Vec[] = [[53, 1638], [43, 1665], [36, 1688], [20, 1750], H.pt(704, 482)];
const CUT: Vec = [56, 1614];
const DIAL: Vec = [315, 1650];

const C = placed(pictures.chest, [3000, 0], 1000);
const HC = placed(pictures.heart, add(C.pt(735, 770), [2.6, -5.2]), 620);
const BUMP = C.pt(976, 367); // just under the left collarbone
const lead = C.pts([[976, 367], [930, 450], [860, 560], [800, 700], [770, 850], [760, 960]]);
const MAG2_C: Vec = [3190, -560];
const MAG2_R = 150;
const PM_W = 380;
const pm = (x: number, y: number): Vec => [(x - 680) * (PM_W / 1360), (y - 680) * (PM_W / 1360)];
const pmWire: Vec[] = [
  [687, 319], [824, 343], [962, 398], [1071, 481], [1140, 591], [1174, 728], [1165, 880], [1110, 1010], [1010, 1085], [880, 1112],
].map(([x, y]) => pm(x, y));

// ---------------------------------------------------------------- timings (all from the voice)

const T = {
  never: w(1, 'never'),
  who: w(3, "who's"),
  show: w(3, 'show'),
  tucked: w(4, 'tucked'),
  upper: w(4, 'upper'),
  sa: w(4, 'sa'),
  pacemaker1: w(5, 'pacemaker'),
  fires: w(6, 'fires'),
  spark: w(6, 'spark'),
  hundredK: w(6, '100000'),
  dish: w(8, 'dish'),
  body: w(8, 'body'),
  beating: w(8, 'beating'),
  start: w(8, 'start'),
  brain9: w(9, 'brain'),
  jolt: w(10, 'jolt'),
  jump: w(10, 'jump'),
  races: w(10, 'races'),
  cranking: w(11, 'cranking'),
  volume: w(11, 'volume'),
  up: we(11, 'up'),
  falling: w(12, 'falling'),
  turns: w(12, 'turns'),
  down: we(12, 'down'),
  breatheIn: w(13, 'breathe'),
  slightly: we(13, 'slightly'),
  breatheOut: w(14, 'breathe'),
  slows: we(14, 'slows'),
  brain15: w(15, 'brain'),
  brake: w(15, 'brake'),
  nerves: w(16, 'nerves'),
  cut: w(16, 'cut'),
  beats17: w(17, 'beats'),
  faster: w(17, 'faster'),
  backups: w(18, 'backups'),
  lowPower: w(18, 'low-power'),
  fails1: w(19, 'fails'),
  second: w(19, 'second'),
  fails2: w(20, 'fails'),
  third: w(20, 'third'),
  pacemaker2: w(21, 'pacemaker'),
  bump: w(22, 'bump'),
  collarbone: w(22, 'collarbone'),
  doing: w(23, 'doing'),
  oxygen: w(24, 'oxygen'),
  breathing: w(24, 'breathing'),
  beat25: w(25, 'beat'),
  right: w(26, 'right'),
  follow: w(28, 'follow'),
  end: timings.duration,
};

// ---------------------------------------------------------------- heartbeats

const phoneBeats = [...beatTimes(0.25, 7.0, [{at: 0, bpm: 72}]), ...beatTimes(88.4, T.end + 1.2, [{at: 0, bpm: 72}])];
const saBeats1 = beatTimes(12.2, 25.2, [{at: 0, bpm: 72}]);
const saBeats2 = beatTimes(60.6, T.fails1 + 0.1, [{at: 0, bpm: 72}]);
const avBeats = beatTimes(T.second + 0.1, T.fails2 + 0.1, [{at: 0, bpm: 46}]);
const ventBeats = beatTimes(T.third + 0.1, 69.6, [{at: 0, bpm: 32}]);
const bodyBeats = beatTimes(84.4, 88.9, [{at: 0, bpm: 72}]);
const pairBeats = beatTimes(31.0, 60.6, [
  {at: 31, bpm: 70},
  {at: T.races - 0.4, bpm: 70},
  {at: T.races + 0.6, bpm: 128},
  {at: T.turns - 0.2, bpm: 125},
  {at: T.down + 0.2, bpm: 56},
  {at: 49.5, bpm: 70},
  {at: T.faster - 0.3, bpm: 70},
  {at: T.faster + 0.5, bpm: 100},
]);
const wristBeats = beatTimes(43.4, 49.0, [
  {at: 43.4, bpm: 66},
  {at: T.breatheIn + 0.4, bpm: 66},
  {at: T.slightly, bpm: 77},
  {at: T.slows, bpm: 61},
]);
const cellBeats = beatTimes(T.start - 0.1, 31.4, [{at: 0, bpm: 64}]);
const chestBeats = beatTimes(70.2, 79.4, [{at: 0, bpm: 70}]);
const during = (beats: number[], a: number, b: number) => beats.filter((t) => t >= a && t < b);

// ---------------------------------------------------------------- helpers

const pic = (p: Omit<PictureItem, 'type'>): PictureItem => ({type: 'picture', ...p});
const label = (l: Omit<LabelItem, 'type'>): LabelItem => ({type: 'label', ...l});
const light = (path: Vec[], start: number, dur: number, extra: Partial<LightItem> = {}): LightItem => ({
  type: 'light',
  path,
  start,
  end: start + dur,
  ease: 'inOut',
  ...extra,
});
const TOP: Vec = [540, 270]; // label spot in the upper free area
const RIGHT: Vec = [880, 1100]; // beside the heart in the brain + heart scene
const CHEST_LABEL: Vec = [300, 300];

// ---------------------------------------------------------------- camera

const camera: CameraKey[] = [
  {at: 0, x: 0, y: -106, zoom: 1.0},
  {at: 6.3, x: -30, y: -200, zoom: 1.5}, // S1 slow push toward the heart and phone
  {at: 7.4, x: 750, y: -60, zoom: 0.85, ease: 'in'}, // S2 glide along the page…
  {at: 8.7, x: 1500, y: -22, zoom: 0.97, ease: 'out'}, // …to the body
  {at: 10.5, x: 1500, y: -30, zoom: 1.0},
  {at: 13.2, x: HEART_MID[0], y: HEART_MID[1], zoom: 8.6}, // S4 push into the heart
  {at: 16.0, x: (SA[0] + HEART_MID[0]) / 2, y: (SA[1] + HEART_MID[1]) / 2, zoom: 9.8}, // toward the SA node
  {at: 18.3, x: (SA[0] + HEART_MID[0]) / 2, y: (SA[1] + HEART_MID[1]) / 2, zoom: 10.0},
  {at: 20.2, x: HEART_MID[0], y: HEART_MID[1], zoom: 8.4}, // S6 whole heart for the spark's trip
  {at: 24.3, x: HEART_MID[0], y: HEART_MID[1], zoom: 7.7},
  {at: 25.5, x: 1505, y: 640, zoom: 0.62, ease: 'in'}, // S8 pull out and travel down…
  {at: 26.8, x: 1500, y: 1390, zoom: 1.12, ease: 'out'}, // …to the dish
  {at: 30.6, x: 1500, y: 1380, zoom: 1.16},
  {at: 31.3, x: 750, y: 1500, zoom: 0.8, ease: 'in'}, // S9 over to the brain
  {at: 32.4, x: 40, y: 1625, zoom: 1.17, ease: 'out'},
  {at: 42.0, x: 40, y: 1640, zoom: 1.2}, // S10–S12 brain and heart together
  {at: 42.9, x: -750, y: 1610, zoom: 0.8, ease: 'in'}, // S13 to the person feeling their pulse
  {at: 44.0, x: -1460, y: 1600, zoom: 1.08, ease: 'out'},
  {at: 48.4, x: -1460, y: 1600, zoom: 1.1},
  {at: 49.3, x: -700, y: 1640, zoom: 0.8, ease: 'in'}, // S15 back to brain and heart
  {at: 50.4, x: 40, y: 1640, zoom: 1.2, ease: 'out'},
  {at: 58.6, x: 40, y: 1650, zoom: 1.22}, // S16–S17 slow drift
  {at: 59.1, x: 40, y: 1650, zoom: 1.22},
  {at: 60.2, x: 760, y: 750, zoom: 0.55, ease: 'in'}, // S18 all the way back into the body's heart
  {at: 61.6, x: HEART_MID[0], y: HEART_MID[1], zoom: 8.2, ease: 'out'},
  {at: 68.6, x: HEART_MID[0], y: HEART_MID[1], zoom: 8.5},
  {at: 69.7, x: 2250, y: -150, zoom: 0.6, ease: 'in'}, // S21 over to the chest
  {at: 70.9, x: 3020, y: -200, zoom: 1.0, ease: 'out'}, // the chest
  {at: 78.5, x: 3020, y: -200, zoom: 1.04},
  {at: 79.5, x: 2250, y: -330, zoom: 0.75, ease: 'in'}, // S24 back to the body: brain and lungs
  {at: 80.6, x: 1500, y: -430, zoom: 1.9, ease: 'out'},
  {at: 84.2, x: 1500, y: -430, zoom: 1.95},
  {at: 85.5, x: BODY_HEART[0], y: BODY_HEART[1], zoom: 4.5}, // S25 the beat
  {at: 87.2, x: BODY_HEART[0], y: BODY_HEART[1], zoom: 4.8},
  {at: 88.7, x: 760, y: -120, zoom: 0.62, ease: 'in'}, // S27 long pull back…
  {at: 90.3, x: 0, y: -106, zoom: 1.0, ease: 'out'}, // …to the opening frame (loops)
  {at: T.end + 1, x: 0, y: -106, zoom: 1.0},
];

// ---------------------------------------------------------------- items

const items: Item[] = [];

// Far layer: faint, blurred hearts and brains drifting behind the page.
const far: [keyof typeof pictures, Vec, number, number][] = [
  ['heart', [-600, -500], 260, -15],
  ['brain', [700, -700], 300, 10],
  ['heart', [800, 900], 220, 20],
  ['brain', [-800, 900], 260, -10],
  ['heart', [2300, 900], 240, -25],
  ['heart', [-900, 2400], 230, 15],
  ['brain', [900, 2500], 280, 5],
  ['heart', [2400, -800], 220, 30],
  ['brain', [3600, 700], 260, -5],
];
far.forEach(([p, at, width, rot], i) =>
  items.push(
    pic({
      pic: p,
      at,
      width,
      rotate: rot,
      depth: 2.6,
      opacity: 0.07,
      motion: [
        {at: 0, x: at[0], y: at[1], rotate: rot},
        {at: T.end + 1, x: at[0] + (i % 2 ? 40 : -40), y: at[1] + (i % 3 ? -50 : 50), rotate: rot + 20, ease: 'linear'},
      ],
    }),
  ),
);

// --- S1 + ending: the person scrolling (the loop frame) ---
items.push(
  pic({id: 'phone', pic: 'phone', at: P.center, width: P.width}),
  {type: 'glow', at: PHONE_HEART, radius: 70, beats: phoneBeats, show: {in: 0, out: 7.2, fade: 0.6}},
  {type: 'glow', at: PHONE_HEART, radius: 70, beats: phoneBeats, show: {in: 89.0, fade: 0.8}},
  label({text: 'YOU NEVER TOLD\nIT TO BEAT', screen: [770, 300], show: {in: T.never, out: s(2) + 0.1}}),
);

// --- S2–S3 the body: who's in control? ---
items.push(
  pic({id: 'body', pic: 'body', at: B.center, width: B.width}),
  {type: 'glow', at: BODY_BRAIN, radius: 40, breathe: true, show: {in: T.who - 0.2, out: 10.6, fade: 0.6}},
  {type: 'line', path: brainToHeartBody, drawStart: T.who, drawEnd: T.who + 0.8, width: 3, color: '#5E9BE0', opacity: 0.6, show: {out: 10.9, fade: 0.6}},
  light(brainToHeartBody, T.show - 0.2, 0.9, {size: 30}),
  label({text: "WHO'S IN\nCONTROL?", screen: [850, 330], show: {in: T.who, out: s(4) - 0.1}}),
);

// Lungs drawn over the body's lungs (later, for "oxygen"), then the cut-open heart on top.
items.push(
  pic({
    id: 'lungs',
    pic: 'lungs',
    at: LU.center,
    width: LU.width,
    show: {in: 79.9, fade: 0.9},
    motion: [
      {at: 0, scale: 1},
      {at: T.oxygen, scale: 1},
      {at: T.oxygen + 1.6, scale: 1.035},
      {at: T.oxygen + 3.2, scale: 1},
      {at: T.oxygen + 4.8, scale: 1.035},
      {at: T.oxygen + 6.4, scale: 1},
    ],
  }),
  pic({
    id: 'section',
    pic: 'section',
    at: SEC.center,
    width: SEC.width,
    beats: [...saBeats1, ...saBeats2, ...avBeats, ...ventBeats, ...bodyBeats],
    beatAmount: 0.025,
    show: {in: 11.4, fade: 1.0},
  }),
);

// --- S4–S6 the SA node and its spark ---
const spark = (tb: number, from: 'sa' | 'av' | 'vent', size = 42) => {
  if (from === 'sa') {
    items.push(light(toAV, tb, 0.34, {size}), light(septum, tb + 0.4, 0.3, {size}), light(wallL, tb + 0.68, 0.32, {size: size * 0.85}), light(wallR, tb + 0.68, 0.32, {size: size * 0.85}));
  } else if (from === 'av') {
    items.push(light(septum, tb, 0.34, {size}), light(wallL, tb + 0.32, 0.36, {size: size * 0.85}), light(wallR, tb + 0.32, 0.36, {size: size * 0.85}));
  } else {
    items.push(light(fromVentL, tb, 0.55, {size: size * 0.85}), light(fromVentR, tb, 0.55, {size: size * 0.85}));
  }
};
items.push(
  {type: 'glow', at: RA, radius: 13, breathe: true, show: {in: T.upper - 0.1, out: T.sa - 0.2, fade: 0.6}},
  {type: 'glow', at: SA, radius: 6.5, beats: saBeats1, show: {in: T.sa - 0.1, out: 25.0, fade: 0.6}},
  {type: 'pulse', at: SA, radius: 9, start: T.sa, count: 2, interval: 0.8, duration: 1.8},
  label({text: 'SA NODE', anchor: SA, offset: [0, -150], show: {in: T.sa, out: s(5) - 0.1}}),
  label({text: 'YOUR BUILT-IN\nPACEMAKER', screen: TOP, show: {in: T.pacemaker1 - 0.3, out: s(6)}}),
  {type: 'pulse', at: SA, radius: 11, start: T.fires, count: 1, duration: 1.4},
  label({text: '≈100,000\nBEATS A DAY', screen: TOP, show: {in: T.hundredK, out: s(7) + 0.4}}),
);
during(saBeats1, T.spark - 0.15, 24.6).forEach((tb) => spark(tb, 'sa'));

// --- S8 heart cells in a dish ---
items.push(pic({id: 'petri', pic: 'petri', at: PD.center, width: PD.width}));
clusters.forEach((c, i) =>
  items.push({type: 'glow', at: c, radius: 55, beats: cellBeats.map((t) => t + i * 0.03), show: {in: T.start - 0.3, out: 31.4, fade: 0.6}}),
);
items.push(
  {
    type: 'magnifier',
    source: clusters[2],
    sourceRadius: 70,
    center: MAG1_C,
    radius: MAG1_R,
    grow: T.dish - 0.1,
    show: {out: 31.1, fade: 0.7},
    children: [pic({pic: 'petri', at: MAG1_PIC_AT, width: MAG1_PIC_W, beats: cellBeats, beatAmount: 0.035})],
  },
  label({text: 'NO BODY · NO BRAIN', screen: [540, 1385], show: {in: T.body, out: T.beating - 0.5}}),
  label({text: 'STILL BEATING', screen: [540, 1385], show: {in: T.beating, out: 31.0}}),
);

// --- S9–S17 brain and heart: the volume knob and the brake ---
items.push(
  pic({id: 'brain', pic: 'brain', at: BR.center, width: BR.width}),
  pic({id: 'heart2', pic: 'heart', at: H.center, width: H.width, beats: pairBeats, beatAmount: 0.03}),
  {type: 'glow', at: BRAIN_MID, radius: 150, breathe: true, show: {in: T.brain9 - 0.2, out: T.jolt + 0.4, fade: 0.7}},
  // the nerve from brain to heart
  {type: 'line', path: nerve, drawStart: T.jolt - 0.4, drawEnd: T.jolt + 0.5, width: 3, opacity: 0.5, show: {out: T.cut, fade: 0.35}},
  {type: 'line', path: nerveTop, drawStart: T.jolt - 0.4, drawEnd: T.jolt + 0.2, width: 3, opacity: 0.5, show: {out: 60.0}},
  {type: 'line', path: nerveBottom, drawStart: T.jolt - 0.1, drawEnd: T.jolt + 0.5, width: 3, opacity: 0.5, show: {out: 60.0}},
  light(nerve, T.jolt + 0.3, 0.8, {size: 34}),
  {type: 'pulse', at: HEART2_MID, radius: 190, start: T.races, count: 2, interval: 0.5, duration: 1.4},
  label({text: 'JUMP\nSCARE', screen: RIGHT, show: {in: T.jump, out: s(11) - 0.2}}),
  {
    type: 'dial',
    at: DIAL,
    radius: 62,
    show: {in: s(11), out: 42.4, fade: 0.6},
    keys: [
      {at: 0, value: 0.35},
      {at: T.cranking, value: 0.35},
      {at: T.up + 0.2, value: 0.95},
      {at: T.turns, value: 0.95},
      {at: T.down + 0.2, value: 0.15},
    ],
  },
  label({text: 'VOLUME\nKNOB', screen: [870, 985], show: {in: T.volume, out: 42.4}}),
  // S15 the brake: steady signals flow down the nerve until it is cut
  ...Array.from({length: 9}, (_, i) => light(nerve, T.brain15 + i * 0.42, 1.0, {size: 26, show: {out: T.cut - 0.2, fade: 0.3}})),
  {type: 'glow', at: BRAIN_MID, radius: 150, breathe: true, show: {in: T.brain15 - 0.2, out: T.cut, fade: 0.7}},
  label({text: 'THE\nBRAKE', screen: RIGHT, show: {in: T.brake, out: s(16) + 0.4}}),
  {type: 'pulse', at: CUT, radius: 40, start: T.cut, count: 1, duration: 1.2},
  label({text: 'NERVES\nCUT', screen: [860, 760], show: {in: T.cut - 0.1, out: s(17) + 0.6}}),
  label({text: 'STILL BEATING\nJUST FASTER', screen: RIGHT, show: {in: T.faster, out: s(18) + 0.3}}),
);

// --- S13–S14 feel your pulse ---
items.push(
  pic({id: 'pulse', pic: 'pulse', at: PU.center, width: PU.width}),
  {type: 'glow', at: WRIST, radius: 34, beats: wristBeats, show: {in: 43.4, out: 48.9, fade: 0.6}},
  {
    type: 'magnifier',
    source: WRIST,
    sourceRadius: 40,
    center: MAG3_C,
    radius: MAG3_R,
    grow: 43.6,
    show: {out: 48.9, fade: 0.6},
    children: [
      pic({pic: 'pulse', at: MAG3_PIC_AT, width: MAG3_PIC_W}),
      {type: 'glow', at: [0, 0], radius: 70, beats: wristBeats},
      ...wristBeats.map((tb) => ({type: 'pulse' as const, at: [0, 0] as Vec, radius: 95, start: tb, count: 1, duration: 0.9})),
    ],
  },
  label({text: 'BREATHE IN…', screen: [870, 590], show: {in: T.breatheIn, out: s(14) - 0.2}}),
  label({text: '…AND OUT', screen: [870, 590], show: {in: T.breatheOut, out: 48.9}}),
);

// --- S18–S20 the backups ---
items.push(
  label({text: 'BACKUPS', screen: TOP, show: {in: T.lowPower, out: s(19) + 0.2}}),
  {type: 'glow', at: SA, radius: 6.5, beats: saBeats2, show: {in: 60.8, out: T.fails1, fade: 0.7}},
  {type: 'glow', at: AV, radius: 7, beats: avBeats, show: {in: T.second - 0.1, out: T.fails2, fade: 0.7}},
  {type: 'pulse', at: AV, radius: 11, start: T.second, count: 1, duration: 1.3},
  label({text: 'BACKUP 1', anchor: AV, offset: [0, -190], show: {in: T.second, out: s(20) - 0.1}}),
  {type: 'glow', at: VENT, radius: 9, beats: ventBeats, show: {in: T.third - 0.1, out: 69.4, fade: 0.7}},
  {type: 'pulse', at: VENT, radius: 13, start: T.third, count: 1, duration: 1.3},
  label({text: 'BACKUP 2', anchor: VENT, offset: [0, 190], show: {in: T.third, out: s(21)}}),
);
during(saBeats2, 61.4, T.fails1).forEach((tb) => spark(tb, 'sa'));
avBeats.forEach((tb) => spark(tb, 'av'));
ventBeats.forEach((tb) => spark(tb, 'vent'));

// --- S21–S23 the pacemaker ---
items.push(
  pic({id: 'heartC', pic: 'heart', at: HC.center, width: HC.width, beats: chestBeats, beatAmount: 0.025}),
  pic({id: 'chest', pic: 'chest', at: C.center, width: C.width}),
  {
    type: 'magnifier',
    source: BUMP,
    sourceRadius: 30,
    center: MAG2_C,
    radius: MAG2_R,
    grow: T.pacemaker2 - 0.1,
    show: {out: 79.0, fade: 0.7},
    children: [
      pic({pic: 'pacemaker', at: [0, 0], width: PM_W}),
      ...during(chestBeats, T.doing - 0.6, 78.8).map((tb) => light(pmWire, tb - 0.5, 0.5, {size: 30})),
    ],
  },
  label({text: 'PACEMAKER', screen: CHEST_LABEL, show: {in: T.pacemaker2 + 0.3, out: s(22) + 0.2}}),
  {type: 'glow', at: BUMP, radius: 30, breathe: true, show: {in: T.bump - 0.1, out: s(23), fade: 0.6}},
  label({text: 'UNDER THE\nCOLLARBONE', screen: CHEST_LABEL, show: {in: T.collarbone, out: s(23) + 0.2}}),
  {type: 'line', path: lead, drawStart: s(23) - 0.1, drawEnd: s(23) + 0.9, width: 4, opacity: 0.65, show: {out: 79.2, fade: 0.6}},
  ...during(chestBeats, T.doing - 0.3, 78.8).map((tb) => light(lead, tb - 0.4, 0.4, {size: 34})),
  label({text: "DOING THE\nSA NODE'S JOB", screen: CHEST_LABEL, show: {in: T.doing, out: s(24)}}),
);

// --- S24–S26 oxygen, then the beat itself ---
items.push(
  {type: 'glow', at: LUNG_L, radius: 52, breathe: true, show: {in: T.oxygen - 0.1, out: 84.4, fade: 0.8}},
  {type: 'glow', at: LUNG_R, radius: 52, breathe: true, show: {in: T.oxygen - 0.1, out: 84.4, fade: 0.8}},
  label({text: 'NEEDS OXYGEN', screen: TOP, show: {in: T.oxygen, out: T.breathing - 0.15}}),
  {type: 'glow', at: BODY_BRAIN, radius: 40, breathe: true, show: {in: T.breathing - 0.1, out: 84.4, fade: 0.6}},
  light(brainToLungL, T.breathing, 0.9, {size: 26}),
  light(brainToLungR, T.breathing, 0.9, {size: 26}),
  label({text: "BREATHING:\nYOUR BRAIN'S JOB", screen: TOP, show: {in: T.breathing, out: s(25) - 0.1}}),
  {type: 'glow', at: BODY_HEART, radius: 26, beats: bodyBeats, show: {in: T.beat25 - 0.2, out: 88.6, fade: 0.6}},
  ...during(bodyBeats, T.right - 0.3, 88.0).map((tb) => ({type: 'pulse' as const, at: BODY_HEART, radius: 40, start: tb, count: 1, duration: 1.0})),
  label({text: 'THE BEAT IS\nALL HEART', screen: TOP, show: {in: T.beat25, out: 88.3}}),
);

// --- S28 end card (the opening frame) ---
items.push(label({text: 'FOLLOW\n@FINGERTIPFACTS', screen: TOP, show: {in: T.follow, out: T.end + 0.4}}));

// ---------------------------------------------------------------- settings

const settings: VideoSettings = {
  id: 'heart',
  width: 1080,
  height: 1920,
  fps: 60,
  audio: 'audio/heart-narration.mp3',
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
  // Top 8 % is kept free; the bottom 18 % is kept free and the band above it holds the subtitles,
  // so pictures are framed in the area between (8 %–74 %).
  safe: {top: 0.08, bottom: 0.26},
  subtitles: {
    font: 'Montserrat',
    fontFile: 'fonts/montserrat-latin-900-normal.woff2',
    weight: 900,
    size: 56,
    y: 1497,
    maxChars: 24,
  },
  watermark: {
    text: '@fingertipfacts',
    opacity: 0.07,
    size: 40,
    font: 'Montserrat',
    fontFile: 'fonts/montserrat-latin-700-normal.woff2',
    weight: 700,
  },
  pictures,
  camera,
  items,
};

export default settings;
