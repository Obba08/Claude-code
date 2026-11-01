// Settings for "A Hole in the Heart".
// Everything specific to this video lives here: pictures, where they sit in the world, the
// camera path, lights, labels and every timing (tied to words of the narration).
// Blue (accent) is used only for moving blood and the heart's electrical signals; everything
// else the animation adds (labels, arrows, outlines, ripples, the catheter) is ink.

import timingsJson from '../data/heart-hole.timings.json';
import {placed, timeHelpers} from '../engine/core';
import type {
  BeatDef,
  CameraKey,
  CircleItem,
  Item,
  LabelItem,
  LightItem,
  LineItem,
  MotionKey,
  PictureItem,
  Timings,
  Vec,
  VideoSettings,
} from '../engine/types';

const timings = timingsJson as unknown as Timings;
const {w, we, s, se} = timeHelpers(timings);

const pictures = {
  chest: {src: 'images/chest.png', w: 1090, h: 1257},
  exterior: {src: 'images/heart_exterior.png', w: 732, h: 1187},
  cutaway: {src: 'images/heart_cutaway.png', w: 857, h: 1304},
  device: {src: 'images/closure_device.png', w: 829, h: 919},
  patch: {src: 'images/surgical_patch.png', w: 866, h: 685},
};

// ---------------------------------------------------------------- layout (world units)

// The chest is the big page. The heart pictures sit exactly on the heart in the chest drawing.
const C = placed(pictures.chest, [0, 0], 1000);
const H0 = C.pt(597, 578); // middle of the heart in the chest drawing
const E = placed(pictures.exterior, H0, 280);
const X = placed(pictures.cutaway, H0, 298);
const P = (px: number, py: number) => X.pt(px, py);
const PS = (list: Vec[]) => X.pts(list);
const k = X.scale; // world units per cut-away pixel

// Features traced on heart_cutaway.png (image pixels).
const HOLE = P(465, 905);
const HOLE_R = 19 * k;
const OVAL = P(433, 640);

// Blood paths, traced along the chambers and vessels of the drawing.
// (The heart's right side is on the viewer's left, as in a textbook.)
const RIGHT_IN = PS([[212, 150], [214, 260], [222, 360], [236, 460], [246, 560], [252, 650], [264, 720], [288, 820], [322, 900], [362, 960]]);
const RIGHT_OUT = PS([[362, 960], [386, 860], [395, 760], [398, 640], [405, 540], [425, 450], [475, 380], [545, 318], [625, 284], [700, 266]]);
const LEFT_IN = PS([[752, 362], [718, 425], [668, 482], [630, 545], [614, 612], [610, 670], [604, 750], [598, 845], [592, 945], [578, 1030]]);
const LEFT_OUT = PS([[578, 1030], [540, 950], [516, 850], [500, 750], [486, 640], [462, 525], [425, 425], [385, 335], [372, 235], [410, 152], [458, 108], [462, 50]]);
const RIGHT_FULL = [...RIGHT_IN, ...RIGHT_OUT.slice(1)];
const LEFT_FULL = [...LEFT_IN, ...LEFT_OUT.slice(1)];
const RV_SHORT = PS([[262, 720], [290, 820], [325, 905], [370, 960], [392, 870]]);
const LV_SHORT = PS([[612, 660], [604, 760], [596, 880], [578, 1010], [540, 950], [512, 830]]);
const SEPTUM = PS([[380, 468], [405, 560], [425, 650], [440, 740], [452, 830], [465, 905], [478, 990], [496, 1080], [520, 1160], [548, 1222]]);
const SEPTUM_TOP = PS([[380, 468], [405, 560], [425, 650], [440, 740], [452, 830], [458, 872]]);
const SEPTUM_BOTTOM = PS([[548, 1222], [520, 1160], [496, 1080], [482, 1000], [474, 940]]);
const PLACENTA_IN = PS([[130, 1420], [150, 1200], [170, 1000], [205, 820], [240, 690], [280, 600], [320, 590]]);
const FORAMEN = PS([[300, 600], [362, 618], [433, 640], [500, 622], [560, 592]]);
const LEAK = PS([[600, 900], [535, 905], [465, 905], [400, 905], [335, 885]]);
const LEAK_SMALL = PS([[560, 905], [465, 905], [380, 900]]);
// The leaked blood's loop: lungs -> left side -> hole -> right side -> lungs.
const LOOP = [
  ...LEFT_IN.slice(0, 8),
  ...PS([[560, 905], [465, 905], [380, 900], [340, 880]]),
  ...RIGHT_OUT.slice(1),
];
const FROM_LUNGS = [...LEFT_IN.slice(0, 8), ...PS([[560, 905], [470, 905]])];
const TO_LUNGS = [...PS([[465, 905], [380, 900], [345, 880]]), ...RIGHT_OUT.slice(1)];
// Electrical signal: from the top of the right upper chamber, down the wall, round the bottom.
const SIGNAL = PS([[250, 380], [320, 500], [400, 660], [438, 760], [458, 880], [488, 1060], [545, 1215], [650, 1180], [755, 1010], [790, 820]]);
// Catheter: up a vein from below, into the right side, across to the hole.
const CATHETER = PS([[150, 1640], [158, 1420], [172, 1180], [196, 960], [228, 780], [266, 700], [302, 770], [338, 852], [392, 893], [465, 905]]);
const HEART_BOTTOM_Y = X.pt(0, 1304)[1];
// ECG trace under the heart.
const ecg = (): Vec[] => {
  const pts: Vec[] = [];
  const y0 = HEART_BOTTOM_Y + 34;
  const x0 = P(40, 0)[0];
  const x1 = P(820, 0)[0];
  const beats = 3;
  const bw = (x1 - x0) / beats;
  for (let b = 0; b < beats; b++) {
    const bx = x0 + b * bw;
    const shape: [number, number][] = [[0, 0], [0.22, 0], [0.27, -4], [0.32, 0], [0.42, 0], [0.45, 4], [0.5, -26], [0.55, 9], [0.58, 0], [0.7, 0], [0.78, -7], [0.86, 0], [1, 0]];
    for (const [fx, fy] of shape) pts.push([bx + fx * bw, y0 + fy]);
  }
  return pts;
};
const ECG = ecg();
// Echo scan fan, from above the heart.
const FAN_APEX = P(430, -170);
const fanArc = (): Vec[] => {
  const pts: Vec[] = [];
  const r = Math.hypot(P(430, 1180)[0] - FAN_APEX[0], P(430, 1180)[1] - FAN_APEX[1]);
  for (let a = -24; a <= 24; a += 3) {
    const rad = ((90 - a) * Math.PI) / 180;
    pts.push([FAN_APEX[0] + r * Math.cos(rad), FAN_APEX[1] + r * Math.sin(rad)]);
  }
  return pts;
};
const ARC = fanArc();
const FAN_EDGE = [ARC[0], FAN_APEX, ARC[ARC.length - 1]];
// Diaphragm top edge, traced on chest.png.
const DIAPHRAGM = C.pts([[150, 878], [240, 850], [330, 832], [450, 824], [550, 822], [650, 824], [760, 832], [860, 850], [950, 880]]);

// Sizes (width of the whole picture file, in world units)
const DEV_W = 34;
const PATCH_W = 21;
const DEV_TILT = 9; // the wall leans a little; the device sits across it

// ---------------------------------------------------------------- camera

const Z_CHEST = 0.98;
const Z_HEART = 2.6;
const CHEST_VIEW: [number, number, number] = [0, 2, Z_CHEST];
const HEART_VIEW: [number, number, number] = [H0[0], H0[1], Z_HEART];

const cam: CameraKey[] = [];
let last: [number, number, number] = CHEST_VIEW;
let lastEnd = 0;
/** Hold where we are until `start`, then move (eased) to a new view by `end`. Moves never overlap. */
const move = (start: number, end: number, x: number, y: number, zoom: number) => {
  start = Math.max(start, lastEnd);
  end = Math.max(end, start + 1.2);
  lastEnd = end;
  cam.push({at: start, x: last[0], y: last[1], zoom: last[2]});
  cam.push({at: end, x, y, zoom});
  last = [x, y, zoom];
};
const moveTo = (start: number, end: number, p: Vec, zoom: number) => move(start, end, p[0], p[1], zoom);

// ---------------------------------------------------------------- items

const items: Item[] = [];
const add = <T extends Item>(it: T) => (items.push(it), it);
const pic = (p: Omit<PictureItem, 'type'>) => add<PictureItem>({type: 'picture', ...p});
const light = (l: Omit<LightItem, 'type'>) => add<LightItem>({type: 'light', size: 30, ...l});
const line = (l: Omit<LineItem, 'type'>) => add<LineItem>({type: 'line', ...l});
const circle = (c: Omit<CircleItem, 'type'>) => add<CircleItem>({type: 'circle', ...c});
/** A label next to a world point. */
const tag = (text: string, at: Vec, tin: number, tout: number, offset: Vec = [0, 0], size?: number) =>
  add<LabelItem>({type: 'label', text, anchor: at, offset, size, show: {in: tin, out: tout}});
/** A label at a fixed place on screen (y in px). */
const note = (text: string, y: number, tin: number, tout: number, size?: number) =>
  add<LabelItem>({type: 'label', text, screen: [540, y], size, show: {in: tin, out: tout}});
/** A list: heading plus items that appear one by one, all leaving together. */
const list = (heading: string, rows: [string, number][], tout: number, y0 = 360, gap = 92, headingAt?: number) => {
  note(heading, y0, headingAt ?? rows[0][1] - 0.6, tout, 40);
  rows.forEach(([text, tin], i) => note(text, y0 + 120 + i * gap, tin, tout, 30));
};

// Heart motion: opacity (dimming behind lists) and size (stretching), collected then sorted.
const heartMotion: MotionKey[] = [];
const dim = (from: number, to: number, level = 0.22) => {
  heartMotion.push({at: from - 0.01, opacity: 1}, {at: from + 0.8, opacity: level}, {at: to, opacity: level}, {at: to + 0.9, opacity: 1});
};

// ================================================================ 1. The chest (sentences 1–5)

const T1 = {
  heart: w(1, 'heart'),
  diaphragm: w(1, 'diaphragm'),
  dome: w(1, 'dome'),
  hole: w(1, 'hole'),
  frightening: w(2, 'frightening'),
  common: w(3, 'common'),
  babies: w(4, 'babies'),
  adults: w(4, 'adults'),
  fine: w(4, 'fine'),
  lets: w(5, "let's"),
  inside: w(5, 'inside'),
};
// A faint copy of the heart far behind everything: a slower, blurred layer for depth.
pic({pic: 'exterior', at: [H0[0] + 40, H0[1] + 30], width: 900, depth: 2.4, opacity: 0.1, show: {in: T1.inside, out: w(104, 'chest'), fade: 1.6}});

pic({id: 'chest', pic: 'chest', at: C.center, width: C.width, show: {in: -1, out: we(5, 'inside') + 0.2, fade: 1.2}});
// End of the video: the chest comes back, matching the very first frame.
pic({pic: 'chest', at: C.center, width: C.width, show: {in: w(104, 'chest') - 0.2, fade: 1.4}});

move(0, T1.lets, CHEST_VIEW[0], CHEST_VIEW[1] - 20, 1.12); // slow push in toward the heart
line({path: DIAPHRAGM, drawStart: T1.diaphragm - 0.2, drawEnd: T1.dome + 0.4, width: 6, opacity: 0.85, show: {in: T1.diaphragm - 0.2, out: T1.frightening}});
tag('DIAPHRAGM', C.pt(550, 930), T1.diaphragm, T1.frightening);
// The heartbeat as a soft electrical pulse over the heart.
add({type: 'pulse', at: H0, radius: 150, start: T1.heart, count: 5, interval: 1.0, duration: 2.0, show: {in: T1.heart, out: T1.frightening + 1}});
tag('A HOLE IN THE WALL', H0, T1.hole, T1.frightening, [0, -290]);
tag('VERY COMMON AT BIRTH', H0, T1.common, w(4, 'some'), [0, -290]);
tag('BABIES', C.pt(330, 520), T1.babies, T1.fine);
tag('ADULTS', C.pt(860, 520), T1.adults, T1.fine);
add({type: 'pulse', at: H0, radius: 130, start: T1.fine, count: 2, interval: 1.0, duration: 2.0});

// Into the heart: the outside of the heart fades up in place of the drawing's heart.
moveTo(T1.lets, s(6) + 1.2, H0, Z_HEART);
pic({id: 'exterior', pic: 'exterior', at: E.center, width: E.width, show: {in: T1.inside - 0.5, out: w(7, 'four'), fade: 1.0}, beat: [{start: s(6), end: w(7, 'four') + 1, bpm: 62, amount: 0.012}]});

// ================================================================ 2. The heart (6–16)

const T2 = {
  pump: w(7, 'pump'),
  four: w(7, 'four'),
  chambers: w(7, 'chambers'),
  right: w(8, 'right'),
  left: w(8, 'left'),
};
const beats: BeatDef[] = [];
pic({id: 'cutaway', pic: 'cutaway', at: X.center, width: X.width, show: {in: T2.pump, out: w(103, 'heart'), fade: 1.0}, beat: beats, motion: heartMotion});
tag('4 CHAMBERS', H0, T2.chambers, s(8) + 0.6, [0, -250]);
tag('RIGHT', P(250, 560), T2.right, w(9, 'collects') + 1);
tag('LEFT', P(615, 560), T2.left, w(9, 'collects') + 1);
beats.push({start: s(7), end: w(52, 'large'), bpm: 62, amount: 0.008});

// 9: right side -> lungs
moveTo(s(9), se(9) - 0.5, P(330, 600), 2.75);
light({path: RIGHT_FULL, start: w(9, 'collects'), end: w(9, 'collects') + 4.2, count: 3, gap: 0.8});
tag('TO THE LUNGS', P(700, 266), w(9, 'lungs'), se(10), [-60, -60]);
// 10: refilled with oxygen
add({type: 'glow', at: P(735, 330), radius: 55, breathe: true, show: {in: w(10, 'refill'), out: se(10) + 0.4}});
// 11: left side -> body
moveTo(s(11), se(11), P(520, 600), 2.75);
light({path: LEFT_FULL, start: w(11, 'takes'), end: w(11, 'takes') + 4.2, count: 3, gap: 0.8, intensity: 1});
tag('TO THE BODY', P(462, 50), w(11, 'body'), se(11) + 0.8, [0, -40]);

// 12–13: the septum
moveTo(s(12), se(12), P(450, 820), 3.1);
line({path: SEPTUM, drawStart: w(12, 'wall'), drawEnd: w(12, 'septum') + 0.4, width: 3, show: {in: w(12, 'wall'), out: se(13) + 0.3}});
tag('SEPTUM', P(452, 830), w(12, 'septum'), se(13) + 0.3, [150, 0]);
light({path: RV_SHORT, start: w(13, 'keep'), end: w(13, 'keep') + 2.4, count: 2, gap: 0.7});
light({path: LV_SHORT, start: w(13, 'keep'), end: w(13, 'keep') + 2.4, count: 2, gap: 0.7});

// 14–16: pressure
moveTo(s(14), se(14), P(450, 860), 2.9);
add({type: 'glow', at: P(600, 900), radius: 55, breathe: true, show: {in: w(14, 'squeezes'), out: se(15) + 0.3}});
add({type: 'pulse', at: P(600, 900), radius: 70, start: w(14, 'squeezes'), count: 3, interval: 1.0, color: 'ink'});
line({path: [P(720, 860), P(560, 878)], smooth: false, arrow: true, width: 7, drawStart: w(15, 'pressure'), drawEnd: w(15, 'pressure') + 0.8, show: {in: w(15, 'pressure'), out: se(16)}});
line({path: [P(190, 860), P(290, 872)], smooth: false, arrow: true, width: 3, drawStart: w(15, 'pressure') + 0.3, drawEnd: w(15, 'pressure') + 1.0, show: {in: w(15, 'pressure') + 0.3, out: se(16)}});
tag('HIGHER PRESSURE', P(650, 860), w(15, 'higher'), se(16), [0, -110]);

// ================================================================ 3. A door before birth (17–26)

moveTo(s(17), w(17, 'air'), P(400, 660), 3.2);
note('BEFORE BIRTH', 260, w(17, 'birth'), se(19));
light({path: PLACENTA_IN, start: w(18, 'oxygen'), end: w(18, 'oxygen') + 3.4, count: 3, gap: 0.7});
tag('FROM THE PLACENTA', P(170, 1000), w(18, 'placenta'), se(18) + 0.6, [60, 120]);
tag('LUNGS: NOT USED YET', P(700, 266), w(19, 'lungs'), se(19) + 0.3, [-120, -60]);

// 20–22: the foramen ovale
moveTo(s(20), w(20, 'opening'), OVAL, 4.6);
circle({at: OVAL, radius: 14 * k, radiusY: 34 * k, stroke: 'ink', strokeWidth: 2.5, draw: [w(20, 'opening'), w(20, 'opening') + 0.9], show: {in: w(20, 'opening'), out: w(24, 'seals')}});
// The flap: a small door hinged at the top of the opening, open then shut.
const FLAP_OPEN = PS([[433, 606], [452, 628], [470, 656], [482, 684]]);
const FLAP_SHUT = PS([[433, 606], [438, 630], [437, 656], [433, 676]]);
line({path: FLAP_OPEN, drawStart: w(20, 'flap'), drawEnd: w(20, 'door') + 0.3, width: 3.5, show: {in: w(20, 'flap'), out: w(24, 'shut')}});
tag('FORAMEN OVALE', OVAL, w(21, 'foramen'), se(22), [0, -170]);
light({path: FORAMEN, start: w(22, 'slips'), end: w(22, 'slips') + 2.4, count: 3, gap: 0.6, size: 26});
tag('RIGHT → LEFT', OVAL, w(22, 'right'), se(22) + 0.3, [0, 170]);

// 23: first breath — blood goes to the lungs again
moveTo(s(23), w(23, 'lungs'), P(450, 560), 3.0);
note('FIRST BREATH', 260, w(23, 'breath'), se(23));
light({path: RIGHT_OUT, start: w(23, 'lungs'), end: w(23, 'lungs') + 2.6, count: 3, gap: 0.6});
// 24: the flap shuts and seals
moveTo(s(24), w(24, 'shut'), OVAL, 4.4);
line({path: FLAP_SHUT, drawStart: w(24, 'shut'), drawEnd: w(24, 'shut') + 0.6, width: 3.5, show: {in: w(24, 'shut'), out: se(26)}});
tag('SEALS OVER TIME', OVAL, w(24, 'seals'), se(24) + 0.3, [0, -170]);
// 25: one in four
tag('1 IN 4 ADULTS', OVAL, w(25, 'one'), se(26), [0, -170]);
const dots: Vec[] = [[-24, 210], [-8, 210], [8, 210], [24, 210]];
dots.forEach(([dx, dy], i) =>
  circle({
    at: [OVAL[0] + dx, OVAL[1] + dy / 4.4],
    radius: 3.4,
    stroke: 'ink',
    strokeWidth: 2.5,
    fill: i === 0 ? '#3a3631' : undefined,
    show: {in: w(25, 'four') + i * 0.12, out: se(26)},
  }),
);

// ================================================================ 4. A true hole (27–31)

moveTo(s(27), w(28, 'wall'), HOLE, 4.4);
circle({at: HOLE, radius: HOLE_R + 3, stroke: 'ink', strokeWidth: 3, show: {in: w(28, 'gap'), out: se(31)}});
tag('A GAP IN THE WALL', HOLE, w(28, 'gap'), se(28) + 0.2, [0, -150]);
moveTo(w(29, 'upper'), w(29, 'chambers'), P(433, 640), 3.8);
circle({at: P(433, 625), radius: 12, stroke: 'ink', strokeWidth: 3, dash: 9, show: {in: w(29, 'upper'), out: se(31)}});
tag('ATRIAL SEPTAL DEFECT', P(433, 625), w(29, 'atrial'), se(29) + 0.4, [0, -140], 30);
moveTo(w(30, 'lower'), w(30, 'chambers'), HOLE, 3.8);
tag('VENTRICULAR SEPTAL DEFECT', HOLE, w(30, 'ventricular'), se(30) + 0.4, [0, -140], 30);
moveTo(s(31), w(31, 'and'), P(450, 770), 2.9);
tag('ASD', P(433, 625), w(31, 'asd'), se(31) + 0.3, [-120, 0]);
tag('VSD', HOLE, w(31, 'vsd'), se(31) + 0.3, [-120, 0]);

// ================================================================ 5. Causes (32–43)

move(s(32), se(32) + 0.4, ...HEART_VIEW);
note('FIRST WEEKS OF PREGNANCY', 250, w(33, 'first'), se(33) + 0.3, 32);
// 34–35: walls grow inward; the lower one stops short.
dim(w(34, 'walls') - 0.3, se(35) + 0.5, 0.45);
line({path: SEPTUM_TOP, drawStart: w(34, 'walls'), drawEnd: w(34, 'chambers'), width: 6, show: {in: w(34, 'walls'), out: se(36)}});
line({path: SEPTUM_BOTTOM, drawStart: w(34, 'walls'), drawEnd: w(34, 'chambers'), width: 6, show: {in: w(34, 'walls'), out: se(36)}});
moveTo(s(35), w(35, 'close'), HOLE, 3.8);
circle({at: HOLE, radius: HOLE_R + 3, stroke: 'ink', strokeWidth: 3, show: {in: w(35, 'close'), out: se(36)}});
tag('?', HOLE, w(36, 'nobody'), se(36), [0, -120], 54);
tag('GENES · FAMILY HISTORY', HOLE, w(37, 'genes'), se(38) + 0.3, [0, -150], 30);
tag('E.G. DOWN SYNDROME', HOLE, w(38, 'down'), se(38) + 0.3, [0, -95], 30);
move(s(39), w(39, 'risk'), ...HEART_VIEW);
dim(s(39), se(42));
list('DURING PREGNANCY', [['RUBELLA (GERMAN MEASLES)', w(40, 'rubella')], ['DIABETES NOT CONTROLLED', w(41, 'diabetes')], ['SMOKING · ALCOHOL', w(42, 'smoking')], ['SOME MEDICINES', w(42, 'medicines')]], se(42) + 0.2, 420);
note('USUALLY NOT CAUSED', 300, w(43, 'most'), se(43) + 0.2, 34);
note('BY ANYTHING A PARENT DID', 360, w(43, 'parent'), se(43) + 0.2, 34);

// ================================================================ 6. How the body reacts (44–59)

line({path: [P(720, 860), P(560, 878)], smooth: false, arrow: true, width: 7, drawStart: w(44, 'pressure'), drawEnd: w(44, 'pressure') + 0.8, show: {in: w(44, 'pressure'), out: s(46) + 0.4}});
line({path: [P(190, 860), P(290, 872)], smooth: false, arrow: true, width: 3, drawStart: w(45, 'harder'), drawEnd: w(45, 'harder') + 0.8, show: {in: w(45, 'harder'), out: s(46) + 0.4}});
moveTo(s(46), w(46, 'leaks'), HOLE, 4.0);
light({path: LEAK, start: w(46, 'leaks'), end: w(46, 'leaks') + 1.8, count: 4, gap: 0.55, size: 26});
tag('LEFT → RIGHT', HOLE, w(46, 'left'), se(46) + 0.3, [0, -150]);
move(s(47), w(47, 'lungs'), H0[0], H0[1] - 20, 2.7);
light({path: FROM_LUNGS, start: w(47, 'come'), end: w(47, 'come') + 3.2, count: 2, gap: 0.8});
light({path: TO_LUNGS, start: w(48, 'sent'), end: w(48, 'sent') + 2.6, count: 2, gap: 0.8});
light({path: LOOP, start: w(49, 'pumping'), end: w(49, 'pumping') + 4.6, count: 3, gap: 0.9});
tag('PUMPED TWICE', H0, w(49, 'twice'), se(49) + 0.5, [0, -260]);

// 50–51: a small hole
moveTo(s(50), w(50, 'small'), HOLE, 4.2);
tag('SMALL HOLE', HOLE, w(50, 'small'), se(50) + 0.3, [0, -140]);
light({path: LEAK_SMALL, start: w(50, 'barely'), end: w(50, 'barely') + 2.0, count: 2, gap: 0.9, size: 16, intensity: 0.6});
// It closes on its own: a disc of wall colour slowly covers the hole.
circle({at: HOLE, radius: HOLE_R + 1.5, fill: '#e6dac3', show: {in: w(51, 'close'), out: s(52) + 0.2, fade: 1.4}});
tag('SOME CLOSE ON THEIR OWN', HOLE, w(51, 'close'), se(51) + 0.2, [0, -140], 30);

// 52: a large hole — the heart works harder
move(s(52), w(52, 'heart'), H0[0], H0[1], 2.8);
tag('LARGE HOLE', HOLE, w(52, 'large'), se(52) + 0.3, [0, -150]);
circle({at: HOLE, radius: HOLE_R + 7, stroke: 'ink', strokeWidth: 3.5, show: {in: w(52, 'large'), out: se(52) + 0.3}});
light({path: LEAK, start: w(52, 'heart'), end: w(52, 'heart') + 1.5, count: 5, gap: 0.35, size: 36});
beats.push({start: w(52, 'large') + 0.05, end: se(52) + 0.5, bpm: 96, amount: 0.012});
beats.push({start: se(52) + 0.55, end: w(83, 'takes'), bpm: 62, amount: 0.008});

// 53–55: what people notice
dim(s(53), se(55));
list('IN BABIES', [['FAST BREATHING', w(53, 'fast')], ['SWEATING WHILE FEEDING', w(53, 'sweating')], ['TIRING EASILY', w(53, 'tiring')], ['SLOW WEIGHT GAIN', w(53, 'slow')]], se(53) + 0.2);
list('CHILDREN AND ADULTS', [['OUT OF BREATH', w(54, 'out')], ['TIRED WITH EXERCISE', w(54, 'tired')], ['CHEST INFECTIONS', w(54, 'chest')]], se(54) + 0.2);
note('SOMETIMES FOUND BY CHANCE', 600, w(55, 'adulthood'), se(55) + 0.2, 32);

// 56–59: over many years
heartMotion.push({at: w(56, 'stretch') - 0.2, scale: 1}, {at: w(56, 'stretch') + 2.2, scale: 1.07}, {at: se(58), scale: 1.07}, {at: se(59), scale: 1});
move(s(56), w(56, 'stretch'), H0[0], H0[1] + 10, 2.45);
tag('THE HEART STRETCHES', H0, w(56, 'stretch'), se(56) + 0.3, [0, -300]);
line({path: [P(560, 330), P(700, 230)], smooth: false, arrow: true, width: 5, drawStart: w(57, 'pressure'), drawEnd: w(57, 'pressure') + 0.8, show: {in: w(57, 'pressure'), out: se(57) + 0.3}});
tag('HIGHER LUNG PRESSURE', P(700, 230), w(57, 'lungs'), se(57) + 0.3, [-120, -70], 30);
// 58: the rhythm stutters — the signal starts, stops, starts again.
light({path: SIGNAL, start: w(58, 'upset'), end: w(58, 'upset') + 1.4, count: 1, size: 26});
light({path: SIGNAL, start: w(58, 'upset') + 1.7, end: w(58, 'upset') + 2.6, count: 1, size: 26});
tag('UNEVEN RHYTHM', H0, w(58, 'rhythm'), se(58) + 0.4, [0, -300]);
tag('DOCTORS KEEP WATCH', H0, w(59, 'eye'), se(59) + 0.3, [0, -300]);

// ================================================================ 7. How doctors find it (60–68)

move(s(60), se(60), ...HEART_VIEW);
moveTo(s(61), w(61, 'murmur'), HOLE, 3.8);
add({type: 'pulse', at: HOLE, radius: 46, start: w(61, 'whooshing'), count: 4, interval: 0.7, duration: 1.8, color: 'ink'});
tag('MURMUR', HOLE, w(61, 'murmur'), se(62) + 0.3, [0, -150]);
add({type: 'pulse', at: HOLE, radius: 46, start: w(62, 'sound'), count: 3, interval: 0.7, duration: 1.8, color: 'ink'});
light({path: LEAK, start: w(62, 'rushing'), end: w(62, 'rushing') + 1.6, count: 3, gap: 0.5, size: 26});
tag('MANY MURMURS ARE HARMLESS', HOLE, w(63, 'harmless'), se(63) + 0.3, [0, -150], 30);

move(s(64), w(64, 'echocardiogram'), H0[0], H0[1] - 30, 2.25);
line({path: FAN_EDGE, smooth: false, drawStart: w(64, 'echocardiogram'), drawEnd: w(64, 'echocardiogram') + 1.0, width: 2.5, show: {in: w(64, 'echocardiogram'), out: se(67)}});
line({path: ARC, drawStart: w(64, 'echocardiogram') + 0.6, drawEnd: w(64, 'echocardiogram') + 1.4, width: 2.5, show: {in: w(64, 'echocardiogram') + 0.6, out: se(67)}});
tag('ECHOCARDIOGRAM', FAN_APEX, w(64, 'echocardiogram'), se(64) + 0.3, [0, 60]);
tag('ULTRASOUND', FAN_APEX, w(65, 'ultrasound'), se(65) + 0.3, [0, 60]);
// The scan sweeping: an arc drawn again across the fan.
const sweep = (frac: number): Vec[] => ARC.map(([x, y]) => [FAN_APEX[0] + (x - FAN_APEX[0]) * frac, FAN_APEX[1] + (y - FAN_APEX[1]) * frac]);
[0.45, 0.65, 0.85].forEach((f, i) =>
  line({path: sweep(f), drawStart: w(65, 'scan') - 0.6 + i * 0.35, drawEnd: w(65, 'scan') + 0.3 + i * 0.35, width: 1.6, opacity: 0.35, show: {in: w(65, 'scan') - 0.6 + i * 0.35, out: se(67)}}),
);
circle({at: HOLE, radius: HOLE_R + 3, stroke: 'ink', strokeWidth: 3, show: {in: w(66, 'hole'), out: se(67)}});
line({path: [P(600, 905), P(380, 900)], smooth: false, arrow: true, color: 'accent', width: 4, drawStart: w(66, 'flowing') - 0.6, drawEnd: w(66, 'flowing') + 0.4, show: {in: w(66, 'flowing') - 0.6, out: se(67)}});
tag('CAN BE SEEN BEFORE BIRTH', H0, w(67, 'before'), se(67) + 0.3, [0, -330], 30);
move(s(68), w(68, 'records'), H0[0], H0[1] + 40, 2.2);
line({path: ECG, smooth: false, color: 'accent', width: 3.5, drawStart: w(68, 'electrical') - 0.4, drawEnd: w(68, 'signals') + 1.0, show: {in: w(68, 'electrical') - 0.4, out: se(68) + 0.4}});
tag('ECG', [P(430, 0)[0], HEART_BOTTOM_Y + 34], w(68, 'ecg'), se(68) + 0.4, [0, 80]);
tag('CHEST X-RAY', H0, w(68, 'x-ray'), se(68) + 0.4, [0, -320]);

// ================================================================ 8. Treatment (69–87)

move(s(69), se(69), ...HEART_VIEW);
tag('SIZE', H0, w(69, 'size'), se(69) + 0.3, [0, -340]);
tag('PLACE', H0, w(69, 'where'), se(69) + 0.3, [0, -280]);
tag('HOW THE BODY COPES', H0, w(69, 'coping'), se(69) + 0.3, [0, -220], 30);
moveTo(s(70), w(70, 'small'), HOLE, 3.6);
tag('WAIT AND WATCH', HOLE, w(70, 'wait'), se(71) + 0.2, [0, -150]);
tag('CHECK-UPS · SCANS', HOLE, w(71, 'check-ups'), se(71) + 0.2, [0, -90], 30);
light({path: LEAK_SMALL, start: w(70, 'small'), end: w(70, 'small') + 2.0, count: 2, gap: 1.0, size: 16, intensity: 0.6});
move(s(72), w(72, 'medicines'), ...HEART_VIEW);
tag('MEDICINES', H0, w(72, 'medicines'), se(73) + 0.3, [0, -320]);
tag('LESS FLUID TO HANDLE', H0, w(73, 'fluid'), se(73) + 0.3, [0, -260], 30);
moveTo(s(74), w(74, 'close'), HOLE, 3.8);
light({path: LEAK, start: w(74, 'close'), end: w(74, 'close') + 1.8, count: 3, gap: 0.55, size: 26});
tag('HOLE STILL OPEN', HOLE, w(74, 'hole'), se(74) + 0.3, [0, -150]);
move(s(75), w(75, 'two'), ...HEART_VIEW);
note('1 · CATHETER', 250, w(75, 'two'), se(76) + 0.3);
note('2 · SURGERY', 320, w(75, 'two') + 0.6, s(76));

// 77–81: closing with a device through a catheter
move(s(77), w(77, 'catheter'), H0[0] - 20, H0[1] + 140, 1.9);
line({path: CATHETER, drawStart: w(77, 'guides'), drawEnd: w(77, 'heart'), width: 4.5, opacity: 0.7, show: {in: w(77, 'guides'), out: w(81, 'works')}});
tag('CATHETER', P(170, 1180), w(77, 'catheter'), se(77), [110, 40]);
moveTo(w(77, 'heart') - 1.5, se(77), P(380, 880), 3.2);
const DEV_TRAVEL_START = w(78, 'travels') - 0.6;
const DEV_ARRIVE = se(78) + 0.2;
pic({
  id: 'device',
  pic: 'device',
  at: CATHETER[0],
  width: DEV_W,
  rotate: DEV_TILT,
  show: {in: DEV_TRAVEL_START, out: w(82, 'second'), fade: 0.6},
  motion: [{at: 0, scale: 0.28}, {at: w(79, 'opens'), scale: 0.28}, {at: w(79, 'opens') + 1.4, scale: 1}],
  pathMotion: {path: CATHETER.slice(4), start: DEV_TRAVEL_START, end: DEV_ARRIVE},
});
moveTo(s(79), w(79, 'opens'), HOLE, 4.2);
tag('TWO SMALL DISCS', HOLE, w(79, 'discs'), se(80) + 0.3, [0, -170]);
// A magnifier grows out of the hole to show the device opening across the wall.
const MAG_C: Vec = [HOLE[0] + 2, HOLE[1] - 62];
const MAG_R = 36;
const M = 3.2; // magnification inside the circle
add({
  type: 'magnifier',
  source: HOLE,
  sourceRadius: 16,
  center: MAG_C,
  radius: MAG_R,
  grow: w(79, 'both') - 0.4,
  show: {in: w(79, 'both') - 0.7, out: se(80) + 0.2},
  children: [
    {type: 'picture', pic: 'cutaway', at: [(X.center[0] - HOLE[0]) * M, (X.center[1] - HOLE[1]) * M], width: X.width * M},
    {type: 'picture', pic: 'device', at: [0, 0], width: DEV_W * M, rotate: DEV_TILT, motion: [{at: 0, scale: 0.28}, {at: w(79, 'opens'), scale: 0.28}, {at: w(79, 'opens') + 1.4, scale: 1}]},
  ],
});
tag('GAP PLUGGED', HOLE, w(80, 'plug'), se(80) + 0.3, [0, 150]);
move(s(81), w(81, 'works'), H0[0], H0[1] + 10, 2.9);
tag('ASD: OFTEN', P(433, 625), w(81, 'upper'), se(81) + 0.3, [0, -120], 30);
tag('VSD: SOMETIMES', HOLE, w(81, 'lower'), se(81) + 0.3, [0, -120], 30);

// 82–86: surgery with a patch
note('2 · SURGERY', 250, w(82, 'second'), se(82) + 0.3);
tag('HEART-LUNG MACHINE', H0, w(83, 'heart-lung'), se(83) + 0.3, [0, -320], 30);
tag('A STILL HEART', H0, w(83, 'still'), se(83) + 0.3, [0, -260], 30);
moveTo(s(84), w(84, 'stitches'), HOLE, 4.6);
circle({at: HOLE, radius: HOLE_R + 5, stroke: 'ink', strokeWidth: 2.5, dash: 5, show: {in: w(84, 'stitches'), out: se(84) + 0.4}});
pic({
  id: 'patch',
  pic: 'patch',
  at: HOLE,
  width: PATCH_W,
  rotate: DEV_TILT,
  show: {in: w(84, 'patch') - 0.3, out: w(99, 'wall'), fade: 0.8},
  // Over the months the wall's own tissue grows over it.
  motion: [{at: 0, opacity: 1}, {at: w(85, 'grows'), opacity: 1}, {at: w(85, 'patch') + 1.5, opacity: 0.3}],
});
tag('STITCHES', HOLE, w(84, 'stitches'), se(84) + 0.3, [0, -120]);
tag('PATCH', HOLE, w(84, 'patch'), se(84) + 0.3, [0, 120]);
tag('TISSUE GROWS OVER IT', HOLE, w(85, 'grows'), se(86) + 0.3, [0, -130], 30);
beats.push({start: s(86), end: w(103, 'heart') + 2, bpm: 62, amount: 0.008});
light({path: RV_SHORT, start: s(86), end: s(86) + 2.6, count: 2, gap: 0.7});
light({path: LV_SHORT, start: s(86), end: s(86) + 2.6, count: 2, gap: 0.7});
move(s(87), se(87), ...HEART_VIEW);
tag('FULL, ACTIVE LIVES', H0, w(87, 'full'), se(87) + 0.4, [0, -330]);

// ================================================================ 9. Prevention (88–97)

dim(s(88), se(97) + 0.2, 0.2);
note('PREVENTION', 300, s(88), se(89) + 0.2, 42);
note('NOT ALWAYS POSSIBLE', 400, w(89, 'not'), se(89) + 0.2, 30);
note('NO KNOWN CAUSE, OFTEN', 470, w(89, 'cause'), se(89) + 0.2, 30);
list(
  'LOWER THE RISK',
  [
    ['RUBELLA VACCINE BEFORE PREGNANCY', w(91, 'vaccinated')],
    ['FOLIC ACID', w(92, 'folic')],
    ['DIABETES UNDER CONTROL', w(93, 'diabetes')],
    ['NO SMOKING OR ALCOHOL', w(94, 'smoking')],
    ['CHECK MEDICINES', w(95, 'medicines')],
    ['PREGNANCY CHECK-UPS', w(96, 'check-ups')],
    ['FAMILY HISTORY? TALK TO A DOCTOR', w(97, 'family')],
  ],
  se(97) + 0.2,
  300,
  84,
  w(90, 'lower'),
);

// ================================================================ 10. Pulling back (98–106)

moveTo(s(98), w(99, 'gap'), HOLE, 3.2); // back to the gap, then out
circle({at: HOLE, radius: HOLE_R + 3, stroke: 'ink', strokeWidth: 2.5, show: {in: w(99, 'gap'), out: se(99) + 0.2}});
light({path: LEAK, start: w(100, 'blood'), end: w(100, 'blood') + 1.6, count: 1, size: 24, intensity: 0.7});
add({type: 'pulse', at: H0, radius: 120, start: w(101, 'harder'), count: 1, duration: 1.8, color: 'ink'});
add({type: 'pulse', at: HOLE, radius: 40, start: w(102, 'heard'), count: 2, interval: 0.6, duration: 1.6, color: 'ink'});
line({path: FAN_EDGE, smooth: false, drawStart: w(102, 'seen'), drawEnd: w(102, 'seen') + 0.8, width: 2, opacity: 0.4, show: {in: w(102, 'seen'), out: w(102, 'closed')}});
move(w(99, 'gap') + 0.3, se(101), H0[0], H0[1], 2.4);
move(se(101), w(103, 'heart'), ...HEART_VIEW);
// The cut-away fades back into the closed heart.
pic({pic: 'exterior', at: E.center, width: E.width, show: {in: w(103, 'heart') - 0.4, out: w(104, 'chest') + 0.6, fade: 1.2}, beat: [{start: w(103, 'heart'), end: w(105, 'small'), bpm: 62, amount: 0.01}]});
move(w(104, 'and'), w(105, 'common') + 1, ...CHEST_VIEW);
add({type: 'pulse', at: H0, radius: 150, start: w(105, 'small'), count: 6, interval: 1.0, duration: 2.0});
const END = timings.duration + 1;
cam.push({at: END, x: CHEST_VIEW[0], y: CHEST_VIEW[1], zoom: CHEST_VIEW[2]});

// ---------------------------------------------------------------- tidy up

heartMotion.sort((a, b) => a.at - b.at);
cam.sort((a, b) => a.at - b.at);

const settings: VideoSettings = {
  id: 'heart-hole',
  width: 1080,
  height: 1920,
  fps: 60,
  audio: 'audio/heart-hole-narration.mp3',
  timings,
  tail: 1,
  style: {
    background: '#efe6d4', // parchment, to match the pictures' paper
    ink: '#2c2925',
    accent: '#5E9BE0',
    font: 'Inter',
    dotGrid: {spacing: 34, size: 1.4, color: 'auto', parallax: 0.85},
    labelSize: 36,
    fade: 0.5,
  },
  safe: {top: 0.08, bottom: 0.18},
  subtitles: {band: 140, size: 50, maxChars: 30},
  pictures,
  camera: cam,
  items,
};

export default settings;
