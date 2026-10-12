import React from 'react';
import {hash, noise1} from '../anim';
import {fonts, palette} from '../theme';
import {Pill} from '../hud/Pill';

// Stylized video-call participant. Pure function of its pose inputs.
type AvatarStyle = {skin: string; hair: string; shirt: string; wall: string; wall2: string; accent: string};
const REMOTE: AvatarStyle = {skin: '#C98763', hair: '#2A1B18', shirt: '#5B6CFF', wall: '#2B2F6B', wall2: '#1C1F4D', accent: '#2ED3A0'};
const SELF: AvatarStyle = {skin: '#8D5A3B', hair: '#121019', shirt: '#E2A33A', wall: '#24305E', wall2: '#151C40', accent: '#FFB547'};

export const AvatarScene: React.FC<{
  talk: number;
  blink: number;
  bob: number;
  tilt: number;
  look: number;
  style?: AvatarStyle;
  bun?: boolean;
}> = ({talk, blink, bob, tilt, look, style = REMOTE, bun = true}) => {
  const eyeH = 7 * (1 - blink) + 0.8;
  return (
    <svg viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" width="100%" height="100%">
      <defs>
        <linearGradient id={`wall-${style.shirt}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={style.wall} />
          <stop offset="1" stopColor={style.wall2} />
        </linearGradient>
        <radialGradient id={`lamp-${style.shirt}`} cx="0.85" cy="0.25" r="0.5">
          <stop offset="0" stopColor="#FFC982" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FFC982" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="400" height="260" fill={`url(#wall-${style.shirt})`} />
      <rect width="400" height="260" fill={`url(#lamp-${style.shirt})`} />
      {/* window with blinds */}
      <rect x="26" y="34" width="92" height="118" rx="6" fill="#3A4290" opacity="0.7" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x="26" y={40 + i * 19} width="92" height="4" fill="#5560B8" opacity="0.6" />
      ))}
      {/* plant */}
      <rect x="338" y="196" width="34" height="40" rx="5" fill="#141838" />
      {[-30, -10, 12, 32].map((a, i) => (
        <ellipse key={i} cx={355 + a * 0.4} cy={180 - i * 4} rx="9" ry="26" fill={style.accent} opacity={0.75} transform={`rotate(${a} ${355} 200)`} />
      ))}
      <g transform={`translate(${200 + look * 4} ${bob}) rotate(${tilt} 0 170)`}>
        {/* shoulders */}
        <path d="M-118 262 C-112 196 -70 182 -36 178 L36 178 C70 182 112 196 118 262 Z" fill={style.shirt} />
        <path d="M-26 178 L0 204 L26 178 Z" fill="#00000033" />
        <rect x="-19" y="150" width="38" height="36" rx="12" fill={style.skin} />
        {/* head */}
        <ellipse cx="0" cy="112" rx="56" ry="64" fill={style.skin} />
        <ellipse cx="-56" cy="118" rx="9" ry="14" fill={style.skin} />
        <ellipse cx="56" cy="118" rx="9" ry="14" fill={style.skin} />
        {/* hair */}
        <path d="M-60 112 C-64 54 -30 38 2 40 C38 40 66 60 60 110 C52 84 30 70 0 72 C-26 72 -50 84 -60 112 Z" fill={style.hair} />
        {bun && <circle cx="22" cy="40" r="22" fill={style.hair} />}
        {/* brows */}
        <rect x={-34 + look * 2} y={92 - talk * 3} width="22" height="5" rx="2.5" fill={style.hair} />
        <rect x={12 + look * 2} y={92 - talk * 3} width="22" height="5" rx="2.5" fill={style.hair} />
        {/* eyes */}
        <ellipse cx={-22 + look * 3} cy="110" rx="6.5" ry={eyeH} fill="#170F1C" />
        <ellipse cx={22 + look * 3} cy="110" rx="6.5" ry={eyeH} fill="#170F1C" />
        <circle cx={-20 + look * 3} cy={107} r={blink > 0.5 ? 0 : 2} fill="#fff" opacity="0.8" />
        <circle cx={24 + look * 3} cy={107} r={blink > 0.5 ? 0 : 2} fill="#fff" opacity="0.8" />
        {/* nose + cheeks */}
        <path d="M0 116 Q-6 132 2 134" stroke="#0000002E" strokeWidth="3" fill="none" strokeLinecap="round" />
        <ellipse cx="-34" cy="132" rx="10" ry="6" fill="#FF7A7A" opacity="0.18" />
        <ellipse cx="34" cy="132" rx="10" ry="6" fill="#FF7A7A" opacity="0.18" />
        {/* mouth */}
        <ellipse cx={look * 2} cy="148" rx={13 - talk * 2} ry={2.2 + talk * 9} fill="#4A1620" />
        <ellipse cx={look * 2} cy={150 + talk * 4} rx={7} ry={talk * 3.5} fill="#E06A7A" opacity={talk > 0.2 ? 0.8 : 0} />
      </g>
    </svg>
  );
};

const talkAt = (t: number) => Math.max(0, noise1(t * 7.5, 3) * 0.7 + noise1(t * 17, 9) * 0.45 + 0.15);
const blinkAt = (t: number, seed: number) => {
  const period = 3.1 + seed;
  const ph = (t + seed * 1.7) % period;
  return ph < 0.14 ? Math.sin((ph / 0.14) * Math.PI) : 0;
};

export const VideoCall: React.FC<{
  t: number;
  width: number;
  height: number;
  freezeAt: number;
  resumeAt?: number;
  compact?: boolean;
}> = ({t, width, height, freezeAt, resumeAt = Infinity, compact = false}) => {
  const frozen = t >= freezeAt && t < resumeAt;
  const tr = frozen ? freezeAt : t;
  const talkRaw = talkAt(tr);
  const talk = frozen ? Math.max(talkRaw, 0.72) : t >= resumeAt ? talkAt(t) : talkRaw;
  const footer = compact ? 0 : 92;
  const vh = height - footer;
  const s = Math.floor(t * 30);
  const blocks = frozen
    ? Array.from({length: compact ? 7 : 14}, (_, i) => ({
        x: 30 + hash(i * 3.1) * 40,
        y: 18 + hash(i * 5.7) * 50,
        w: 4 + hash(i * 7.3) * 6,
        o: 0.25 + 0.3 * hash(i * 1.3),
      }))
    : [];
  return (
    <div style={{position: 'relative', width, height}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          bottom: footer,
          overflow: 'hidden',
          borderRadius: compact ? 18 : 0,
          filter: frozen ? 'saturate(0.55) brightness(0.86) contrast(1.05)' : undefined,
        }}
      >
        <AvatarScene talk={talk} blink={blinkAt(tr, 0.4)} bob={Math.sin(tr * 2.2) * 3} tilt={Math.sin(tr * 0.9) * 2.5} look={noise1(tr * 0.6, 4)} />
        {blocks.map((b, i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.w}%`,
              height: `${b.w * (width / vh)}%`,
              background: i % 2 ? '#C98763' : '#5B6CFF',
              opacity: b.o,
              mixBlendMode: 'overlay',
            }}
          />
        ))}
        {frozen && (
          <div style={{position: 'absolute', left: compact ? 12 : 22, top: compact ? 12 : 22}}>
            <Pill color={palette.amber} size={compact ? 18 : 24} dotPulse={0.5 + 0.5 * Math.sin(s * 0.5)}>
              Connection unstable
            </Pill>
          </div>
        )}
        {!compact && (
          <div
            style={{
              position: 'absolute',
              left: 22,
              bottom: 18,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 26,
              color: palette.cream,
              background: 'rgba(3,5,15,0.55)',
              padding: '6px 16px',
              borderRadius: 12,
            }}
          >
            Sam
          </div>
        )}
        {/* Self view: your own camera is local, so it never freezes. */}
        <div
          style={{
            position: 'absolute',
            right: compact ? 10 : 18,
            bottom: compact ? 10 : 18,
            width: compact ? width * 0.3 : 210,
            height: compact ? width * 0.3 * 0.7 : 148,
            borderRadius: compact ? 10 : 16,
            overflow: 'hidden',
            border: `2px solid ${palette.cream}55`,
            boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          }}
        >
          <AvatarScene talk={0.08} blink={blinkAt(t, 1.3)} bob={Math.sin(t * 1.7) * 4} tilt={Math.sin(t * 1.1) * 3} look={noise1(t * 0.8, 8)} style={SELF} bun={false} />
          {!compact && (
            <div style={{position: 'absolute', left: 8, bottom: 6, fontFamily: fonts.mono, fontSize: 16, color: palette.cream, opacity: 0.85}}>you</div>
          )}
        </div>
      </div>
      {!compact && (
        <div style={{position: 'absolute', left: 0, right: 0, bottom: 0, height: footer, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 26}}>
          {['#2A3270', '#2A3270', '#E5484D'].map((c, i) => (
            <div key={i} style={{width: 60, height: 60, borderRadius: 999, background: c, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
              <div style={{width: i === 2 ? 26 : 18, height: i === 2 ? 8 : 18, borderRadius: i === 2 ? 4 : 999, background: palette.cream, opacity: 0.85}} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
