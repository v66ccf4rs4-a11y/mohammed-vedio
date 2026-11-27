import { AbsoluteFill } from "remotion";
import { C, CHANNEL, INTRO, NASKH, POET, SANS, TITLE, TOTAL } from "../theme";
import { prog, useT } from "../time";

const Ink: React.FC<{ text: string; at: number; dur: number; size: number; color?: string; weight?: number }> = ({ text, at, dur, size, color = C.ivory, weight = 700 }) => {
  const t = useT();
  const p = prog(t, at, dur, (x) => x);
  const edge = p * 130 - 15;
  const mask = `linear-gradient(to left, #000 ${edge - 15}%, transparent ${edge + 5}%)`;
  return (
    <div style={{ fontFamily: NASKH, fontWeight: weight, fontSize: size, color, direction: "rtl", WebkitMaskImage: mask, maskImage: mask, textShadow: "0 4px 30px rgba(0,0,0,0.9)", lineHeight: 1.6 }}>
      {text}
    </div>
  );
};

export const Intro: React.FC = () => {
  const t = useT();
  if (t > INTRO + 1.5) return null;
  const out = 1 - prog(t, INTRO - 1.2, 1.6);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", opacity: out, flexDirection: "column", gap: 6 }}>
      <Ink text={TITLE} at={0.6} dur={1.8} size={150} />
      <div style={{ width: 260 * prog(t, 1.8, 1.2), height: 2, background: C.amber, opacity: 0.8 }} />
      {POET ? <Ink text={`شعر: ${POET}`} at={2.3} dur={1.2} size={44} color={C.amber} weight={400} /> : null}
    </AbsoluteFill>
  );
};

export const Outro: React.FC = () => {
  const t = useT();
  const T0 = TOTAL - 6.5;
  if (t < T0) return null;
  const fadeBlack = prog(t, T0, 1.2);
  const end = 1 - prog(t, TOTAL - 1.2, 1.1);
  return (
    <AbsoluteFill style={{ background: `rgba(0,0,0,${fadeBlack * 0.85})`, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, opacity: end }}>
      <Ink text={TITLE} at={T0 + 0.8} dur={1.4} size={96} />
      {POET ? <Ink text={`شعر: ${POET}`} at={T0 + 1.8} dur={1} size={40} color={C.amber} weight={400} /> : null}
      <div style={{ marginTop: 30, fontFamily: SANS, fontWeight: 700, fontSize: 34, color: C.ivory, opacity: 0.85 * prog(t, T0 + 2.6, 1) }}>{CHANNEL}</div>
    </AbsoluteFill>
  );
};
