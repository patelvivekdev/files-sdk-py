import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const REVEAL_STEP = 12;
const HOLD = 22;
const SHRINK_STEP = 16;
const SHRINK_DUR = 26;

interface Row {
  name: string;
  fromKb: number;
  toKb: number;
  identity: boolean;
}

// Text compresses hard; already-compressed bytes (jpg) are stored verbatim
// and marked identity so reads never pay to "decompress" them.
const ROWS: Row[] = [
  { fromKb: 1024, identity: false, name: "logs/app.log", toKb: 88 },
  { fromKb: 640, identity: false, name: "data/export.csv", toKb: 120 },
  { fromKb: 2150, identity: true, name: "img/photo.jpg", toKb: 2150 },
];

const SAVED_MB = ROWS.reduce((sum, r) => sum + (r.fromKb - r.toKb), 0) / 1024;
// All rows land at original size first, hold, then compress one after another.
const REVEAL_DONE = (ROWS.length - 1) * REVEAL_STEP + 12;
const SHRINK_START = REVEAL_DONE + HOLD;
const LAST_SHRINK = SHRINK_START + (ROWS.length - 1) * SHRINK_STEP + SHRINK_DUR;
/** Reveal at original size, hold, then shrink each bar in turn. */
export const COMPRESSION_ACTION_FRAMES = LAST_SHRINK + 36;

const fmt = (kb: number): string =>
  kb >= 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb} KB`;

const RowView: React.FC<{ row: Row; frame: number; index: number }> = ({
  row,
  frame,
  index,
}) => {
  const reveal = interpolate(
    frame,
    [index * REVEAL_STEP, index * REVEAL_STEP + 12],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const shrinkAt = SHRINK_START + index * SHRINK_STEP;
  const target = row.identity ? 100 : (row.toKb / row.fromKb) * 100;
  const width = interpolate(
    frame,
    [shrinkAt, shrinkAt + SHRINK_DUR],
    [100, target],
    {
      easing: Easing.bezier(0.33, 1, 0.68, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const detail = interpolate(frame, [shrinkAt, shrinkAt + 12], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ratio = interpolate(
    frame,
    [shrinkAt, shrinkAt + SHRINK_DUR],
    [0, Math.round((1 - row.toKb / row.fromKb) * 100)],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const compressing = frame >= shrinkAt;

  return (
    <div style={{ opacity: reveal, padding: "10px 22px 6px" }}>
      <div
        style={{
          alignItems: "baseline",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 8,
        }}
      >
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
        <span
          style={{
            alignItems: "baseline",
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            width: 240,
          }}
        >
          <span
            style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 14 }}
          >
            {fmt(row.fromKb)}
          </span>
          {compressing && row.identity && (
            <span
              style={{
                background: "#EFEDE6",
                borderRadius: 999,
                color: "#9CA3AF",
                fontFamily: geistMono,
                fontSize: 12,
                opacity: detail,
                padding: "3px 10px",
              }}
            >
              identity
            </span>
          )}
          {compressing && !row.identity && (
            <span
              style={{
                color: "#0E7490",
                fontFamily: geistMono,
                fontSize: 14,
                opacity: detail,
              }}
            >
              → {fmt(row.toKb)} · −{Math.round(ratio)}%
            </span>
          )}
        </span>
      </div>
      <div
        style={{
          background: "#EFEDE6",
          borderRadius: 999,
          height: 8,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div
          style={{
            background: row.identity ? "#C7BEB0" : "#0E7490",
            borderRadius: 999,
            height: "100%",
            width: `${width}%`,
          }}
        />
      </div>
    </div>
  );
};

export const CompressionPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const saved = interpolate(frame, [SHRINK_START, LAST_SHRINK], [0, SAVED_MB], {
    easing: Easing.bezier(0.33, 1, 0.68, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const done = frame >= LAST_SHRINK;

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
          compression
        </span>
        <span
          style={{
            background: "rgba(14,116,144,0.12)",
            borderRadius: 999,
            color: "#0E7490",
            fontFamily: geistMono,
            fontSize: 12,
            padding: "3px 10px",
          }}
        >
          gzip
        </span>
      </div>

      <div style={{ padding: "6px 0 4px" }}>
        {ROWS.map((row, i) => (
          <RowView frame={frame} index={i} key={row.name} row={row} />
        ))}
      </div>

      <div
        style={{
          alignItems: "center",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          fontFamily: geistMono,
          fontSize: 13,
          gap: 8,
          justifyContent: "space-between",
          letterSpacing: -0.1,
          padding: "13px 22px",
        }}
      >
        <span style={{ color: "#9CA3AF" }}>
          stored compressed · read verbatim
        </span>
        <span style={{ color: done ? "#0E7490" : "#9CA3AF", fontSize: 15 }}>
          saved {saved.toFixed(1)} MB
        </span>
      </div>
    </div>
  );
};
