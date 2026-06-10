import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { totalChars } from "../shared/code";
import type { Line } from "../shared/code";
import { CodeWindow } from "../shared/code-window";
import { AUDIT_ACTION_FRAMES, AuditPanel } from "./audit-panel";
import { FPS, typedBudget } from "./code-scene";
import { SceneTitle } from "./scene-title";

const ENTER = 18;
const EXIT = 16;
const CHARS_PER_SEC = 55;
const PAUSE = 8;
const DWELL = 26;

const LINES: Line[] = [
  [
    ["import ", "kw"],
    ["{ audit } "],
    ["from ", "kw"],
    ['"files-sdk/audit"', "str"],
    [";"],
  ],
  [],
  [["const ", "kw"], ["files = "], ["new ", "kw"], ["Files", "tg"], ["({"]],
  [["  "], ["adapter", "at"], [": "], ["s3", "at"], ["(),"]],
  [["  "], ["plugins", "at"], [": ["], ["audit", "at"], ["({"]],
  [
    ["    "],
    ["sink", "at"],
    [": ("],
    ["record"],
    [") => "],
    ["db"],
    ["."],
    ["insert", "at"],
    ["(record),   "],
    ["// awaited", "cm"],
  ],
  [
    ["    "],
    ["actor", "at"],
    [": () => "],
    ["ctx"],
    ["."],
    ["user"],
    ["."],
    ["id,"],
  ],
  [["  })],"]],
  [["});"]],
  [],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"report.pdf"', "str"],
    [", data);"],
  ],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["delete", "at"],
    ["("],
    ['"old.log"', "str"],
    [");"],
  ],
];

const TYPE_FRAMES = Math.ceil((totalChars(LINES) / CHARS_PER_SEC) * FPS);
const ACTION_START = ENTER + TYPE_FRAMES + PAUSE;
export const AUDIT_SCENE_DURATION =
  ACTION_START + AUDIT_ACTION_FRAMES + DWELL + EXIT;

export const AuditScene: React.FC = () => {
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
    [AUDIT_SCENE_DURATION - EXIT, AUDIT_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [AUDIT_SCENE_DURATION - EXIT, AUDIT_SCENE_DURATION - 2],
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
        eyebrow="Plugin · audit"
        title="An audit trail you can trust."
      />
      <div style={{ alignItems: "center", display: "flex", gap: 56 }}>
        <CodeWindow
          budget={typedBudget(frame, LINES)}
          filename="audit.ts"
          lines={LINES}
          showActiveLine={false}
          width={760}
        />
        <AuditPanel frame={frame - ACTION_START} />
      </div>
    </AbsoluteFill>
  );
};
