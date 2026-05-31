import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import { SceneTitle } from "./scene-title";
import { TRANSFER_ACTION_FRAMES, TransferPanel } from "./transfer-panel";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 18;

const LINES: Line[] = [
  [["const ", "kw"], ["from = "], ["new ", "kw"], ["Files", "tg"], ["({"]],
  [
    ["  "],
    ["adapter", "at"],
    [": "],
    ["s3", "at"],
    ["({ "],
    ["bucket", "at"],
    [": "],
    ['"prod"', "str"],
    [" }),"],
  ],
  [["});"]],
  [["const ", "kw"], ["to = "], ["new ", "kw"], ["Files", "tg"], ["({"]],
  [
    ["  "],
    ["adapter", "at"],
    [": "],
    ["googleDrive", "at"],
    ["({ rootFolderId }),"],
  ],
  [["});"]],
  [],
  [["// stream every object straight to Google Drive", "cm"]],
  [["await ", "kw"], ["transfer", "at"], ["(from, to, {"]],
  [["  "], ["prefix", "at"], [": "], ['"uploads/"', "str"], [","]],
  [
    ["  "],
    ["onProgress", "at"],
    [": ({ done }) => "],
    ["setCount", "at"],
    ["(done),"],
  ],
  [["});"]],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const TRANSFER_SCENE_DURATION =
  ACTION_START + TRANSFER_ACTION_FRAMES + DWELL + EXIT;

export const TransferScene: React.FC = () => {
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
    [TRANSFER_SCENE_DURATION - EXIT, TRANSFER_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [TRANSFER_SCENE_DURATION - EXIT, TRANSFER_SCENE_DURATION - 2],
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
      <SceneTitle title="Cross-provider transfer." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="backup.ts"
          lines={LINES}
          showActiveLine={false}
          width={720}
        />
        <TransferPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
