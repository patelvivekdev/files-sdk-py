import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import { DedupPanel, DEDUP_ACTION_FRAMES } from "./dedup-panel";
import { SceneTitle } from "./scene-title";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ dedup } "],
    ["from ", "kw"],
    ['"files-sdk/dedup"', "str"],
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
    ["dedup", "at"],
    ["()],"],
  ],
  [["});"]],
  [],
  [["// identical bytes are written once", "cm"]],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"photos/a.png"', "str"],
    [", bytes);"],
  ],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"photos/b.png"', "str"],
    [", bytes);"],
  ],
  [],
  [["// copy just shares the blob", "cm"]],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["copy", "at"],
    ["("],
    ['"photos/a.png"', "str"],
    [", "],
    ['"photos/c.png"', "str"],
    [");"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const DEDUP_SCENE_DURATION =
  ACTION_START + DEDUP_ACTION_FRAMES + DWELL + EXIT;

export const DedupScene: React.FC = () => {
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
    [DEDUP_SCENE_DURATION - EXIT, DEDUP_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [DEDUP_SCENE_DURATION - EXIT, DEDUP_SCENE_DURATION - 2],
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
      <SceneTitle eyebrow="Plugin · dedup" title="Store each blob once." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="dedup.ts"
          lines={LINES}
          showActiveLine={false}
          width={720}
        />
        <DedupPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
