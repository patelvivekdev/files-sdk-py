import "./index.css";
import { Composition } from "remotion";

import { FilesSdkLaunch } from "./composition";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition
      id="FilesSdkLaunch"
      component={FilesSdkLaunch}
      durationInFrames={900}
      fps={30}
      width={1920}
      height={1080}
    />
  </>
);
