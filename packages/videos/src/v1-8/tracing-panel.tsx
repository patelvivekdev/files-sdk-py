import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const STEP = 17;
const GROW = 13;

interface Span {
  name: string;
  startMs: number;
  durMs: number;
  depth: number;
  attr: string;
}

// One span per operation, nested by call. Bars fill in as each span runs,
// the way a trace renders in a waterfall view.
const SPANS: Span[] = [
  {
    attr: "size 2.1 MB",
    depth: 0,
    durMs: 12,
    name: "files.upload",
    startMs: 0,
  },
  { attr: "", depth: 1, durMs: 4, name: "files.head", startMs: 13 },
  {
    attr: "size 2.1 MB",
    depth: 0,
    durMs: 18,
    name: "files.download",
    startMs: 20,
  },
  { attr: "count 128", depth: 0, durMs: 7, name: "files.list", startMs: 41 },
];
const TOTAL_MS = 48;

const LAST_DONE = (SPANS.length - 1) * STEP + GROW;
/** Spans stream into the waterfall in order. */
export const TRACING_ACTION_FRAMES = LAST_DONE + 30;

const SpanRow: React.FC<{ span: Span; frame: number; index: number }> = ({
  span,
  frame,
  index,
}) => {
  const at = index * STEP;
  const reveal = interpolate(frame, [at, at + 8], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const grow = interpolate(frame, [at, at + GROW], [0, 1], {
    easing: Easing.bezier(0.33, 1, 0.68, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const settled = frame >= at + GROW;
  const left = (span.startMs / TOTAL_MS) * 100;
  const width = (span.durMs / TOTAL_MS) * 100 * grow;
  const nested = span.depth > 0;

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        gap: 14,
        height: 46,
        opacity: reveal,
        padding: "0 22px",
      }}
    >
      <span
        style={{
          color: nested ? "#6B7280" : "#1F2937",
          fontFamily: geistMono,
          fontSize: 14,
          letterSpacing: -0.2,
          paddingLeft: span.depth * 14,
          width: 168,
        }}
      >
        {span.name}
      </span>
      <div style={{ flex: 1, position: "relative" }}>
        <div
          style={{
            background: nested ? "#60A5FA" : "#2563EB",
            borderRadius: 5,
            height: 14,
            left: `${left}%`,
            position: "absolute",
            top: -7,
            width: `${width}%`,
          }}
        />
      </div>
      <span
        style={{
          color: "#9CA3AF",
          fontFamily: geistMono,
          fontSize: 13,
          textAlign: "right",
          width: 96,
        }}
      >
        {settled ? `${span.durMs}ms` : ""}
        {settled && span.attr ? (
          <span style={{ color: "#C7B59C" }}> · {span.attr}</span>
        ) : null}
      </span>
    </div>
  );
};

export const TracingPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const done = frame >= LAST_DONE;

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 14,
        boxShadow:
          "0 18px 48px rgba(60, 40, 20, 0.18), 0 1px 0 rgba(255,255,255,0.6) inset",
        fontFamily: geist,
        overflow: "hidden",
        width: 600,
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: "#FAFAF7",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          height: 58,
          justifyContent: "space-between",
          padding: "0 22px",
        }}
      >
        <span
          style={{
            color: "#1F2937",
            fontFamily: geistMono,
            fontSize: 16,
            letterSpacing: -0.2,
          }}
        >
          trace
        </span>
        <span
          style={{
            background: "rgba(37,99,235,0.12)",
            borderRadius: 999,
            color: "#2563EB",
            fontFamily: geistMono,
            fontSize: 12,
            padding: "3px 10px",
          }}
        >
          {done ? "4 spans" : "recording…"}
        </span>
      </div>

      <div style={{ padding: "16px 0 14px" }}>
        {SPANS.map((span, i) => (
          <SpanRow frame={frame} index={i} key={span.name} span={span} />
        ))}
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.05)",
          color: "#9CA3AF",
          fontFamily: geistMono,
          fontSize: 13,
          letterSpacing: -0.1,
          padding: "13px 22px",
        }}
      >
        exported via @opentelemetry/api
      </div>
    </div>
  );
};
