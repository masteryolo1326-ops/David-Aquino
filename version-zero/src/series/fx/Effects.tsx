import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ease, hash, prog} from '../anim';
import {palette} from '../theme';

export const Vignette: React.FC<{strength?: number}> = ({strength = 1}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      background: `radial-gradient(ellipse 85% 70% at 50% 45%, rgba(3,5,15,0) 55%, rgba(3,5,15,${0.55 * strength}) 100%)`,
    }}
  />
);

/** Full-frame light flash that decays (connection drop / return, scene cuts). */
export const Flash: React.FC<{t: number; at: number; dur?: number; color?: string; peak?: number}> = ({
  t,
  at,
  dur = 0.5,
  color = palette.cream,
  peak = 0.85,
}) => {
  if (t < at - 0.05 || t > at + dur) return null;
  const rise = prog(t, at - 0.05, at, ease.outCubic);
  const fall = 1 - prog(t, at, at + dur, ease.outCubic);
  return <AbsoluteFill style={{pointerEvents: 'none', background: color, opacity: peak * Math.min(rise, fall), mixBlendMode: 'screen'}} />;
};

/** Digital-interruption glitch: horizontal tears, colour bars and scanlines over a short window. */
export const Glitch: React.FC<{t: number; at: number; dur?: number; intensity?: number}> = ({t, at, dur = 0.35, intensity = 1}) => {
  if (t < at || t > at + dur) return null;
  const k = 1 - prog(t, at, at + dur, ease.inQuad);
  const step = Math.floor(t * 30);
  const bars = Array.from({length: 9}, (_, i) => {
    const h = hash(step * 13.1 + i * 7.7);
    return {
      top: hash(step * 3.3 + i * 1.9) * 1920,
      height: 8 + h * 70,
      shift: (hash(step * 5.1 + i) - 0.5) * 160 * k,
      color: i % 3 === 0 ? palette.coral : i % 3 === 1 ? palette.cyan : palette.cream,
      alpha: (0.08 + 0.3 * hash(i * 9.1 + step)) * k * intensity,
    };
  });
  return (
    <AbsoluteFill style={{pointerEvents: 'none', mixBlendMode: 'screen'}}>
      {bars.map((b, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            left: b.shift,
            top: b.top,
            width: 1080,
            height: b.height,
            background: `linear-gradient(90deg, transparent, ${b.color}, transparent)`,
            opacity: b.alpha,
          }}
        />
      ))}
      <AbsoluteFill
        style={{
          background: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 2px, transparent 2px, transparent 6px)',
          opacity: k * intensity,
        }}
      />
    </AbsoluteFill>
  );
};

/** Deterministic frame jitter used to shake a layer during a glitch. */
export const glitchOffset = (t: number, at: number, dur = 0.3, amp = 18): [number, number] => {
  if (t < at || t > at + dur) return [0, 0];
  const k = 1 - (t - at) / dur;
  const s = Math.floor(t * 30);
  return [(hash(s * 1.7) - 0.5) * amp * 2 * k, (hash(s * 2.9) - 0.5) * amp * k];
};
