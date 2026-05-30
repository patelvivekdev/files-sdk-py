import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const STEP = 7;
const SETTLE = 22;

const READS = ["download", "head", "exists", "list", "url"];
const WRITES = ["upload", "delete", "copy", "move", "signedUploadUrl"];
const MAX_ROWS = Math.max(READS.length, WRITES.length);

/** Frames for both columns to stagger in plus the error footer. */
export const READONLY_ACTION_FRAMES = MAX_ROWS * STEP + SETTLE;

const LockIcon: React.FC = () => (
  <svg height="20" viewBox="0 0 20 22" width="18">
    <title>Locked</title>
    <rect fill="#B45309" height="11" rx="2" width="14" x="3" y="9" />
    <path
      d="M6 9V6a4 4 0 0 1 8 0v3"
      fill="none"
      stroke="#B45309"
      strokeWidth="2"
    />
  </svg>
);

const Check: React.FC = () => (
  <span
    style={{
      alignItems: "center",
      background: "rgba(5,150,105,0.12)",
      borderRadius: 999,
      color: "#059669",
      display: "flex",
      fontSize: 13,
      height: 22,
      justifyContent: "center",
      width: 22,
    }}
  >
    ✓
  </span>
);

const Cross: React.FC = () => (
  <span
    style={{
      alignItems: "center",
      background: "rgba(185,28,28,0.10)",
      borderRadius: 999,
      color: "#B91C1C",
      display: "flex",
      fontSize: 12,
      height: 22,
      justifyContent: "center",
      width: 22,
    }}
  >
    ✕
  </span>
);

const MethodRow: React.FC<{
  name: string;
  blocked: boolean;
  reveal: number;
}> = ({ name, blocked, reveal }) => (
  <div
    style={{
      alignItems: "center",
      display: "flex",
      gap: 10,
      height: 40,
      justifyContent: "space-between",
      opacity: reveal,
      transform: `translateY(${(1 - reveal) * 6}px)`,
    }}
  >
    <span
      style={{
        color: blocked ? "#9CA3AF" : "#1F2937",
        fontFamily: geistMono,
        fontSize: 15,
        letterSpacing: -0.2,
        textDecoration: blocked ? "line-through" : "none",
      }}
    >
      {name}
    </span>
    {blocked ? <Cross /> : <Check />}
  </div>
);

const ColumnHeader: React.FC<{ label: string; color: string }> = ({
  label,
  color,
}) => (
  <div
    style={{
      color,
      fontFamily: geistMono,
      fontSize: 12,
      letterSpacing: 0.4,
      marginBottom: 6,
      textTransform: "uppercase",
    }}
  >
    {label}
  </div>
);

export const ReadonlyPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const revealAt = (index: number): number =>
    interpolate(frame, [index * STEP, index * STEP + 12], [0, 1], {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    });

  const errorReveal = interpolate(
    frame,
    [MAX_ROWS * STEP, MAX_ROWS * STEP + 14],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

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
          gap: 11,
          height: 56,
          padding: "0 22px",
        }}
      >
        <LockIcon />
        <span
          style={{
            color: "#1F2937",
            fontFamily: geistMono,
            fontSize: 16,
            letterSpacing: -0.2,
          }}
        >
          files.readonly()
        </span>
        <span
          style={{
            background: "rgba(217,119,6,0.14)",
            borderRadius: 999,
            color: "#B45309",
            fontFamily: geistMono,
            fontSize: 12,
            marginLeft: "auto",
            padding: "3px 10px",
          }}
        >
          locked
        </span>
      </div>

      <div style={{ display: "flex", gap: 28, padding: "18px 24px 6px" }}>
        <div style={{ flex: 1 }}>
          <ColumnHeader color="#047857" label="Reads · allowed" />
          {READS.map((name, i) => (
            <MethodRow
              blocked={false}
              key={name}
              name={name}
              reveal={revealAt(i)}
            />
          ))}
        </div>
        <div style={{ background: "rgba(0,0,0,0.05)", width: 1 }} />
        <div style={{ flex: 1 }}>
          <ColumnHeader color="#B91C1C" label="Writes · blocked" />
          {WRITES.map((name, i) => (
            <MethodRow blocked key={name} name={name} reveal={revealAt(i)} />
          ))}
        </div>
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(0,0,0,0.05)",
          color: "#B91C1C",
          fontFamily: geistMono,
          fontSize: 13,
          letterSpacing: -0.1,
          opacity: errorReveal,
          padding: "13px 24px",
        }}
      >
        throw new FilesError({"{ "}code:{" "}
        <span style={{ color: "#B45309" }}>"ReadOnly"</span>
        {" }"})
      </div>
    </div>
  );
};
