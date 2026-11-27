import React from "react";
import { AbsoluteFill } from "remotion";
import { prog, useT } from "../time";

/** Renders children only inside [from, to) seconds with a soft zoom/fade at both edges. */
export const Scene: React.FC<{ from: number; to: number; children: React.ReactNode; fade?: number }> = ({ from, to, children, fade = 0.45 }) => {
  const t = useT();
  if (t < from - 0.01 || t >= to + fade) return null;
  const pin = prog(t, from, fade);
  const pout = prog(t, to, fade);
  const scale = 1.04 - 0.04 * pin + 0.03 * pout;
  return (
    <AbsoluteFill style={{ opacity: pin * (1 - pout), transform: `scale(${scale})`, filter: `blur(${pout * 8}px)` }}>
      {children}
    </AbsoluteFill>
  );
};
