import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { Mic } from "../components/Mic";
import { Waveform } from "../components/Waveform";
import { colors, content } from "../content";
import { headingFont } from "../fonts";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const IntroScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          flexDirection: "column",
          gap: 90,
        }}
      >
        <div
          style={{
            scale: interpolate(frame, [0, 30], [0.85, 1], { ...clamp, easing: ease }),
          }}
        >
          <Mic size={300} draw={interpolate(frame, [0, 40], [0, 1], { ...clamp, easing: ease })} />
        </div>
        <div style={{ opacity: interpolate(frame, [20, 45], [0, 1], clamp) }}>
          <Waveform width={760} maxHeight={180} />
        </div>
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 900,
            fontSize: 104,
            color: colors.text,
            direction: "rtl",
            textAlign: "center",
            opacity: interpolate(frame, [45, 70], [0, 1], clamp),
            translate: interpolate(frame, [45, 75], ["0px 50px", "0px 0px"], { ...clamp, easing: ease }),
          }}
        >
          {content.tagline}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
