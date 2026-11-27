import React from "react";
import { C } from "../theme";

type Pt = [number, number];
type Seg = { d: string; y: number; w: number };
const CX = 200;
const q = (a: Pt, c: Pt, b: Pt, t: number): Pt => [
  (1 - t) ** 2 * a[0] + 2 * (1 - t) * t * c[0] + t * t * b[0],
  (1 - t) ** 2 * a[1] + 2 * (1 - t) * t * c[1] + t * t * b[1],
];
const line = (a: Pt, b: Pt) => `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
const mirror = (p: Pt): Pt => [2 * CX - p[0], p[1]];

// Build the line-art Eiffel Tower once. Each segment carries its lowest y so it can be "built" bottom-up.
const segs: Seg[] = [];
const add = (d: string, y: number, w = 2) => segs.push({ d, y, w });
const curveSide = (a: Pt, c: Pt, b: Pt, w = 3.2) => {
  for (const s of [1, -1]) {
    const f = (p: Pt): Pt => (s === 1 ? p : mirror(p));
    add(`M${f(a)[0]} ${f(a)[1]} Q${f(c)[0]} ${f(c)[1]} ${f(b)[0]} ${f(b)[1]}`, a[1], w);
  }
};
const lattice = (oa: Pt, oc: Pt, ob: Pt, ia: Pt | null, ic: Pt | null, ib: Pt | null, n: number) => {
  const ts = new Array(n + 1).fill(0).map((_, i) => 1 - (1 - i / n) ** 1.25);
  for (let i = 0; i < n; i++) {
    const o0 = q(oa, oc, ob, ts[i]);
    const o1 = q(oa, oc, ob, ts[i + 1]);
    const i0 = ia ? q(ia, ic!, ib!, ts[i]) : mirror(o0);
    const i1 = ia ? q(ia, ic!, ib!, ts[i + 1]) : mirror(o1);
    const sides = ia ? [1, -1] : [1];
    for (const s of sides) {
      const f = (p: Pt): Pt => (s === 1 ? p : mirror(p));
      add(line(f(o0), f(i1)), o0[1], 1.3);
      add(line(f(i0), f(o1)), o0[1], 1.3);
      add(line(f(o1), f(i1)), o1[1], 1.6);
    }
  }
};

// Legs (base → 1st platform)
const LO: [Pt, Pt, Pt] = [[20, 780], [95, 660], [102, 565]];
const LI: [Pt, Pt, Pt] = [[95, 780], [140, 670], [146, 565]];
curveSide(...LO);
curveSide(...LI);
lattice(...LO, ...LI, 6);
// Arch under the first platform
add(`M${LI[0][0]} ${LI[0][1]} Q200 520 ${2 * CX - LI[0][0]} ${LI[0][1]}`, 780, 2.6);
add(`M${LI[0][0] + 12} 780 Q200 545 ${2 * CX - LI[0][0] - 12} 780`, 780, 1.2);
// First platform
add(line([88, 548], [312, 548]), 565, 3);
add(line([88, 565], [312, 565]), 565, 3);
for (let x = 92; x <= 308; x += 18) add(line([x, 548], [x + 9, 565]), 565, 1);
// Mid section (1st → 2nd platform)
const MO: [Pt, Pt, Pt] = [[105, 548], [125, 470], [134, 405]];
curveSide(...MO);
lattice(...MO, null, null, null, 5);
// Second platform
add(line([124, 392], [276, 392]), 405, 3);
add(line([124, 405], [276, 405]), 405, 3);
// Upper shaft (2nd platform → top)
const UO: [Pt, Pt, Pt] = [[140, 392], [178, 250], [189, 132]];
curveSide(...UO);
lattice(...UO, null, null, null, 11);
// Top lantern + antenna
add(line([182, 132], [218, 132]), 132, 3);
add(`M184 132 L186 104 L214 104 L216 132`, 132, 2.4);
add(`M190 104 Q200 84 210 104`, 104, 2.4);
add(line([200, 92], [200, 18]), 92, 2.6);

const YMIN = 18;
const YMAX = 780;

/** Line-art tower. `build` 0..1 draws it from the ground up. */
export const Tower: React.FC<{ build: number; height: number; color?: string; glow?: number; style?: React.CSSProperties }> = ({ build, height, color = C.gold, glow = 0, style }) => {
  return (
    <svg viewBox="0 0 400 800" height={height} width={height / 2} style={{ overflow: "visible", ...style }}>
      <defs>
        <filter id="tglow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>
      {[glow > 0 ? "glow" : null, "main"].filter(Boolean).map((layer) => (
        <g key={layer!} filter={layer === "glow" ? "url(#tglow)" : undefined} opacity={layer === "glow" ? glow : 1}>
          {segs.map((s, i) => {
            const start = ((YMAX - s.y) / (YMAX - YMIN)) * 0.8;
            const p = Math.max(0, Math.min(1, (build - start) / 0.2));
            if (p <= 0) return null;
            return (
              <path
                key={i}
                d={s.d}
                stroke={color}
                strokeWidth={s.w}
                fill="none"
                strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - p}
              />
            );
          })}
        </g>
      ))}
      <line x1={-40} x2={440} y1={781} y2={781} stroke={color} strokeWidth={2} opacity={0.5 * Math.min(1, build * 5)} />
    </svg>
  );
};
