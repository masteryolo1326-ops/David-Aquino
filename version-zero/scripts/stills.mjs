#!/usr/bin/env node
// Render inspection stills (or the thumbnail) from a composition.
//   node scripts/stills.mjs --times 1.2,5,9.5 --out out/stills [--scale 0.5] [--comp internet-5-seconds]
//   node scripts/stills.mjs --frames 120,300 --out out/stills [--props '{"hideCaptions":true}']
import {bundle} from '@remotion/bundler';
import {renderStill, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {browserExecutable, chromiumOptions} from './render-config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const comp = arg('comp', 'internet-5-seconds');
const out = path.resolve(root, arg('out', 'out/stills'));
const scale = Number(arg('scale', '0.5'));
const audio = arg('audio', 'none');
mkdirSync(out, {recursive: true});

const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const inputProps = {audio, ...JSON.parse(arg('props', '{}'))};
const composition = await selectComposition({serveUrl, id: comp, inputProps, browserExecutable, chromiumOptions});
const fps = composition.fps;
const frames = arg('frames')
  ? arg('frames').split(',').map(Number)
  : arg('times', '0').split(',').map((s) => Math.min(composition.durationInFrames - 1, Math.round(Number(s) * fps)));

for (const frame of frames) {
  const file = path.join(out, `${comp}-f${String(frame).padStart(4, '0')}.png`);
  await renderStill({composition, serveUrl, frame, output: file, scale, inputProps, browserExecutable, chromiumOptions, overwrite: true});
  console.log(`frame ${frame} (${(frame / fps).toFixed(2)}s) -> ${path.relative(root, file)}`);
}
