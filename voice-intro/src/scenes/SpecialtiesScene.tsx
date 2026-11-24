import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { Background } from "../components/Background";
import { colors, content } from "../content";
import { bodyFont, headingFont } from "../fonts";

const ease = Easing.bezier(0.16, 1, 0.3, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

export const SpecialtiesScene: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Background />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          padding: "0 110px",
          direction: "rtl",
          gap: 56,
        }}
      >
        <div
          style={{
            fontFamily: headingFont,
            fontWeight: 900,
            fontSize: 120,
            color: colors.text,
            marginBottom: 30,
            opacity: interpolate(frame, [0, 20], [0, 1], clamp),
            translate: interpolate(frame, [0, 30], ["0px 40px", "0px 0px"], { ...clamp, easing: ease }),
          }}
        >
          {content.specialtiesHeading}
          <span style={{ color: colors.gold }}>.</span>
        </div>
        {content.specialties.map((item, i) => {
          const start = 25 + i * 22;
          return (
            <div
              key={item}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 36,
                opacity: interpolate(frame, [start, start + 18], [0, 1], clamp),
                translate: interpolate(frame, [start, start + 28], ["-80px 0px", "0px 0px"], { ...clamp, easing: ease }),
              }}
            >
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: 26,
                  background: colors.gold,
                  boxShadow: `0 0 30px ${colors.gold}`,
                  flexShrink: 0,
                }}
              />
              <div
                style={{
                  fontFamily: bodyFont,
                  fontWeight: 700,
                  fontSize: 72,
                  color: colors.text,
                }}
              >
                {item}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
