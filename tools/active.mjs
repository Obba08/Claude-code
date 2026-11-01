// Finds the active video (src/settings/active.ts) and its word timings, for the check tools.
import fs from 'node:fs';
const src = fs.readFileSync('src/settings/active.ts', 'utf8');
export const VIDEO = process.env.VIDEO ?? src.match(/from '\.\/([\w-]+)'/)[1];
export const TIMINGS_FILE = `src/data/${VIDEO}.timings.json`;
if (process.argv[1]?.endsWith('active.mjs')) console.log(TIMINGS_FILE);
