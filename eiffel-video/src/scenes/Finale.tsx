import { AbsoluteFill } from "remotion";
import { Kicker, Words } from "../components/Words";
import { Tower } from "../components/Tower";
import { C, CHANNEL, FONT_BODY, FONT_HEAD } from "../theme";
import { pop, prog, useT } from "../time";

/** 1:54–2:03 — Paris' landmark… made of Algerian iron. */
export const Finale: React.FC = () => {
  const t = useT();
  const build = prog(t, 114.3, 2.2);
  const toIron = prog(t, 119.6, 1.2);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 960 - 205, top: 40 }}>
        <Tower build={build} height={820} glow={0.5 + 0.4 * toIron} color={toIron > 0.5 ? C.goldSoft : C.gold} />
      </div>
      <div style={{ position: "absolute", right: 120, top: 260, width: 560, direction: "rtl", display: "flex", flexDirection: "column", gap: 10 }}>
        <Kicker text="معلم سياحي" at={115.4} />
        <Words text="يميّز العاصمة باريس" at={116.67} size={72} stagger={0.25} highlight={["باريس"]} />
      </div>
      <div style={{ position: "absolute", left: 100, top: 470, width: 600, direction: "rtl", display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 4 }}>
        <Words text="من الحديد" at={119.61} size={90} />
        <Words text="الجزائري" at={120.9} size={140} color={C.gold} />
      </div>
    </AbsoluteFill>
  );
};

/** 2:03–end — channel outro. */
export const Outro: React.FC = () => {
  const t = useT();
  const T0 = 122.9;
  const ring = prog(t, T0, 1.2);
  const btn = pop(t, T0 + 1.6);
  const click = t > T0 + 3.2 && t < T0 + 3.5;
  const subscribed = t >= T0 + 3.35;
  const cursor = prog(t, T0 + 2.2, 1);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
      <svg width={260} height={260} style={{ position: "absolute", top: 150 }}>
        <circle cx={130} cy={130} r={118} fill="none" stroke={C.gold} strokeWidth={6} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ring} transform="rotate(-90 130 130)" />
        <text x={130} y={170} textAnchor="middle" fontFamily={FONT_HEAD} fontWeight={900} fontSize={120} fill={C.gold} opacity={prog(t, T0 + 0.5, 0.6)}>م</text>
      </svg>
      <div style={{ marginTop: 160 }}>
        <Words text={CHANNEL} at={T0 + 0.6} size={130} stagger={0.25} />
      </div>
      <div style={{ position: "absolute", top: 760, display: "flex", gap: 30, alignItems: "center", direction: "rtl" }}>
        <div
          style={{
            transform: `scale(${btn * (click ? 0.92 : 1)})`,
            padding: "16px 60px 26px",
            borderRadius: 16,
            background: subscribed ? "#3a3530" : C.red,
            fontFamily: FONT_HEAD,
            fontWeight: 900,
            fontSize: 52,
            color: C.paper,
          }}
        >
          {subscribed ? "تم الاشتراك" : "اشترك"}
        </div>
        <div style={{ opacity: prog(t, T0 + 3.6, 0.5), fontFamily: FONT_BODY, fontWeight: 800, fontSize: 40, color: C.goldSoft }}>وفعّل الجرس</div>
      </div>
      {/* cursor */}
      <svg width={60} height={60} viewBox="0 0 24 24" style={{ position: "absolute", left: 1150 - 260 * cursor, top: 1000 - 180 * cursor, opacity: cursor * (1 - prog(t, T0 + 4.5, 0.4)), transform: `scale(${click ? 0.85 : 1})` }}>
        <path d="M4 2 L20 12 L12 13.5 L8.5 21 Z" fill={C.paper} stroke={C.bg} strokeWidth={1.2} />
      </svg>
      <div style={{ position: "absolute", bottom: 90, fontFamily: FONT_BODY, fontWeight: 600, fontSize: 34, color: C.dim, opacity: prog(t, T0 + 4.5, 0.6) }}>شكرًا للمشاهدة</div>
    </AbsoluteFill>
  );
};
