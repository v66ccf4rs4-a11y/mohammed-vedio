import { AbsoluteFill, interpolate, random } from "remotion";
import { palette } from "./poem";

// مشهد ليلي: سماء غروب، قمر، نجوم، كثبان بعيدة، طيور مهاجرة
const W = 1920;
const H = 1080;

const stars = new Array(140).fill(0).map((_, i) => ({
  x: random(`sx${i}`) * W,
  y: random(`sy${i}`) * H * 0.6,
  r: 0.6 + random(`sr${i}`) * 1.6,
  phase: random(`sp${i}`) * Math.PI * 2,
  speed: 0.03 + random(`ss${i}`) * 0.06,
}));

// أضواء قرية بعيدة على الأفق (الوطن)
const village = new Array(16).fill(0).map((_, i) => ({
  x: 1180 + i * 34 + random(`vx${i}`) * 30,
  y: 800 + Math.sin(i * 0.9) * 6 + random(`vy${i}`) * 10,
  r: 2 + random(`vr${i}`) * 2.2,
}));

const ridge = (seed: string, baseY: number, amp: number, offset: number) => {
  const pts: string[] = [];
  for (let x = -200; x <= W + 200; x += 40) {
    const xx = x + offset;
    const y =
      baseY +
      Math.sin(xx / 260 + random(seed) * 10) * amp +
      Math.sin(xx / 97 + random(seed + "b") * 10) * amp * 0.35;
    pts.push(`${x},${y.toFixed(1)}`);
  }
  return `M-200,${H} L${pts.join(" L")} L${W + 200},${H} Z`;
};

const Bird: React.FC<{ x: number; y: number; s: number; t: number }> = ({ x, y, s, t }) => {
  const flap = Math.sin(t) * 7;
  return (
    <path
      d={`M${x - 14 * s},${y + flap * s * 0.4} Q${x - 6 * s},${y - flap * s} ${x},${y} Q${x + 6 * s},${y - flap * s} ${x + 14 * s},${y + flap * s * 0.4}`}
      stroke="#0a0a12"
      strokeWidth={2.2 * s}
      fill="none"
      strokeLinecap="round"
    />
  );
};

const Flock: React.FC<{ frame: number; from: number; dur: number; y: number; dir: 1 | -1 }> = ({
  frame,
  from,
  dur,
  y,
  dir,
}) => {
  const p = (frame - from) / dur;
  if (p < 0 || p > 1) return null;
  const cx = dir === 1 ? -150 + p * (W + 300) : W + 150 - p * (W + 300);
  return (
    <g>
      {new Array(7).fill(0).map((_, i) => {
        const row = Math.ceil(i / 2);
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <Bird
            key={i}
            x={cx - dir * row * 38 + random(`bx${i}`) * 8}
            y={y + side * row * 22 + Math.sin(frame / 20 + i) * 4}
            s={0.9 - row * 0.08}
            t={frame / 3.2 + i * 1.3}
          />
        );
      })}
    </g>
  );
};

export const Landscape: React.FC<{ frame: number; fps: number; level: number }> = ({
  frame,
  fps,
  level,
}) => {
  const t = frame / fps;
  // تتحول السماء ببطء من الغروب إلى الليل العميق
  const night = interpolate(t, [0, 80], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const horizon = `rgb(${Math.round(interpolate(night, [0, 1], [196, 92]))},${Math.round(
    interpolate(night, [0, 1], [112, 58]),
  )},${Math.round(interpolate(night, [0, 1], [62, 70]))})`;
  const moonY = interpolate(t, [0, 87], [330, 230]);
  const glow = 0.55 + level * 0.9;

  return (
    <AbsoluteFill>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#05060d" />
            <stop offset="0.45" stopColor="#141326" />
            <stop offset="0.78" stopColor={horizon} />
            <stop offset="1" stopColor="#1a0f0c" />
          </linearGradient>
          <radialGradient id="moonGlow">
            <stop offset="0" stopColor="#ffe9c2" stopOpacity={0.7 * glow} />
            <stop offset="0.25" stopColor="#f3c98a" stopOpacity={0.24 * glow} />
            <stop offset="1" stopColor="#f3c98a" stopOpacity={0} />
          </radialGradient>
          <radialGradient id="moonFace" cx="0.42" cy="0.4">
            <stop offset="0" stopColor="#fff6e4" />
            <stop offset="0.8" stopColor="#f1dcb4" />
            <stop offset="1" stopColor="#d9bd8c" />
          </radialGradient>
          <filter id="soft" x="-20%" y="-100%" width="140%" height="300%">
            <feGaussianBlur stdDeviation="28" />
          </filter>
          <filter id="lightBlur">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <linearGradient id="fog" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#d7a86a" stopOpacity="0" />
            <stop offset="0.5" stopColor="#d7a86a" stopOpacity="0.16" />
            <stop offset="1" stopColor="#d7a86a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width={W} height={H} fill="url(#sky)" />
        {stars.map((s, i) => (
          <circle
            key={i}
            cx={s.x}
            cy={s.y}
            r={s.r}
            fill="#fff4dc"
            opacity={(0.25 + 0.75 * night) * (0.45 + 0.55 * Math.sin(frame * s.speed + s.phase) ** 2)}
          />
        ))}
        <circle cx={360} cy={moonY} r={520} fill="url(#moonGlow)" />
        <circle cx={360} cy={moonY} r={130} fill="#ffe6b8" opacity={0.08 + level * 0.12} filter="url(#soft)" />
        <circle cx={360} cy={moonY} r={92} fill="url(#moonFace)" opacity={0.96} />
        <circle cx={330} cy={moonY - 20} r={14} fill="#d8c39a" opacity={0.35} />
        <circle cx={392} cy={moonY + 24} r={20} fill="#d8c39a" opacity={0.25} />
        <Flock frame={frame} from={1 * fps} dur={14 * fps} y={420} dir={-1} />
        <Flock frame={frame} from={58 * fps} dur={16 * fps} y={360} dir={-1} />
        <Flock frame={frame} from={72 * fps} dur={14 * fps} y={470} dir={1} />
        <rect x={-400 + ((t * 18) % 400)} y={720} width={W + 800} height={110} fill="url(#fog)" filter="url(#soft)" />
        <path d={ridge("r1", 790, 38, t * 6)} fill="#1c1420" opacity={0.95} />
        <path d={ridge("r2", 850, 30, t * 12)} fill="#120d15" />
        {village.map((v, i) => (
          <circle
            key={i}
            cx={v.x - t * 6}
            cy={v.y}
            r={v.r}
            fill="#ffcf7a"
            opacity={0.55 + 0.45 * Math.sin(frame * 0.05 + i * 2.1) ** 2}
            filter="url(#lightBlur)"
          />
        ))}
        <rect x={-400 + ((t * 30) % 400) - 200} y={850} width={W + 800} height={90} fill="url(#fog)" opacity={0.7} filter="url(#soft)" />
        <path d={ridge("r3", 920, 26, t * 22)} fill="#08060a" />
      </svg>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 48%, transparent 30%, rgba(0,0,0,0.55) 100%)`,
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle at 19% ${(moonY / H) * 100}%, ${palette.gold}${Math.round(
            Math.min(1, level) * 40,
          )
            .toString(16)
            .padStart(2, "0")} 0%, transparent 35%)`,
          mixBlendMode: "screen",
        }}
      />
    </AbsoluteFill>
  );
};
