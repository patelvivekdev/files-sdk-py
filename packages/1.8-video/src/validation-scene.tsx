import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "./code";
import type { Line } from "./code";
import { FPS, typedBudget } from "./code-scene";
import { CodeWindow } from "./code-window";
import { SceneTitle } from "./scene-title";
import { ValidationPanel, VALIDATION_ACTION_FRAMES } from "./validation-panel";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ validation } "],
    ["from ", "kw"],
    ['"files-sdk/validation"', "str"],
    [";"],
  ],
  [],
  [["const ", "kw"], ["files = "], ["createFiles", "at"], ["({"]],
  [["  "], ["adapter", "at"], [": "], ["s3", "at"], ["(),"]],
  [["  "], ["plugins", "at"], [": ["], ["validation", "at"], ["({"]],
  [["    "], ["maxSize", "at"], [": 10 * 1024 * 1024,"]],
  [
    ["    "],
    ["allowedTypes", "at"],
    [": ["],
    ['"image/*"', "str"],
    [", "],
    ['"application/pdf"', "str"],
    ["],"],
  ],
  [["    "], ["key", "at"], [": /^[\\w.-]+$/,"]],
  [["  })],"]],
  [["});"]],
  [],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"photo.png"', "str"],
    [", bytes);   "],
    ["// ok", "cm"],
  ],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"backup.zip"', "str"],
    [", big);   "],
    ["// throws", "cm"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const VALIDATION_SCENE_DURATION =
  ACTION_START + VALIDATION_ACTION_FRAMES + DWELL + EXIT;

export const ValidationScene: React.FC = () => {
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
    [VALIDATION_SCENE_DURATION - EXIT, VALIDATION_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [VALIDATION_SCENE_DURATION - EXIT, VALIDATION_SCENE_DURATION - 2],
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
      <SceneTitle eyebrow="Plugin · validation" title="Reject bad uploads." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="validation.ts"
          lines={LINES}
          showActiveLine={false}
          width={720}
        />
        <ValidationPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
