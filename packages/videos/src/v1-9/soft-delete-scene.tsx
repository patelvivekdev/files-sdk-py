import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import { SceneTitle } from "./scene-title";
import {
  SOFT_DELETE_ACTION_FRAMES,
  SoftDeletePanel,
} from "./soft-delete-panel";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ softDelete } "],
    ["from ", "kw"],
    ['"files-sdk/soft-delete"', "str"],
  ],
  [
    ["import ", "kw"],
    ["{ createFiles } "],
    ["from ", "kw"],
    ['"files-sdk"', "str"],
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
    ["softDelete", "at"],
    ["()],"],
  ],
  [["});"]],
  [],
  [["// delete moves it to .trash/ — nothing is destroyed", "cm"]],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["delete", "at"],
    ["("],
    ['"report.pdf"', "str"],
    [");"],
  ],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["restore", "at"],
    ["("],
    ['"report.pdf"', "str"],
    [");"],
  ],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["purge", "at"],
    ["();   "],
    ["// bytes finally leave", "cm"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const SOFT_DELETE_SCENE_DURATION =
  ACTION_START + SOFT_DELETE_ACTION_FRAMES + DWELL + EXIT;

export const SoftDeleteScene: React.FC = () => {
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
    [SOFT_DELETE_SCENE_DURATION - EXIT, SOFT_DELETE_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [SOFT_DELETE_SCENE_DURATION - EXIT, SOFT_DELETE_SCENE_DURATION - 2],
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
        eyebrow="Plugin · softDelete"
        title="A recycle bin for any adapter."
      />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="soft-delete.ts"
          lines={LINES}
          showActiveLine={false}
          width={760}
        />
        <SoftDeletePanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
