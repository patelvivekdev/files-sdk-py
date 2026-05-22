import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "./code";
import type { Line } from "./code";
import { CodeWindow } from "./code-window";

const { fontFamily: geist } = loadGeist();

const FPS = 30;
const CHARS_PER_SEC = 55;
const ENTER = 18;
const EXIT = 16;

const LINES: Line[] = [
  [["// delete one — throws on failure", "cm"]],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["delete", "at"],
    ["("],
    ['"avatars/old.png"', "str"],
    [");"],
  ],
  [],
  [["// or many — a structured result, no partial throw", "cm"]],
  [
    ["const ", "kw"],
    ["res = "],
    ["await ", "kw"],
    ["files"],
    ["."],
    ["delete", "at"],
    ["(["],
    ['"a.png"', "str"],
    [", "],
    ['"b.png"', "str"],
    [", "],
    ['"c.png"', "str"],
    ["]);"],
  ],
  [
    ["res"],
    ["."],
    ["deleted", "at"],
    ["; "],
    ["// string[], in the order supplied", "cm"],
  ],
  [
    ["res"],
    ["."],
    ["errors", "at"],
    [";  "],
    ["// per-key failures, or undefined", "cm"],
  ],
  [],
  [["// upload, download, head & exists take arrays too", "cm"]],
  [
    ["const ", "kw"],
    ["{ uploaded, errors } = "],
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["(["],
  ],
  [
    ["  { "],
    ["key", "at"],
    [": "],
    ['"a.png"', "str"],
    [", "],
    ["body", "at"],
    [": a, "],
    ["contentType", "at"],
    [": "],
    ['"image/png"', "str"],
    [" },"],
  ],
  [
    ["  { "],
    ["key", "at"],
    [": "],
    ['"b.png"', "str"],
    [", "],
    ["body", "at"],
    [": b },"],
  ],
  [["]);"]],
];

const TOTAL = totalChars(LINES);
const TYPE_FRAMES = Math.ceil((TOTAL / CHARS_PER_SEC) * FPS);
const DWELL = 50;
export const BULK_SCENE_DURATION = ENTER + TYPE_FRAMES + DWELL + EXIT;

export const BulkScene: React.FC = () => {
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
    [BULK_SCENE_DURATION - EXIT, BULK_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [BULK_SCENE_DURATION - EXIT, BULK_SCENE_DURATION - 2],
    [0, -14],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const typingFrame = Math.max(0, frame - ENTER);
  const budget = Math.min(
    TOTAL,
    Math.floor((typingFrame / FPS) * CHARS_PER_SEC)
  );

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        flexDirection: "column",
        gap: 28,
        justifyContent: "center",
        opacity: enterOpacity * exitOpacity,
        transform: `translateY(${enterLift + exitLift}px)`,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          flexDirection: "column",
          gap: 6,
        }}
      >
        <div
          style={{
            color: "#FDE68A",
            fontFamily: geist,
            fontSize: 15,
            letterSpacing: 0.6,
            textShadow: "0 1px 10px rgba(20, 12, 6, 0.40)",
            textTransform: "uppercase",
          }}
        >
          New in 1.5
        </div>
        <div
          style={{
            color: "#FFFFFF",
            fontFamily: geist,
            fontSize: 44,
            fontWeight: 600,
            letterSpacing: -1.2,
            textShadow:
              "0 2px 20px rgba(20, 12, 6, 0.45), 0 1px 2px rgba(20, 12, 6, 0.30)",
          }}
        >
          Bulk file operations.
        </div>
      </div>
      <CodeWindow
        lines={LINES}
        budget={budget}
        filename="bulk.ts"
        showActiveLine={false}
      />
    </AbsoluteFill>
  );
};
