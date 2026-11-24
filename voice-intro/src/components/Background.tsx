import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { colors } from "../content";

export const Background: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(180deg, ${colors.bgTop} 0%, ${colors.bgBottom} 100%)`,
      }}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 50% ${interpolate(
            Math.sin(frame / 60),
            [-1, 1],
            [35, 45],
          )}%, ${colors.goldSoft} 0%, transparent 55%)`,
        }}
      />
    </AbsoluteFill>
  );
};
