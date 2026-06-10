import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { FPS, typedBudget } from "./code-scene";
import { SceneTitle } from "./scene-title";
import { SIGNED_URL_ACTION_FRAMES, SignedUrlPanel } from "./signed-url-panel";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [["import ", "kw"], ["{ signedUrlPolicy }"]],
  [["  "], ["from ", "kw"], ['"files-sdk/signed-url-policy"', "str"], [";"]],
  [],
  [["const ", "kw"], ["files = "], ["new ", "kw"], ["Files", "tg"], ["({"]],
  [["  "], ["adapter", "at"], [": "], ["s3", "at"], ["(),"]],
  [["  "], ["plugins", "at"], [": ["], ["signedUrlPolicy", "at"], ["({"]],
  [["    "], ["maxExpiresIn", "at"], [": 3600,"]],
  [["    "], ["maxUploadSize", "at"], [": 10_000_000,"]],
  [["  })],"]],
  [["});"]],
  [],
  [["// forces attachment, clamps the expiry", "cm"]],
  [
    ["const ", "kw"],
    ["url = "],
    ["await ", "kw"],
    ["files"],
    ["."],
    ["url", "at"],
    ["("],
    ['"user-upload.svg"', "str"],
    [");"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const SIGNED_URL_SCENE_DURATION =
  ACTION_START + SIGNED_URL_ACTION_FRAMES + DWELL + EXIT;

export const SignedUrlScene: React.FC = () => {
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
    [SIGNED_URL_SCENE_DURATION - EXIT, SIGNED_URL_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [SIGNED_URL_SCENE_DURATION - EXIT, SIGNED_URL_SCENE_DURATION - 2],
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
        eyebrow="Plugin · signedUrlPolicy"
        title="Safe URLs by default."
      />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="signed-url-policy.ts"
          lines={LINES}
          showActiveLine={false}
          width={760}
        />
        <SignedUrlPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
