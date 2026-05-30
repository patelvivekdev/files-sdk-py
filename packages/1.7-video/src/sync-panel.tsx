import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

type Outcome = "uploaded" | "skipped" | "deleted";

interface Row {
  name: string;
  outcome: Outcome;
  settle: number;
}

// Each key resolves to one of sync's three outcomes at a staggered frame —
// uploaded (new or changed), unchanged (already identical), or pruned (gone
// from the source). Mirrors the { uploaded, skipped, deleted } result shape.
const ROWS: Row[] = [
  { name: "reports/q1.pdf", outcome: "uploaded", settle: 18 },
  { name: "img/logo.png", outcome: "skipped", settle: 34 },
  { name: "img/hero.jpg", outcome: "skipped", settle: 50 },
  { name: "data/2026.csv", outcome: "uploaded", settle: 66 },
  { name: "tmp/legacy.zip", outcome: "deleted", settle: 84 },
];

const SETTLE_LAST = Math.max(...ROWS.map((row) => row.settle));
/** Frames the panel takes: every key settles, then the in-sync beat. */
export const SYNC_ACTION_FRAMES = SETTLE_LAST + 20;

const OUTCOME: Record<
  Outcome,
  { dot: string; label: string; bg: string; color: string }
> = {
  deleted: {
    bg: "rgba(185,28,28,0.10)",
    color: "#B91C1C",
    dot: "#B91C1C",
    label: "pruned",
  },
  skipped: {
    bg: "#EFEDE6",
    color: "#9CA3AF",
    dot: "#C7BEB0",
    label: "unchanged",
  },
  uploaded: {
    bg: "rgba(5,150,105,0.12)",
    color: "#047857",
    dot: "#059669",
    label: "uploaded",
  },
};

const Chip: React.FC<{ color: string; label: string }> = ({ color, label }) => (
  <span style={{ alignItems: "center", display: "flex", gap: 6 }}>
    <span
      style={{ background: color, borderRadius: 4, height: 17, width: 17 }}
    />
    <span style={{ color: "#1F2937" }}>{label}</span>
  </span>
);

const Pill: React.FC<{ outcome: Outcome }> = ({ outcome }) => {
  const style = OUTCOME[outcome];
  return (
    <span
      style={{
        alignItems: "center",
        background: style.bg,
        borderRadius: 999,
        color: style.color,
        display: "flex",
        fontFamily: geistMono,
        fontSize: 12,
        gap: 7,
        padding: "4px 11px",
      }}
    >
      <span
        style={{
          background: style.dot,
          borderRadius: 999,
          height: 6,
          width: 6,
        }}
      />
      {style.label}
    </span>
  );
};

const Comparing: React.FC<{ frame: number }> = ({ frame }) => {
  const pulse = 0.35 + 0.4 * (0.5 + 0.5 * Math.sin(frame / 3));
  return (
    <span
      style={{
        alignItems: "center",
        background: "#EFEDE6",
        borderRadius: 999,
        color: "#9CA3AF",
        display: "flex",
        fontFamily: geistMono,
        fontSize: 12,
        gap: 7,
        padding: "4px 11px",
      }}
    >
      <span
        style={{
          background: "#9CA3AF",
          borderRadius: 999,
          height: 6,
          opacity: pulse,
          width: 6,
        }}
      />
      comparing…
    </span>
  );
};

const SyncRow: React.FC<{ frame: number; row: Row }> = ({ frame, row }) => {
  const settled = frame >= row.settle;
  const pruned = settled && row.outcome === "deleted";

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: 46,
        justifyContent: "space-between",
        padding: "0 20px",
      }}
    >
      <span
        style={{
          color: pruned ? "#9CA3AF" : "#1F2937",
          fontFamily: geistMono,
          fontSize: 15,
          letterSpacing: -0.1,
          textDecoration: pruned ? "line-through" : "none",
        }}
      >
        {row.name}
      </span>
      {settled ? <Pill outcome={row.outcome} /> : <Comparing frame={frame} />}
    </div>
  );
};

export const SyncPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const progress = interpolate(frame, [0, SETTLE_LAST], [0, 1], {
    easing: Easing.bezier(0.33, 1, 0.68, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const done = frame >= SETTLE_LAST;

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 14,
        boxShadow:
          "0 18px 48px rgba(60, 40, 20, 0.18), 0 1px 0 rgba(255,255,255,0.6) inset",
        fontFamily: geist,
        overflow: "hidden",
        width: 540,
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
          padding: "0 20px",
        }}
      >
        <span
          style={{
            alignItems: "center",
            color: "#6B7280",
            display: "flex",
            fontFamily: geistMono,
            fontSize: 14,
            gap: 8,
          }}
        >
          Syncing
          <Chip color="#3F8624" label="S3" />
          <span style={{ color: "#9CA3AF" }}>→</span>
          <Chip color="#F6821F" label="R2" />
        </span>
        <span
          style={{
            color: done ? "#059669" : "#B45309",
            fontFamily: geistMono,
            fontSize: 13,
          }}
        >
          {done ? "✓ in sync" : "mirroring…"}
        </span>
      </div>

      <div style={{ padding: "16px 20px 4px" }}>
        <div
          style={{
            background: "#EFEDE6",
            borderRadius: 999,
            height: 6,
            overflow: "hidden",
            width: "100%",
          }}
        >
          <div
            style={{
              background: done ? "#059669" : "#D97706",
              borderRadius: 999,
              height: "100%",
              width: `${progress * 100}%`,
            }}
          />
        </div>
      </div>

      <div style={{ padding: "8px 0 14px" }}>
        {ROWS.map((row) => (
          <SyncRow frame={frame} key={row.name} row={row} />
        ))}
      </div>
    </div>
  );
};
