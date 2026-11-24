import { AbsoluteFill, Easing, interpolate, random } from "remotion";
import { Mic } from "../components/Mic";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const overshoot = Easing.bezier(0.34, 1.56, 0.64, 1);
const smooth = Easing.bezier(0.16, 1, 0.3, 1);
const appear = (t: number, at: number, d = 0.6, e = smooth) => interpolate(t, [at, at + d], [0, 1], { ...clamp, easing: e });

type P = { t: number; from: number; level: number };

// يضع الرسم في منتصف الجزء العلوي من الشاشة
const Stage: React.FC<{ children: React.ReactNode; y?: number; size?: number }> = ({ children, y = 470, size = 620 }) => (
  <div style={{ position: "absolute", left: (1080 - size) / 2, top: y, width: size, height: size }}>{children}</div>
);

const Sparkle: React.FC<{ x: number; y: number; s: number; o: number; c: string }> = ({ x, y, s, o, c }) => (
  <path
    d={`M${x},${y - s} Q${x},${y} ${x + s},${y} Q${x},${y} ${x},${y + s} Q${x},${y} ${x - s},${y} Q${x},${y} ${x},${y - s}Z`}
    fill={c}
    opacity={o}
  />
);

/* ---------------- التعريف ---------------- */
export const IntroArt: React.FC<P & { accent: string }> = ({ t, level, accent }) => (
  <Stage y={430}>
    <svg width="620" height="620" viewBox="0 0 620 620" style={{ position: "absolute" }}>
      {[0, 1, 2].map((i) => {
        const ph = ((t * 0.6 + i / 3) % 1);
        return <circle key={i} cx={310} cy={300} r={140 + ph * 170} fill="none" stroke={accent} strokeWidth={3} opacity={(1 - ph) * 0.5} />;
      })}
      <circle cx={310} cy={300} r={150 + level * 30} fill={accent} opacity={0.08 + level * 0.15} />
    </svg>
    <div style={{ position: "absolute", left: 150, top: 140, scale: 1 + level * 0.06 }}>
      <Mic size={320} draw={appear(t, 0.2, 1.6)} />
    </div>
  </Stage>
);

/* ---------------- المقهى ---------------- */
export const CafeArt: React.FC<P> = ({ t }) => {
  const steam = (i: number) => {
    const x = 210 + i * 40;
    const d = `M${x},250 C${x - 25},220 ${x + 25},190 ${x},160 C${x - 25},130 ${x + 25},100 ${x},70`;
    return <path key={i} d={d} stroke="#a0745a" strokeWidth={9} fill="none" strokeLinecap="round" strokeDasharray="60 260" strokeDashoffset={-((t * 120 + i * 80) % 320)} opacity={0.6} />;
  };
  const cup = appear(t, 28.0, 0.7, overshoot);
  const cake = appear(t, 31.9, 0.7, overshoot);
  const badge = appear(t, 35.9, 0.55, overshoot);
  const clock = appear(t, 37.8, 0.5, overshoot);
  return (
    <Stage y={380} size={760}>
      <svg width="760" height="760" viewBox="0 0 760 760">
        {/* فنجان القهوة */}
        <g style={{ scale: cup, transformOrigin: "260px 420px" }} transform="translate(30,150)">
          {steam(0)}
          {steam(1)}
          {steam(2)}
          <ellipse cx={250} cy={440} rx={200} ry={38} fill="#c79a6e" />
          <ellipse cx={250} cy={432} rx={170} ry={28} fill="#e2c09a" />
          <path d="M110,270 L390,270 L360,420 Q250,450 140,420 Z" fill="#fffaf2" stroke="#3b2417" strokeWidth={8} strokeLinejoin="round" />
          <ellipse cx={250} cy={270} rx={140} ry={26} fill="#5b3420" stroke="#3b2417" strokeWidth={8} />
          <path d="M385,300 Q460,300 450,350 Q440,395 370,390" fill="none" stroke="#3b2417" strokeWidth={14} strokeLinecap="round" />
          <path d="M150,330 L350,330" stroke="#b5651d" strokeWidth={10} strokeLinecap="round" />
        </g>
        {/* شريحة الكيك */}
        <g style={{ scale: cake, transformOrigin: "560px 520px" }}>
          <path d="M430,470 L700,470 L700,580 L430,580 Z" fill="#fff3d6" stroke="#3b2417" strokeWidth={8} strokeLinejoin="round" />
          <path d="M430,505 L700,505" stroke="#b5651d" strokeWidth={10} />
          <path d="M430,545 L700,545" stroke="#9e1b32" strokeWidth={10} />
          <path d="M430,470 L560,400 L700,470 Z" fill="#ffe7b8" stroke="#3b2417" strokeWidth={8} strokeLinejoin="round" />
          <circle cx={575} cy={420} r={22} fill="#d7263d" stroke="#3b2417" strokeWidth={6} />
          <path d="M575,398 l6,-14 l8,6" stroke="#3a7d44" strokeWidth={6} fill="none" strokeLinecap="round" />
        </g>
        {/* شارة السعر */}
        <g style={{ scale: badge, transformOrigin: "590px 170px" }}>
          <polygon
            points={new Array(24)
              .fill(0)
              .map((_, i) => {
                const a = (i / 24) * Math.PI * 2 + t * 0.4;
                const r = i % 2 ? 118 : 140;
                return `${590 + Math.cos(a) * r},${170 + Math.sin(a) * r}`;
              })
              .join(" ")}
            fill="#b5651d"
          />
          <circle cx={590} cy={170} r={104} fill="#9b4f12" />
          <text x={590} y={185} textAnchor="middle" fontFamily="Cairo" fontWeight={900} fontSize={96} fill="#fff8ee">69</text>
          <text x={590} y={236} textAnchor="middle" fontFamily="Cairo" fontWeight={800} fontSize={36} fill="#ffe0b8">ريال</text>
        </g>
        {/* ساعة */}
        <g style={{ scale: clock, transformOrigin: "120px 150px" }}>
          <circle cx={120} cy={150} r={78} fill="#fffaf2" stroke="#3b2417" strokeWidth={8} />
          <line x1={120} y1={150} x2={120} y2={98} stroke="#3b2417" strokeWidth={8} strokeLinecap="round" />
          <line x1={120} y1={150} x2={120} y2={150 + 50 * clock} stroke="#b5651d" strokeWidth={8} strokeLinecap="round" />
          <circle cx={120} cy={150} r={8} fill="#3b2417" />
        </g>
      </svg>
    </Stage>
  );
};

/* ---------------- الفخامة (مجوهرات) ---------------- */
export const LuxuryArt: React.FC<P> = ({ t, level }) => {
  const ruby = appear(t, 54.8, 0.8);
  const fill = (gold: string, red: string) => (ruby > 0.5 ? red : gold);
  const spin = Math.cos(t * 0.8);
  const sweep = ((t * 0.35) % 1.4) - 0.2;
  const sparkles = new Array(10).fill(0).map((_, i) => ({
    x: 60 + random(`lx${i}`) * 500,
    y: 40 + random(`ly${i}`) * 520,
    s: 10 + random(`ls${i}`) * 22,
    ph: random(`lp${i}`) * 6,
  }));
  return (
    <Stage y={420}>
      <svg width="620" height="620" viewBox="0 0 620 620">
        <defs>
          <linearGradient id="gem" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor={fill("#fff6dc", "#ff6b81")} />
            <stop offset="0.5" stopColor={fill("#d8b46a", "#c2102e")} />
            <stop offset="1" stopColor={fill("#7a5a22", "#5a0414")} />
          </linearGradient>
          <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
            <stop offset={Math.max(0, sweep - 0.1)} stopColor="#fff" stopOpacity="0" />
            <stop offset={Math.min(1, Math.max(0, sweep))} stopColor="#fff" stopOpacity="0.75" />
            <stop offset={Math.min(1, sweep + 0.1)} stopColor="#fff" stopOpacity="0" />
          </linearGradient>
        </defs>
        <circle cx={310} cy={300} r={230} fill={fill("#d8b46a", "#e0162b")} opacity={0.08 + level * 0.12} />
        <g style={{ scale: `${0.75 + 0.25 * Math.abs(spin)} 1`, transformOrigin: "310px 300px" }} opacity={appear(t, 42.2, 1.2)}>
          <polygon points="170,210 230,150 390,150 450,210 310,470" fill="url(#gem)" stroke={fill("#f3e2b3", "#ffb3c0")} strokeWidth={4} strokeLinejoin="round" />
          <g stroke={fill("#f3e2b3", "#ffb3c0")} strokeWidth={3} opacity={0.8} fill="none">
            <path d="M170,210 L450,210" />
            <path d="M230,150 L270,210 L310,150 L350,210 L390,150" />
            <path d="M270,210 L310,470 L350,210" />
            <path d="M170,210 L310,470" />
            <path d="M450,210 L310,470" />
          </g>
          <polygon points="170,210 230,150 390,150 450,210 310,470" fill="url(#shine)" />
        </g>
        {sparkles.map((s, i) => (
          <Sparkle key={i} x={s.x} y={s.y} s={s.s} c="#fff3d0" o={Math.max(0, Math.sin(t * 2.2 + s.ph)) * appear(t, 42.5, 1)} />
        ))}
      </svg>
    </Stage>
  );
};

/* ---------------- الدراما ---------------- */
export const DramaArt: React.FC<P & { accent: string }> = ({ t, level, accent }) => {
  const crack = appear(t, 66.4, 0.35, Easing.out(Easing.cubic));
  const flick = 0.75 + 0.25 * Math.sin(t * 23) * Math.sin(t * 7.3);
  const swing = Math.sin(t * 0.9) * 6;
  const cracks = [
    "M310,300 L230,220 L200,150 L150,120",
    "M310,300 L400,240 L470,250 L540,190",
    "M310,300 L330,400 L290,480 L310,560",
    "M310,300 L200,330 L120,320 L60,360",
    "M310,300 L430,360 L500,440",
  ];
  return (
    <Stage y={420}>
      <svg width="620" height="620" viewBox="0 0 620 620">
        <defs>
          <radialGradient id="blood">
            <stop offset="0" stopColor={accent} stopOpacity={0.55 * flick + level * 0.3} />
            <stop offset="1" stopColor={accent} stopOpacity="0" />
          </radialGradient>
          <linearGradient id="blade" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#6d7077" />
            <stop offset="0.5" stopColor="#eef0f3" />
            <stop offset="1" stopColor="#8a8d93" />
          </linearGradient>
        </defs>
        <circle cx={310} cy={300} r={300} fill="url(#blood)" />
        <g stroke={accent} strokeWidth={5} fill="none" strokeLinecap="round" strokeDasharray={400} strokeDashoffset={400 * (1 - crack)}>
          {cracks.map((d, i) => (
            <path key={i} d={d} />
          ))}
        </g>
        <g style={{ rotate: `${swing - 20}deg`, transformOrigin: "310px 300px" }} opacity={appear(t, 59.9, 0.8)}>
          <polygon points="292,90 328,90 340,400 310,450 280,400" fill="url(#blade)" stroke="#2b2d31" strokeWidth={4} />
          <line x1={310} y1={100} x2={310} y2={420} stroke="#9aa0a8" strokeWidth={3} />
          <rect x={220} y={400} width={180} height={26} rx={12} fill="#3a0a0f" stroke={accent} strokeWidth={4} />
          <rect x={292} y={426} width={36} height={110} rx={10} fill="#1d0608" stroke={accent} strokeWidth={4} />
          <circle cx={310} cy={550} r={20} fill={accent} />
          <path d="M318,330 Q324,350 318,372 Q312,350 318,330Z" fill={accent} opacity={appear(t, 79.6, 1)} />
        </g>
      </svg>
    </Stage>
  );
};

/* ---------------- الوثائقي (خلفية كاملة) ---------------- */
const Acacia: React.FC<{ x: number; y: number; s: number }> = ({ x, y, s }) => (
  <g transform={`translate(${x},${y}) scale(${s})`} fill="#140a05">
    <path d="M-6,0 L-4,-120 L-40,-170 L-34,-174 L0,-135 L30,-180 L36,-176 L6,-120 L6,0 Z" />
    <ellipse cx={-50} cy={-182} rx={90} ry={22} />
    <ellipse cx={40} cy={-190} rx={100} ry={24} />
    <ellipse cx={-5} cy={-205} rx={70} ry={18} />
  </g>
);

export const DocArt: React.FC<P> = ({ t, from, level }) => {
  const lt = t - from;
  const sunY = 760 - lt * 6;
  const birds = new Array(6).fill(0).map((_, i) => {
    const x = 1150 - ((lt * 70 + i * 60) % 1400);
    const y = 420 + Math.sin(i * 1.7) * 60 + (i % 2) * 30;
    const f = Math.sin(t * 9 + i) * 10;
    return <path key={i} d={`M${x - 18},${y + f * 0.4} Q${x - 8},${y - f} ${x},${y} Q${x + 8},${y - f} ${x + 18},${y + f * 0.4}`} stroke="#1a0c05" strokeWidth={3.5} fill="none" strokeLinecap="round" />;
  });
  return (
    <AbsoluteFill>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920">
        <defs>
          <linearGradient id="savSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2a0f12" />
            <stop offset="0.35" stopColor="#8a2c14" />
            <stop offset="0.6" stopColor="#e0641c" />
            <stop offset="0.75" stopColor="#ffb347" />
            <stop offset="1" stopColor="#ffd68a" />
          </linearGradient>
          <radialGradient id="sunGlow">
            <stop offset="0" stopColor="#fff2c4" stopOpacity={0.9} />
            <stop offset="0.3" stopColor="#ffb347" stopOpacity={0.45 + level * 0.3} />
            <stop offset="1" stopColor="#ff7a1a" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#savSky)" />
        <circle cx={540} cy={sunY} r={520} fill="url(#sunGlow)" />
        <circle cx={540} cy={sunY} r={210} fill="#fff0c8" opacity={0.95} />
        {birds}
        <path d={`M0,1080 Q270,1030 540,1060 T1080,1040 L1080,1920 L0,1920 Z`} fill="#3a160a" opacity={0.7} />
        <g transform={`translate(${-lt * 4},0)`}>
          <Acacia x={210} y={1110} s={1.6} />
          <Acacia x={900} y={1120} s={1.15} />
          <Acacia x={620} y={1100} s={0.7} />
        </g>
        <path d={`M0,1100 Q300,1080 540,1110 T1080,1095 L1080,1920 L0,1920 Z`} fill="#140a05" />
        {new Array(60).fill(0).map((_, i) => {
          const x = i * 19;
          const sway = Math.sin(t * 2 + i * 0.7) * 6;
          return <path key={i} d={`M${x},1110 Q${x + sway},${1070 - (i % 3) * 12} ${x + sway * 1.6},${1050 - (i % 4) * 14}`} stroke="#140a05" strokeWidth={4} fill="none" />;
        })}
      </svg>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, transparent 55%, rgba(10,5,2,0.9) 75%)" }} />
    </AbsoluteFill>
  );
};

/* ---------------- البودكاست والكتب ---------------- */
export const PodcastArt: React.FC<P & { accent: string }> = ({ t, level, accent }) => {
  const head = appear(t, 106.8, 0.7, overshoot);
  const book = appear(t, 107.4, 0.7, overshoot);
  const flip = (t * 0.5) % 1;
  return (
    <Stage y={400} size={700}>
      <svg width="700" height="700" viewBox="0 0 700 700">
        {[0, 1, 2].map((i) => {
          const ph = (t * 0.5 + i / 3) % 1;
          return <circle key={i} cx={350} cy={250} r={120 + ph * 200} fill="none" stroke={accent} strokeWidth={3} opacity={(1 - ph) * 0.35} />;
        })}
        {/* سماعات */}
        <g style={{ scale: head * (1 + level * 0.05), transformOrigin: "350px 250px" }} stroke={accent} fill="none" strokeWidth={22} strokeLinecap="round">
          <path d="M190,300 Q190,110 350,110 Q510,110 510,300" />
          <rect x={160} y={260} width={70} height={130} rx={30} fill="#2a1d55" />
          <rect x={470} y={260} width={70} height={130} rx={30} fill="#2a1d55" />
        </g>
        {/* كتاب مفتوح */}
        <g style={{ scale: book, transformOrigin: "350px 540px" }}>
          <path d="M350,480 Q260,450 150,470 L150,600 Q260,580 350,610 Z" fill="#f1ecff" stroke="#3a2a70" strokeWidth={6} strokeLinejoin="round" />
          <path d="M350,480 Q440,450 550,470 L550,600 Q440,580 350,610 Z" fill="#e4dcff" stroke="#3a2a70" strokeWidth={6} strokeLinejoin="round" />
          <path
            d="M350,480 Q440,450 550,470 L550,600 Q440,580 350,610 Z"
            fill="#fbf9ff"
            stroke="#3a2a70"
            strokeWidth={4}
            style={{ scale: `${Math.cos(flip * Math.PI)} 1`, transformOrigin: "350px 540px" }}
            opacity={0.9}
          />
          {[0, 1, 2].map((i) => (
            <line key={i} x1={185} x2={320} y1={505 + i * 28} y2={498 + i * 28} stroke="#9c8ad6" strokeWidth={5} strokeLinecap="round" />
          ))}
        </g>
      </svg>
    </Stage>
  );
};

/* ---------------- الشعر ---------------- */
export const PoetryArt: React.FC<P & { accent: string }> = ({ t, accent }) => {
  const a = appear(t, 137, 1.4);
  const stars = new Array(50).fill(0).map((_, i) => ({ x: random(`px${i}`) * 1080, y: random(`py${i}`) * 1100, r: 1 + random(`pr${i}`) * 2.4, ph: random(`pp${i}`) * 6 }));
  return (
    <AbsoluteFill style={{ opacity: a }}>
      <svg width="1080" height="1920" viewBox="0 0 1080 1920" style={{ position: "absolute" }}>
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.r} fill="#fff4dc" opacity={0.3 + 0.7 * Math.sin(t * 1.5 + s.ph) ** 2} />
        ))}
        <defs>
          <radialGradient id="moonG">
            <stop offset="0" stopColor="#ffe9c2" stopOpacity="0.5" />
            <stop offset="1" stopColor="#ffe9c2" stopOpacity="0" />
          </radialGradient>
          <mask id="cres">
            <rect width="1080" height="1920" fill="#fff" />
            <circle cx={610} cy={600} r={150} fill="#000" />
          </mask>
        </defs>
        <circle cx={540} cy={640} r={360} fill="url(#moonG)" />
        <circle cx={540} cy={640} r={170} fill="#f6e3b8" mask="url(#cres)" />
        {/* ريشة */}
        <g transform={`translate(800,${900 + Math.sin(t) * 10}) rotate(-35)`} opacity={0.9}>
          <path d="M0,0 C40,-60 50,-170 0,-260 C-50,-170 -40,-60 0,0Z" fill="none" stroke={accent} strokeWidth={5} />
          <line x1={0} y1={30} x2={0} y2={-250} stroke={accent} strokeWidth={4} />
          {[-60, -100, -140, -180].map((y) => (
            <path key={y} d={`M0,${y} L28,${y - 30} M0,${y} L-28,${y - 30}`} stroke={accent} strokeWidth={3} />
          ))}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/* ---------------- الختام ---------------- */
export const OutroArt: React.FC<P & { accent: string; text: string; font: string; bodyFont: string }> = ({ t, from, level, accent, text, font, bodyFont }) => {
  const lt = t - from;
  const a = (d: number) => interpolate(lt, [d, d + 0.8], [0, 1], { ...clamp, easing: overshoot });
  return (
    <AbsoluteFill style={{ justifyContent: "center", alignItems: "center", flexDirection: "column", direction: "rtl" }}>
      <div style={{ scale: a(0.2) * (1 + level * 0.05) }}>
        <Mic size={260} draw={interpolate(lt, [0, 1.4], [0, 1], clamp)} />
      </div>
      <div style={{ fontFamily: font, fontWeight: 900, fontSize: 140, color: text, marginTop: 40, opacity: a(0.8), scale: 0.8 + 0.2 * a(0.8) }}>محمد العمري</div>
      <div style={{ height: 8, borderRadius: 8, background: accent, width: 460 * a(1.3), margin: "18px 0 30px" }} />
      <div style={{ fontFamily: font, fontWeight: 700, fontSize: 84, color: accent, opacity: a(1.6) }}>معلّق صوتي</div>
      <div style={{ fontFamily: bodyFont, fontWeight: 500, fontSize: 42, color: text, opacity: a(2.3) * 0.75, marginTop: 30 }}>
        إعلانات · دراما · وثائقيات · كتب مسموعة · شعر
      </div>
    </AbsoluteFill>
  );
};
