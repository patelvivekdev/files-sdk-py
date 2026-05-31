import { AbsoluteFill, Sequence } from "remotion";

import { Background } from "../shared/background";
import { IntroScene } from "../shared/intro-scene";
import { Outro } from "../shared/outro";
import { CompressionScene } from "./compression-scene";
import { ContentTypeScene } from "./content-type-scene";
import { DedupScene } from "./dedup-scene";
import { EncryptionScene } from "./encryption-scene";
import { GalleryScene } from "./gallery-scene";
import { SearchScene } from "./search-scene";
import { TIMING } from "./timings";
import { TracingScene } from "./tracing-scene";
import { UsageScene } from "./usage-scene";
import { ValidationScene } from "./validation-scene";
import { VersioningScene } from "./versioning-scene";

const SCENES = [
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
];

export const FilesSdk18: React.FC = () => (
  <AbsoluteFill style={{ background: "#1a1410" }}>
    <Background src="background-2.jpg" />
    <Sequence
      durationInFrames={TIMING.intro.duration}
      from={TIMING.intro.from}
      layout="none"
    >
      <IntroScene
        command="npm i files-sdk@1.8.0"
        version="v1.8"
        tagline="search · a plugin system · 8 official plugins"
      />
    </Sequence>
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
    <Sequence
      durationInFrames={TIMING.outro.duration}
      from={TIMING.outro.from}
      layout="none"
    >
      <Outro tagline="One API for every storage provider. Now extensible." />
    </Sequence>
  </AbsoluteFill>
);
