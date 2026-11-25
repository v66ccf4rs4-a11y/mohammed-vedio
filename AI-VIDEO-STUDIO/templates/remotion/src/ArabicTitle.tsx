import {loadFont} from '@remotion/fonts';
import {
  AbsoluteFill, Easing, interpolate, OffthreadVideo, staticFile, useCurrentFrame,
  useVideoConfig,
} from 'remotion';
import {z} from 'zod';

// Fonts are copied into public/fonts by the studio installer (OFL licensed).
const FONTS: Record<string, string> = {
  'Aref Ruqaa Ink': 'ArefRuqaaInk-Regular.ttf',
  Amiri: 'Amiri-Bold.ttf',
  'Reem Kufi': 'ReemKufi-wght.ttf',
  Tajawal: 'Tajawal-Bold.ttf',
};
const fontsReady = Promise.all(
  Object.entries(FONTS).map(([family, file]) => loadFont({family, url: staticFile(`fonts/${file}`)})),
);
void fontsReady;

export const arabicTitleSchema = z.object({
  lines: z.array(z.object({text: z.string(), from: z.number(), to: z.number(), font: z.string()})),
  background: z.string().nullable(),
});

const Line: React.FC<{text: string; from: number; to: number; font: string}> = ({text, from, to, font}) => {
  const frame = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const t = frame / fps;
  if (t < from - 0.1 || t > to + 0.1) return null;
  const words = text.split(' ');
  const span = Math.max(0.4, (to - from) * 0.55);
  const out = interpolate(t, [to - 0.45, to], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const size = Math.min(width, height) * 0.11;
  return (
    <div style={{
      position: 'absolute', width: '100%', top: height * 0.62, direction: 'rtl', textAlign: 'center',
      fontFamily: `'${font}'`, fontSize: size, color: '#F4EFE8', opacity: out,
      textShadow: '0 6px 30px rgba(0,0,0,0.55)', lineHeight: 1.5, padding: '0 8%',
      boxSizing: 'border-box',
    }}>
      {words.map((w, i) => {
        // whole words animate (never per-letter) so Arabic joining is preserved
        const start = from + (i / words.length) * span;
        const p = interpolate(t, [start, start + 0.45], [0, 1], {
          extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic),
        });
        return (
          <span key={i} style={{
            display: 'inline-block', opacity: p, filter: `blur(${(1 - p) * 10}px)`,
            transform: `translateY(${(1 - p) * size * 0.35}px) scale(${1.08 - 0.08 * p})`,
            marginInline: size * 0.12,
          }}>{w}</span>
        );
      })}
    </div>
  );
};

export const ArabicTitle: React.FC<z.infer<typeof arabicTitleSchema>> = ({lines, background}) => {
  const frame = useCurrentFrame();
  const {durationInFrames} = useVideoConfig();
  const zoom = interpolate(frame, [0, durationInFrames], [1.0, 1.12], {easing: Easing.inOut(Easing.sin)});
  return (
    <AbsoluteFill style={{backgroundColor: '#0d1420'}}>
      <AbsoluteFill style={{transform: `scale(${zoom})`}}>
        {background ? (
          <OffthreadVideo src={staticFile(background)} muted style={{width: '100%', height: '100%', objectFit: 'cover'}} />
        ) : (
          <AbsoluteFill style={{background: 'linear-gradient(180deg,#1b2d4a 0%,#6d7f99 48%,#c9a98f 70%,#5b4336 100%)'}} />
        )}
      </AbsoluteFill>
      <AbsoluteFill style={{background: 'radial-gradient(ellipse at center, transparent 45%, rgba(0,0,0,0.55) 100%)'}} />
      {lines.map((l, i) => <Line key={i} {...l} />)}
    </AbsoluteFill>
  );
};
