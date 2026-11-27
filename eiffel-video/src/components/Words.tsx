import React from "react";
import { C, FONT_HEAD } from "../theme";
import { prog, useT } from "../time";

/** Word-by-word reveal (never splits Arabic letters, so shaping stays intact). */
export const Words: React.FC<{
  text: string;
  at: number;
  size?: number;
  color?: string;
  weight?: number;
  stagger?: number;
  font?: string;
  highlight?: string[];
  highlightColor?: string;
  style?: React.CSSProperties;
  out?: number;
}> = ({ text, at, size = 84, color = C.paper, weight = 900, stagger = 0.09, font = FONT_HEAD, highlight = [], highlightColor = C.gold, style, out }) => {
  const t = useT();
  const words = text.split(" ");
  const o = out !== undefined ? 1 - prog(t, out, 0.4) : 1;
  return (
    <div
      style={{
        direction: "rtl",
        fontFamily: font,
        fontSize: size,
        fontWeight: weight,
        color,
        lineHeight: 1.45,
        display: "flex",
        flexWrap: "wrap",
        gap: `0 ${size * 0.28}px`,
        opacity: o,
        ...style,
      }}
    >
      {words.map((w, i) => {
        const p = prog(t, at + i * stagger, 0.7);
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              transform: `translateY(${(1 - p) * size * 0.5}px)`,
              filter: `blur(${(1 - p) * 10}px)`,
              color: highlight.includes(w) ? highlightColor : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** Small uppercase-style kicker label with a gold rule. */
export const Kicker: React.FC<{ text: string; at: number; color?: string; out?: number }> = ({ text, at, color = C.gold, out }) => {
  const t = useT();
  const p = prog(t, at, 0.8);
  const o = out !== undefined ? 1 - prog(t, out, 0.4) : 1;
  return (
    <div style={{ direction: "rtl", display: "flex", alignItems: "center", gap: 20, opacity: p * o }}>
      <div style={{ width: 90 * p, height: 4, background: color, borderRadius: 2 }} />
      <div style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 38, color, transform: `translateX(${(1 - p) * -30}px)` }}>{text}</div>
    </div>
  );
};
