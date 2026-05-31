import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const ROW_H = 60;
const LIST_PAD_TOP = 10;
// Node center x = row padding-left (22) + node radius (7). Rail and the
// traveling marker share this x so everything lines up on one axis.
const RAIL_CENTER = 29;
const RESTORE_AT = 82;

interface Version {
  id: string;
  size: string;
  when: string;
  revealAt: number;
}

// Newest on top. Each overwrite snapshots the prior bytes; v1 (bottom) is the
// oldest. revealAt is the frame the snapshot lands in the history.
const VERSIONS: Version[] = [
  { id: "v3", revealAt: 40, size: "1.4 KB", when: "just now" },
  { id: "v2", revealAt: 20, size: "1.1 KB", when: "2 min ago" },
  { id: "v1", revealAt: 0, size: "0.9 KB", when: "5 min ago" },
];
// v1, the bottom row, is the version restore() rolls back to.
const RESTORE_IDX = VERSIONS.length - 1;

/** Snapshots accrue, then restore() rolls the pointer back to v1. */
export const VERSIONING_ACTION_FRAMES = RESTORE_AT + 44;

const rowCenter = (index: number): number =>
  LIST_PAD_TOP + ROW_H / 2 + index * ROW_H;

// The current pointer climbs as snapshots are added, then drops to v1 on restore.
const markerIdxAt = (frame: number): number =>
  interpolate(
    frame,
    [0, 20, 40, RESTORE_AT, RESTORE_AT + 16],
    [2, 1, 0, 0, RESTORE_IDX],
    {
      easing: Easing.bezier(0.45, 0, 0.55, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

const Row: React.FC<{
  version: Version;
  frame: number;
  isCurrent: boolean;
  restoredHere: boolean;
}> = ({ version, frame, isCurrent, restoredHere }) => {
  const reveal = interpolate(
    frame,
    [version.revealAt, version.revealAt + 12],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        gap: 16,
        height: ROW_H,
        opacity: reveal,
        padding: "0 22px",
        position: "relative",
        transform: `translateY(${(1 - reveal) * 8}px)`,
      }}
    >
      <span
        style={{
          background: restoredHere ? "#047857" : "#FFFFFF",
          border: `2px solid ${restoredHere ? "#047857" : "#D8D2C6"}`,
          borderRadius: 999,
          height: 14,
          width: 14,
          zIndex: 1,
        }}
      />
      <span
        style={{
          color: "#1F2937",
          fontFamily: geistMono,
          fontSize: 16,
          letterSpacing: -0.2,
          width: 36,
        }}
      >
        {version.id}
      </span>
      <span
        style={{
          color: "#9CA3AF",
          flex: 1,
          fontFamily: geistMono,
          fontSize: 14,
        }}
      >
        {version.size} · {version.when}
      </span>
      {restoredHere && (
        <span
          style={{
            background: "rgba(5,150,105,0.12)",
            borderRadius: 999,
            color: "#047857",
            fontFamily: geistMono,
            fontSize: 12,
            padding: "4px 11px",
          }}
        >
          restored
        </span>
      )}
      {isCurrent && !restoredHere && (
        <span
          style={{
            background: "rgba(217,119,6,0.12)",
            borderRadius: 999,
            color: "#B45309",
            fontFamily: geistMono,
            fontSize: 12,
            padding: "4px 11px",
          }}
        >
          current
        </span>
      )}
    </div>
  );
};

export const VersioningPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const markerIdx = markerIdxAt(frame);
  const restoring = frame >= RESTORE_AT;
  const restored = frame >= RESTORE_AT + 16;
  const currentIdx = Math.round(markerIdx);

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
          notes.txt
        </span>
        <span
          style={{
            color: restored ? "#047857" : "#B45309",
            fontFamily: geistMono,
            fontSize: 13,
          }}
        >
          {restored ? "✓ restored to v1" : "files.versions()"}
        </span>
      </div>

      <div style={{ padding: `${LIST_PAD_TOP}px 0 6px`, position: "relative" }}>
        <div
          style={{
            background: "#EFEDE6",
            height: (VERSIONS.length - 1) * ROW_H,
            left: RAIL_CENTER - 1,
            position: "absolute",
            top: rowCenter(0),
            width: 2,
          }}
        />
        <span
          style={{
            background: restored ? "#047857" : "#B45309",
            borderRadius: 999,
            boxShadow: `0 0 12px 3px ${
              restored ? "rgba(5,150,105,0.5)" : "rgba(217,119,6,0.5)"
            }`,
            height: 12,
            left: RAIL_CENTER - 6,
            position: "absolute",
            top: rowCenter(markerIdx) - 6,
            width: 12,
            zIndex: 2,
          }}
        />
        {VERSIONS.map((version, i) => (
          <Row
            frame={frame}
            isCurrent={i === currentIdx}
            key={version.id}
            restoredHere={restored && i === RESTORE_IDX}
            version={version}
          />
        ))}
      </div>

      <div
        style={{
          alignItems: "center",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          color: restoring ? "#047857" : "#6B7280",
          display: "flex",
          fontFamily: geistMono,
          fontSize: 13,
          gap: 8,
          letterSpacing: -0.1,
          padding: "13px 22px",
        }}
      >
        {restoring ? (
          <>
            <span style={{ fontSize: 13 }}>✓</span>
            files.restore("notes.txt")
          </>
        ) : (
          <span style={{ color: "#9CA3AF" }}>
            .versions/notes.txt/&lt;id&gt;
          </span>
        )}
      </div>
    </div>
  );
};
