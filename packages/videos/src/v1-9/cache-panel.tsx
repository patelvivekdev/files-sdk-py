import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const MISS_AT = 8;
const HIT_AT = 52;

/** First read misses to the provider; the repeat is served from memory. */
export const CACHE_ACTION_FRAMES = HIT_AT + 44;

interface Attempt {
  label: string;
  ms: number;
  frac: number;
  startAt: number;
  span: number;
  accent: string;
  tag: string;
  via: string;
}

const ATTEMPTS: Attempt[] = [
  {
    accent: "#B45309",
    frac: 0.92,
    label: "1st read",
    ms: 84,
    span: 30,
    startAt: MISS_AT,
    tag: "MISS",
    via: "→ provider",
  },
  {
    accent: "#047857",
    frac: 0.05,
    label: "2nd read",
    ms: 1,
    span: 8,
    startAt: HIT_AT,
    tag: "HIT",
    via: "⚡ memory",
  },
];

const Row: React.FC<{ attempt: Attempt; frame: number }> = ({
  attempt,
  frame,
}) => {
  const reveal = interpolate(
    frame,
    [attempt.startAt, attempt.startAt + 10],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const grow = interpolate(
    frame,
    [attempt.startAt + 4, attempt.startAt + 4 + attempt.span],
    [0, 1],
    {
      easing: Easing.bezier(0.33, 1, 0.68, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const ms = Math.round(attempt.ms * grow);

  return (
    <div style={{ opacity: reveal, padding: "10px 22px" }}>
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
            alignItems: "center",
            display: "flex",
            gap: 8,
          }}
        >
          <span
            style={{
              color: "#1F2937",
              fontFamily: geistMono,
              fontSize: 14,
              letterSpacing: -0.2,
            }}
          >
            {attempt.label}
          </span>
          <span
            style={{
              background: `${attempt.accent}1F`,
              borderRadius: 999,
              color: attempt.accent,
              fontFamily: geistMono,
              fontSize: 11,
              letterSpacing: 0.4,
              padding: "2px 8px",
            }}
          >
            {attempt.tag}
          </span>
        </span>
        <span
          style={{
            color: "#9CA3AF",
            fontFamily: geistMono,
            fontSize: 13,
          }}
        >
          {ms} ms · {attempt.via}
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
            background: attempt.accent,
            borderRadius: 999,
            height: "100%",
            width: `${attempt.frac * 100 * grow}%`,
          }}
        />
      </div>
    </div>
  );
};

export const CachePanel: React.FC<{ frame: number }> = ({ frame }) => {
  const misses = frame >= MISS_AT ? 1 : 0;
  const hits = frame >= HIT_AT + 8 ? 1 : 0;

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
          files.head("avatar.png")
        </span>
        <span style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 13 }}>
          ttl 60s
        </span>
      </div>

      <div style={{ padding: "10px 0" }}>
        {ATTEMPTS.map((attempt) => (
          <Row attempt={attempt} frame={frame} key={attempt.label} />
        ))}
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
        <span style={{ color: hits ? "#047857" : "#6B7280" }}>
          cacheStats() → {`{ hits: ${hits}, misses: ${misses} }`}
        </span>
        <span style={{ color: "#9CA3AF" }}>outside retries</span>
      </div>
    </div>
  );
};
