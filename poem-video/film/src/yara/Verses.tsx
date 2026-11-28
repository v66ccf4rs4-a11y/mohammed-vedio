import data from "../data/yara.json";
import { NASKH } from "../theme";
import { prog, useT } from "../time";
import { Y } from "./kit";

type W = { w: string; t: number };
type V = { verse: number; start: number; end: number; h: { start: number; end: number; words: W[] }[] };
const VS = data as V[];

const strip = (s: string) => s.replace(/[ً-ْ!؟?:.،]/g, "");
const ACCENT: Record<string, string> = {
  يارا: Y.rose, دميتي: Y.rose, المشيب: "#ffffff", الشيب: "#ffffff", انفطرا: Y.blood, حربا: Y.gold,
  الأربعون: Y.gold, أدمت: Y.blood, انقشعت: Y.gold, عبرا: Y.gold, الألوان: Y.gold, منحدرا: Y.gold, الطهر: "#ffffff", انتحرا: Y.blood,
};

const Line: React.FC<{ words: W[]; t: number; size: number }> = ({ words, t, size }) => (
  <div style={{ direction: "rtl", display: "flex", justifyContent: "center", gap: `0 ${size * 0.3}px`, flexWrap: "nowrap", fontSize: size, lineHeight: 1.75 }}>
    {words.map((w, i) => {
      const p = prog(t, w.t - 0.12, 0.55);
      const acc = ACCENT[strip(w.w)];
      const lit = acc ? prog(t, w.t, 0.4) : 0;
      return (
        <span
          key={i}
          style={{
            display: "inline-block",
            opacity: 0.12 + 0.88 * p,
            transform: `translateY(${(1 - p) * 14}px)`,
            filter: `blur(${(1 - p) * 6}px)`,
            color: acc && lit > 0 ? acc : Y.hair,
            textShadow: acc ? `0 0 ${24 * lit}px ${acc}88, 0 2px 14px rgba(0,0,0,0.9)` : "0 2px 14px rgba(0,0,0,0.9)",
          }}
        >
          {w.w}
        </span>
      );
    })}
  </div>
);

export const YaraVerses: React.FC = () => {
  const t = useT();
  const i = VS.findIndex((v, k) => t >= v.start - 0.5 && t < (VS[k + 1] && VS[k + 1].start - v.end < 3 ? VS[k + 1].start - 0.25 : v.end + 1.6));
  if (i === -1) return null;
  const v = VS[i];
  const nextStart = VS[i + 1] && VS[i + 1].start - v.end < 3 ? VS[i + 1].start : v.end + 2.2;
  const o = prog(t, v.start - 0.5, 0.4) * (1 - prog(t, nextStart - 0.65, 0.4));
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 680, opacity: o, fontFamily: NASKH, fontWeight: 700, display: "flex", flexDirection: "column", gap: 4 }}>
      <Line words={v.h[0].words} t={t} size={60} />
      <Line words={v.h[1].words} t={t} size={60} />
    </div>
  );
};
