import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "./code";
import type { Line } from "./code";
import { FPS, typedBudget } from "./code-scene";
import { CodeWindow } from "./code-window";
import { SceneTitle } from "./scene-title";
import { UPLOAD_ACTION_FRAMES, UploadList } from "./upload-list";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
// beat between finishing the code and the uploads kicking off
const PAUSE = 8;
const DWELL = 36;

const LINES: Line[] = [
  [["const ", "kw"], ["items = ["]],
  [
    ["  { "],
    ["key", "at"],
    [": "],
    ['"hero.jpg"', "str"],
    [", "],
    ["body", "at"],
    [": hero },"],
  ],
  [
    ["  { "],
    ["key", "at"],
    [": "],
    ['"promo.mp4"', "str"],
    [", "],
    ["body", "at"],
    [": promo },"],
  ],
  [["  "], ["// …two more", "cm"]],
  [["];"]],
  [],
  [["await ", "kw"], ["files"], ["."], ["upload", "at"], ["(items, {"]],
  [["  "], ["onProgress", "at"], ["({ key, loaded, total }) {"]],
  [
    ["    bars"],
    ["."],
    ["get", "at"],
    ["(key)?."],
    ["set", "at"],
    ["(loaded / total);"],
  ],
  [["  },"]],
  [["});"]],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const PROGRESS_SCENE_DURATION =
  ACTION_START + UPLOAD_ACTION_FRAMES + DWELL + EXIT;

export const ProgressScene: React.FC = () => {
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
    [PROGRESS_SCENE_DURATION - EXIT, PROGRESS_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [PROGRESS_SCENE_DURATION - EXIT, PROGRESS_SCENE_DURATION - 2],
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
      <SceneTitle title="Live upload progress." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="upload.ts"
          lines={LINES}
          showActiveLine={false}
          width={700}
        />
        <UploadList frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
