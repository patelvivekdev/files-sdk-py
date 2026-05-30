import "./index.css";
import { Composition } from "remotion";

import { FilesSdk17 } from "./composition";
import { TOTAL_DURATION } from "./timings";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FilesSdk17"
      component={FilesSdk17}
      durationInFrames={TOTAL_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
