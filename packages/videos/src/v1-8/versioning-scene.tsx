import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import { SceneTitle } from "./scene-title";
import { VersioningPanel, VERSIONING_ACTION_FRAMES } from "./versioning-panel";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ versioning } "],
    ["from ", "kw"],
    ['"files-sdk/versioning"', "str"],
    [";"],
  ],
  [],
  [["const ", "kw"], ["files = "], ["createFiles", "at"], ["({"]],
  [["  "], ["adapter", "at"], [": "], ["s3", "at"], ["(),"]],
  [
    ["  "],
    ["plugins", "at"],
    [": ["],
    ["versioning", "at"],
    ["({ "],
    ["limit", "at"],
    [": 20 })],"],
  ],
  [["});"]],
  [],
  [["// each overwrite snapshots the prior bytes", "cm"]],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"notes.txt"', "str"],
    [", v2);"],
  ],
  [],
  [
    ["const ", "kw"],
    ["history = "],
    ["await ", "kw"],
    ["files"],
    ["."],
    ["versions", "at"],
    ["("],
    ['"notes.txt"', "str"],
    [");"],
  ],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["restore", "at"],
    ["("],
    ['"notes.txt"', "str"],
    [");  "],
    ["// roll back", "cm"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const VERSIONING_SCENE_DURATION =
  ACTION_START + VERSIONING_ACTION_FRAMES + DWELL + EXIT;

export const VersioningScene: React.FC = () => {
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
    [VERSIONING_SCENE_DURATION - EXIT, VERSIONING_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [VERSIONING_SCENE_DURATION - EXIT, VERSIONING_SCENE_DURATION - 2],
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
      <SceneTitle eyebrow="Plugin · versioning" title="Snapshot every write." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="versioning.ts"
          lines={LINES}
          showActiveLine={false}
          width={740}
        />
        <VersioningPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
