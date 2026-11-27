import { AbsoluteFill } from "remotion";
import { Words } from "../components/Words";
import { C, FONT_BODY, FONT_HEAD } from "../theme";
import { pop, prog, useT } from "../time";

const Card: React.FC<{ x: number; at: number; dim: number; accent: string; title: string; children: React.ReactNode }> = ({ x, at, dim, accent, title, children }) => {
  const t = useT();
  const p = prog(t, at, 0.8);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 170,
        width: 760,
        height: 600,
        borderRadius: 28,
        background: "rgba(23,18,13,0.85)",
        border: `2px solid ${accent}55`,
        boxShadow: `0 30px 80px rgba(0,0,0,0.5), inset 0 0 80px ${accent}12`,
        opacity: p * (1 - 0.6 * dim),
        transform: `translateY(${(1 - p) * 80}px) scale(${1 - 0.05 * dim})`,
        direction: "rtl",
        padding: 50,
        boxSizing: "border-box",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div style={{ fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 52, color: accent }}>{title}</div>
      <div style={{ width: 120, height: 4, background: accent, margin: "16px 0 30px", borderRadius: 2 }} />
      {children}
    </div>
  );
};

const Chip: React.FC<{ text: string; at: number }> = ({ text, at }) => {
  const t = useT();
  const s = pop(t, at);
  return (
    <div style={{ transform: `scale(${s})`, padding: "14px 40px 22px", borderRadius: 60, border: `2px solid ${C.iron}`, fontFamily: FONT_HEAD, fontWeight: 700, fontSize: 60, color: C.paper }}>
      {text}
    </div>
  );
};

/** 0:41–0:59 — official story vs. historical sources. */
export const Versus: React.FC = () => {
  const t = useT();
  const stamp = pop(t, 56.63, 0.5);
  const shake = t > 56.7 && t < 57.1 ? Math.sin(t * 120) * 12 * (1 - prog(t, 56.7, 0.4)) : 0;
  const flag = prog(t, 42.17, 0.8);
  return (
    <AbsoluteFill style={{ transform: `translate(${shake}px, ${shake * 0.5}px)` }}>
      {/* right card: French narrative */}
      <Card x={1020} at={41.6} dim={prog(t, 49.3, 0.8)} accent={C.iron} title="الرواية الفرنسية">
        <div style={{ display: "flex", height: 16, width: 300 * flag, borderRadius: 8, overflow: "hidden", marginBottom: 40 }}>
          <div style={{ flex: 1, background: "#2b4fa3" }} />
          <div style={{ flex: 1, background: "#f3f3f3" }} />
          <div style={{ flex: 1, background: "#d0323a" }} />
        </div>
        <Words text="الحديد نُقل من" at={44.3} size={54} weight={700} color={C.goldSoft} />
        <div style={{ display: "flex", gap: 30, marginTop: 40 }}>
          <Chip text="لورين" at={46.67} />
          <Chip text="نانسي" at={47.31} />
        </div>
      </Card>

      {/* VS badge */}
      <div
        style={{
          position: "absolute",
          left: 960 - 60,
          top: 410,
          width: 120,
          height: 120,
          borderRadius: 60,
          background: C.bg,
          border: `3px solid ${C.gold}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: FONT_BODY,
          fontWeight: 800,
          fontSize: 44,
          color: C.gold,
          transform: `scale(${pop(t, 49.0)})`,
          zIndex: 2,
        }}
      >
        VS
      </div>

      {/* left card: historical sources */}
      <Card x={140} at={49.27} dim={0} accent={C.gold} title="مصادر تاريخية">
        <Words text="الحديد الذي صُنع منه البرج" at={53.7} size={44} weight={700} color={C.goldSoft} stagger={0.12} />
        <div
          style={{
            marginTop: 20,
            fontFamily: FONT_HEAD,
            fontWeight: 900,
            fontSize: 200,
            lineHeight: 1.1,
            color: C.gold,
            opacity: prog(t, 50.8, 0.5) * (1 - prog(t, 56.5, 0.2)),
            transform: `scale(${1 + 0.06 * Math.sin(t * 5)})`,
          }}
        >
          ؟
        </div>
      </Card>

      {/* stamp */}
      {t > 56.5 && (
        <div style={{ position: "absolute", left: 140, top: 560, width: 760, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              transform: `rotate(-8deg) scale(${2.2 - 1.2 * stamp})`,
              opacity: Math.min(1, stamp * 1.5),
              border: `8px solid ${C.red}`,
              borderRadius: 18,
              padding: "8px 40px 22px",
              fontFamily: FONT_HEAD,
              fontWeight: 900,
              fontSize: 64,
              whiteSpace: "nowrap",
              color: C.red,
              direction: "rtl",
              background: "rgba(12,10,8,0.7)",
              boxShadow: `0 0 50px ${C.red}55`,
            }}
          >
            مسروق من الجزائر
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};
