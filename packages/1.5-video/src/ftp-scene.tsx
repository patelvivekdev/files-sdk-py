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
  [
    ["import ", "kw"],
    ["{ Files } "],
    ["from ", "kw"],
    ['"files-sdk"', "str"],
    [";"],
  ],
  [
    ["import ", "kw"],
    ["{ sftp } "],
    ["from ", "kw"],
    ['"files-sdk/sftp"', "str"],
    [";"],
  ],
  [],
  [["const ", "kw"], ["files = "], ["new ", "kw"], ["Files", "tg"], ["({"]],
  [["  "], ["adapter", "at"], [": "], ["sftp", "at"], ["({"]],
  [["    "], ["host", "at"], [": "], ['"files.example.com"', "str"], [","]],
  [["    "], ["username", "at"], [": process.env.SFTP_USERNAME!,"]],
  [["    "], ["privateKey", "at"], [": process.env.SFTP_PRIVATE_KEY!,"]],
  [["    "], ["root", "at"], [": "], ['"/uploads"', "str"], [","]],
  [["  }),"]],
  [["});"]],
  [],
  [
    ["await ", "kw"],
    ["files"],
    ["."],
    ["upload", "at"],
    ["("],
    ['"reports/q1.csv"', "str"],
    [", csv, { "],
    ["contentType", "at"],
    [": "],
    ['"text/csv"', "str"],
    [" });"],
  ],
];

const TOTAL = totalChars(LINES);
const TYPE_FRAMES = Math.ceil((TOTAL / CHARS_PER_SEC) * FPS);
const DWELL = 50;
export const FTP_SCENE_DURATION = ENTER + TYPE_FRAMES + DWELL + EXIT;

export const FtpScene: React.FC = () => {
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
    [FTP_SCENE_DURATION - EXIT, FTP_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [FTP_SCENE_DURATION - EXIT, FTP_SCENE_DURATION - 2],
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
          FTP &amp; SFTP, same API.
        </div>
      </div>
      <CodeWindow
        lines={LINES}
        budget={budget}
        filename="src/storage.ts"
        showActiveLine={false}
      />
    </AbsoluteFill>
  );
};
