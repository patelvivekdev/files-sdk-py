import "./index.css";
import { Composition } from "remotion";

import { FilesSdkLaunch } from "./composition";
import { TOTAL_DURATION } from "./timings";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FilesSdkLaunch"
      component={FilesSdkLaunch}
      durationInFrames={TOTAL_DURATION}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
