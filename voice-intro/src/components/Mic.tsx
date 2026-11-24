import { colors } from "../content";

export const Mic: React.FC<{ size: number; draw?: number }> = ({
  size,
  draw = 1,
}) => {
  const len = 400;
  const dash = { strokeDasharray: len, strokeDashoffset: len * (1 - draw) };
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none">
      <rect
        x="42" y="10" width="36" height="62" rx="18"
        stroke={colors.gold} strokeWidth="5" style={dash}
      />
      {[28, 38, 48].map((y) => (
        <line
          key={y} x1="50" x2="70" y1={y} y2={y}
          stroke={colors.gold} strokeWidth="3" strokeLinecap="round"
          opacity={draw}
        />
      ))}
      <path
        d="M30 56 C30 80 45 90 60 90 C75 90 90 80 90 56"
        stroke={colors.gold} strokeWidth="5" strokeLinecap="round" style={dash}
      />
      <line
        x1="60" y1="90" x2="60" y2="108"
        stroke={colors.gold} strokeWidth="5" strokeLinecap="round" style={dash}
      />
      <line
        x1="44" y1="110" x2="76" y2="110"
        stroke={colors.gold} strokeWidth="5" strokeLinecap="round" style={dash}
      />
    </svg>
  );
};
