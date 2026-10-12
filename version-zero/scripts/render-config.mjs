// Shared renderer settings. In this container Chromium has no GPU, so WebGL runs on ANGLE's
// software path. Set BROWSER_EXECUTABLE to override (or unset to let Remotion download one).
import {existsSync} from 'node:fs';

const candidates = [
  process.env.BROWSER_EXECUTABLE,
  '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell',
].filter(Boolean);
export const browserExecutable = candidates.find((p) => existsSync(p)) ?? null;
export const chromiumOptions = {gl: 'angle'};
