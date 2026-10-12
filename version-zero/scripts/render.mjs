#!/usr/bin/env node
// Render an episode to MP4 (H.264 + AAC).
//   node scripts/render.mjs                 → final 1080x1920 (deliverables/<episode>/version-zero-<episode>.mp4)
//   node scripts/render.mjs --preview       → half-res preview (out/preview.mp4)
//   options: --comp <id> --out <file> --concurrency <n> --frames 0-299
import {bundle} from '@remotion/bundler';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {mkdirSync} from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {browserExecutable, chromiumOptions} from './render-config.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const has = (f) => process.argv.includes(`--${f}`);
const arg = (name, def) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : def;
};
const preview = has('preview');
const comp = arg('comp', 'internet-5-seconds');
const out = path.resolve(
  root,
  arg('out', preview ? 'out/preview.mp4' : `deliverables/${comp}/version-zero-${comp}.mp4`),
);
mkdirSync(path.dirname(out), {recursive: true});
const frameRange = arg('frames') ? arg('frames').split('-').map(Number) : null;

const serveUrl = await bundle({entryPoint: path.join(root, 'src/index.ts')});
const inputProps = {audio: 'mix'};
const composition = await selectComposition({serveUrl, id: comp, inputProps, browserExecutable, chromiumOptions});
const started = Date.now();
let last = -1;
await renderMedia({
  composition,
  serveUrl,
  codec: 'h264',
  outputLocation: out,
  inputProps,
  browserExecutable,
  chromiumOptions,
  scale: preview ? 0.5 : 1,
  crf: preview ? 26 : 17,
  pixelFormat: 'yuv420p',
  audioCodec: 'aac',
  audioBitrate: '192k',
  x264Preset: preview ? 'veryfast' : 'slow',
  colorSpace: 'bt709',
  concurrency: Number(arg('concurrency', '4')),
  frameRange,
  overwrite: true,
  onProgress: ({progress}) => {
    const pct = Math.floor(progress * 100);
    if (pct >= last + 5) {
      last = pct;
      console.log(`${pct}%  (${((Date.now() - started) / 1000).toFixed(0)}s)`);
    }
  },
});
console.log(`done → ${path.relative(process.cwd(), out)} in ${((Date.now() - started) / 1000).toFixed(0)}s`);
