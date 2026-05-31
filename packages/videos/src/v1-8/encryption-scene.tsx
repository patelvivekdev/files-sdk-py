import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import { EncryptionPanel, ENCRYPTION_ACTION_FRAMES } from "./encryption-panel";
import { SceneTitle } from "./scene-title";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [["import ", "kw"], ["{ encryption, generateEncryptionKey }"]],
  [["  "], ["from ", "kw"], ['"files-sdk/encryption"', "str"], [";"]],
  [],
  [
    ["const ", "kw"],
    ["key = "],
    ["await ", "kw"],
    ["generateEncryptionKey", "at"],
    ["();"],
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
    ["encryption", "at"],
    ["(key)],"],
  ],
  [["});"]],
  [],
  [["// AES-256-GCM envelope — per-object data keys", "cm"]],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"secret.txt"', "str"],
    [", data);"],
  ],
  [
    ["await ", "kw"],
    ["(await ", "kw"],
    ["files"],
    ["."],
    ["download", "at"],
    ["("],
    ['"secret.txt"', "str"],
    [")).text();"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const ENCRYPTION_SCENE_DURATION =
  ACTION_START + ENCRYPTION_ACTION_FRAMES + DWELL + EXIT;

export const EncryptionScene: React.FC = () => {
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
    [ENCRYPTION_SCENE_DURATION - EXIT, ENCRYPTION_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [ENCRYPTION_SCENE_DURATION - EXIT, ENCRYPTION_SCENE_DURATION - 2],
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
      <SceneTitle eyebrow="Plugin · encryption" title="Encrypt at rest." />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="encryption.ts"
          lines={LINES}
          showActiveLine={false}
          width={740}
        />
        <EncryptionPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
