import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const STEP = 20;

type Outcome = "stored" | "deduped" | "shared";

interface Upload {
  key: string;
  detail: string;
  outcome: Outcome;
}

// Same bytes uploaded under three keys: the first writes the blob, the second
// matches its SHA-256 and is skipped, the third is a copy that shares it.
const UPLOADS: Upload[] = [
  { detail: "2.0 MB", key: "photos/a.png", outcome: "stored" },
  { detail: "2.0 MB", key: "photos/b.png", outcome: "deduped" },
  { detail: "copy of a.png", key: "photos/c.png", outcome: "shared" },
];

const ROWS_DONE = (UPLOADS.length - 1) * STEP + 14;
/** Rows resolve, then the blob summary settles. */
export const DEDUP_ACTION_FRAMES = ROWS_DONE + 46;

const OUTCOME: Record<Outcome, { label: string; color: string; bg: string }> = {
  deduped: {
    bg: "rgba(217,119,6,0.12)",
    color: "#B45309",
    label: "deduplicated",
  },
  shared: {
    bg: "rgba(124,58,237,0.12)",
    color: "#7C3AED",
    label: "shared blob",
  },
  stored: { bg: "rgba(5,150,105,0.12)", color: "#047857", label: "stored" },
};

const Pill: React.FC<{ outcome: Outcome }> = ({ outcome }) => {
  const s = OUTCOME[outcome];
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
        gap: 7,
        padding: "4px 11px",
      }}
    >
      <span
        style={{ background: s.color, borderRadius: 999, height: 6, width: 6 }}
      />
      {s.label}
    </span>
  );
};

const Row: React.FC<{ row: Upload; frame: number; index: number }> = ({
  row,
  frame,
  index,
}) => {
  const at = index * STEP;
  const reveal = interpolate(frame, [at, at + 12], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const resolved = frame >= at + 10;

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: 46,
        justifyContent: "space-between",
        opacity: reveal,
        padding: "0 22px",
        transform: `translateX(${(1 - reveal) * 10}px)`,
      }}
    >
      <span style={{ alignItems: "baseline", display: "flex", gap: 10 }}>
        <span
          style={{
            color: "#1F2937",
            fontFamily: geistMono,
            fontSize: 15,
            letterSpacing: -0.2,
          }}
        >
          {row.key}
        </span>
        <span style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 13 }}>
          {row.detail}
        </span>
      </span>
      {resolved && <Pill outcome={row.outcome} />}
    </div>
  );
};

export const DedupPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const summaryReveal = interpolate(
    frame,
    [ROWS_DONE, ROWS_DONE + 16],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const savedMb = interpolate(frame, [ROWS_DONE + 6, ROWS_DONE + 30], [0, 4], {
    easing: Easing.bezier(0.33, 1, 0.68, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const done = frame >= ROWS_DONE;

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
          content-addressed
        </span>
        <span
          style={{
            color: done ? "#047857" : "#B45309",
            fontFamily: geistMono,
            fontSize: 13,
          }}
        >
          {done ? "✓ 1 blob" : "hashing…"}
        </span>
      </div>

      <div style={{ padding: "8px 0 6px" }}>
        {UPLOADS.map((row, i) => (
          <Row frame={frame} index={i} key={row.key} row={row} />
        ))}
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.05)",
          opacity: summaryReveal,
          padding: "14px 22px 16px",
        }}
      >
        <div
          style={{
            alignItems: "center",
            display: "flex",
            gap: 10,
            marginBottom: 8,
          }}
        >
          <span
            style={{
              background: "rgba(124,58,237,0.10)",
              borderRadius: 7,
              color: "#7C3AED",
              fontFamily: geistMono,
              fontSize: 13,
              padding: "4px 10px",
            }}
          >
            .dedup/9f86d081…
          </span>
          <span
            style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 13 }}
          >
            1 blob · 2.0 MB on disk
          </span>
        </div>
        <div
          style={{
            alignItems: "baseline",
            display: "flex",
            gap: 10,
            justifyContent: "space-between",
          }}
        >
          <span
            style={{ color: "#6B7280", fontFamily: geistMono, fontSize: 14 }}
          >
            logical 6.0 MB → stored 2.0 MB
          </span>
          <span
            style={{
              color: "#047857",
              fontFamily: geistMono,
              fontSize: 16,
              fontWeight: 500,
            }}
          >
            saved {savedMb.toFixed(1)} MB
          </span>
        </div>
      </div>
    </div>
  );
};
