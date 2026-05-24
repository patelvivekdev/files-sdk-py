import "./index.css";
import { Composition } from "remotion";

import { FilesSdk16 } from "./composition";
import { TOTAL_DURATION } from "./timings";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FilesSdk16"
      component={FilesSdk16}
      durationInFrames={TOTAL_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
