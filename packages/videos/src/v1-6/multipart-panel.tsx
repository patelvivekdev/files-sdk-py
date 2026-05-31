import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const N_PARTS = 12;
const CONCURRENCY = 4;
const ASSEMBLE = 22;

// Per-part upload time in frames — varied so parts finish out of order.
const PART_DURATIONS = [30, 34, 28, 38, 26, 36, 32, 40, 28, 34, 30, 26];

interface Schedule {
  starts: number[];
  ends: number[];
  uploadEnd: number;
}

// Walk the parts through CONCURRENCY slots: each part starts when a slot frees,
// so only CONCURRENCY upload at once — the bounded-parallelism story.
const buildSchedule = (): Schedule => {
  const slotFree = Array.from({ length: CONCURRENCY }, () => 0);
  const starts: number[] = [];
  const ends: number[] = [];
  for (let i = 0; i < N_PARTS; i += 1) {
    let slot = 0;
    for (let k = 1; k < CONCURRENCY; k += 1) {
      if (slotFree[k] < slotFree[slot]) {
        slot = k;
      }
    }
    const start = slotFree[slot];
    const end = start + PART_DURATIONS[i];
    starts.push(start);
    ends.push(end);
    slotFree[slot] = end;
  }
  return { ends, starts, uploadEnd: Math.max(...ends) };
};

const SCHEDULE = buildSchedule();

/** Frames the panel takes: all parts uploaded + server-side assembly. */
export const MULTIPART_ACTION_FRAMES = SCHEDULE.uploadEnd + ASSEMBLE;

type PartStatus = "queued" | "uploading" | "done";

const partFraction = (index: number, frame: number): number =>
  interpolate(frame, [SCHEDULE.starts[index], SCHEDULE.ends[index]], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const partStatus = (index: number, frame: number): PartStatus => {
  if (frame >= SCHEDULE.ends[index]) {
    return "done";
  }
  if (frame >= SCHEDULE.starts[index]) {
    return "uploading";
  }
  return "queued";
};

const tileStyle = (status: PartStatus): React.CSSProperties => {
  if (status === "done") {
    return {
      background: "rgba(5,150,105,0.08)",
      border: "1px solid rgba(5,150,105,0.25)",
    };
  }
  if (status === "uploading") {
    return {
      background: "#FFFFFF",
      border: "1px solid rgba(217,119,6,0.45)",
    };
  }
  return { background: "#F3F1EA", border: "1px solid transparent" };
};

const labelColor = (status: PartStatus): string => {
  if (status === "done") {
    return "#047857";
  }
  if (status === "uploading") {
    return "#1F2937";
  }
  return "#9CA3AF";
};

const PartTile: React.FC<{ index: number; frame: number }> = ({
  index,
  frame,
}) => {
  const status = partStatus(index, frame);
  const fraction = partFraction(index, frame);
  const fillColor = status === "done" ? "#059669" : "#D97706";

  return (
    <div
      style={{
        ...tileStyle(status),
        borderRadius: 8,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        height: 52,
        justifyContent: "space-between",
        padding: "8px 10px",
        width: 119,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            color: labelColor(status),
            fontFamily: geistMono,
            fontSize: 12,
          }}
        >
          Part {index + 1}
        </span>
        {status === "done" && (
          <span style={{ color: "#059669", fontSize: 12 }}>✓</span>
        )}
      </div>
      <div
        style={{
          background: "#EAE7DE",
          borderRadius: 999,
          height: 4,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div
          style={{
            background: fillColor,
            borderRadius: 999,
            height: "100%",
            width: `${fraction * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

const Footer: React.FC<{ frame: number; doneCount: number }> = ({
  frame,
  doneCount,
}) => {
  const overall = interpolate(frame, [0, SCHEDULE.uploadEnd], [0, 1], {
    easing: Easing.bezier(0.33, 1, 0.68, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const uploaded = frame >= SCHEDULE.uploadEnd;
  const complete = frame >= SCHEDULE.uploadEnd + 10;

  let label = `${doneCount} / ${N_PARTS} parts`;
  if (complete) {
    label = "✓ Upload complete";
  } else if (uploaded) {
    label = "Assembling…";
  }

  return (
    <div
      style={{
        alignItems: "center",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        display: "flex",
        gap: 16,
        height: 56,
        padding: "0 20px",
      }}
    >
      <div
        style={{
          background: "#EFEDE6",
          borderRadius: 999,
          flex: 1,
          height: 6,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            background: complete ? "#059669" : "#D97706",
            borderRadius: 999,
            height: "100%",
            width: `${overall * 100}%`,
          }}
        />
      </div>
      <span
        style={{
          color: complete ? "#059669" : "#6B7280",
          fontFamily: geistMono,
          fontSize: 13,
          minWidth: 124,
          textAlign: "right",
        }}
      >
        {label}
      </span>
    </div>
  );
};

export const MultipartPanel: React.FC<{ frame: number }> = ({ frame }) => {
  let doneCount = 0;
  for (let i = 0; i < N_PARTS; i += 1) {
    if (partStatus(i, frame) === "done") {
      doneCount += 1;
    }
  }

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
            color: "#1F2937",
            fontFamily: geistMono,
            fontSize: 16,
            letterSpacing: -0.1,
          }}
        >
          db.tar
        </span>
        <span style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 13 }}>
          192 MB · 12 × 16 MiB
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 8,
          padding: "16px 20px",
        }}
      >
        {SCHEDULE.starts.map((_, i) => (
          <PartTile frame={frame} index={i} key={i} />
        ))}
      </div>
      <Footer doneCount={doneCount} frame={frame} />
    </div>
  );
};
