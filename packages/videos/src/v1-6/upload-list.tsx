import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

interface Row {
  name: string;
  size: string;
  start: number;
  end: number;
}

// Each file fills at its own rate and settles at a different time — the visual
// payoff of per-key onProgress. `start`/`end` are frames within the action phase.
const ROWS: Row[] = [
  { end: 26, name: "logo.png", size: "240 KB", start: 3 },
  { end: 34, name: "hero.jpg", size: "4.2 MB", start: 0 },
  { end: 92, name: "promo.mp4", size: "128 MB", start: 6 },
  { end: 108, name: "db.tar", size: "210 MB", start: 10 },
];

/** Frames the upload list needs for every bar to reach 100%. */
export const UPLOAD_ACTION_FRAMES = Math.max(...ROWS.map((r) => r.end));

const fractionAt = (frame: number, row: Row): number =>
  interpolate(frame, [row.start, row.end], [0, 1], {
    easing: Easing.bezier(0.33, 1, 0.68, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const FileBar: React.FC<{ row: Row; frame: number }> = ({ row, frame }) => {
  const frac = fractionAt(frame, row);
  const pct = Math.round(frac * 100);
  const done = frac >= 1;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 9,
        padding: "12px 20px",
      }}
    >
      <div
        style={{
          alignItems: "baseline",
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <span
          style={{
            color: "#1F2937",
            fontFamily: geistMono,
            fontSize: 15,
            letterSpacing: -0.1,
          }}
        >
          {row.name}
        </span>
        <span
          style={{
            alignItems: "baseline",
            color: "#9CA3AF",
            display: "flex",
            fontFamily: geistMono,
            fontSize: 12,
            gap: 12,
          }}
        >
          <span>{row.size}</span>
          <span
            style={{
              color: done ? "#059669" : "#B45309",
              minWidth: 38,
              textAlign: "right",
            }}
          >
            {done ? "done" : `${pct}%`}
          </span>
        </span>
      </div>
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
            width: `${frac * 100}%`,
          }}
        />
      </div>
    </div>
  );
};

export const UploadList: React.FC<{ frame: number }> = ({ frame }) => {
  const doneCount = ROWS.filter((r) => frame >= r.end).length;

  return (
    <div
      style={{
        background: "#FFFFFF",
        borderRadius: 14,
        boxShadow:
          "0 18px 48px rgba(60, 40, 20, 0.18), 0 1px 0 rgba(255,255,255,0.6) inset",
        fontFamily: geist,
        overflow: "hidden",
        width: 520,
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: "#FAFAF7",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          height: 60,
          justifyContent: "space-between",
          padding: "0 20px",
        }}
      >
        <span
          style={{
            color: "#1F2937",
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: -0.4,
          }}
        >
          Uploading
        </span>
        <span
          style={{
            color: "#9CA3AF",
            fontFamily: geistMono,
            fontSize: 14,
          }}
        >
          {doneCount}/{ROWS.length}
        </span>
      </div>
      <div style={{ padding: "10px 0 14px" }}>
        {ROWS.map((row) => (
          <FileBar frame={frame} key={row.name} row={row} />
        ))}
      </div>
    </div>
  );
};
