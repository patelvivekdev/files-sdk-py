import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const STEP = 16;

interface Obj {
  name: string;
  size: string;
  tier: "hot" | "cold";
}

// Small objects route to the hot tier; large ones drop to the cheap cold tier.
const OBJECTS: Obj[] = [
  { name: "avatar.png", size: "12 KB", tier: "hot" },
  { name: "clip.mp4", size: "84 MB", tier: "cold" },
  { name: "thumb.jpg", size: "240 KB", tier: "hot" },
  { name: "backup.zip", size: "2.1 GB", tier: "cold" },
];

const LAST = (OBJECTS.length - 1) * STEP;
/** Objects route into the hot or cold column one by one. */
export const TIERING_ACTION_FRAMES = LAST + 40;

const TIER = {
  cold: { accent: "#2563EB", bg: "rgba(37,99,235,0.10)", sub: "r2()" },
  hot: { accent: "#D97706", bg: "rgba(217,119,6,0.10)", sub: "s3()" },
} as const;

const ObjectRow: React.FC<{ obj: Obj; reveal: number }> = ({ obj, reveal }) => {
  const t = TIER[obj.tier];
  return (
    <div
      style={{
        alignItems: "center",
        background: "#FFFFFF",
        border: `1px solid ${t.accent}33`,
        borderRadius: 9,
        boxShadow: "0 6px 14px rgba(60,40,20,0.08)",
        display: "flex",
        gap: 8,
        justifyContent: "space-between",
        opacity: reveal,
        padding: "9px 12px",
        transform: `translateY(${(1 - reveal) * -10}px)`,
      }}
    >
      <span
        style={{
          color: "#1F2937",
          fontFamily: geistMono,
          fontSize: 13,
          letterSpacing: -0.2,
        }}
      >
        {obj.name}
      </span>
      <span style={{ color: t.accent, fontFamily: geistMono, fontSize: 12 }}>
        {obj.size}
      </span>
    </div>
  );
};

const Column: React.FC<{ tier: "hot" | "cold"; frame: number }> = ({
  tier,
  frame,
}) => {
  const t = TIER[tier];
  return (
    <div
      style={{
        background: t.bg,
        borderRadius: 12,
        display: "flex",
        flex: 1,
        flexDirection: "column",
        gap: 10,
        minHeight: 196,
        padding: 14,
      }}
    >
      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 8,
          marginBottom: 2,
        }}
      >
        <span
          style={{
            background: t.accent,
            borderRadius: 999,
            color: "#FFFFFF",
            fontFamily: geistMono,
            fontSize: 11,
            letterSpacing: 0.5,
            padding: "3px 9px",
            textTransform: "uppercase",
          }}
        >
          {tier}
        </span>
        <span style={{ color: t.accent, fontFamily: geistMono, fontSize: 12 }}>
          {t.sub}
        </span>
      </div>
      {OBJECTS.map((obj, i) =>
        obj.tier === tier ? (
          <ObjectRow
            key={obj.name}
            obj={obj}
            reveal={interpolate(frame, [i * STEP, i * STEP + 12], [0, 1], {
              easing: Easing.bezier(0.16, 1, 0.3, 1),
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />
        ) : null
      )}
    </div>
  );
};

export const TieringPanel: React.FC<{ frame: number }> = ({ frame }) => (
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
        route({"{ key, size }"})
      </span>
      <span style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 13 }}>
        by size
      </span>
    </div>

    <div style={{ display: "flex", gap: 14, padding: "18px 22px" }}>
      <Column frame={frame} tier="hot" />
      <Column frame={frame} tier="cold" />
    </div>

    <div
      style={{
        alignItems: "center",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        color: "#6B7280",
        display: "flex",
        fontFamily: geistMono,
        fontSize: 13,
        gap: 8,
        justifyContent: "space-between",
        letterSpacing: -0.1,
        padding: "13px 22px",
      }}
    >
      <span>one onion, two adapters</span>
      <span style={{ color: "#9CA3AF" }}>files.tier() to move</span>
    </div>
  </div>
);
