import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const STEP = 15;
const CHECK = 9;

interface Row {
  name: string;
  meta: string;
  ok: boolean;
  reason: string;
}

// Every write is checked against the guards before it touches the adapter;
// anything that fails is thrown, never stored.
const ROWS: Row[] = [
  {
    meta: "2.1 MB · image/png",
    name: "photo.png",
    ok: true,
    reason: "allowed",
  },
  {
    meta: "5.4 MB · application/pdf",
    name: "scan.pdf",
    ok: true,
    reason: "allowed",
  },
  { meta: "80 MB", name: "backup.zip", ok: false, reason: "exceeds maxSize" },
  {
    meta: "text/plain",
    name: "notes.txt",
    ok: false,
    reason: "type not allowed",
  },
  {
    meta: "image/png",
    name: "bad key!.png",
    ok: false,
    reason: "key rejected",
  },
];

const RULES = ["maxSize 10 MB", "image/*, pdf", "key /^[\\w.-]+$/"];

const LAST_DONE = (ROWS.length - 1) * STEP + CHECK;
/** Each upload is checked in turn. */
export const VALIDATION_ACTION_FRAMES = LAST_DONE + 28;

const Check: React.FC<{ ok: boolean }> = ({ ok }) => (
  <span
    style={{
      alignItems: "center",
      background: ok ? "rgba(5,150,105,0.12)" : "rgba(185,28,28,0.10)",
      borderRadius: 999,
      color: ok ? "#059669" : "#B91C1C",
      display: "flex",
      fontSize: ok ? 13 : 12,
      height: 22,
      justifyContent: "center",
      width: 22,
    }}
  >
    {ok ? "✓" : "✗"}
  </span>
);

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
  const resolved = frame >= at + CHECK;

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        gap: 12,
        height: 44,
        justifyContent: "space-between",
        opacity: reveal,
        padding: "0 22px",
        transform: `translateX(${(1 - reveal) * 10}px)`,
      }}
    >
      <span
        style={{ alignItems: "baseline", display: "flex", flex: 1, gap: 10 }}
      >
        <span
          style={{
            color: resolved && !row.ok ? "#9CA3AF" : "#1F2937",
            fontFamily: geistMono,
            fontSize: 15,
            letterSpacing: -0.2,
            textDecoration: resolved && !row.ok ? "line-through" : "none",
          }}
        >
          {row.name}
        </span>
        <span style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 13 }}>
          {row.meta}
        </span>
      </span>
      {resolved && (
        <span
          style={{
            color: row.ok ? "#047857" : "#B91C1C",
            fontFamily: geistMono,
            fontSize: 13,
          }}
        >
          {row.reason}
        </span>
      )}
      {resolved && <Check ok={row.ok} />}
    </div>
  );
};

export const ValidationPanel: React.FC<{ frame: number }> = ({ frame }) => (
  <div
    style={{
      background: "#FFFFFF",
      borderRadius: 14,
      boxShadow:
        "0 18px 48px rgba(60, 40, 20, 0.18), 0 1px 0 rgba(255,255,255,0.6) inset",
      fontFamily: geist,
      overflow: "hidden",
      width: 580,
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
        validation
      </span>
      <span
        style={{
          background: "rgba(185,28,28,0.10)",
          borderRadius: 999,
          color: "#B91C1C",
          fontFamily: geistMono,
          fontSize: 12,
          padding: "3px 10px",
        }}
      >
        fail-closed
      </span>
    </div>

    <div
      style={{
        borderBottom: "1px solid rgba(0,0,0,0.04)",
        display: "flex",
        gap: 8,
        padding: "12px 22px",
      }}
    >
      {RULES.map((rule) => (
        <span
          style={{
            background: "#F1EEE6",
            borderRadius: 7,
            color: "#8A7B68",
            fontFamily: geistMono,
            fontSize: 12,
            padding: "4px 9px",
          }}
          key={rule}
        >
          {rule}
        </span>
      ))}
    </div>

    <div style={{ padding: "8px 0 10px" }}>
      {ROWS.map((row, i) => (
        <RowView frame={frame} index={i} key={row.name} row={row} />
      ))}
    </div>
  </div>
);
