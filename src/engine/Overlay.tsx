import React from 'react';
import {AbsoluteFill} from 'remotion';
import {ease, progress} from './core';
import type {SubtitleStyle, Timings, VideoSettings, WatermarkStyle} from './types';

// ---------------- subtitles ----------------

export interface Caption {
  start: number;
  end: number;
  words: {text: string; start: number}[];
}

/** Splits each sentence into short phrases (no lone words), preferring breaks after punctuation. */
export const buildCaptions = (timings: Timings, maxChars: number): Caption[] => {
  const out: Caption[] = [];
  for (const s of timings.sentences) {
    const n = s.text.split(/\s+/).length;
    const ws = timings.words.slice(s.firstWord, s.firstWord + n);
    const len = (a: number, b: number) => ws.slice(a, b).map((w) => w.text).join(' ').length;
    // Best split by dynamic programming: even lengths, bonus for breaking after , or .
    const best: {cost: number; prev: number}[] = Array(ws.length + 1).fill(null).map(() => ({cost: Infinity, prev: -1}));
    best[0] = {cost: 0, prev: -1};
    const target = Math.min(maxChars, len(0, ws.length) / Math.max(1, Math.ceil(len(0, ws.length) / maxChars)));
    for (let b = 1; b <= ws.length; b++) {
      for (let a = 0; a < b; a++) {
        const l = len(a, b);
        if (l > maxChars + 2 && b - a > 1) continue;
        if (b - a < 2 && ws.length > 1) continue; // no lone words
        const punct = /[,.;:!?]$/.test(ws[b - 1].text) && b < ws.length ? -120 : 0;
        const c = best[a].cost + (l - target) ** 2 + 60 + punct;
        if (c < best[b].cost) best[b] = {cost: c, prev: a};
      }
    }
    const cuts: number[] = [];
    for (let b = ws.length; b > 0; b = best[b].prev) {
      if (best[b].prev < 0) {
        cuts.length = 0;
        cuts.push(0);
        break;
      }
      cuts.unshift(best[b].prev);
    }
    cuts.push(ws.length);
    for (let i = 0; i < cuts.length - 1; i++) {
      const part = ws.slice(cuts[i], cuts[i + 1]);
      if (!part.length) continue;
      out.push({start: part[0].start, end: part[part.length - 1].end, words: part.map((w) => ({text: w.text, start: w.start}))});
    }
  }
  // Hold each caption a little after its last word (max +0.6 s), but always end before the next
  // one starts, so two captions are never on screen together.
  out.forEach((c, i) => {
    const next = out[i + 1]?.start ?? c.end + 0.8;
    c.end = Math.min(c.end + 0.6, next - 0.03);
  });
  return out;
};

const Subtitles: React.FC<{st: SubtitleStyle; captions: Caption[]; t: number; width: number}> = ({st, captions, t, width}) => {
  const fade = 0.14;
  return (
    <>
      {captions.map((c, i) => {
        // Fade in from just before the first word; fade out so it is gone by `end`.
        if (t < c.start - 0.03 || t > c.end) return null;
        const vin = ease('inOut', progress(t, c.start - 0.03, c.start - 0.03 + fade));
        const vout = 1 - ease('inOut', progress(t, c.end - fade, c.end));
        const v = Math.min(vin, vout);
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 60,
              width: width - 120,
              top: st.y,
              transform: `translateY(-50%) translateY(${(1 - vin) * 8}px) scale(${0.97 + 0.03 * v})`,
              opacity: v,
              filter: v < 0.98 ? `blur(${(1 - v) * 4}px)` : undefined,
              textAlign: 'center',
              fontFamily: st.font,
              fontWeight: st.weight,
              fontSize: st.size,
              lineHeight: 1.15,
              letterSpacing: '0.01em',
              color: st.color,
              textTransform: st.uppercase ? 'uppercase' : undefined,
              // Soft white halo so captions read over the drawings without a box.
              textShadow: '0 0 3px #fff, 0 0 8px #fff, 0 0 16px #fff, 0 0 28px #fff, 0 0 44px #fff, 0 0 60px #fff',
            }}
          >
            {c.words.map((w, k) => {
              const spoken = ease('inOut', progress(t, w.start - 0.06, w.start + 0.1));
              const o = st.upcoming + (1 - st.upcoming) * spoken;
              return (
                <span key={k} style={{opacity: o}}>
                  {w.text}
                  {k < c.words.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </div>
        );
      })}
    </>
  );
};

// ---------------- watermark ----------------

const Watermark: React.FC<{wm: WatermarkStyle; s: VideoSettings}> = ({wm, s}) => {
  const [x, y] = wm.at ?? [s.width / 2, s.height / 2];
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        fontFamily: wm.font,
        fontWeight: wm.weight,
        fontSize: wm.size,
        letterSpacing: '0.18em',
        paddingLeft: '0.18em',
        color: s.style.ink,
        opacity: wm.opacity,
        // Multiply blends it into the page and the drawings instead of sitting on top.
        mixBlendMode: 'multiply',
        whiteSpace: 'nowrap',
        pointerEvents: 'none',
      }}
    >
      {wm.text}
    </div>
  );
};

export const Overlay: React.FC<{s: VideoSettings; t: number; captions: Caption[]}> = ({s, t, captions}) => (
  <AbsoluteFill>
    {s.watermark && <Watermark wm={s.watermark} s={s} />}
    {s.subtitles && <Subtitles st={s.subtitles} captions={captions} t={t} width={s.width} />}
  </AbsoluteFill>
);
