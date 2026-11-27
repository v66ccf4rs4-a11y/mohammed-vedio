import { AbsoluteFill, Img, staticFile } from "remotion";
import { prog, useT } from "../time";

export type Move = { from: [number, number, number]; to: [number, number, number] }; // [scale, xPct, yPct]
export type ShotDef = {
  src: string; // file in public/media
  start: number; // absolute seconds (film timeline)
  end: number;
  move?: Move;
  focus?: string; // object-position, e.g. "50% 40%"
  /** second image dissolving in over the same frame (match-cut) */
  morph?: { src: string; at: number; dur: number };
};

const FADE = 1.4;

/** One photograph with a slow cinematic camera move and soft dissolves at both ends. */
export const Shot: React.FC<{ s: ShotDef }> = ({ s }) => {
  const t = useT();
  if (t < s.start - FADE || t > s.end + FADE) return null;
  const opacity = prog(t, s.start - FADE, FADE) * (1 - prog(t, s.end, FADE));
  const span = s.end + FADE - (s.start - FADE);
  const p = Math.min(1, Math.max(0, (t - (s.start - FADE)) / span));
  const m = s.move ?? { from: [1.06, 0, 0], to: [1.16, 0, 0] };
  const sc = m.from[0] + (m.to[0] - m.from[0]) * p;
  const x = m.from[1] + (m.to[1] - m.from[1]) * p;
  const y = m.from[2] + (m.to[2] - m.from[2]) * p;
  const img = (src: string, o = 1) => (
    <Img
      src={staticFile(`media/${src}`)}
      style={{ position: "absolute", width: "100%", height: "100%", objectFit: "cover", objectPosition: s.focus ?? "50% 50%", opacity: o }}
    />
  );
  return (
    <AbsoluteFill style={{ opacity }}>
      <AbsoluteFill style={{ transform: `scale(${sc}) translate(${x}%, ${y}%)` }}>
        {img(s.src)}
        {s.morph && img(s.morph.src, prog(t, s.morph.at, s.morph.dur))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
