import React, {useEffect, useMemo, useState} from 'react';
import {applyFormat} from './format';
import {AbsoluteFill, Audio, Img, continueRender, delayRender, staticFile, useCurrentFrame} from 'remotion';
import type {CircleItem, Item, LabelItem, MagnifierItem, PictureItem, Timings, VideoSettings, Vec} from './types';
import {
  Cam,
  cameraAt,
  clamp,
  ease,
  lerp,
  motionAt,
  pointOnPath,
  Pose,
  progress,
  smoothPath,
  visibility,
} from './core';

// A projector turns world points into screen pixels for one layer.
interface Projector {
  toScreen: (p: Vec) => Vec;
  scale: number; // screen px per world unit
  /** Screen position of this layer's (0,0) – used to skip things outside the frame. */
  origin?: Vec;
}

interface Ctx {
  s: VideoSettings;
  t: number;
  cam: Cam;
  byId: Map<string, Item>;
}

const smoothCache = new WeakMap<Vec[], Vec[]>();
const smooth = (p: Vec[]) => {
  let v = smoothCache.get(p);
  if (!v) {
    v = smoothPath(p);
    smoothCache.set(p, v);
  }
  return v;
};

const hexToRgb = (hex: string) => {
  const n = parseInt(hex.replace('#', ''), 16);
  return `${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}`;
};

const colorOf = (s: VideoSettings, c: string | undefined, fallback: string) =>
  !c ? fallback : c === 'accent' ? s.style.accent : c === 'ink' ? s.style.ink : c;

/** Top and bottom of the area free for content (inside the safe margins, above the subtitles). */
const contentArea = (s: VideoSettings) => ({
  top: s.height * s.safe.top,
  bottom: s.height * (1 - s.safe.bottom) - (s.subtitles?.band ?? 0),
});

const focusPoint = (s: VideoSettings): Vec => {
  // The middle of the area that is free to use (between the safe margins).
  const {top, bottom} = contentArea(s);
  return [s.width / 2, (top + bottom) / 2];
};

const layerProjector = (ctx: Ctx, depth = 1): Projector => {
  const f = focusPoint(ctx.s);
  // Far layers react less to the camera: zoom is softened and movement is slower.
  const z = Math.pow(ctx.cam.zoom, 1 / depth);
  return {
    toScreen: ([x, y]) => [f[0] + (x - ctx.cam.x) * z, f[1] + (y - ctx.cam.y) * z],
    scale: z,
  };
};

// "Nothing pops": every appearance fades in with a little scale and blur.
const appear = (v: number) => ({scale: lerp(0.94, 1, v), blur: (1 - v) * 10});

// ---------------- pictures ----------------

export const picturePose = (it: PictureItem, t: number): Pose => {
  let pose = motionAt({x: it.at[0], y: it.at[1], scale: 1, rotate: it.rotate ?? 0, opacity: 1}, it.motion, t);
  if (it.pathMotion && t >= it.pathMotion.start) {
    const pts = smooth(it.pathMotion.path);
    const [x, y] = pointOnPath(pts, ease(it.pathMotion.ease, progress(t, it.pathMotion.start, it.pathMotion.end)));
    pose = {...pose, x, y};
  }
  if (it.beat) {
    for (const b of it.beat) {
      if (t < b.start || t > b.end) continue;
      const period = 60 / (b.bpm ?? 64);
      const ph = ((t - b.start) % period) / period;
      // A soft double bump (lub-dub), faded in and out at the ends of the beating span.
      const bump = (c: number, w: number) => Math.exp(-(((ph - c) / w) ** 2));
      const env = Math.min(1, (t - b.start) / 0.8, (b.end - t) / 0.8);
      pose = {...pose, scale: pose.scale * (1 + (b.amount ?? 0.015) * env * (bump(0.12, 0.07) + 0.6 * bump(0.32, 0.07)))};
    }
  }
  if (it.swallow && t >= it.swallow.at) {
    const u = ease('inOut', progress(t, it.swallow.at, it.swallow.at + (it.swallow.duration ?? 1)));
    pose = {
      ...pose,
      x: lerp(pose.x, it.swallow.into[0], u),
      y: lerp(pose.y, it.swallow.into[1], u),
      scale: pose.scale * (1 - 0.8 * u),
      opacity: pose.opacity * (1 - u),
    };
  }
  return pose;
};

const Picture: React.FC<{it: PictureItem; ctx: Ctx; pr: Projector}> = ({it, ctx, pr}) => {
  const def = ctx.s.pictures[it.pic];
  const pose = picturePose(it, ctx.t);
  const vis = visibility(it.show, ctx.t, ctx.s.style.fade);
  const opacity = vis * pose.opacity * (it.opacity ?? 1);
  if (opacity <= 0.002) return null;
  const a = appear(vis);
  const k = (it.width / def.w) * pose.scale * a.scale; // world units per image px
  const w = def.w * k * pr.scale;
  const h = def.h * k * pr.scale;
  // Where does the image center go, given the anchor pixel sits at the pose position?
  const anchor = it.anchor ?? [def.w / 2, def.h / 2];
  const r = (pose.rotate * Math.PI) / 180;
  const ox = (anchor[0] - def.w / 2) * k;
  const oy = (anchor[1] - def.h / 2) * k;
  const cx = pose.x - (ox * Math.cos(r) - oy * Math.sin(r));
  const cy = pose.y - (ox * Math.sin(r) + oy * Math.cos(r));
  const [sx, sy] = pr.toScreen([cx, cy]);
  // Skip anything fully outside the frame.
  const rad = Math.hypot(w, h) / 2;
  const gx = sx + (pr.origin?.[0] ?? 0);
  const gy = sy + (pr.origin?.[1] ?? 0);
  if (gx + rad < -50 || gx - rad > ctx.s.width + 50 || gy + rad < -50 || gy - rad > ctx.s.height + 50) return null;
  const depthBlur = ((it.depth ?? 1) - 1) * 5;
  const blur = a.blur + depthBlur;
  return (
    <Img
      src={staticFile(def.src)}
      style={{
        position: 'absolute',
        left: sx - w / 2,
        top: sy - h / 2,
        width: w,
        height: h,
        opacity,
        transform: `rotate(${pose.rotate}deg)`,
        filter: blur > 0.05 ? `blur(${blur}px)` : undefined,
        willChange: 'transform',
      }}
    />
  );
};

// ---------------- lights ----------------

const Light: React.FC<{it: Extract<Item, {type: 'light'}>; ctx: Ctx; pr: Projector}> = ({it, ctx, pr}) => {
  const pts = smooth(it.path);
  const count = it.count ?? 1;
  const gap = it.gap ?? 0.35;
  const dur = it.end - it.start;
  const size = it.size ?? 38;
  const rgb = hexToRgb(ctx.s.style.accent);
  const showVis = visibility(it.show, ctx.t, ctx.s.style.fade) * (it.opacity ?? 1);
  if (showVis <= 0.002) return null;
  const out: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const t0 = it.start + i * gap;
    const u = progress(ctx.t, t0, t0 + dur);
    if (ctx.t < t0 || ctx.t > t0 + dur) continue;
    const e = ease(it.ease ?? 'inOut', u);
    // Soft fade at both ends of the trip.
    const v = Math.min(1, u / 0.15, (1 - u) / 0.15) * showVis * (it.intensity ?? 1);
    // A short soft trail behind the light.
    for (let k = 5; k >= 0; k--) {
      const p = pr.toScreen(pointOnPath(pts, e - k * 0.012));
      const kk = 1 - k / 6;
      const s = size * (0.55 + 0.45 * kk);
      out.push(
        <div
          key={`${i}-${k}`}
          style={{
            position: 'absolute',
            left: p[0] - s * 1.6,
            top: p[1] - s * 1.6,
            width: s * 3.2,
            height: s * 3.2,
            borderRadius: '50%',
            opacity: v * (k === 0 ? 1 : 0.35 * kk),
            background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(${rgb},0.95) 14%, rgba(${rgb},0.45) 34%, rgba(${rgb},0.12) 58%, rgba(${rgb},0) 72%)`,
            filter: 'blur(2px)',
          }}
        />,
      );
    }
  }
  return <>{out}</>;
};

// ---------------- lines ----------------

const Line: React.FC<{it: Extract<Item, {type: 'line'}>; ctx: Ctx; pr: Projector}> = ({it, ctx, pr}) => {
  const vis = visibility(it.show, ctx.t, ctx.s.style.fade);
  const u = ease('inOut', progress(ctx.t, it.drawStart, it.drawEnd));
  if (vis <= 0.002 || u <= 0) return null;
  const pts = (it.smooth === false ? it.path : smooth(it.path)).map(pr.toScreen);
  let len = 0;
  for (let i = 1; i < pts.length; i++) len += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
  const color = colorOf(ctx.s, it.color, ctx.s.style.ink);
  const isAccent = color === ctx.s.style.accent;
  const opacity = (it.opacity ?? (isAccent ? 0.9 : 0.55)) * vis;
  const width = it.width ?? 2.5;
  const points = pts.map((p) => p.join(',')).join(' ');
  // Dashed lines still draw themselves: a solid line drawn on reveals the dashes (mask).
  const maskId = `m${Math.abs(Math.round(pts[0][0] * 7 + pts[0][1] * 13 + len))}`;
  // Arrow head at the current tip of the line.
  let head: React.ReactNode = null;
  if (it.arrow && u > 0.05) {
    const tip = pointOnPath(pts, u);
    const back = pointOnPath(pts, Math.max(0, u - 0.02));
    const a = Math.atan2(tip[1] - back[1], tip[0] - back[0]);
    const hl = Math.max(14, width * 4);
    const p1: Vec = [tip[0] - hl * Math.cos(a - 0.45), tip[1] - hl * Math.sin(a - 0.45)];
    const p2: Vec = [tip[0] - hl * Math.cos(a + 0.45), tip[1] - hl * Math.sin(a + 0.45)];
    head = (
      <polyline
        points={`${p1.join(',')} ${tip.join(',')} ${p2.join(',')}`}
        fill="none"
        stroke={color}
        strokeOpacity={opacity}
        strokeWidth={width}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  }
  return (
    <svg style={{position: 'absolute', inset: 0, overflow: 'visible'}} width={ctx.s.width} height={ctx.s.height}>
      {it.dash ? (
        <>
          <defs>
            <mask id={maskId} maskUnits="userSpaceOnUse" x={-5000} y={-5000} width={20000} height={20000}>
              <polyline
                points={points}
                fill="none"
                stroke="#fff"
                strokeWidth={width * 3}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={`${len} ${len}`}
                strokeDashoffset={len * (1 - u)}
              />
            </mask>
          </defs>
          <polyline
            points={points}
            mask={`url(#${maskId})`}
            fill="none"
            stroke={color}
            strokeOpacity={opacity}
            strokeWidth={width}
            strokeLinecap="round"
            strokeDasharray={`${it.dash} ${it.dash * 0.8}`}
          />
        </>
      ) : (
        <polyline
          points={points}
          fill="none"
          stroke={color}
          strokeOpacity={opacity}
          strokeWidth={width}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray={`${len} ${len}`}
          strokeDashoffset={len * (1 - u)}
          style={isAccent ? {filter: `drop-shadow(0 0 6px ${color})`} : undefined}
        />
      )}
      {head}
    </svg>
  );
};

// ---------------- circles ----------------

const Circle: React.FC<{it: CircleItem; ctx: Ctx; pr: Projector}> = ({it, ctx, pr}) => {
  const vis = visibility(it.show, ctx.t, ctx.s.style.fade);
  const pose = motionAt({x: it.at[0], y: it.at[1], scale: 1, rotate: 0, opacity: 1}, it.motion, ctx.t);
  const o = vis * pose.opacity * (it.opacity ?? 1);
  if (o <= 0.002) return null;
  const [cx, cy] = pr.toScreen([pose.x, pose.y]);
  const rx = it.radius * pr.scale * pose.scale;
  const ry = (it.radiusY ?? it.radius) * pr.scale * pose.scale;
  const drawFrom = it.draw?.[0] ?? it.show?.in ?? 0;
  const drawTo = it.draw?.[1] ?? drawFrom + 0.9;
  const u = ease('inOut', progress(ctx.t, drawFrom, drawTo));
  // Ellipse perimeter (Ramanujan) for the draw-on effect.
  const per = Math.PI * (3 * (rx + ry) - Math.sqrt((3 * rx + ry) * (rx + 3 * ry)));
  const stroke = it.stroke ? colorOf(ctx.s, it.stroke, ctx.s.style.ink) : undefined;
  const sw = it.strokeWidth ?? 2.5;
  const pad = sw * 4 + 10;
  return (
    <svg
      style={{position: 'absolute', left: cx - rx - pad, top: cy - ry - pad, overflow: 'visible', opacity: o}}
      width={2 * (rx + pad)}
      height={2 * (ry + pad)}
    >
      {it.fill && <ellipse cx={rx + pad} cy={ry + pad} rx={rx} ry={ry} fill={colorOf(ctx.s, it.fill, it.fill)} />}
      {stroke && u > 0 && (
        <ellipse
          cx={rx + pad}
          cy={ry + pad}
          rx={rx}
          ry={ry}
          fill="none"
          stroke={stroke}
          strokeOpacity={stroke === ctx.s.style.accent ? 0.95 : 0.7}
          strokeWidth={sw}
          strokeLinecap="round"
          strokeDasharray={it.dash ? `${it.dash} ${it.dash * 0.8}` : `${per} ${per}`}
          strokeDashoffset={it.dash ? 0 : per * (1 - u)}
          opacity={it.dash ? u : 1}
          transform={`rotate(-90 ${rx + pad} ${ry + pad})`}
          style={stroke === ctx.s.style.accent ? {filter: `drop-shadow(0 0 5px ${stroke})`} : undefined}
        />
      )}
    </svg>
  );
};

// ---------------- pulses & glows ----------------

const Pulse: React.FC<{it: Extract<Item, {type: 'pulse'}>; ctx: Ctx; pr: Projector}> = ({it, ctx, pr}) => {
  const rgb = hexToRgb(colorOf(ctx.s, it.color, ctx.s.style.accent));
  const vis = visibility(it.show, ctx.t, ctx.s.style.fade);
  const [cx, cy] = pr.toScreen(it.at);
  const out: React.ReactNode[] = [];
  const count = it.count ?? 3;
  const dur = it.duration ?? 2.2;
  for (let k = 0; k < count; k++) {
    const t0 = it.start + k * (it.interval ?? 0.8);
    const u = progress(ctx.t, t0, t0 + dur);
    if (u <= 0 || u >= 1) continue;
    const r = it.radius * pr.scale * (0.15 + 0.85 * ease('out', u));
    const o = Math.sin(Math.PI * u) * 0.75 * vis;
    out.push(
      <div
        key={k}
        style={{
          position: 'absolute',
          left: cx - r,
          top: cy - r,
          width: r * 2,
          height: r * 2,
          borderRadius: '50%',
          border: `${Math.max(2, r * 0.035)}px solid rgba(${rgb},0.8)`,
          boxShadow: `0 0 ${r * 0.18}px rgba(${rgb},0.55), inset 0 0 ${r * 0.18}px rgba(${rgb},0.4)`,
          opacity: o,
          filter: 'blur(1.5px)',
        }}
      />,
    );
  }
  return <>{out}</>;
};

const Glow: React.FC<{it: Extract<Item, {type: 'glow'}>; ctx: Ctx; pr: Projector}> = ({it, ctx, pr}) => {
  const rgb = hexToRgb(ctx.s.style.accent);
  const vis = visibility(it.show, ctx.t, ctx.s.style.fade);
  const pose = motionAt({x: it.at[0], y: it.at[1], scale: 1, rotate: 0, opacity: 1}, it.motion, ctx.t);
  const o = vis * pose.opacity * (it.opacity ?? 1);
  if (o <= 0.002) return null;
  const breathe = it.breathe ? 0.85 + 0.15 * Math.sin(ctx.t * 2.4) : 1;
  const r = it.radius * pr.scale * pose.scale * breathe;
  const [cx, cy] = pr.toScreen([pose.x, pose.y]);
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: '50%',
        opacity: o,
        background: `radial-gradient(circle, rgba(${rgb},0.55) 0%, rgba(${rgb},0.28) 35%, rgba(${rgb},0.08) 60%, rgba(${rgb},0) 72%)`,
      }}
    />
  );
};

// ---------------- labels ----------------

const Label: React.FC<{it: LabelItem; ctx: Ctx; pr: Projector}> = ({it, ctx, pr}) => {
  const vis = visibility(it.show, ctx.t, ctx.s.style.fade);
  if (vis <= 0.002) return null;
  let p: Vec;
  if (it.screen) p = it.screen;
  else {
    let anchor = it.anchor ?? [0, 0];
    if (it.follow) {
      const f = ctx.byId.get(it.follow);
      if (f && f.type === 'picture') {
        const pose = picturePose(f, ctx.t);
        anchor = [pose.x + (it.anchor?.[0] ?? 0), pose.y + (it.anchor?.[1] ?? 0)];
      }
    }
    p = pr.toScreen(anchor);
  }
  const off = it.offset ?? [0, 0];
  const size = it.size ?? ctx.s.style.labelSize;
  // Keep labels inside the free area of the frame.
  const area = contentArea(ctx.s);
  const top = area.top + size;
  const bottom = area.bottom - size;
  const x = clamp(p[0] + off[0], 200, ctx.s.width - 200);
  const y = clamp(p[1] + off[1], top, bottom);
  const a = appear(vis);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `translate(-50%, -50%) translateY(${(1 - vis) * 10}px) scale(${a.scale})`,
        opacity: vis,
        filter: a.blur > 0.05 ? `blur(${a.blur * 0.6}px)` : undefined,
        fontFamily: ctx.s.style.font,
        fontWeight: 800,
        fontSize: size,
        letterSpacing: '0.32em',
        paddingLeft: '0.32em', // balances the trailing letter space
        color: ctx.s.style.ink,
        textShadow: `0 0 10px ${ctx.s.style.background}, 0 0 18px ${ctx.s.style.background}, 0 0 4px ${ctx.s.style.background}, 0 0 26px ${ctx.s.style.background}`,
        whiteSpace: 'nowrap',
        textAlign: 'center',
      }}
    >
      {it.text}
    </div>
  );
};

// ---------------- magnifier ----------------

// Outer tangent lines between two circles (for the two thin joining lines).
const outerTangents = (c1: Vec, r1: number, c2: Vec, r2: number): [Vec, Vec][] => {
  const dx = c2[0] - c1[0];
  const dy = c2[1] - c1[1];
  const d = Math.hypot(dx, dy);
  if (d <= Math.abs(r2 - r1) + 0.01) return [];
  const base = Math.atan2(dy, dx);
  const ang = Math.acos((r1 - r2) / d);
  return [base + ang, base - ang].map((a) => {
    const n: Vec = [Math.cos(a), Math.sin(a)];
    return [
      [c1[0] + n[0] * r1, c1[1] + n[1] * r1],
      [c2[0] + n[0] * r2, c2[1] + n[1] * r2],
    ] as [Vec, Vec];
  });
};

const Magnifier: React.FC<{it: MagnifierItem; ctx: Ctx; pr: Projector}> = ({it, ctx, pr}) => {
  const vis = visibility(it.show, ctx.t, ctx.s.style.fade);
  if (vis <= 0.002 || ctx.t < it.grow - 0.3) return null;
  const lineU = ease('inOut', progress(ctx.t, it.grow - 0.3, it.grow + 0.5));
  const u = ease('inOut', progress(ctx.t, it.grow + 0.1, it.grow + 1.1));
  const c: Vec = [lerp(it.source[0], it.center[0], u), lerp(it.source[1], it.center[1], u)];
  const r = lerp(it.sourceRadius, it.radius, u);
  const sc = pr.toScreen(c);
  const rp = r * pr.scale;
  const src = pr.toScreen(it.source);
  const srp = it.sourceRadius * pr.scale;
  const tangents = outerTangents(src, srp, sc, rp);
  const ink = ctx.s.style.ink;
  const inner: Projector = {
    toScreen: ([x, y]) => [rp + x * pr.scale * (r / it.radius), rp + y * pr.scale * (r / it.radius)],
    scale: pr.scale * (r / it.radius),
    origin: [sc[0] - rp, sc[1] - rp],
  };
  return (
    <>
      <svg style={{position: 'absolute', inset: 0, overflow: 'visible', opacity: vis}} width={ctx.s.width} height={ctx.s.height}>
        <circle
          cx={src[0]}
          cy={src[1]}
          r={srp}
          fill="none"
          stroke={ink}
          strokeOpacity={0.6}
          strokeWidth={2}
          strokeDasharray={`${2 * Math.PI * srp}`}
          strokeDashoffset={2 * Math.PI * srp * (1 - lineU)}
        />
        {u > 0.02 &&
          tangents.map(([a, b], i) => {
            // Lines grow from the detail toward the circle.
            const e = lineU;
            const bx = lerp(a[0], b[0], e);
            const by = lerp(a[1], b[1], e);
            return <line key={i} x1={a[0]} y1={a[1]} x2={bx} y2={by} stroke={ink} strokeOpacity={0.45} strokeWidth={1.6} />;
          })}
      </svg>
      {u > 0.001 && (
        <div
          style={{
            position: 'absolute',
            left: sc[0] - rp,
            top: sc[1] - rp,
            width: rp * 2,
            height: rp * 2,
            borderRadius: '50%',
            overflow: 'hidden',
            background: ctx.s.style.background,
            boxShadow: `0 0 0 2px rgba(29,29,31,0.55)`,
            opacity: vis * Math.min(1, u * 3),
            filter: u < 0.999 ? `blur(${(1 - u) * 6}px)` : undefined,
          }}
        >
          {it.children.map((child, i) => (
            <ItemView key={i} it={child} ctx={ctx} pr={inner} />
          ))}
        </div>
      )}
    </>
  );
};

// ---------------- orbit (time passing) ----------------

const Orbit: React.FC<{it: Extract<Item, {type: 'orbit'}>; ctx: Ctx}> = ({it, ctx}) => {
  const vis = visibility(it.show, ctx.t, ctx.s.style.fade);
  if (vis <= 0.002) return null;
  const [cx, cy] = it.screen;
  const draw = ease('inOut', progress(ctx.t, it.show?.in ?? it.start, (it.show?.in ?? it.start) + 0.7));
  const u = ease('inOut', progress(ctx.t, it.start, it.end));
  const ang = -Math.PI / 2 + u * it.turns * Math.PI * 2;
  const lp: Vec = [cx + Math.cos(ang) * it.radius, cy + Math.sin(ang) * it.radius];
  const rgb = hexToRgb(ctx.s.style.accent);
  const circ = 2 * Math.PI * it.radius;
  const s = 30;
  return (
    <div style={{position: 'absolute', inset: 0, opacity: vis}}>
      <div
        style={{
          position: 'absolute',
          left: cx - it.radius * 1.6,
          top: cy - it.radius * 1.6,
          width: it.radius * 3.2,
          height: it.radius * 3.2,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.97) 55%, rgba(255,255,255,0) 70%)',
        }}
      />
      <svg style={{position: 'absolute', inset: 0}} width={ctx.s.width} height={ctx.s.height}>
        <circle
          cx={cx}
          cy={cy}
          r={it.radius}
          fill="none"
          stroke={ctx.s.style.ink}
          strokeOpacity={0.5}
          strokeWidth={2.5}
          strokeDasharray={circ}
          strokeDashoffset={circ * (1 - draw)}
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      </svg>
      {ctx.t > it.start && ctx.t < it.end + 0.6 && (
        <div
          style={{
            position: 'absolute',
            left: lp[0] - s * 1.6,
            top: lp[1] - s * 1.6,
            width: s * 3.2,
            height: s * 3.2,
            borderRadius: '50%',
            opacity: Math.min(1, progress(ctx.t, it.start, it.start + 0.3)),
            background: `radial-gradient(circle, rgba(255,255,255,0.95) 0%, rgba(${rgb},0.95) 14%, rgba(${rgb},0.45) 34%, rgba(${rgb},0.12) 58%, rgba(${rgb},0) 72%)`,
            filter: 'blur(2px)',
          }}
        />
      )}
      {it.text && (
        <div
          style={{
            position: 'absolute',
            left: cx,
            top: cy,
            transform: 'translate(-50%,-50%)',
            fontFamily: ctx.s.style.font,
            fontWeight: 800,
            fontSize: 30,
            letterSpacing: '0.32em',
            paddingLeft: '0.32em',
            color: ctx.s.style.ink,
          }}
        >
          {it.text}
        </div>
      )}
    </div>
  );
};

// ---------------- dispatcher ----------------

const ItemView: React.FC<{it: Item; ctx: Ctx; pr: Projector}> = ({it, ctx, pr}) => {
  switch (it.type) {
    case 'picture':
      return <Picture it={it} ctx={ctx} pr={pr} />;
    case 'light':
      return <Light it={it} ctx={ctx} pr={pr} />;
    case 'line':
      return <Line it={it} ctx={ctx} pr={pr} />;
    case 'pulse':
      return <Pulse it={it} ctx={ctx} pr={pr} />;
    case 'glow':
      return <Glow it={it} ctx={ctx} pr={pr} />;
    case 'label':
      return <Label it={it} ctx={ctx} pr={pr} />;
    case 'magnifier':
      return <Magnifier it={it} ctx={ctx} pr={pr} />;
    case 'orbit':
      return <Orbit it={it} ctx={ctx} />;
    case 'circle':
      return <Circle it={it} ctx={ctx} pr={pr} />;
  }
};

// ---------------- dot grid ----------------

// A faint dot grid that zooms forever: two grids an octave apart cross-fade.
const DotGrid: React.FC<{ctx: Ctx}> = ({ctx}) => {
  const g = ctx.s.style.dotGrid;
  const f = focusPoint(ctx.s);
  const z = Math.pow(ctx.cam.zoom, g.parallax);
  const l = Math.log2(z);
  const frac = l - Math.floor(l);
  const fine = g.spacing * Math.pow(2, frac);
  const coarse = fine * 2;
  // World origin on screen (moves with the camera, a little slower than the page).
  const ox = f[0] - ctx.cam.x * z;
  const oy = f[1] - ctx.cam.y * z;
  const mod = (a: number, m: number) => ((a % m) + m) % m;
  const dot = (op: number) =>
    `radial-gradient(circle, rgba(0,0,0,${(g.color === 'auto' ? 0.085 : 0.085) * op}) ${g.size}px, rgba(0,0,0,0) ${g.size + 1}px)`;
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `${dot(1)}, ${dot(frac)}`,
        backgroundSize: `${coarse}px ${coarse}px, ${fine}px ${fine}px`,
        backgroundPosition: `${mod(ox - coarse / 2, coarse)}px ${mod(oy - coarse / 2, coarse)}px, ${mod(ox - fine / 2, fine)}px ${mod(
          oy - fine / 2,
          fine,
        )}px`,
      }}
    />
  );
};

// ---------------- subtitles ----------------

/** Splits each sentence into evenly sized captions (no lone words, breaks after commas preferred). */
export const buildCaptions = (tm: Timings, maxChars = 32) => {
  const out: {start: number; end: number; text: string}[] = [];
  const textOf = (ws: {text: string}[]) => ws.map((w) => w.text).join(' ');
  for (const s of tm.sentences) {
    const n = s.text.split(/\s+/).length;
    const ws = tm.words.slice(s.firstWord, s.firstWord + n);
    const total = textOf(ws).length;
    const nMin = Math.max(1, Math.ceil(total / maxChars));
    // Best split into k parts by dynamic programming over cut positions.
    let best: {cost: number; parts: (typeof ws)[]} | null = null;
    for (let parts = nMin; parts <= nMin + 1 && parts <= ws.length; parts++) {
      const target = total / parts;
      // dp[i][j]: best cost to put the first i words into j captions.
      const dp: {cost: number; prev: number}[][] = Array.from({length: ws.length + 1}, () =>
        Array.from({length: parts + 1}, () => ({cost: Infinity, prev: -1})),
      );
      dp[0][0] = {cost: 0, prev: -1};
      for (let i = 1; i <= ws.length; i++) {
        for (let j = 1; j <= parts; j++) {
          for (let p = j - 1; p < i; p++) {
            if (dp[p][j - 1].cost === Infinity) continue;
            const chunk = ws.slice(p, i);
            const len = textOf(chunk).length;
            if (len > maxChars + 3 || (chunk.length < 2 && ws.length > 1)) continue;
            let c = (len - target) ** 2;
            if (i < ws.length && /[,:;]$/.test(chunk[chunk.length - 1].text)) c -= 250;
            const total2 = dp[p][j - 1].cost + c;
            if (total2 < dp[i][j].cost) dp[i][j] = {cost: total2, prev: p};
          }
        }
      }
      const end = dp[ws.length][parts];
      if (end.cost === Infinity) continue;
      const cost = end.cost + 400 * (parts - nMin);
      if (!best || cost < best.cost) {
        const chunks: (typeof ws)[] = [];
        let i = ws.length;
        for (let j = parts; j > 0; j--) {
          const p = dp[i][j].prev;
          chunks.unshift(ws.slice(p, i));
          i = p;
        }
        best = {cost, parts: chunks};
      }
    }
    for (const part of best?.parts ?? [ws]) {
      out.push({start: part[0].start, end: part[part.length - 1].end, text: textOf(part)});
    }
  }
  // Hold each caption until the next one starts (max 0.7 s extra).
  out.forEach((c, i) => {
    const next = out[i + 1]?.start ?? c.end + 1;
    c.end = Math.min(next - 0.05, c.end + 0.7);
  });
  return out;
};

const Subtitles: React.FC<{ctx: Ctx; captions: ReturnType<typeof buildCaptions>}> = ({ctx, captions}) => {
  const sub = ctx.s.subtitles!;
  const c = captions.find((x) => ctx.t >= x.start - 0.08 && ctx.t <= x.end + 0.12);
  if (!c) return null;
  // Quick soft fade so captions never pop.
  const v = Math.min(1, (ctx.t - (c.start - 0.08)) / 0.12, (c.end + 0.12 - ctx.t) / 0.12);
  const y = ctx.s.height * (1 - ctx.s.safe.bottom) - sub.band / 2;
  return (
    <div
      style={{
        position: 'absolute',
        left: 60,
        right: 60,
        top: y,
        transform: 'translateY(-50%)',
        textAlign: 'center',
        opacity: clamp(v, 0, 1),
        fontFamily: ctx.s.style.font,
        fontWeight: 800,
        fontSize: sub.size,
        lineHeight: 1.15,
        color: ctx.s.style.ink,
        textShadow: `0 0 8px ${ctx.s.style.background}, 0 0 16px ${ctx.s.style.background}, 0 0 3px ${ctx.s.style.background}`,
      }}
    >
      {c.text}
    </div>
  );
};

// ---------------- the scene ----------------

const useFont = (family: string, file: string) => {
  const [handle] = useState(() => delayRender('font'));
  useEffect(() => {
    const face = new FontFace(family, `url(${staticFile(file)})`, {weight: '800'});
    face
      .load()
      .then((f) => {
        document.fonts.add(f);
        continueRender(handle);
      })
      .catch(() => continueRender(handle));
  }, [family, file, handle]);
};

export const Scene: React.FC<{settings: VideoSettings; format?: string}> = ({settings, format}) => {
  const s = useMemo(() => applyFormat(settings, format), [settings, format]);
  useFont(s.style.font, 'fonts/inter-latin-800-normal.woff2');
  const frame = useCurrentFrame();
  const t = frame / s.fps;
  const cam = cameraAt(s.camera, t);
  const byId = new Map<string, Item>();
  const collect = (list: Item[]) =>
    list.forEach((i) => {
      if (i.id) byId.set(i.id, i);
      if (i.type === 'magnifier') collect(i.children);
    });
  collect(s.items);
  const ctx: Ctx = {s, t, cam, byId};
  const captions = useMemo(() => buildCaptions(s.timings, s.subtitles?.maxChars), [s]);
  const projectors = new Map<number, Projector>();
  const pr = (d = 1) => {
    if (!projectors.has(d)) projectors.set(d, layerProjector(ctx, d));
    return projectors.get(d)!;
  };
  // Far layers first, then the page, then labels on top.
  const ordered = [...s.items].sort((a, b) => (b.depth ?? 1) - (a.depth ?? 1));
  const labels = ordered.filter((i) => i.type === 'label' || i.type === 'orbit');
  const rest = ordered.filter((i) => i.type !== 'label' && i.type !== 'orbit');
  return (
    <AbsoluteFill style={{background: s.style.background, overflow: 'hidden'}}>
      <DotGrid ctx={ctx} />
      {rest.map((it, i) => (
        <ItemView key={i} it={it} ctx={ctx} pr={pr(it.depth ?? 1)} />
      ))}
      {labels.map((it, i) => (
        <ItemView key={`l${i}`} it={it} ctx={ctx} pr={pr(it.depth ?? 1)} />
      ))}
      {s.subtitles && <Subtitles ctx={ctx} captions={captions} />}
      <Audio src={staticFile(s.audio)} />
    </AbsoluteFill>
  );
};
