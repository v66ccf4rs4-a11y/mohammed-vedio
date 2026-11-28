import React from "react";
import { random } from "remotion";
import { prog } from "../time";

export const Y = {
  bg: "#0a0a0d",
  hair: "#f6f2ea",
  rose: "#e9b8a6",
  gold: "#d8b26e",
  blood: "#b3262d",
  dim: "rgba(246,242,234,0.35)",
};

/** A single hair: a gently waving cubic curve from a to b. */
export const hairD = (x0: number, y0: number, x1: number, y1: number, wave = 40, phase = 0) => {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const c1 = [x0 + dx * 0.33, y0 + dy * 0.33 - wave * Math.cos(phase)];
  const c2 = [x0 + dx * 0.66, y0 + dy * 0.66 + wave * Math.sin(phase + 1)];
  return `M${x0} ${y0} C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${x1} ${y1}`;
};

/** Glowing stroke: a blurred halo under a crisp line. `draw` 0..1 reveals it along its length. */
export const Glow: React.FC<{ d: string; draw?: number; color?: string; w?: number; glow?: number; opacity?: number }> = ({ d, draw = 1, color = Y.hair, w = 2.2, glow = 1, opacity = 1 }) => (
  <g opacity={opacity}>
    <path d={d} stroke={color} strokeWidth={w * 5} fill="none" strokeLinecap="round" opacity={0.18 * glow} style={{ filter: "blur(8px)" }} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
    <path d={d} stroke={color} strokeWidth={w} fill="none" strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
  </g>
);

/** Window helper: 0 before a, ramps in, holds, ramps out after b. */
export const win = (t: number, a: number, b: number, fin = 0.8, fout = 0.8) => prog(t, a - fin, fin) * (1 - prog(t, b, fout));

/** Falling white hairs (title section, outro). */
export const HairRain: React.FC<{ t: number; t0: number; n?: number; speed?: number; opacity?: number }> = ({ t, t0, n = 60, speed = 1, opacity = 1 }) => (
  <svg width={1920} height={1080} style={{ position: "absolute", inset: 0, opacity }}>
    {new Array(n).fill(0).map((_, i) => {
      const depth = 0.3 + random(`d${i}`) * 0.7;
      const len = 60 + depth * 140;
      const x = random(`x${i}`) * 2000 - 40 + Math.sin((t - t0) * 0.4 + i) * 30 * depth;
      const y = ((random(`y${i}`) * 1400 + (t - t0) * (25 + depth * 55) * speed) % 1400) - 200;
      const rot = random(`r${i}`) * 360 + (t - t0) * (10 + random(`s${i}`) * 20) * (i % 2 ? 1 : -1);
      return (
        <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`} opacity={0.25 + depth * 0.6} style={{ filter: depth < 0.5 ? `blur(${(0.5 - depth) * 6}px)` : undefined }}>
          <path d={hairD(-len / 2, 0, len / 2, 0, 10 * depth, i)} stroke={Y.hair} strokeWidth={0.6 + depth * 1.4} fill="none" strokeLinecap="round" />
        </g>
      );
    })}
  </svg>
);
