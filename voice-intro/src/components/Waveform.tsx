import { useCurrentFrame } from "remotion";
import { colors } from "../content";

// موجة صوتية متحركة (تولَّد رياضياً، بدون ملف صوت)
export const Waveform: React.FC<{
  bars?: number;
  width: number;
  maxHeight: number;
  intensity?: number;
  opacity?: number;
}> = ({ bars = 40, width, maxHeight, intensity = 1, opacity = 1 }) => {
  const frame = useCurrentFrame();
  const gap = 8;
  const barWidth = (width - gap * (bars - 1)) / bars;
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap,
        width,
        height: maxHeight,
        opacity,
      }}
    >
      {new Array(bars).fill(0).map((_, i) => {
        const center = 1 - Math.abs(i - (bars - 1) / 2) / (bars / 2);
        const wave =
          0.5 +
          0.3 * Math.sin(frame * 0.18 + i * 0.55) +
          0.2 * Math.sin(frame * 0.31 - i * 1.3);
        const h = Math.max(
          barWidth,
          maxHeight * intensity * (0.15 + 0.85 * center) * wave,
        );
        return (
          <div
            key={i}
            style={{
              width: barWidth,
              height: h,
              borderRadius: barWidth,
              background: colors.gold,
              opacity: 0.35 + 0.65 * center,
            }}
          />
        );
      })}
    </div>
  );
};
