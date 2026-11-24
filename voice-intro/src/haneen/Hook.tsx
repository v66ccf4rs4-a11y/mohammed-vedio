import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { Dust, Grain, Letterbox } from "./Atmosphere";
import { titleFont, verseFont } from "./fonts";
import { Landscape } from "./Landscape";
import { hook, palette } from "./poem";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// افتتاحية الفيديو: جملة تخاطب المغترب قبل بدء الإلقاء
export const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;
  const D = hook.duration;

  const fadeIn = interpolate(t, [0, 0.6], [0, 1], clamp);
  const fadeOut = interpolate(t, [D - 0.7, D - 0.05], [0, 1], { ...clamp, easing: Easing.in(Easing.quad) });
  const a = (d: number) => interpolate(t, [d, d + 1.1], [0, 1], { ...clamp, easing: ease });
  const l1 = a(0.35);
  const l2 = a(1.7);
  const line = a(1.3);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <AbsoluteFill style={{ filter: "brightness(0.55) blur(3px)", scale: 1.04 + t * 0.006 }}>
        <Landscape frame={frame} fps={fps} level={0} />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "radial-gradient(ellipse 60% 55% at 50% 48%, rgba(0,0,0,0.15), rgba(0,0,0,0.7))" }} />
      <Dust t={t} level={0} />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          direction: "rtl",
          paddingBottom: 30,
          filter: `blur(${fadeOut * 10}px)`,
          translate: `0px ${fadeOut * -24}px`,
        }}
      >
        <div
          style={{
            fontFamily: verseFont,
            fontWeight: 700,
            fontSize: 92,
            color: palette.text,
            opacity: l1,
            filter: `blur(${(1 - l1) * 12}px)`,
            translate: `0px ${(1 - l1) * 24}px`,
            textShadow: "0 4px 28px rgba(0,0,0,0.9)",
          }}
        >
          {hook.lines[0]}
        </div>
        <div style={{ height: 2, width: 440 * line, margin: "30px 0 26px", background: `linear-gradient(90deg, transparent, ${palette.gold}, transparent)` }} />
        <div
          style={{
            fontFamily: titleFont,
            fontSize: 124,
            color: palette.gold,
            opacity: l2,
            filter: `blur(${(1 - l2) * 14}px)`,
            scale: 0.94 + l2 * 0.06,
            textShadow: `0 0 ${20 + 20 * l2}px rgba(232,194,122,0.5), 0 6px 30px rgba(0,0,0,0.85)`,
          }}
        >
          {hook.lines[1]}
        </div>
      </AbsoluteFill>
      <Grain frame={frame} />
      <Letterbox progress={1} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: 1 - fadeIn + fadeOut }} />
    </AbsoluteFill>
  );
};
