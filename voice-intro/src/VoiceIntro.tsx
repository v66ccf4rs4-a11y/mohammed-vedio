import { linearTiming, TransitionSeries } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { CtaScene } from "./scenes/CtaScene";
import { IntroScene } from "./scenes/IntroScene";
import { NameScene } from "./scenes/NameScene";
import { SpecialtiesScene } from "./scenes/SpecialtiesScene";

export const VoiceIntro: React.FC = () => (
  <TransitionSeries>
    <TransitionSeries.Sequence name="Intro" durationInFrames={120}>
      <IntroScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
    <TransitionSeries.Sequence name="Name" durationInFrames={120}>
      <NameScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={slide({ direction: "from-bottom" })} timing={linearTiming({ durationInFrames: 15 })} />
    <TransitionSeries.Sequence name="Specialties" durationInFrames={180}>
      <SpecialtiesScene />
    </TransitionSeries.Sequence>
    <TransitionSeries.Transition presentation={fade()} timing={linearTiming({ durationInFrames: 15 })} />
    <TransitionSeries.Sequence name="CTA" durationInFrames={150}>
      <CtaScene />
    </TransitionSeries.Sequence>
  </TransitionSeries>
);
