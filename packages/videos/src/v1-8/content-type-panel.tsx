import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const STEP = 26;
const SNIFF = 18;

type Outcome = "verified" | "detected" | "rejected";

interface Row {
  name: string;
  declared: string;
  sniffed: string;
  outcome: Outcome;
}

// The first bytes are sniffed and compared to the declared type: a match is
// verified, an unknown declared type is filled in, a spoof is rejected.
const ROWS: Row[] = [
  {
    declared: "image/png",
    name: "avatar.png",
    outcome: "verified",
    sniffed: "image/png",
  },
  {
    declared: "octet-stream",
    name: "upload.bin",
    outcome: "detected",
    sniffed: "image/jpeg",
  },
  {
    declared: "image/png",
    name: "evil.png",
    outcome: "rejected",
    sniffed: "text/html",
  },
];

const LAST_DONE = (ROWS.length - 1) * STEP + SNIFF;
/** Each upload sniffs then resolves. */
export const CONTENT_TYPE_ACTION_FRAMES = LAST_DONE + 30;

const STYLE: Record<Outcome, { color: string; bg: string; glyph: string }> = {
  detected: { bg: "rgba(217,119,6,0.12)", color: "#B45309", glyph: "↪" },
  rejected: { bg: "rgba(185,28,28,0.10)", color: "#B91C1C", glyph: "✗" },
  verified: { bg: "rgba(5,150,105,0.12)", color: "#047857", glyph: "✓" },
};

const LABEL: Record<Outcome, string> = {
  detected: "detected",
  rejected: "rejected",
  verified: "verified",
};

const TypeInfo: React.FC<{ row: Row; reveal: number }> = ({ row, reveal }) => {
  const base = {
    color: "#6B7280",
    fontFamily: geistMono,
    fontSize: 13,
    opacity: reveal,
    transform: `translateY(${(1 - reveal) * 4}px)`,
  };
  if (row.outcome === "verified") {
    return <span style={base}>{row.sniffed}</span>;
  }
  return (
    <span style={base}>
      {row.declared} <span style={{ color: "#C7B59C" }}>→</span>{" "}
      <span style={{ color: STYLE[row.outcome].color }}>{row.sniffed}</span>
    </span>
  );
};

const Sniffing: React.FC<{ reveal: number }> = ({ reveal }) => (
  <span
    style={{
      alignItems: "center",
      color: "#C7BEB0",
      display: "flex",
      fontFamily: geistMono,
      fontSize: 13,
      gap: 6,
      opacity: reveal,
      position: "absolute",
      right: 0,
      top: 1,
    }}
  >
    <svg height="13" viewBox="0 0 20 20" width="13">
      <title>Sniffing</title>
      <circle
        cx="8.5"
        cy="8.5"
        fill="none"
        r="5.5"
        stroke="#C7BEB0"
        strokeWidth="2"
      />
      <path
        d="M13 13 L18 18"
        stroke="#C7BEB0"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
    sniffing…
  </span>
);

const Pill: React.FC<{ outcome: Outcome; reveal: number }> = ({
  outcome,
  reveal,
}) => {
  const s = STYLE[outcome];
  return (
    <span
      style={{
        alignItems: "center",
        background: s.bg,
        borderRadius: 999,
        color: s.color,
        display: "flex",
        fontFamily: geistMono,
        fontSize: 12,
        gap: 6,
        opacity: reveal,
        padding: "4px 11px",
        position: "absolute",
        right: 0,
        top: 0,
      }}
    >
      <span>{s.glyph}</span>
      {LABEL[outcome]}
    </span>
  );
};

const RowView: React.FC<{ row: Row; frame: number; index: number }> = ({
  row,
  frame,
  index,
}) => {
  const at = index * STEP;
  const reveal = interpolate(frame, [at, at + 10], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const resolve = interpolate(frame, [at + SNIFF, at + SNIFF + 12], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: 54,
        justifyContent: "space-between",
        opacity: reveal,
        padding: "0 22px",
        transform: `translateX(${(1 - reveal) * 10}px)`,
      }}
    >
      <span style={{ display: "flex", flexDirection: "column", gap: 3 }}>
        <span
          style={{
            color: "#1F2937",
            fontFamily: geistMono,
            fontSize: 15,
            letterSpacing: -0.2,
          }}
        >
          {row.name}
        </span>
        <TypeInfo reveal={resolve} row={row} />
      </span>
      <span style={{ height: 24, position: "relative", width: 132 }}>
        <Sniffing reveal={1 - resolve} />
        <Pill outcome={row.outcome} reveal={resolve} />
      </span>
    </div>
  );
};

export const ContentTypePanel: React.FC<{ frame: number }> = ({ frame }) => {
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
        width: 560,
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
          magic bytes
        </span>
        <span
          style={{
            background: "rgba(79,70,229,0.12)",
            borderRadius: 999,
            color: "#4F46E5",
            fontFamily: geistMono,
            fontSize: 12,
            padding: "3px 10px",
          }}
        >
          onMismatch: reject
        </span>
      </div>

      <div style={{ padding: "10px 0 8px" }}>
        {ROWS.map((row, i) => (
          <RowView frame={frame} index={i} key={row.name} row={row} />
        ))}
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.05)",
          color: done ? "#4F46E5" : "#9CA3AF",
          fontFamily: geistMono,
          fontSize: 13,
          letterSpacing: -0.1,
          padding: "13px 22px",
        }}
      >
        {done
          ? "Content-Type set from the bytes, not the name"
          : "reading header bytes…"}
      </div>
    </div>
  );
};
