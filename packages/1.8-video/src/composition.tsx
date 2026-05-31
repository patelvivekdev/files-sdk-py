import { AbsoluteFill, Sequence } from "remotion";

import { Background } from "./background";
import { CompressionScene } from "./compression-scene";
import { ContentTypeScene } from "./content-type-scene";
import { DedupScene } from "./dedup-scene";
import { EncryptionScene } from "./encryption-scene";
import { GalleryScene } from "./gallery-scene";
import { IntroScene } from "./intro-scene";
import { Outro } from "./outro";
import { SearchScene } from "./search-scene";
import { TIMING } from "./timings";
import { TracingScene } from "./tracing-scene";
import { UsageScene } from "./usage-scene";
import { ValidationScene } from "./validation-scene";
import { VersioningScene } from "./versioning-scene";

const SCENES = [
  { Component: IntroScene, key: "intro" as const },
  { Component: SearchScene, key: "search" as const },
  { Component: GalleryScene, key: "gallery" as const },
  { Component: EncryptionScene, key: "encryption" as const },
  { Component: CompressionScene, key: "compression" as const },
  { Component: ContentTypeScene, key: "contentType" as const },
  { Component: DedupScene, key: "dedup" as const },
  { Component: UsageScene, key: "usage" as const },
  { Component: ValidationScene, key: "validation" as const },
  { Component: VersioningScene, key: "versioning" as const },
  { Component: TracingScene, key: "tracing" as const },
  { Component: Outro, key: "outro" as const },
];

export const FilesSdk18: React.FC = () => (
  <AbsoluteFill style={{ background: "#1a1410" }}>
    <Background />
    {SCENES.map(({ Component, key }) => (
      <Sequence
        durationInFrames={TIMING[key].duration}
        from={TIMING[key].from}
        key={key}
        layout="none"
      >
        <Component />
      </Sequence>
    ))}
  </AbsoluteFill>
);
