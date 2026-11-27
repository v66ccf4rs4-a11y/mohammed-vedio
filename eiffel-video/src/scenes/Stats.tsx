import { AbsoluteFill, interpolate, Easing } from "remotion";
import { Kicker, Words } from "../components/Words";
import { C, FONT_BODY, FONT_HEAD } from "../theme";
import { pop, prog, useT } from "../time";

const Icon: React.FC<{ kind: "weight" | "beam" | "rivet" }> = ({ kind }) => {
  const s = { stroke: C.gold, strokeWidth: 5, fill: "none", strokeLinejoin: "round" as const };
  return (
    <svg width={120} height={120} viewBox="0 0 120 120">
      {kind === "weight" && <path d="M30 100 L45 45 H75 L90 100 Z M50 45 Q50 22 60 22 Q70 22 70 45" {...s} />}
      {kind === "beam" && <path d="M20 25 H100 V37 H68 V83 H100 V95 H20 V83 H52 V37 H20 Z" {...s} />}
      {kind === "rivet" && (
        <>
          <path d="M28 52 Q28 24 60 24 Q92 24 92 52 Z" {...s} />
          <path d="M48 52 V100 H72 V52" {...s} />
        </>
      )}
    </svg>
  );
};

const Stat: React.FC<{ at: number; to: number; unit: string; kind: "weight" | "beam" | "rivet"; x: number; dur?: number }> = ({ at, to, unit, kind, x, dur = 1.6 }) => {
  const t = useT();
  const p = pop(t, at - 0.3, 0.7);
  const v = Math.round(interpolate(t, [at, at + dur], [0, to], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) }));
  const done = t >= at + dur;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 400,
        width: 500,
        height: 400,
        borderRadius: 28,
        background: "rgba(23,18,13,0.88)",
        border: `2px solid ${done ? C.gold : "rgba(212,168,86,0.3)"}`,
        boxShadow: done ? `0 0 60px ${C.gold}33` : "none",
        opacity: Math.min(1, p),
        transform: `translateY(${(1 - p) * 90}px) scale(${0.9 + 0.1 * p})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
      }}
    >
      <Icon kind={kind} />
      <div style={{ fontFamily: FONT_BODY, fontWeight: 800, fontSize: 104, color: C.paper, lineHeight: 1.1 }}>{v.toLocaleString("en-US")}</div>
      <div style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 44, color: C.gold, direction: "rtl" }}>{unit}</div>
    </div>
  );
};

/** 1:36–1:54 — the numbers: tonnes, pieces, rivets. */
export const Stats: React.FC = () => {
  const t = useT();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", top: 130, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
        <Kicker text="بالأرقام" at={96.7} />
        <Words text="الحديد المستهلك في بناء البرج" at={98.57} size={84} stagger={0.12} />
      </div>
      {/* RTL reading order: right → left */}
      <Stat at={101.25} to={10000} unit="طن من الحديد" kind="weight" x={1270} />
      <Stat at={106.71} to={18000} unit="قطعة حديدية" kind="beam" x={710} />
      <Stat at={109.27} to={2500000} unit="مسمار" kind="rivet" x={150} dur={2.6} />
      <div style={{ position: "absolute", top: 830, left: 0, right: 0, textAlign: "center", opacity: prog(t, 103.13, 0.5) * (1 - prog(t, 106.3, 0.4)), fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 40, color: C.goldSoft, direction: "rtl" }}>
        من الحديد الجزائري
      </div>
    </AbsoluteFill>
  );
};
