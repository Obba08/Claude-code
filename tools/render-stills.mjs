// Renders a still every half second and at every sentence start, for checking.
// Usage: [COMP=Explainer-square OUT=out/stills-square] node tools/render-stills.mjs [from-seconds] [to-seconds]
import {bundle} from '@remotion/bundler';
import {openBrowser, renderStill, selectComposition} from '@remotion/renderer';
import fs from 'node:fs';
import path from 'node:path';

const browserExecutable =
  process.env.REMOTION_BROWSER ??
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const timings = JSON.parse(fs.readFileSync('src/data/timings.json', 'utf8'));
const from = Number(process.argv[2] ?? 0);
const to = Number(process.argv[3] ?? 1e9);
const compId = process.env.COMP ?? 'Explainer';
const outDir = process.env.OUT ?? 'out/stills';
fs.mkdirSync(outDir, {recursive: true});

const serveUrl = await bundle({entryPoint: path.resolve('src/index.ts')});
const browser = await openBrowser('chrome', {browserExecutable});
const composition = await selectComposition({serveUrl, id: compId, puppeteerInstance: browser});
const fps = composition.fps;

const times = new Set();
for (let t = 0; t * fps < composition.durationInFrames; t += 0.5) times.add(Math.round(t * fps));
for (const s of timings.sentences) times.add(Math.round(s.start * fps));
const frames = [...times].filter((f) => f >= from * fps && f <= to * fps && f < composition.durationInFrames).sort((a, b) => a - b);

const sentenceAt = (f) => timings.sentences.findLastIndex((s) => s.start * fps <= f + 0.5) + 1;
for (const frame of frames) {
  const file = path.join(outDir, `f${String(frame).padStart(5, '0')}.jpeg`);
  await renderStill({composition, serveUrl, frame, output: file, imageFormat: 'jpeg', jpegQuality: 80, puppeteerInstance: browser});
  console.log(`${(frame / fps).toFixed(2)}s  sentence ${sentenceAt(frame)}  ${file}`);
}
await browser.close({silent: true});
