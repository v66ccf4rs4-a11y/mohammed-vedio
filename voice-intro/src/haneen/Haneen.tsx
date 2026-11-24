import { Audio } from "@remotion/media";
import { useWindowedAudioData, visualizeAudio } from "@remotion/media-utils";
import { AbsoluteFill, interpolate, random, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { Dust, Grain, Letterbox } from "./Atmosphere";
import { Credits } from "./Credits";
import { Landscape } from "./Landscape";
import { AUDIO_DURATION, poem } from "./poem";
import { Verse } from "./Verse";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

// وميض ضوئي دافئ سينمائي بين الأبيات
const LeakOverlay: React.FC<{ seed: number }> = ({ seed }) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const p = interpolate(frame, [0, durationInFrames - 1], [0, 1], clamp);
  const strength = Math.sin(p * Math.PI) ** 1.5;
  const y = 30 + random(`ly${seed}`) * 40;
  return (
    <AbsoluteFill style={{ mixBlendMode: "screen", opacity: strength * 0.85, pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 45% 70% at ${interpolate(p, [0, 1], [110, -10])}% ${y}%, rgba(255,170,80,0.85) 0%, rgba(255,120,60,0.35) 40%, transparent 70%)`,
          filter: "blur(30px)",
        }}
      />
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 30% 55% at ${interpolate(p, [0, 1], [125, 5])}% ${100 - y}%, rgba(255,215,150,0.7) 0%, rgba(255,140,120,0.25) 45%, transparent 70%)`,
          filter: "blur(40px)",
        }}
      />
      <AbsoluteFill style={{ background: "rgba(255,200,140,0.10)" }} />
    </AbsoluteFill>
  );
};

export const Haneen: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const { audioData, dataOffsetInSeconds } = useWindowedAudioData({
    src: staticFile("haneen.wav"),
    frame,
    fps,
    windowInSeconds: 20,
  });
  let level = 0;
  if (audioData) {
    const f = visualizeAudio({ fps, frame, audioData, numberOfSamples: 64, optimizeFor: "speed", dataOffsetInSeconds, smoothing: true });
    level = Math.min(1, (f.slice(2, 24).reduce((a, b) => a + b, 0) / 22) * 6);
  }

  const camera = interpolate(t, [0, AUDIO_DURATION], [1.0, 1.09], clamp);
  const intro = interpolate(t, [0, 1.4], [0, 1], clamp);
  const outro = interpolate(t, [AUDIO_DURATION - 1.4, AUDIO_DURATION - 0.1], [0, 1], clamp);

  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      <Audio src={staticFile("haneen.mp3")} />
      <AbsoluteFill style={{ scale: camera, translate: `${interpolate(t, [0, AUDIO_DURATION], [0, -40])}px 0px` }}>
        <Landscape frame={frame} fps={fps} level={level} />
      </AbsoluteFill>
      <Dust t={t} level={level} />
      {poem.map((b, i) => (
        <Verse key={i} bayt={b} t={t} exitBy={i < poem.length - 1 ? poem[i + 1].start : b.end + 0.9} />
      ))}
      <Credits t={t} />
      {poem.slice(1).map((b, i) => (
        <Sequence key={i} from={Math.round((b.start - 0.7) * fps)} durationInFrames={Math.round(1.8 * fps)} layout="absolute-fill">
          <LeakOverlay seed={i + 3} />
        </Sequence>
      ))}
      <Sequence from={Math.round((poem[poem.length - 1].end - 0.2) * fps)} durationInFrames={Math.round(2 * fps)} layout="absolute-fill">
        <LeakOverlay seed={20} />
      </Sequence>
      <Grain frame={frame} />
      <Letterbox progress={intro} />
      <AbsoluteFill style={{ backgroundColor: "#000", opacity: 1 - intro + outro }} />
    </AbsoluteFill>
  );
};
