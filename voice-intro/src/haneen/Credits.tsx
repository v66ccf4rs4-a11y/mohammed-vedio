import { AbsoluteFill, Easing, interpolate } from "remotion";
import { credits, palette } from "./poem";
import { titleFont, verseFont } from "./fonts";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const Credits: React.FC<{ t: number }> = ({ t }) => {
  const s = credits.start;
  if (t < s) return null;
  const a = (d: number) => interpolate(t, [s + d, s + d + 1.2], [0, 1], { ...clamp, easing: ease });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", direction: "rtl", paddingBottom: 40 }}>
      <div
        style={{
          fontFamily: titleFont,
          fontSize: 118,
          color: palette.gold,
          opacity: a(0),
          filter: `blur(${(1 - a(0)) * 12}px)`,
          scale: 0.96 + a(0) * 0.04,
          textShadow: "0 0 30px rgba(232,194,122,0.45), 0 6px 30px rgba(0,0,0,0.8)",
        }}
      >
        {credits.title}
      </div>
      <div style={{ height: 2, width: 520 * a(0.5), margin: "26px 0 34px", background: `linear-gradient(90deg, transparent, ${palette.gold}, transparent)` }} />
      {[credits.poet, credits.voice].map((line, i) => (
        <div
          key={line}
          style={{
            fontFamily: verseFont,
            fontSize: 54,
            lineHeight: 1.7,
            color: palette.text,
            opacity: a(0.9 + i * 0.5) * 0.9,
            translate: `0px ${(1 - a(0.9 + i * 0.5)) * 20}px`,
            textShadow: "0 4px 24px rgba(0,0,0,0.85)",
          }}
        >
          {line}
        </div>
      ))}
    </AbsoluteFill>
  );
};
