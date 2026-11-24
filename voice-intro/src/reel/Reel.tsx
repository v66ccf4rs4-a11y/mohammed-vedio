import { Audio } from "@remotion/media";
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { bodyFont, headingFont } from "../fonts";
import { CafeArt, DocArt, DramaArt, IntroArt, LuxuryArt, OutroArt, PodcastArt, PoetryArt } from "./Art";
import { Captions } from "./Captions";
import { captions, REEL_DURATION, scenes, themes } from "./data";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const smooth = Easing.bezier(0.16, 1, 0.3, 1);

const Bars: React.FC<{ freqs: number[]; color: string }> = ({ freqs, color }) => {
  const half = freqs.slice(1, 25).map((v) => Math.max(0, Math.min(1, (20 * Math.log10(v + 1e-6) + 70) / 45)));
  const bars = [...half.slice().reverse(), ...half];
  return (
    <div style={{ position: "absolute", top: 1660, left: 120, right: 120, height: 120, display: "flex", alignItems: "center", justifyContent: "center", gap: 7 }}>
      {bars.map((v, i) => (
        <div key={i} style={{ width: 11, height: 10 + v * 110, borderRadius: 8, background: color, opacity: 0.35 + 0.65 * v }} />
      ))}
    </div>
  );
};

const Wipe: React.FC<{ t: number; at: number; c1: string; c2: string }> = ({ t, at, c1, c2 }) => {
  const p = interpolate(t, [at - 0.45, at + 0.45], [0, 1], clamp);
  if (p <= 0 || p >= 1) return null;
  const x = (k: number) => interpolate(p, [0, 1], [1900 + k, -2900 + k], { easing: Easing.inOut(Easing.cubic) });
  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <div style={{ position: "absolute", top: -200, height: 2320, width: 1900, left: x(0), background: c1, transform: "skewX(-12deg)" }} />
      <div style={{ position: "absolute", top: -200, height: 2320, width: 1700, left: x(380), background: c2, transform: "skewX(-12deg)" }} />
    </AbsoluteFill>
  );
};

export const Reel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({ src: staticFile("reel.wav"), frame, fps, windowInSeconds: 20 });
  let freqs: number[] = new Array(64).fill(0);
  if (audioData) {
    freqs = visualizeAudio({ fps, frame, audioData, numberOfSamples: 64, optimizeFor: "speed", dataOffsetInSeconds, smoothing: true });
  }
  const level = Math.min(1, (freqs.slice(2, 24).reduce((a, b) => a + b, 0) / 22) * 6);

  const idx = Math.max(0, scenes.findIndex((s) => t >= s.from && t < s.to));
  const scene = scenes[idx];
  const th = themes[scene.key];
  const lt = t - scene.from;

  // اهتزاز الكاميرا في لحظة "خائن متسلط"
  const shake = scene.key === "drama" ? Math.sin(t * 70) * 10 * interpolate(t, [66.4, 66.55, 67.1], [0, 1, 0], clamp) : 0;

  const art = (() => {
    const p = { t, from: scene.from, level };
    switch (scene.key) {
      case "intro": return <IntroArt {...p} accent={th.accent} />;
      case "cafe": return <CafeArt {...p} />;
      case "luxury": return <LuxuryArt {...p} />;
      case "drama": return <DramaArt {...p} accent={th.accent} />;
      case "podcast": return <PodcastArt {...p} accent={th.accent} />;
      case "poetry": return <PoetryArt {...p} accent={th.accent} />;
      case "outro": return <OutroArt {...p} accent={th.accent} text={th.text} font={headingFont} bodyFont={bodyFont} />;
      default: return null;
    }
  })();

  const chipIn = interpolate(lt, [0.25, 0.8], [0, 1], { ...clamp, easing: smooth });
  const titleOut = interpolate(t, [4.6, 5.2], [1, 0], clamp);
  const fadeIn = interpolate(t, [0, 0.6], [1, 0], clamp);
  const fadeOut = interpolate(t, [REEL_DURATION - 1.2, REEL_DURATION - 0.1], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse at 50% 35%, ${th.bg1} 0%, ${th.bg2} 75%)` }}>
      <Audio src={staticFile("reel.mp3")} />
      <AbsoluteFill style={{ translate: `${shake}px ${shake * 0.6}px`, scale: 1 + interpolate(lt, [0, scene.to - scene.from], [0, 0.04]) }}>
        {scene.key === "doc" ? <DocArt t={t} from={scene.from} level={level} /> : null}
        {art}
      </AbsoluteFill>
      {scene.key === "drama" ? (
        <AbsoluteFill style={{ background: "radial-gradient(ellipse at 50% 45%, transparent 35%, rgba(0,0,0,0.85) 100%)" }} />
      ) : null}

      {/* عنوان الافتتاح */}
      {t < 5.2 ? (
        <div style={{ position: "absolute", top: 1180, left: 0, right: 0, textAlign: "center", direction: "rtl", opacity: titleOut }}>
          <div
            style={{
              fontFamily: headingFont, fontWeight: 900, fontSize: 120, color: th.text,
              opacity: interpolate(t, [1.0, 1.8], [0, 1], clamp),
              letterSpacing: interpolate(t, [1.0, 2.4], [24, 0], { ...clamp, easing: smooth }),
            }}
          >
            الهوية الصوتية
          </div>
          <div style={{ fontFamily: headingFont, fontWeight: 700, fontSize: 70, color: th.accent, marginTop: 10, opacity: interpolate(t, [2.2, 3.0], [0, 1], clamp) }}>
            محمد العمري
          </div>
        </div>
      ) : null}

      <Captions caps={captions[scene.key]} theme={th} t={t} top={scene.key === "doc" ? 1250 : 1160} />

      {/* شعار علوي ثابت + تصنيف المشهد */}
      {scene.key !== "outro" ? (
        <div style={{ position: "absolute", top: 110, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", direction: "rtl", opacity: interpolate(t, [5, 5.8], [0, 1], clamp) }}>
          <div style={{ fontFamily: headingFont, fontWeight: 800, fontSize: 40, color: th.text, opacity: 0.85 }}>
            محمد العمري <span style={{ color: th.accent }}>|</span> معلّق صوتي
          </div>
          <div
            style={{
              marginTop: 22, padding: "10px 34px", borderRadius: 60, background: th.accent,
              color: scene.key === "cafe" ? "#fff8ee" : th.bg2,
              fontFamily: headingFont, fontWeight: 800, fontSize: 44,
              opacity: chipIn, scale: 0.7 + 0.3 * chipIn,
            }}
          >
            {th.label}
          </div>
        </div>
      ) : null}

      {scene.key !== "outro" ? <Bars freqs={freqs} color={th.accent} /> : null}

      {scenes.slice(1).map((s, i) => (
        <Wipe key={i} t={t} at={s.from} c1={themes[s.key].accent} c2={themes[s.key].bg1} />
      ))}
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: Math.max(fadeIn, fadeOut), pointerEvents: "none" }} />
    </AbsoluteFill>
  );
};
