import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Waveform } from "../components/Waveform";
import { colors, content } from "../content";
import { bodyFont, headingFont } from "../fonts";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const NameScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          direction: "rtl",
        }}
      >
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 500,
            fontSize: 52,
            color: colors.muted,
            opacity: interpolate(frame, [0, 20], [0, 1], clamp),
          }}
        >
          أنا
        </div>
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 900,
            fontSize: 140,
            lineHeight: 1.3,
            color: colors.text,
            opacity: interpolate(frame, [5, 30], [0, 1], clamp),
            scale: interpolate(frame, [5, 40], [1.15, 1], { ...clamp, easing: ease }),
            letterSpacing: interpolate(frame, [5, 40], [30, 0], { ...clamp, easing: ease }),
          }}
        >
          {content.name}
        </div>
        <div
          style={{
            height: 8,
            borderRadius: 8,
            background: colors.gold,
            width: interpolate(frame, [30, 60], [0, 420], { ...clamp, easing: ease }),
            margin: "20px 0 40px",
          }}
        />
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 700,
            fontSize: 96,
            color: colors.gold,
            opacity: interpolate(frame, [45, 70], [0, 1], clamp),
            translate: interpolate(frame, [45, 75], ["0px 40px", "0px 0px"], { ...clamp, easing: ease }),
          }}
        >
          {content.title}
        </div>
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 220 }}>
        <Waveform width={800} maxHeight={120} intensity={0.8} opacity={0.5} />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
