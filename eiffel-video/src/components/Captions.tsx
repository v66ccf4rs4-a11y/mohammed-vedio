import captions from "../data/captions.json";
import { C, FONT_BODY } from "../theme";
import { prog, useT } from "../time";

type Word = { text: string; start: number; end: number };
const MAX = 6;

// Split each spoken segment into readable chunks of at most MAX words.
const chunks: Word[][] = [];
for (const seg of captions as { words: Word[] }[]) {
  const n = Math.ceil(seg.words.length / MAX);
  const size = Math.ceil(seg.words.length / n);
  for (let i = 0; i < seg.words.length; i += size) chunks.push(seg.words.slice(i, i + size));
}

export const Captions: React.FC = () => {
  const t = useT();
  const idx = chunks.findIndex((c, i) => {
    const next = chunks[i + 1];
    const end = Math.min(c[c.length - 1].end + 0.6, next ? next[0].start : Infinity);
    return t >= c[0].start - 0.15 && t < end;
  });
  if (idx === -1) return null;
  const chunk = chunks[idx];
  const pin = prog(t, chunk[0].start - 0.15, 0.25);
  return (
    <div style={{ position: "absolute", bottom: 70, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
      <div
        style={{
          direction: "rtl",
          fontFamily: FONT_BODY,
          fontWeight: 800,
          fontSize: 46,
          padding: "10px 34px 16px",
          borderRadius: 18,
          background: "rgba(8,6,4,0.62)",
          border: "1px solid rgba(212,168,86,0.25)",
          display: "flex",
          gap: 20,
          opacity: pin,
          transform: `translateY(${(1 - pin) * 16}px)`,
        }}
      >
        {chunk.map((w, i) => {
          const active = t >= w.start && t < w.end + 0.05;
          const said = t >= w.start;
          return (
            <span key={i} style={{ color: active ? C.gold : said ? C.paper : "rgba(243,234,216,0.38)", transform: `scale(${active ? 1.08 : 1})`, display: "inline-block" }}>
              {w.text}
            </span>
          );
        })}
      </div>
    </div>
  );
};
