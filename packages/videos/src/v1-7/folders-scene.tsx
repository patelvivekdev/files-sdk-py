import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import { FOLDERS_ACTION_FRAMES, FoldersPanel } from "./folders-panel";
import { SceneTitle } from "./scene-title";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 30;

const LINES: Line[] = [
  [
    ["const ", "kw"],
    ["{ items, prefixes } = "],
    ["await ", "kw"],
    ["files"],
    ["."],
    ["list", "at"],
    ["({"],
  ],
  [["  "], ["prefix", "at"], [": "], ['"photos/"', "str"], [","]],
  [["  "], ["delimiter", "at"], [": "], ['"/"', "str"], [","]],
  [["});"]],
  [],
  [["// subfolders, collapsed at the delimiter", "cm"]],
  [
    ["for ", "kw"],
    ["("],
    ["const ", "kw"],
    ["folder "],
    ["of ", "kw"],
    ["prefixes ?? []) {"],
  ],
  [["  console"], ["."], ["log", "at"], ["(folder);"]],
  [["}"]],
  [],
  [["// files directly under the prefix", "cm"]],
  [
    ["for ", "kw"],
    ["("],
    ["const ", "kw"],
    ["file "],
    ["of ", "kw"],
    ["items) {"],
  ],
  [["  console"], ["."], ["log", "at"], ["(file.key);"]],
  [["}"]],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const FOLDERS_SCENE_DURATION =
  ACTION_START + FOLDERS_ACTION_FRAMES + DWELL + EXIT;

export const FoldersScene: React.FC = () => {
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
    [FOLDERS_SCENE_DURATION - EXIT, FOLDERS_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [FOLDERS_SCENE_DURATION - EXIT, FOLDERS_SCENE_DURATION - 2],
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
      <SceneTitle title="List folders with delimiters." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="browser.ts"
          lines={LINES}
          showActiveLine={false}
          width={700}
        />
        <FoldersPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
