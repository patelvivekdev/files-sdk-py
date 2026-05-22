import "./index.css";
import { Composition } from "remotion";

import { FilesSdk15 } from "./composition";
import { TOTAL_DURATION } from "./timings";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FilesSdk15"
      component={FilesSdk15}
      durationInFrames={TOTAL_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
