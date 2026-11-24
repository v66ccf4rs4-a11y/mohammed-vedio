import { Easing, interpolate } from "remotion";
import { Cap, Theme } from "./data";
import { bodyFont, headingFont } from "../fonts";
import { verseFont } from "../haneen/fonts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const overshoot = Easing.bezier(0.34, 1.56, 0.64, 1);
const smooth = Easing.bezier(0.16, 1, 0.3, 1);

const fontFor = (f: Theme["font"]) => (f === "amiri" ? verseFont : f === "tajawal" ? bodyFont : headingFont);

// تقسيم الجمل الطويلة إلى مقاطع قصيرة متزامنة مع الكلام
const chunk = (caps: Cap[]): Cap[] => {
  const out: Cap[] = [];
  for (const c of caps) {
    const words = c.text.split(" ");
    if (words.length <= 5) {
      out.push(c);
      continue;
    }
    const n = Math.ceil(words.length / 4);
    const size = Math.ceil(words.length / n);
    const total = c.text.replace(/ /g, "").length;
    let acc = 0;
    for (let i = 0; i < words.length; i += size) {
      const part = words.slice(i, i + size);
      const len = part.join("").length;
      out.push({
        s: c.s + (acc / total) * (c.e - c.s),
        e: c.s + ((acc + len) / total) * (c.e - c.s),
        text: part.join(" "),
        emph: c.emph,
      });
      acc += len;
    }
  }
  return out;
};

const Word: React.FC<{ w: string; p: number; theme: Theme; emph: boolean; t: number; ws: number }> = ({
  w,
  p,
  theme,
  emph,
  t,
  ws,
}) => {
  const style = theme.style;
  let extra: React.CSSProperties = {};
  if (style === "pop") {
    const q = interpolate(p, [0, 1], [0, 1], { ...clamp, easing: overshoot });
    extra = { opacity: Math.min(1, p * 2), scale: 0.4 + 0.6 * q, translate: `0px ${(1 - q) * 50}px` };
  } else if (style === "elegant") {
    const q = interpolate(p, [0, 1], [0, 1], { ...clamp, easing: smooth });
    extra = { opacity: q, filter: `blur(${(1 - q) * 14}px)`, translate: `0px ${(1 - q) * 24}px` };
  } else if (style === "slam") {
    const q = interpolate(t, [ws, ws + 0.16], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
    const shake = emph ? Math.sin(t * 90) * 6 * interpolate(t, [ws + 0.12, ws + 0.45], [1, 0], clamp) : 0;
    extra = { opacity: q, scale: 1.9 - 0.9 * q, translate: `${shake}px 0px` };
  } else {
    const q = interpolate(p, [0, 1], [0, 1], { ...clamp, easing: smooth });
    extra = { opacity: q, translate: `${(1 - q) * -40}px 0px`, filter: `blur(${(1 - q) * 6}px)` };
  }
  return (
    <span
      style={{
        display: "inline-block",
        color: emph ? theme.accent : theme.text,
        fontSize: emph ? "1.12em" : "1em",
        textShadow: emph && theme.style !== "pop" ? `0 0 28px ${theme.accent}88` : undefined,
        ...extra,
      }}
    >
      {w}
    </span>
  );
};

export const Captions: React.FC<{ caps: Cap[]; theme: Theme; t: number; top?: number; size?: number }> = ({
  caps,
  theme,
  t,
  top = 1150,
  size = 96,
}) => {
  const list = chunk(caps);
  return (
    <>
      {list.map((c, i) => {
        const next = list[i + 1]?.s ?? c.e + 1.2;
        const hideAt = Math.min(next - 0.05, c.e + 1.2);
        if (t < c.s - 0.15 || t > hideAt) return null;
        const out = interpolate(t, [hideAt - 0.22, hideAt], [0, 1], clamp);
        const words = c.text.split(" ");
        const total = c.text.replace(/ /g, "").length;
        let acc = 0;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              top,
              left: 80,
              right: 80,
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "center",
              alignItems: "baseline",
              gap: "0.1em 0.28em",
              direction: "rtl",
              fontFamily: fontFor(theme.font),
              fontWeight: theme.font === "amiri" ? 700 : 900,
              fontSize: (theme.font === "amiri" ? size * 1.15 : size) * (words.length <= 2 ? 1.3 : 1),
              lineHeight: theme.font === "amiri" ? 1.6 : 1.35,
              opacity: 1 - out,
              translate: `0px ${out * -30}px`,
              textShadow: theme.style === "pop" && theme.text.startsWith("#3") ? undefined : "0 6px 30px rgba(0,0,0,0.55)",
            }}
          >
            {words.map((w, j) => {
              const ws = c.s + (acc / total) * (c.e - c.s) * 0.85;
              acc += w.length;
              const p = interpolate(t, [ws - 0.05, ws + 0.35], [0, 1], clamp);
              return <Word key={j} w={w} p={p} theme={theme} emph={!!c.emph?.includes(w)} t={t} ws={ws} />;
            })}
          </div>
        );
      })}
    </>
  );
};
