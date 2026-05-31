import { AbsoluteFill, Sequence } from "remotion";

import { Background } from "../shared/background";
import { IntroScene } from "../shared/intro-scene";
import { Outro } from "../shared/outro";
import { BulkScene } from "./bulk-scene";
import { ConvexScene } from "./convex-scene";
import { FtpScene } from "./ftp-scene";
import { TIMING } from "./timings";

export const FilesSdk15: React.FC = () => (
  <AbsoluteFill style={{ background: "#1a1410" }}>
    <Background />
    <Sequence
      from={TIMING.intro.from}
      durationInFrames={TIMING.intro.duration}
      layout="none"
    >
      <IntroScene
        command="npm i files-sdk@1.5.0"
        version="v1.5"
        tagline="bulk operations · ftp & sftp · convex"
      />
    </Sequence>
    <Sequence
      from={TIMING.bulk.from}
      durationInFrames={TIMING.bulk.duration}
      layout="none"
    >
      <BulkScene />
    </Sequence>
    <Sequence
      from={TIMING.ftp.from}
      durationInFrames={TIMING.ftp.duration}
      layout="none"
    >
      <FtpScene />
    </Sequence>
    <Sequence
      from={TIMING.convex.from}
      durationInFrames={TIMING.convex.duration}
      layout="none"
    >
      <ConvexScene />
    </Sequence>
    <Sequence
      from={TIMING.outro.from}
      durationInFrames={TIMING.outro.duration}
      layout="none"
    >
      <Outro />
    </Sequence>
  </AbsoluteFill>
);
