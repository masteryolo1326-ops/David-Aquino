import React, {useMemo} from 'react';
import {AbsoluteFill} from 'remotion';
import {ease, prog} from '../anim';
import {fonts, palette, safe, toneColor} from '../theme';
import {TimelineCue, useTime, useTimeline} from '../timeline';

// Narration-synced captions. Phrase-level timing comes straight from the narration take,
// so captions can't drift. Cues sharing a `group` build up one caption block; a cue with
// `splits` is shown as consecutive blocks. Highlighted phrases take the palette tone.

type Word = {text: string; tone?: string; start: number};
type Page = {start: number; end: number; words: Word[]};

const tokenize = (text: string, start: number, highlight: TimelineCue['highlight']): Word[] => {
  const words = text.split(/\s+/).filter(Boolean);
  const tones: Array<string | undefined> = new Array(words.length).fill(undefined);
  for (const [phrase, tone] of highlight) {
    const pw = phrase.split(/\s+/);
    for (let i = 0; i + pw.length <= words.length; i++) {
      const match = pw.every((p, k) => words[i + k].replace(/[.,!?…]+$/, '') === p.replace(/[.,!?…]+$/, ''));
      if (match) for (let k = 0; k < pw.length; k++) tones[i + k] = toneColor[tone];
    }
  }
  return words.map((w, i) => ({text: w, tone: tones[i], start}));
};

export const buildPages = (cues: TimelineCue[]): Page[] => {
  const pages: Page[] = [];
  let current: Page | null = null;
  let currentGroup = '';
  for (const c of cues) {
    if (c.splits) {
      for (const s of c.splits) {
        pages.push({start: s.start, end: s.end, words: tokenize(s.text, s.start, c.highlight)});
      }
      current = null;
      currentGroup = '';
      continue;
    }
    if (!current || c.group !== currentGroup) {
      current = {start: c.start, end: c.end, words: []};
      pages.push(current);
      currentGroup = c.group;
    }
    current.words.push(...tokenize(c.text, c.start, c.highlight));
    current.end = c.end;
  }
  // Hold each block briefly after speech, but never overlap the next block.
  pages.forEach((p, i) => {
    const next = pages[i + 1];
    p.end = Math.min(p.end + 0.45, next ? next.start - 0.04 : p.end + 0.6);
  });
  return pages;
};

export const Captions: React.FC<{top?: number; width?: number; size?: number}> = ({
  top = safe.captionTop,
  width = 820,
  size = 64,
}) => {
  const t = useTime();
  const {cues} = useTimeline();
  const pages = useMemo(() => buildPages(cues), [cues]);
  const page = pages.find((p) => t >= Math.min(p.start - 0.06, p.start < 0.3 ? 0 : Infinity) && t < p.end);
  if (!page) return null;
  const out = prog(t, page.end - 0.12, page.end, ease.inCubic);
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <div
        style={{
          position: 'absolute',
          top,
          left: (safe.left + safe.right) / 2 - width / 2,
          width,
          textAlign: 'center',
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: size,
          lineHeight: 1.12,
          letterSpacing: '-0.012em',
          color: palette.cream,
          opacity: 1 - out,
        }}
      >
        {page.words.map((w, i) => {
          // Words spoken in the first 0.3 s are on screen from frame 0 (first frame must read).
          const a = w.start < 0.3 ? 1 : prog(t, w.start - 0.06, w.start + 0.16, ease.outCubic);
          return (
            <span
              key={i}
              style={{
                display: 'inline-block',
                marginRight: '0.24em',
                opacity: a,
                transform: `translateY(${(1 - a) * 22}px) scale(${0.94 + 0.06 * a})`,
                color: w.tone ?? palette.cream,
                textShadow: w.tone
                  ? `0 0 26px ${w.tone}55, 0 4px 18px rgba(3,5,15,0.9)`
                  : '0 4px 18px rgba(3,5,15,0.9), 0 2px 2px rgba(3,5,15,0.6)',
              }}
            >
              {w.text}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Soft darkening behind the caption zone so captions stay readable over bright 3D. */
export const CaptionBackdrop: React.FC<{opacity?: number}> = ({opacity = 1}) => (
  <AbsoluteFill
    style={{
      pointerEvents: 'none',
      opacity,
      background: `linear-gradient(180deg, rgba(3,5,15,0) ${safe.captionTop - 150}px, rgba(3,5,15,0.62) ${safe.captionTop + 40}px, rgba(3,5,15,0.7) ${safe.captionTop + 260}px, rgba(3,5,15,0.35) 1920px)`,
    }}
  />
);
