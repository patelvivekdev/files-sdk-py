import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { AI_HIGHLIGHT_LINES, AI_SDKS, buildAiLines } from "./ai-code";
import type { AiSdkId } from "./ai-code";
import { colorOf, renderLines, totalChars } from "./code";
import type { Line, RenderedLine } from "./code";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const FPS = 30;
const TYPE_CPS = 80;
const UNTYPE_CPS = 140;
const HEADER_END = 7;
const HIGHLIGHT_DURATION = 26;
const VERCEL_POST_DWELL = 34;
const MID_DWELL = 30;
const FINAL_DWELL = 48;
const ENTER = 16;
const EXIT = 16;

const VERCEL_LINES = buildAiLines("vercel");
const OPENAI_LINES = buildAiLines("openai");
const CLAUDE_LINES = buildAiLines("claude");

const headerChars = (lines: Line[]): number => {
  let n = 0;
  for (let i = 0; i <= HEADER_END; i += 1) {
    for (const tok of lines[i]) {
      n += tok[0].length;
    }
    n += 1;
  }
  return n;
};

const TOTAL = {
  claude: totalChars(CLAUDE_LINES),
  openai: totalChars(OPENAI_LINES),
  vercel: totalChars(VERCEL_LINES),
};
const HEADER = {
  claude: headerChars(CLAUDE_LINES),
  openai: headerChars(OPENAI_LINES),
  vercel: headerChars(VERCEL_LINES),
};
const BODY = {
  claude: TOTAL.claude - HEADER.claude,
  openai: TOTAL.openai - HEADER.openai,
  vercel: TOTAL.vercel - HEADER.vercel,
};

const framesForChars = (chars: number, cps: number): number =>
  Math.ceil((chars / cps) * FPS);

const T_VERCEL_TYPE_END = framesForChars(TOTAL.vercel, TYPE_CPS);
const T_VERCEL_DWELL_END = T_VERCEL_TYPE_END + VERCEL_POST_DWELL;
const T_UNTYPE_V_END =
  T_VERCEL_DWELL_END + framesForChars(BODY.vercel, UNTYPE_CPS);
const T_TYPE_OPENAI_END =
  T_UNTYPE_V_END + framesForChars(BODY.openai, TYPE_CPS);
const T_OPENAI_DWELL_END = T_TYPE_OPENAI_END + MID_DWELL;
const T_UNTYPE_O_END =
  T_OPENAI_DWELL_END + framesForChars(BODY.openai, UNTYPE_CPS);
const T_TYPE_CLAUDE_END =
  T_UNTYPE_O_END + framesForChars(BODY.claude, TYPE_CPS);
const T_SCENE_END = T_TYPE_CLAUDE_END + FINAL_DWELL;

export const AI_SCENE_DURATION = T_SCENE_END;

const HIGHLIGHT_SET = new Set<number>(AI_HIGHLIGHT_LINES);

interface SceneState {
  sdk: AiSdkId;
  budget: number;
  highlight: boolean;
  isTyping: boolean;
  sdkStartFrame: number;
}

const computeState = (frame: number): SceneState => {
  if (frame < T_VERCEL_TYPE_END) {
    return {
      budget: Math.floor((frame / FPS) * TYPE_CPS),
      highlight: false,
      isTyping: true,
      sdk: "vercel",
      sdkStartFrame: 0,
    };
  }
  if (frame < T_VERCEL_DWELL_END) {
    return {
      budget: TOTAL.vercel,
      highlight: false,
      isTyping: false,
      sdk: "vercel",
      sdkStartFrame: 0,
    };
  }
  if (frame < T_UNTYPE_V_END) {
    const since = frame - T_VERCEL_DWELL_END;
    const removed = Math.floor((since / FPS) * UNTYPE_CPS);
    return {
      budget: Math.max(HEADER.vercel, TOTAL.vercel - removed),
      highlight: false,
      isTyping: false,
      sdk: "vercel",
      sdkStartFrame: 0,
    };
  }
  if (frame < T_TYPE_OPENAI_END) {
    const since = frame - T_UNTYPE_V_END;
    const typed = Math.floor((since / FPS) * TYPE_CPS);
    return {
      budget: HEADER.openai + Math.min(BODY.openai, typed),
      highlight: since < HIGHLIGHT_DURATION,
      isTyping: typed < BODY.openai,
      sdk: "openai",
      sdkStartFrame: T_UNTYPE_V_END,
    };
  }
  if (frame < T_OPENAI_DWELL_END) {
    return {
      budget: TOTAL.openai,
      highlight: false,
      isTyping: false,
      sdk: "openai",
      sdkStartFrame: T_UNTYPE_V_END,
    };
  }
  if (frame < T_UNTYPE_O_END) {
    const since = frame - T_OPENAI_DWELL_END;
    const removed = Math.floor((since / FPS) * UNTYPE_CPS);
    return {
      budget: Math.max(HEADER.openai, TOTAL.openai - removed),
      highlight: false,
      isTyping: false,
      sdk: "openai",
      sdkStartFrame: T_UNTYPE_V_END,
    };
  }
  if (frame < T_TYPE_CLAUDE_END) {
    const since = frame - T_UNTYPE_O_END;
    const typed = Math.floor((since / FPS) * TYPE_CPS);
    return {
      budget: HEADER.claude + Math.min(BODY.claude, typed),
      highlight: since < HIGHLIGHT_DURATION,
      isTyping: typed < BODY.claude,
      sdk: "claude",
      sdkStartFrame: T_UNTYPE_O_END,
    };
  }
  return {
    budget: TOTAL.claude,
    highlight: false,
    isTyping: false,
    sdk: "claude",
    sdkStartFrame: T_UNTYPE_O_END,
  };
};

const Dot: React.FC<{ color: string }> = ({ color }) => (
  <div
    style={{
      background: color,
      borderRadius: 6,
      height: 12,
      width: 12,
    }}
  />
);

const lineBackground = (isHighlighted: boolean): string =>
  isHighlighted ? "rgba(217, 119, 6, 0.12)" : "transparent";

const CodeLine: React.FC<{
  rendered: RenderedLine;
  showCursor: boolean;
  isHighlighted: boolean;
}> = ({ rendered, showCursor, isHighlighted }) => (
  <div
    style={{
      alignItems: "center",
      background: lineBackground(isHighlighted),
      borderRadius: 6,
      display: "flex",
      height: 32,
      margin: "0 -10px",
      padding: "0 10px",
      whiteSpace: "pre",
    }}
  >
    {rendered.tokens.length === 0 ? (
      <span>&nbsp;</span>
    ) : (
      rendered.tokens.map((tok, j) => (
        <span key={j} style={{ color: colorOf(tok[1]) }}>
          {tok[0]}
        </span>
      ))
    )}
    {showCursor && (
      <span
        style={{
          background: "#1F2937",
          display: "inline-block",
          height: 22,
          marginLeft: 2,
          transform: "translateY(1px)",
          width: 9,
        }}
      />
    )}
  </div>
);

export const AiScene: React.FC = () => {
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
    [AI_SCENE_DURATION - EXIT, AI_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [AI_SCENE_DURATION - EXIT, AI_SCENE_DURATION - 2],
    [0, -14],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const state = computeState(frame);
  const lines = buildAiLines(state.sdk);
  const { rendered } = renderLines(lines, state.budget);
  const meta = AI_SDKS[state.sdk];
  const cursorOn = Math.floor(frame / 15) % 2 === 0;
  const partialIdx = rendered.findIndex((rl) => rl.partial);
  const lastNonEmpty = (() => {
    for (let i = rendered.length - 1; i >= 0; i -= 1) {
      if (!rendered[i].empty) {
        return i;
      }
    }
    return -1;
  })();
  const filenameFade = Math.min(1, (frame - state.sdkStartFrame) / 6);

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "center",
        opacity: enterOpacity * exitOpacity,
        transform: `translateY(${enterLift + exitLift}px)`,
      }}
    >
      <div
        style={{
          backdropFilter: "blur(8px)",
          background: "#FBF9F4",
          borderRadius: 16,
          boxShadow:
            "0 40px 90px rgba(60, 40, 20, 0.32), 0 1px 0 rgba(255, 255, 255, 0.6) inset",
          overflow: "hidden",
          width: 1100,
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "rgba(245, 242, 233, 0.7)",
            borderBottom: "1px solid rgba(0, 0, 0, 0.04)",
            display: "flex",
            gap: 10,
            height: 48,
            padding: "0 18px",
            position: "relative",
          }}
        >
          <Dot color="#E8B6A8" />
          <Dot color="#EBD8A1" />
          <Dot color="#B8D4B0" />
          <div
            style={{
              alignItems: "center",
              color: "#9CA3AF",
              display: "flex",
              fontFamily: geist,
              fontSize: 15,
              inset: 0,
              justifyContent: "center",
              letterSpacing: -0.1,
              opacity: filenameFade,
              pointerEvents: "none",
              position: "absolute",
            }}
          >
            {meta.filename}
          </div>
        </div>
        <div
          style={{
            color: "#374151",
            fontFamily: geistMono,
            fontSize: 20,
            lineHeight: 1.6,
            padding: "26px 36px 32px",
          }}
        >
          {rendered.map((rl, i) => {
            const isPartial = i === partialIdx;
            const showTrailing =
              !state.isTyping && i === lastNonEmpty && !rl.partial && cursorOn;
            return (
              <CodeLine
                key={i}
                rendered={rl}
                showCursor={(isPartial && cursorOn) || showTrailing}
                isHighlighted={state.highlight && HIGHLIGHT_SET.has(i)}
              />
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
