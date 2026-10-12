// Version Zero — series-wide visual identity. Every episode draws from these tokens
// so the series reads as one recognizable show.
export const palette = {
  void: '#03050F',
  deep: '#060A1F',
  navy: '#0B1230',
  indigo: '#1A1F5C',
  indigoLight: '#2E3590',
  cyan: '#2EE6FF', // live internet connections
  electric: '#2F7BFF',
  coral: '#FF6A4D', // disruptions & warnings
  amber: '#FFB547', // waiting / retrying
  cream: '#F7EFDF', // captions & explanatory elements
  creamDim: '#B9B3C9',
  warmLight: '#FFC982', // electricity: windows, city lights
  violet: '#B48CFF',
  ink: '#0A0E26',
} as const;

export type Tone = 'cyan' | 'coral' | 'amber' | 'cream' | 'violet';
export const toneColor: Record<Tone, string> = {
  cyan: palette.cyan,
  coral: palette.coral,
  amber: palette.amber,
  cream: palette.cream,
  violet: palette.violet,
};

export const fonts = {
  display: '"Space Grotesk", system-ui, sans-serif',
  mono: '"JetBrains Mono", ui-monospace, monospace',
} as const;

// 1080x1920 frame. TikTok overlays its own UI: tabs at the top, caption/handle block at the
// bottom, action buttons down the right edge. Key content stays inside these bounds.
export const frame = {width: 1080, height: 1920} as const;
export const safe = {
  top: 170,
  bottom: 1480, // nothing important below this line
  left: 70,
  right: 930, // right-edge action buttons live beyond this (y ≈ 760–1500)
  captionTop: 1236,
  hudY: 200,
} as const;

export const glow = (color: string, strength = 1) =>
  `0 0 ${18 * strength}px ${color}66, 0 0 ${42 * strength}px ${color}33`;
