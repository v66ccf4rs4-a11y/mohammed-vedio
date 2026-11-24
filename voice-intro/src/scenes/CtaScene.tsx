import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Mic } from "../components/Mic";
import { Waveform } from "../components/Waveform";
import { colors, content } from "../content";
import { bodyFont, headingFont } from "../fonts";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const CtaScene: React.FC = () => {
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
          gap: 50,
        }}
      >
        <Mic size={200} />
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 900,
            fontSize: 110,
            color: colors.text,
            opacity: interpolate(frame, [5, 25], [0, 1], clamp),
            translate: interpolate(frame, [5, 35], ["0px 40px", "0px 0px"], { ...clamp, easing: ease }),
          }}
        >
          {content.ctaHeading}
        </div>
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 700,
            fontSize: 76,
            color: colors.bgBottom,
            background: colors.gold,
            padding: "18px 64px",
            borderRadius: 100,
            direction: "ltr",
            opacity: interpolate(frame, [25, 45], [0, 1], clamp),
            scale: interpolate(frame, [25, 55], [0.8, 1], { ...clamp, easing: ease }),
          }}
        >
          {content.contact}
        </div>
        <div style={{ marginTop: 60, opacity: interpolate(frame, [40, 60], [0, 1], clamp) }}>
          <Waveform width={700} maxHeight={110} intensity={0.7} />
        </div>
        <div
          style={{
            fontFamily: bodyFont,
            fontWeight: 500,
            fontSize: 48,
            color: colors.muted,
            opacity: interpolate(frame, [55, 75], [0, 1], clamp),
          }}
        >
          {content.name} · {content.title}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
