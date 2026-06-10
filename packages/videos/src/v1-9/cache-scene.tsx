import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { CACHE_ACTION_FRAMES, CachePanel } from "./cache-panel";
import { FPS, typedBudget } from "./code-scene";
import { SceneTitle } from "./scene-title";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ cache } "],
    ["from ", "kw"],
    ['"files-sdk/cache"', "str"],
    [";"],
  ],
  [],
  [["const ", "kw"], ["files = "], ["createFiles", "at"], ["({"]],
  [
    ["  "],
    ["adapter", "at"],
    [": "],
    ["s3", "at"],
    ["(), "],
    ["plugins", "at"],
    [": ["],
    ["cache", "at"],
    ["({ "],
    ["ttl", "at"],
    [": 60 })],"],
  ],
  [["});"]],
  [],
  [["// repeat reads skip the round-trip", "cm"]],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["head", "at"],
    ["("],
    ['"avatar.png"', "str"],
    [");   "],
    ["// MISS", "cm"],
  ],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["head", "at"],
    ["("],
    ['"avatar.png"', "str"],
    [");   "],
    ["// HIT", "cm"],
  ],
  [],
  [["files"], ["."], ["cacheStats", "at"], ["();"]],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const CACHE_SCENE_DURATION =
  ACTION_START + CACHE_ACTION_FRAMES + DWELL + EXIT;

export const CacheScene: React.FC = () => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [0, ENTER], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const enterLift = interpolate(frame, [0, ENTER], [16, 0], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    frame,
    [CACHE_SCENE_DURATION - EXIT, CACHE_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [CACHE_SCENE_DURATION - EXIT, CACHE_SCENE_DURATION - 2],
    [0, -14],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        flexDirection: "column",
        gap: 44,
        justifyContent: "center",
        opacity: enterOpacity * exitOpacity,
        transform: `translateY(${enterLift + exitLift}px)`,
      }}
    >
      <SceneTitle
        eyebrow="Plugin · cache"
        title="Serve hot reads from memory."
      />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="cache.ts"
          lines={LINES}
          showActiveLine={false}
          width={760}
        />
        <CachePanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
