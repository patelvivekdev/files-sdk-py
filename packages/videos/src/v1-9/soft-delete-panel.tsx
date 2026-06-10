import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const DELETE_AT = 36;
const RESTORE_AT = 94;
const CARD_LIVE_TOP = 50;
const CARD_TRASH_TOP = 170;

/** delete() relocates into .trash/, then restore() lifts it back. */
export const SOFT_DELETE_ACTION_FRAMES = RESTORE_AT + 46;

type Phase = "live" | "trashed" | "restored";

const phaseAt = (frame: number): Phase => {
  if (frame >= RESTORE_AT + 10) {
    return "restored";
  }
  if (frame >= DELETE_AT) {
    return "trashed";
  }
  return "live";
};

const STATUS: Record<Phase, { label: string; color: string; bg: string }> = {
  live: { bg: "rgba(107,114,128,0.12)", color: "#6B7280", label: "Live" },
  restored: { bg: "rgba(5,150,105,0.12)", color: "#059669", label: "Restored" },
  trashed: { bg: "rgba(225,29,72,0.12)", color: "#E11D48", label: "Trashed" },
};

const FileGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg height="22" viewBox="0 0 20 22" width="20">
    <title>File</title>
    <path
      d="M4 2h8l4 4v14H4z"
      fill="none"
      stroke={color}
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path d="M12 2v4h4" fill="none" stroke={color} strokeWidth="1.8" />
  </svg>
);

const TrashGlyph: React.FC = () => (
  <svg height="18" viewBox="0 0 20 20" width="18">
    <title>Trash</title>
    <path
      d="M3 5h14M8 5V3h4v2M5 5l1 13h8l1-13"
      fill="none"
      stroke="#E11D48"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const Zone: React.FC<{
  label: React.ReactNode;
  top: number;
  height: number;
  dashed?: boolean;
  active: boolean;
}> = ({ label, top, height, dashed = false, active }) => (
  <div
    style={{
      alignItems: "flex-start",
      border: `1.5px ${dashed ? "dashed" : "solid"} ${
        active ? "rgba(225,29,72,0.45)" : "rgba(0,0,0,0.08)"
      }`,
      borderRadius: 12,
      display: "flex",
      height,
      left: 22,
      padding: "8px 12px",
      position: "absolute",
      right: 22,
      top,
    }}
  >
    <span
      style={{
        color: dashed ? "#E11D48" : "#9CA3AF",
        fontFamily: geistMono,
        fontSize: 12,
        letterSpacing: 0.3,
        textTransform: "uppercase",
      }}
    >
      {label}
    </span>
  </div>
);

export const SoftDeletePanel: React.FC<{ frame: number }> = ({ frame }) => {
  const phase = phaseAt(frame);
  const status = STATUS[phase];
  const trashed = phase === "trashed";

  const cardTop = interpolate(
    frame,
    [0, DELETE_AT, DELETE_AT + 16, RESTORE_AT, RESTORE_AT + 16],
    [
      CARD_LIVE_TOP,
      CARD_LIVE_TOP,
      CARD_TRASH_TOP,
      CARD_TRASH_TOP,
      CARD_LIVE_TOP,
    ],
    {
      easing: Easing.bezier(0.45, 0, 0.55, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );

  const footerReveal = interpolate(frame, [DELETE_AT, DELETE_AT + 14], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

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
          gap: 10,
          height: 58,
          padding: "0 22px",
        }}
      >
        <TrashGlyph />
        <span
          style={{
            color: "#1F2937",
            fontFamily: geistMono,
            fontSize: 16,
            letterSpacing: -0.2,
          }}
        >
          softDelete()
        </span>
        <span
          style={{
            alignItems: "center",
            background: status.bg,
            borderRadius: 999,
            color: status.color,
            display: "flex",
            fontFamily: geistMono,
            fontSize: 12,
            gap: 6,
            marginLeft: "auto",
            padding: "4px 11px",
          }}
        >
          <span
            style={{
              background: status.color,
              borderRadius: 999,
              height: 6,
              width: 6,
            }}
          />
          {status.label}
        </span>
      </div>

      <div style={{ height: 252, position: "relative" }}>
        <Zone active={false} height={104} label="Live" top={14} />
        <Zone
          active={trashed}
          dashed
          height={104}
          label="Trash · .trash/"
          top={134}
        />
        <div
          style={{
            alignItems: "center",
            background: "#FFFFFF",
            border: `1.5px solid ${trashed ? "rgba(225,29,72,0.35)" : "rgba(0,0,0,0.08)"}`,
            borderRadius: 10,
            boxShadow: "0 8px 20px rgba(60,40,20,0.12)",
            display: "flex",
            gap: 12,
            height: 56,
            left: 40,
            padding: "0 18px",
            position: "absolute",
            right: 40,
            top: cardTop,
          }}
        >
          <FileGlyph color={trashed ? "#E11D48" : "#6B7280"} />
          <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
            <span
              style={{
                color: "#1F2937",
                fontFamily: geistMono,
                fontSize: 15,
                letterSpacing: -0.2,
              }}
            >
              {trashed ? ".trash/report.pdf" : "report.pdf"}
            </span>
            <span
              style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 12 }}
            >
              48 KB
            </span>
          </div>
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          color: phase === "restored" ? "#047857" : "#B45309",
          display: "flex",
          fontFamily: geistMono,
          fontSize: 13,
          gap: 8,
          letterSpacing: -0.1,
          opacity: footerReveal,
          padding: "13px 22px",
        }}
      >
        {phase === "restored" ? (
          <>
            <span style={{ fontSize: 13 }}>✓</span>
            files.restore() — back over the live key
          </>
        ) : (
          <>
            <span style={{ fontSize: 13 }}>↺</span>
            recoverable — bytes leave only on purge()
          </>
        )}
      </div>
    </div>
  );
};
