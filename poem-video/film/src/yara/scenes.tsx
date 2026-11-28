import React from "react";
import { AbsoluteFill, interpolate, random } from "remotion";
import { NASKH, SANS, CHANNEL } from "../theme";
import { prog } from "../time";
import { Glow, HairRain, Y, hairD, win } from "./kit";

const CX = 960;
const CY = 400; // visual centre (verses sit below)

/** Fade wrapper: shows children only inside [a,b]. */
export const Win: React.FC<{ t: number; a: number; b: number; fin?: number; fout?: number; children: React.ReactNode }> = ({ t, a, b, fin = 0.8, fout = 0.8, children }) => {
  const o = win(t, a, b, fin, fout);
  if (o <= 0) return null;
  return <AbsoluteFill style={{ opacity: o }}>{children}</AbsoluteFill>;
};

/** A hair is drawn, two warm fingertips pluck it, it floats away. */
export const Pluck: React.FC<{ t: number; draw: number; pluck: number; laugh: number; scale?: number }> = ({ t, draw, pluck, laugh, scale = 1 }) => {
  const d0 = prog(t, draw, 2.6);
  const fin = prog(t, pluck - 0.9, 0.9);
  const lift = prog(t, pluck, 4.5, (x) => x);
  const L = 520 * scale;
  const wave = 34 * scale;
  const y = -lift * 420;
  const rot = lift * -38;
  const sparkle = prog(t, laugh, 0.4) * (1 - prog(t, laugh + 0.6, 1.2));
  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <g transform={`translate(${CX} ${CY + y}) rotate(${rot})`}>
        <Glow d={hairD(-L, 20, L, -20, wave, t * 0.6)} draw={d0} w={2.4 * scale} glow={1.3} opacity={1 - prog(t, pluck + 3.5, 1.2)} />
      </g>
      {/* fingertips: two soft warm lights closing on the hair */}
      {[-1, 1].map((s) => (
        <circle
          key={s}
          cx={CX + 180 * scale + s * (60 - 44 * fin) * scale}
          cy={CY + y * (t > pluck ? 1 : 0) - 30 * s * (1 - fin)}
          r={18 * scale}
          fill={Y.rose}
          opacity={0.55 * fin * (1 - prog(t, pluck + 1.2, 0.8))}
          style={{ filter: "blur(10px)" }}
        />
      ))}
      {/* laughter: a ripple of tiny sparks */}
      {new Array(14).fill(0).map((_, i) => {
        const a = (i / 14) * Math.PI * 2;
        const r = 40 + sparkle * 160 + random(`l${i}`) * 40;
        return <circle key={i} cx={CX + 180 * scale + Math.cos(a) * r} cy={CY - 140 + Math.sin(a) * r * 0.6} r={2.5} fill={Y.gold} opacity={sparkle * 0.9} />;
      })}
    </svg>
  );
};

export const Title: React.FC<{ t: number }> = ({ t }) => (
  <AbsoluteFill>
    <HairRain t={t} t0={11} n={70} speed={0.6} />
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <div style={{ fontFamily: NASKH, fontWeight: 700, fontSize: 150, color: Y.hair, direction: "rtl", opacity: prog(t, 13.5, 2.5), letterSpacing: 2, textShadow: "0 0 40px rgba(246,242,234,0.25)", transform: `scale(${1 + (t - 13) * 0.004})` }}>
        يارا والشَّعَراتُ البيض
      </div>
      <div style={{ width: 300 * prog(t, 17, 2), height: 1.5, background: Y.gold, margin: "18px 0 26px" }} />
      <div style={{ fontFamily: NASKH, fontSize: 52, color: Y.gold, opacity: prog(t, 18.5, 2), direction: "rtl" }}>غازي القصيبي</div>
    </AbsoluteFill>
  </AbsoluteFill>
);

/** v2: the grey she can't see — a veil lifts off a field of hidden white hairs. */
export const Hidden: React.FC<{ t: number }> = ({ t }) => {
  const reveal = prog(t, 55.2, 1.6);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {new Array(46).fill(0).map((_, i) => {
        const x = 200 + random(`hx${i}`) * 1520;
        const y = 90 + random(`hy${i}`) * 500;
        const L = 50 + random(`hl${i}`) * 70;
        const a = random(`ha${i}`) * Math.PI;
        const d = hairD(x - Math.cos(a) * L, y - Math.sin(a) * L, x + Math.cos(a) * L, y + Math.sin(a) * L, 12, i + t * 0.3);
        // a few are visible from the start (the ones she plucks), the rest surface on «استترا»
        const vis = i < 6 ? 1 - prog(t, 50.8 + i * 0.25, 0.5) : reveal * (0.35 + random(`ho${i}`) * 0.6);
        return <Glow key={i} d={d} w={1.1} glow={0.5} opacity={vis * 0.85} />;
      })}
    </svg>
  );
};

/** v3: heartbeat that tires, then breaks. */
export const Heart: React.FC<{ t: number }> = ({ t }) => {
  const tired = prog(t, 60.3, 1.5);
  const brk = prog(t, 65.5, 0.25);
  const fall = prog(t, 65.6, 1.6);
  const pts: string[] = [];
  const head = Math.min(1, (t - 57) / 4.5);
  for (let x = 0; x <= 1600; x += 8) {
    const ph = ((x / 1600) * 4 + t * 0.9) % 1;
    const amp = 140 * (1 - tired * 0.75);
    const beat = ph > 0.45 && ph < 0.55 ? Math.sin(((ph - 0.45) / 0.1) * Math.PI * 2) * amp : 0;
    pts.push(`${160 + x} ${CY + beat}`);
  }
  const d = "M" + pts.join(" L");
  const crack = `M${CX - 30} ${CY - 120} L${CX + 10} ${CY - 30} L${CX - 20} ${CY + 30} L${CX + 25} ${CY + 130}`;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs>
        <clipPath id="lh"><rect x={0} y={0} width={CX} height={1080} /></clipPath>
        <clipPath id="rh"><rect x={CX} y={0} width={960} height={1080} /></clipPath>
      </defs>
      <g clipPath="url(#lh)" transform={`translate(${-fall * 60} ${fall * 260}) rotate(${-fall * 8} ${CX} ${CY})`}>
        <Glow d={d} draw={head} w={2.4} color={brk > 0 ? Y.blood : Y.hair} />
      </g>
      <g clipPath="url(#rh)" transform={`translate(${fall * 60} ${fall * 300}) rotate(${fall * 10} ${CX} ${CY})`}>
        <Glow d={d} draw={head} w={2.4} color={brk > 0 ? Y.blood : Y.hair} />
      </g>
      <Glow d={crack} draw={brk} color={Y.hair} w={3} glow={2} opacity={1 - prog(t, 66, 0.8)} />
    </svg>
  );
};

/** v4: the days wage war — flying strands from both sides, then a frozen question. */
export const War: React.FC<{ t: number }> = ({ t }) => {
  const freeze = prog(t, 74.7, 0.3);
  const tt = t - freeze * (t - 74.8);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        {new Array(46).fill(0).map((_, i) => {
          const side = i % 2 ? 1 : -1;
          const sp = 500 + random(`ws${i}`) * 700;
          const y = 80 + random(`wy${i}`) * 620;
          const born = 66.5 + random(`wb${i}`) * 7.5;
          if (tt < born) return null;
          const x = side < 0 ? -200 + (tt - born) * sp : 2120 - (tt - born) * sp;
          const L = 90 + random(`wl${i}`) * 120;
          return (
            <g key={i} opacity={0.5 + random(`wo${i}`) * 0.5}>
              <line x1={x} y1={y} x2={x - side * L} y2={y + side * 6} stroke={Y.hair} strokeWidth={1.6} strokeLinecap="round" />
              <path d={`M${x} ${y} l${-side * 14} -6 l0 12 z`} fill={Y.hair} />
            </g>
          );
        })}
      </svg>
      {/* days ticking under the battle */}
      <div style={{ position: "absolute", top: 210, width: "100%", textAlign: "center", direction: "rtl", fontFamily: SANS, fontWeight: 800, fontSize: 210, color: "rgba(246,242,234,0.07)", letterSpacing: 10 }}>
        {Math.floor(interpolate(tt, [66.3, 74.8], [1, 14600], { extrapolateRight: "clamp" })).toLocaleString("ar-EG")} يوم
      </div>
      <div style={{ position: "absolute", top: 120, width: "100%", textAlign: "center", fontFamily: NASKH, fontWeight: 700, fontSize: 300, color: Y.gold, opacity: freeze * 0.85, transform: `scale(${0.8 + 0.2 * freeze})` }}>؟</div>
    </AbsoluteFill>
  );
};

/** v5: a giant ٤٠ besieged by spears that close in and draw blood. */
export const Forty: React.FC<{ t: number }> = ({ t }) => {
  const appear = prog(t, 77.7, 1.4);
  const close = prog(t, 79.2, 3.2);
  const tighten = prog(t, 82.2, 1.2);
  const bleed = prog(t, 83.7, 2);
  const R = 520 - close * 230 - tighten * 70;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      <defs>
        <linearGradient id="bl" x1="0" x2="0" y1="1" y2="0">
          <stop offset={bleed} stopColor={Y.blood} />
          <stop offset={Math.min(1, bleed + 0.02)} stopColor="transparent" />
        </linearGradient>
      </defs>
      <text x={CX} y={CY + 120} textAnchor="middle" fontFamily={NASKH} fontWeight={700} fontSize={380} fill="url(#bl)" stroke={Y.hair} strokeWidth={2} opacity={appear}>
        ٤٠
      </text>
      {new Array(28).fill(0).map((_, i) => {
        const a = (i / 28) * Math.PI * 2 + 0.1;
        const r = R + (i % 2) * 40;
        const x = CX + Math.cos(a) * r;
        const y = CY + Math.sin(a) * r * 0.72;
        const L = 150;
        const tx = CX + Math.cos(a) * (r + L);
        const ty = CY + Math.sin(a) * (r + L) * 0.72;
        const tip = `M${x} ${y} L${x + Math.cos(a + 2.7) * 18} ${y + Math.sin(a + 2.7) * 18} L${x + Math.cos(a - 2.7) * 18} ${y + Math.sin(a - 2.7) * 18} Z`;
        const o = prog(t, 77.74 + i * 0.05, 0.6);
        const red = prog(t, 83.7 + (i % 5) * 0.1, 0.6);
        return (
          <g key={i} opacity={o}>
            <line x1={x} y1={y} x2={tx} y2={ty} stroke={Y.hair} strokeWidth={2} />
            <path d={tip} fill={red > 0.5 ? Y.blood : Y.hair} />
          </g>
        );
      })}
    </svg>
  );
};

/** v6: a world of dust that scatters; a dream crosses the sky like a comet. */
export const World: React.FC<{ t: number }> = ({ t }) => {
  const scatter = prog(t, 88.2, 2.2);
  const comet = prog(t, 90.4, 2.2, (x) => x);
  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {new Array(420).fill(0).map((_, i) => {
        const u = random(`gu${i}`) * 2 - 1;
        const th = random(`gt${i}`) * Math.PI * 2 + t * 0.15;
        const s = Math.sqrt(1 - u * u);
        const x = s * Math.cos(th);
        const z = s * Math.sin(th);
        const R = 230;
        const px = CX + x * R + scatter * (x * 900 + (random(`gx${i}`) - 0.5) * 600);
        const py = CY + u * R + scatter * (u * 500 + random(`gy${i}`) * 300);
        const front = (z + 1) / 2;
        return <circle key={i} cx={px} cy={py} r={1 + front * 2.2} fill={Y.hair} opacity={(0.2 + front * 0.8) * (1 - scatter * 0.9)} />;
      })}
      {comet > 0 && comet < 1 && (
        <g>
          <line x1={1900 - comet * 2200} y1={140 + comet * 260} x2={1900 - comet * 2200 + 380} y2={140 + comet * 260 - 45} stroke="url(#cg)" strokeWidth={3} />
          <defs>
            <linearGradient id="cg" x1="0" x2="1">
              <stop offset="0" stopColor={Y.hair} />
              <stop offset="1" stopColor="transparent" />
            </linearGradient>
          </defs>
          <circle cx={1900 - comet * 2200} cy={140 + comet * 260} r={7} fill={Y.hair} style={{ filter: "drop-shadow(0 0 12px #fff)" }} />
        </g>
      )}
    </svg>
  );
};

/** v7: colours drain to grey, then the line tilts into a slope and a soul rolls down. */
export const Slope: React.FC<{ t: number }> = ({ t }) => {
  const drain = prog(t, 94.5, 1.8);
  const tilt = prog(t, 96.6, 1.6);
  const roll = prog(t, 98.6, 2.2, (x) => x * x);
  const x0 = 360;
  const x1 = 1560;
  const y0 = CY - tilt * 230;
  const y1 = CY + tilt * 230;
  const bx = x0 + 80 + roll * (x1 - x0 + 200);
  const by = y0 - 26 + ((bx - x0) / (x1 - x0)) * (y1 - y0) + (bx > x1 ? (bx - x1) ** 1.6 * 0.4 : 0);
  return (
    <AbsoluteFill>
      <AbsoluteFill
        style={{
          background: "radial-gradient(ellipse at 30% 30%, #e07a5f, transparent 55%), radial-gradient(ellipse at 70% 40%, #3d9aa1, transparent 55%), radial-gradient(ellipse at 50% 70%, #f2cc8f, transparent 60%)",
          opacity: 0.55 * (1 - prog(t, 96.2, 1)),
          filter: `saturate(${1 - drain}) blur(30px)`,
        }}
      />
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <Glow d={`M${x0} ${y0} L${x1} ${y1}`} draw={prog(t, 96.4, 0.8)} w={2.4} />
        <circle cx={bx} cy={by} r={22} fill={Y.hair} opacity={prog(t, 97, 0.6) * (1 - prog(t, 100.4, 0.8))} style={{ filter: "drop-shadow(0 0 14px rgba(255,255,255,0.6))" }} />
      </svg>
    </AbsoluteFill>
  );
};

/** v8: tears fall; the purest white line appears — and snaps. */
export const Purity: React.FC<{ t: number }> = ({ t }) => {
  const tear = (at: number, x: number) => {
    const f = prog(t, at, 1.4, (v) => v * v);
    const ripple = prog(t, at + 1.4, 1.5);
    return (
      <g key={at}>
        <path d={`M${x} ${60 + f * 540} q -30 55 0 84 q 30 -29 0 -84`} style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.5))" }} fill={Y.hair} opacity={prog(t, at - 0.2, 0.3) * (1 - prog(t, at + 1.35, 0.1))} />
        <ellipse cx={x} cy={640} rx={ripple * 220} ry={ripple * 26} fill="none" stroke={Y.hair} strokeWidth={1.5} opacity={(1 - ripple) * 0.8} />
      </g>
    );
  };
  const appear = prog(t, 108.6, 1);
  const snap = prog(t, 110.3, 0.2);
  const fall = prog(t, 110.4, 2.6, (v) => v * v);
  const L = 520;
  return (
    <svg width={1920} height={1080} style={{ position: "absolute" }}>
      {tear(103.0, 820)}
      {tear(107.5, 1100)}
      <g opacity={appear}>
        <g transform={`translate(${-fall * 80} ${fall * 700}) rotate(${-fall * 40} ${CX} ${CY})`}>
          <Glow d={hairD(CX - L, CY, CX - 4 * snap, CY, 24, 0.5)} w={3} glow={2.2} />
        </g>
        <g transform={`translate(${fall * 80} ${fall * 760}) rotate(${fall * 55} ${CX} ${CY})`}>
          <Glow d={hairD(CX + 4 * snap, CY, CX + L, CY, 24, 2)} w={3} glow={2.2} />
        </g>
        <circle cx={CX} cy={CY} r={6 + snap * 40} fill="none" stroke={Y.hair} opacity={snap * (1 - prog(t, 110.5, 0.6))} />
      </g>
    </svg>
  );
};

export const Outro: React.FC<{ t: number }> = ({ t }) => {
  const fall = prog(t, 111.5, 12, (x) => x);
  return (
    <AbsoluteFill>
      <svg width={1920} height={1080} style={{ position: "absolute" }}>
        <g transform={`translate(${CX + Math.sin(t * 0.7) * 60} ${-100 + fall * 1300}) rotate(${t * 18})`}>
          <Glow d={hairD(-90, 0, 90, 0, 14, 1)} w={2} glow={1.4} />
        </g>
      </svg>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 8 }}>
        <div style={{ fontFamily: NASKH, fontWeight: 700, fontSize: 96, color: Y.hair, opacity: win(t, 114.5, 127.5, 1.5, 1.5), direction: "rtl" }}>يارا والشَّعَراتُ البيض</div>
        <div style={{ fontFamily: NASKH, fontSize: 46, color: Y.gold, opacity: win(t, 116, 127.5, 1.5, 1.5) }}>غازي القصيبي</div>
        <div style={{ marginTop: 40, fontFamily: SANS, fontWeight: 700, fontSize: 32, color: Y.dim, opacity: win(t, 118, 127.5, 1.5, 1.5) }}>{CHANNEL}</div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
