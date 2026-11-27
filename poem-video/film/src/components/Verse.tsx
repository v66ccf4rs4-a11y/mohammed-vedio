import { fitText } from "@remotion/layout-utils";
import verses from "../data/verses.json";
import { C, INTRO, NASKH } from "../theme";
import { prog, useT } from "../time";

type H = { text: string; start: number; end: number };
const V = (verses as { verse: number; start: number; end: number; hemistichs: H[] }[]).map((v) => ({
  ...v,
  start: v.start + INTRO,
  end: v.end + INTRO,
  hemistichs: v.hemistichs.map((h) => ({ ...h, start: h.start + INTRO, end: h.end + INTRO })),
}));

const COL = 800;

/** One hemistich written in with a right-to-left ink sweep. */
const Shatr: React.FC<{ h: H; side: "right" | "left" }> = ({ h, side }) => {
  const t = useT();
  const dur = Math.max(1.2, (h.end - h.start) * 0.85);
  const p = prog(t, h.start - 0.15, dur, (x) => x);
  const size = Math.min(62, fitText({ text: h.text, withinWidth: COL, fontFamily: NASKH, fontWeight: 700 }).fontSize);
  const edge = p * 130 - 15; // % of the sweep
  const mask = `linear-gradient(to left, #000 ${edge - 15}%, transparent ${edge + 5}%)`;
  return (
    <div
      style={{
        position: "absolute",
        bottom: 92,
        [side]: 120,
        width: COL,
        textAlign: "center",
        direction: "rtl",
        fontFamily: NASKH,
        fontWeight: 700,
        fontSize: size,
        lineHeight: 1.9,
        color: C.ivory,
        textShadow: "0 2px 18px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.9)",
        WebkitMaskImage: mask,
        maskImage: mask,
        whiteSpace: "nowrap",
      }}
    >
      {h.text}
    </div>
  );
};

export const Verses: React.FC = () => {
  const t = useT();
  const i = V.findIndex((v, k) => t >= v.start - 0.3 && t < (V[k + 1]?.start ?? v.end + 4) - 0.2);
  if (i === -1) return null;
  const v = V[i];
  const nextStart = V[i + 1]?.start ?? v.end + 3.5;
  const out = 1 - prog(t, nextStart - 0.9, 0.6);
  const lift = prog(t, nextStart - 0.9, 0.6) * -14;
  return (
    <div style={{ position: "absolute", inset: 0, opacity: out, transform: `translateY(${lift}px)` }}>
      <Shatr h={v.hemistichs[0]} side="right" />
      <Shatr h={v.hemistichs[1]} side="left" />
      {/* ornament between the hemistichs */}
      <div style={{ position: "absolute", bottom: 128, left: 940, width: 40, textAlign: "center", color: C.amber, fontSize: 30, opacity: 0.8 * prog(t, v.hemistichs[0].end - 0.2, 0.6) }}>۞</div>
    </div>
  );
};
