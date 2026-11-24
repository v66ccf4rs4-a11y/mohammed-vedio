import { AbsoluteFill, interpolate, Easing } from "remotion";
import { Bayt, palette } from "./poem";
import { verseFont } from "./fonts";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const Line: React.FC<{
  text: string;
  t: number;
  start: number;
  end: number;
  goldLast?: boolean;
}> = ({ text, t, start, end, goldLast }) => {
  const words = text.split(" ");
  const span = Math.min(end - start, 5.5) * 0.62;
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        direction: "rtl",
        justifyContent: "center",
        gap: "0 0.32em",
        fontFamily: verseFont,
        fontWeight: 700,
        fontSize: 104,
        lineHeight: 1.55,
        color: palette.text,
        textShadow: "0 4px 28px rgba(0,0,0,0.85), 0 0 2px rgba(0,0,0,0.6)",
      }}
    >
      {words.map((w, i) => {
        const ws = start + (i * span) / words.length;
        const p = interpolate(t, [ws, ws + 0.9], [0, 1], { ...clamp, easing: ease });
        const isGold = goldLast && i === words.length - 1;
        return (
          <span
            key={i}
            style={{
              display: "inline-block",
              opacity: p,
              filter: `blur(${(1 - p) * 14}px)`,
              translate: `0px ${(1 - p) * 26}px`,
              color: isGold ? palette.gold : undefined,
              textShadow: isGold
                ? `0 0 ${18 + 14 * p}px rgba(232,194,122,0.55), 0 4px 28px rgba(0,0,0,0.85)`
                : undefined,
            }}
          >
            {w}
          </span>
        );
      })}
    </div>
  );
};

export const Verse: React.FC<{ bayt: Bayt; t: number; exitBy: number }> = ({ bayt, t, exitBy }) => {
  const exitStart = Math.min(bayt.end + 0.15, exitBy - 0.55);
  const out = interpolate(t, [exitStart, exitStart + 0.6], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  if (t < bayt.start - 0.2 || out >= 1) return null;
  const push = interpolate(t, [bayt.start, bayt.end + 0.6], [1, 1.035], clamp);
  const ornament = interpolate(t, [bayt.secondStart - 0.6, bayt.secondStart + 0.6], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        paddingBottom: 60,
        opacity: 1 - out,
        filter: `blur(${out * 12}px)`,
        translate: `0px ${out * -30}px`,
        scale: push + out * 0.03,
      }}
    >
      <Line text={bayt.first} t={t} start={bayt.start} end={bayt.secondStart} />
      <div style={{ display: "flex", alignItems: "center", gap: 18, margin: "6px 0 10px", opacity: ornament }}>
        <div style={{ height: 2, width: 160 * ornament, background: `linear-gradient(90deg, transparent, ${palette.gold})` }} />
        <div style={{ width: 12, height: 12, rotate: "45deg", background: palette.gold, boxShadow: `0 0 16px ${palette.gold}` }} />
        <div style={{ height: 2, width: 160 * ornament, background: `linear-gradient(270deg, transparent, ${palette.gold})` }} />
      </div>
      <Line text={bayt.second} t={t} start={bayt.secondStart} end={bayt.end} goldLast />
    </AbsoluteFill>
  );
};
