// Renders src/index.html frame by frame in headless Chromium.
//   node tools/render.mjs --stills 0.5,12.3        -> build/stills/*.png
//   node tools/render.mjs --frames 0:1727 --out build/frames
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); } catch { playwright = require('/opt/node22/lib/node_modules/playwright'); }

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, all) => (a.startsWith('--') ? [...acc, [a.slice(2), all[i + 1]]] : acc), []));
const HANDLE = process.env.HANDLE || '@yourhandle';

const TYPES = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json' };
const server = http.createServer((req, res) => {
  const p = path.join(ROOT, decodeURIComponent(new URL(req.url, 'http://x').pathname));
  if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); res.end(); return; }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const browser = await playwright.chromium.launch({
  args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--disable-gpu-vsync', '--force-color-profile=srgb'],
});
const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
page.on('pageerror', (e) => console.error('pageerror:', e.message));
page.on('console', (m) => { if (m.type() === 'error') console.error('console:', m.text()); });
await page.goto(`http://127.0.0.1:${port}/src/index.html?handle=${encodeURIComponent(HANDLE)}`);
await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
const { duration, fps } = await page.evaluate(() => window.TIMELINE);

async function shot(t, file, type) {
  await page.evaluate((tt) => window.renderFrame(tt), t);
  await page.screenshot({ path: file, type, ...(type === 'jpeg' ? { quality: 93 } : {}) });
}

if (args.stills) {
  const dir = path.join(ROOT, 'build', 'stills');
  fs.mkdirSync(dir, { recursive: true });
  for (const t of args.stills.split(',').map(Number)) {
    const f = path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`);
    await shot(t, f, 'png');
    console.log(f);
  }
} else {
  const total = Math.ceil(duration * fps);
  const [a, b] = (args.frames || `0:${total}`).split(':').map(Number);
  const out = path.resolve(args.out || path.join(ROOT, 'build', 'frames'));
  fs.mkdirSync(out, { recursive: true });
  const t0 = Date.now();
  for (let i = a; i < Math.min(b, total); i++) {
    await shot(i / fps, path.join(out, `f${String(i).padStart(5, '0')}.jpg`), 'jpeg');
    if ((i - a) % 60 === 0) console.log(`frame ${i}/${total}  ${((Date.now() - t0) / 1000 / (i - a + 1)).toFixed(2)}s/frame`);
  }
}
await browser.close();
server.close();
