import { Composition } from "remotion";
import { EiffelVideo } from "./Video";
import { DURATION_S, FPS } from "./theme";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition id="EiffelIron" component={EiffelVideo} durationInFrames={Math.round(DURATION_S * FPS)} fps={FPS} width={1920} height={1080} />
  );
};
