import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { useCurrentFrame } from "remotion";

import { buildLines, colorOf, renderLines } from "./code";
import type { AdapterId, RenderedLine } from "./code";

const { fontFamily: geistMono } = loadGeistMono();
const { fontFamily: geist } = loadGeist();

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

const lineBackground = (isAdapterLine: boolean, isActive: boolean): string => {
  if (isAdapterLine) {
    return "rgba(217, 119, 6, 0.10)";
  }
  if (isActive) {
    return "rgba(31, 41, 55, 0.06)";
  }
  return "transparent";
};

const CodeLine: React.FC<{
  rendered: RenderedLine;
  isActive: boolean;
  isAdapterLine: boolean;
  showCursor: boolean;
  showTrailingCursor: boolean;
}> = ({
  rendered,
  isActive,
  isAdapterLine,
  showCursor,
  showTrailingCursor,
}) => {
  const background = lineBackground(isAdapterLine, isActive);
  return (
    <div
      style={{
        alignItems: "center",
        background,
        borderRadius: 6,
        display: "flex",
        height: 38,
        margin: "0 -12px",
        padding: "0 12px",
        position: "relative",
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
      {(showCursor || showTrailingCursor) && (
        <span
          style={{
            background: "#1F2937",
            display: "inline-block",
            height: 26,
            marginLeft: 2,
            transform: "translateY(1px)",
            width: 10,
          }}
        />
      )}
    </div>
  );
};

interface CodeWindowProps {
  adapter: AdapterId;
  budget: number;
  showActiveLine?: boolean;
  highlightAdapterLines?: boolean;
}

export const CodeWindow: React.FC<CodeWindowProps> = ({
  adapter,
  budget,
  showActiveLine = true,
  highlightAdapterLines = false,
}) => {
  const lines = buildLines(adapter);
  const { rendered, activeLine } = renderLines(lines, budget);
  const frame = useCurrentFrame();
  const cursorOn = Math.floor(frame / 15) % 2 === 0;

  return (
    <div
      style={{
        backdropFilter: "blur(8px)",
        background: "#FBF9F4",
        borderRadius: 16,
        boxShadow:
          "0 40px 90px rgba(60, 40, 20, 0.28), 0 1px 0 rgba(255, 255, 255, 0.6) inset",
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
            pointerEvents: "none",
            position: "absolute",
          }}
        >
          src/files.tsx
        </div>
      </div>
      <div
        style={{
          color: "#374151",
          fontFamily: geistMono,
          fontSize: 22,
          lineHeight: 1.7,
          padding: "28px 36px 36px",
        }}
      >
        {rendered.map((rl, i) => (
          <CodeLine
            key={i}
            rendered={rl}
            isActive={showActiveLine && i === activeLine}
            isAdapterLine={highlightAdapterLines && (i === 1 || i === 4)}
            showCursor={rl.partial && cursorOn}
            showTrailingCursor={
              showActiveLine &&
              i === activeLine &&
              !rl.partial &&
              cursorOn &&
              !rl.empty
            }
          />
        ))}
      </div>
    </div>
  );
};
