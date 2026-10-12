import React from 'react';
import {ease, prog} from '../anim';
import {fonts, palette} from '../theme';

// Things that keep working with no internet at all: electricity, on-device apps,
// locally-controlled traffic signals, already-downloaded video.

export const Tile: React.FC<{
  width: number;
  height: number;
  label: string;
  icon?: React.ReactNode;
  tone?: string;
  children: React.ReactNode;
  badge?: React.ReactNode;
  style?: React.CSSProperties;
}> = ({width, height, label, icon, tone = palette.cyan, children, badge, style}) => (
  <div
    style={{
      position: 'relative',
      width,
      height,
      borderRadius: 26,
      background: 'linear-gradient(180deg, rgba(22,29,78,0.95), rgba(10,14,40,0.96))',
      border: `2px solid ${tone}70`,
      boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 40px ${tone}1F`,
      overflow: 'hidden',
      ...style,
    }}
  >
    <div style={{position: 'absolute', left: 20, top: 14, display: 'flex', alignItems: 'center', gap: 10, zIndex: 2}}>
      {icon}
      <span style={{fontFamily: fonts.mono, fontWeight: 700, fontSize: 21, letterSpacing: '0.06em', color: palette.cream}}>{label}</span>
    </div>
    {badge && <div style={{position: 'absolute', right: 16, top: 12, zIndex: 2}}>{badge}</div>}
    <div style={{position: 'absolute', inset: 0}}>{children}</div>
  </div>
);

export const Bulb: React.FC<{size: number; on: number}> = ({size, on}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" style={{overflow: 'visible'}}>
    <defs>
      <radialGradient id="bulbGlow" cx="0.5" cy="0.42" r="0.6">
        <stop offset="0" stopColor={palette.warmLight} stopOpacity={0.9 * on} />
        <stop offset="1" stopColor={palette.warmLight} stopOpacity="0" />
      </radialGradient>
    </defs>
    <circle cx="50" cy="42" r="56" fill="url(#bulbGlow)" />
    <path d="M50 12c-17 0-29 12-29 28 0 11 6 18 11 23 3 3 4 6 4 9h28c0-3 1-6 4-9 5-5 11-12 11-23 0-16-12-28-29-28z" fill={on > 0.5 ? '#FFE2B0' : '#3A4290'} />
    <path d="M42 56l8-12 8 12" stroke="#E0A050" strokeWidth="3" fill="none" />
    <rect x="36" y="74" width="28" height="7" rx="3" fill="#8C93C8" />
    <rect x="38" y="83" width="24" height="7" rx="3" fill="#6C73A8" />
  </svg>
);

const NOTE = 'Groceries\n• eggs\n• coffee\n• AA batteries';
export const NotesContent: React.FC<{t: number; startAt: number; scale?: number}> = ({t, startAt, scale = 1}) => {
  const n = Math.max(0, Math.floor((t - startAt) * 16));
  const text = NOTE.slice(0, Math.min(NOTE.length, n));
  const cursor = Math.floor(t * 2.4) % 2 === 0 || n < NOTE.length;
  return (
    <div style={{position: 'absolute', left: 22 * scale, top: 56 * scale, right: 18, fontFamily: fonts.display, fontWeight: 500, fontSize: 25 * scale, lineHeight: 1.25, color: palette.cream, whiteSpace: 'pre-wrap'}}>
      {text}
      <span style={{display: 'inline-block', width: 3, height: 26 * scale, marginLeft: 2, background: palette.cyan, opacity: cursor ? 1 : 0, verticalAlign: 'middle'}} />
    </div>
  );
};

/** Stylised (sped-up) signal cycle; each real controller runs its own stored timing plan. */
export const signalPhase = (t: number, offset = 0) => {
  const ph = (t + offset) % 3.4;
  return ph < 1.5 ? 'green' : ph < 2.0 ? 'amber' : 'red';
};
export const TrafficSignal: React.FC<{t: number; height: number; offset?: number}> = ({t, height, offset = 0}) => {
  const p = signalPhase(t, offset);
  const lamp = (c: string, on: boolean) => (
    <div
      style={{
        width: height * 0.22,
        height: height * 0.22,
        borderRadius: 999,
        background: on ? c : '#151A3A',
        boxShadow: on ? `0 0 ${height * 0.18}px ${c}, inset 0 0 8px rgba(255,255,255,0.4)` : 'inset 0 2px 6px rgba(0,0,0,0.6)',
      }}
    />
  );
  return (
    <div style={{display: 'flex', flexDirection: 'column', gap: height * 0.05, padding: height * 0.05, borderRadius: height * 0.1, background: '#0B0E24', border: '2px solid #2A3270'}}>
      {lamp('#FF3B47', p === 'red')}
      {lamp(palette.amber, p === 'amber')}
      {lamp('#3DFF8A', p === 'green')}
    </div>
  );
};

// ---- Video player with visible buffer ----
const DURATION = 195; // 3:15
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;

export const VideoScene: React.FC<{pt: number}> = ({pt}) => (
  <svg viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
    <defs>
      <linearGradient id="vsky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#2A1F6B" />
        <stop offset="0.55" stopColor="#B4508A" />
        <stop offset="1" stopColor="#FF9A5B" />
      </linearGradient>
      <linearGradient id="vsea" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#3A2F7A" />
        <stop offset="1" stopColor="#141A4A" />
      </linearGradient>
    </defs>
    <rect width="400" height="140" fill="url(#vsky)" />
    <circle cx="250" cy={118 + pt * 0.6} r="34" fill="#FFD9A0" opacity="0.95" />
    {[0, 1, 2].map((i) => (
      <ellipse key={i} cx={((pt * (6 + i * 3) + i * 150) % 520) - 60} cy={36 + i * 18} rx={46 - i * 8} ry={7} fill="#FFFFFF" opacity={0.18} />
    ))}
    <rect y="138" width="400" height="87" fill="url(#vsea)" />
    {Array.from({length: 8}, (_, i) => (
      <rect key={i} x={((i * 61 + pt * 14) % 460) - 40} y={150 + i * 9} width={50 + (i % 3) * 20} height="2.5" rx="1.2" fill="#FFC982" opacity={0.4 - i * 0.03} />
    ))}
    <g transform={`translate(${((pt * 11) % 480) - 40} ${142 + Math.sin(pt * 2.2) * 2.5})`}>
      <path d="M0 0 L36 0 L30 8 L6 8 Z" fill="#0B0E24" />
      <path d="M18 -2 L18 -40 L36 -6 Z" fill="#F7EFDF" />
      <path d="M16 -4 L16 -30 L2 -6 Z" fill="#E8DCC6" />
    </g>
    {[0, 1].map((i) => {
      const bx = ((pt * 22 + i * 90) % 480) - 40;
      const by = 60 + i * 14 + Math.sin(pt * 3 + i) * 4;
      const w = Math.sin(pt * 9 + i * 2) * 4;
      return <path key={i} d={`M${bx - 8} ${by + w} Q${bx - 4} ${by - 3} ${bx} ${by} Q${bx + 4} ${by - 3} ${bx + 8} ${by + w}`} stroke="#0B0E24" strokeWidth="2" fill="none" />;
    })}
  </svg>
);

export const VideoPlayer: React.FC<{
  t: number;
  width: number;
  height: number;
  playStart: number;
  downloadStopAt: number;
  downloadResumeAt?: number;
  explain?: number; // 0..1 annotation reveal
  barScale?: number;
}> = ({t, width, height, playStart, downloadStopAt, downloadResumeAt = Infinity, explain = 0, barScale = 1}) => {
  const pt = 42 + Math.max(0, t - playStart); // playback position (seconds into the video)
  const ahead = 30; // e.g. hls.js default maxBufferLength
  const stopPos = 42 + Math.max(0, downloadStopAt - playStart) + ahead;
  const bufEnd = t < downloadStopAt || t >= downloadResumeAt ? pt + ahead : stopPos;
  const barH = 12 * barScale;
  const barY = height - 46 * barScale;
  const bw = width - 48 * barScale;
  const x0 = 24 * barScale;
  const px = (s: number) => x0 + (s / DURATION) * bw;
  const zoom = 1 + explain * 2.4; // zoom the bar around the playhead so the buffer is legible
  const zx = (s: number) => {
    const c = px(pt);
    return c + (px(s) - c) * zoom;
  };
  const clampX = (x: number) => Math.max(x0, Math.min(x0 + bw, x));
  return (
    <div style={{position: 'relative', width, height, overflow: 'hidden', borderRadius: 20, background: '#000'}}>
      <div style={{position: 'absolute', inset: 0, bottom: 0}}>
        <VideoScene pt={pt} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: 90 * barScale, background: 'linear-gradient(180deg, transparent, rgba(3,5,15,0.85))'}} />
      {/* bar */}
      <div style={{position: 'absolute', left: x0, top: barY, width: bw, height: barH, borderRadius: 999, background: 'rgba(247,239,223,0.18)'}} />
      <div style={{position: 'absolute', left: clampX(zx(0)), top: barY, width: clampX(zx(bufEnd)) - clampX(zx(0)), height: barH, borderRadius: 999, background: 'rgba(247,239,223,0.45)'}} />
      <div style={{position: 'absolute', left: clampX(zx(0)), top: barY, width: clampX(zx(pt)) - clampX(zx(0)), height: barH, borderRadius: 999, background: palette.cyan, boxShadow: `0 0 16px ${palette.cyan}`}} />
      <div style={{position: 'absolute', left: zx(pt) - 11 * barScale, top: barY - 5 * barScale, width: 22 * barScale, height: 22 * barScale, borderRadius: 999, background: '#fff', boxShadow: `0 0 12px ${palette.cyan}`}} />
      <div
        style={{
          position: 'absolute',
          left: x0,
          top: barY - 40 * barScale,
          fontFamily: fonts.mono,
          fontWeight: 700,
          fontSize: 20 * barScale,
          color: palette.cream,
          opacity: 1 - explain,
        }}
      >
        {fmt(pt)} / {fmt(DURATION)}
      </div>
      {explain > 0 && (
        <>
          {/* bracket over the buffered region: playhead → end of downloaded data */}
          <div
            style={{
              position: 'absolute',
              left: zx(pt) + 16 * barScale,
              top: barY - 30 * barScale,
              width: Math.max(0, clampX(zx(bufEnd)) - zx(pt) - 16 * barScale),
              height: 20 * barScale,
              borderTop: `3px solid ${palette.cream}`,
              borderLeft: `3px solid ${palette.cream}`,
              borderRight: `3px solid ${palette.cream}`,
              borderRadius: '8px 8px 0 0',
              opacity: explain,
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: (zx(pt) + clampX(zx(bufEnd))) / 2,
              top: barY - 82 * barScale,
              transform: `translateX(-50%) translateY(${(1 - explain) * 12}px)`,
              fontFamily: fonts.mono,
              fontWeight: 700,
              fontSize: 22 * barScale,
              letterSpacing: '0.08em',
              color: palette.cream,
              background: 'rgba(3,5,15,0.78)',
              padding: `${5 * barScale}px ${12 * barScale}px`,
              borderRadius: 10,
              whiteSpace: 'nowrap',
              opacity: explain,
            }}
          >
            ALREADY DOWNLOADED
          </div>
          {/* the download itself has stopped: no new data arrives during the outage */}
          <div
            style={{
              position: 'absolute',
              left: clampX(zx(bufEnd)),
              top: barY + 20 * barScale,
              transform: 'translateX(-100%)',
              fontFamily: fonts.mono,
              fontWeight: 700,
              fontSize: 17 * barScale,
              color: palette.amber,
              whiteSpace: 'nowrap',
              opacity: explain,
            }}
          >
            download paused ▲
          </div>
        </>
      )}
    </div>
  );
};

/** Fades/pops a tile in from below with a little overshoot. */
export const popIn = (t: number, at: number, dur = 0.45) => {
  const k = prog(t, at, at + dur, (x) => ease.outBack(x, 1.4));
  const a = prog(t, at, at + dur * 0.6, ease.outCubic);
  return {opacity: a, transform: `translateY(${(1 - k) * 60}px) scale(${0.86 + 0.14 * k})`};
};
