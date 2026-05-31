import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const PATTERN = "photos/**/*.jpg";
const STEP = 16;
const BADGE_DELAY = 7;

// The lazy walk streams matching keys back one at a time — only the hits are
// surfaced, the rest of the key space never reaches the caller.
const MATCHES: string[] = [
  "photos/2024/summer/beach.jpg",
  "photos/avatar.jpg",
  "photos/2025/ski/slope.jpg",
  "photos/2024/portrait.jpg",
  "photos/2023/trip/sunset.jpg",
];

const LAST_BADGE = (MATCHES.length - 1) * STEP + BADGE_DELAY;
/** Matches stream in one by one. */
export const SEARCH_ACTION_FRAMES = LAST_BADGE + 26;

const ModeChip: React.FC = () => (
  <span
    style={{
      background: "rgba(124,58,237,0.12)",
      borderRadius: 999,
      color: "#7C3AED",
      fontFamily: geistMono,
      fontSize: 12,
      letterSpacing: 0.2,
      padding: "3px 10px",
    }}
  >
    glob
  </span>
);

const SearchGlyph: React.FC = () => (
  <svg height="18" viewBox="0 0 20 20" width="18">
    <title>Search</title>
    <circle
      cx="8.5"
      cy="8.5"
      fill="none"
      r="5.5"
      stroke="#9CA3AF"
      strokeWidth="2"
    />
    <path
      d="M13 13 L18 18"
      stroke="#9CA3AF"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);

const MatchBadge: React.FC<{ reveal: number }> = ({ reveal }) => (
  <span
    style={{
      alignItems: "center",
      background: "rgba(5,150,105,0.12)",
      borderRadius: 999,
      color: "#047857",
      display: "flex",
      fontFamily: geistMono,
      fontSize: 12,
      gap: 6,
      opacity: reveal,
      padding: "4px 11px",
      transform: `scale(${0.85 + reveal * 0.15})`,
    }}
  >
    <span style={{ fontSize: 12 }}>✓</span>
    match
  </span>
);

const ResultRow: React.FC<{ name: string; frame: number; index: number }> = ({
  name,
  frame,
  index,
}) => {
  const at = index * STEP;
  const reveal = interpolate(frame, [at, at + 10], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const badge = interpolate(
    frame,
    [at + BADGE_DELAY, at + BADGE_DELAY + 8],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: 46,
        justifyContent: "space-between",
        opacity: reveal,
        padding: "0 22px",
        transform: `translateX(${(1 - reveal) * 10}px)`,
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
        {name}
      </span>
      <MatchBadge reveal={badge} />
    </div>
  );
};

export const SearchPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const found = MATCHES.filter(
    (_, i) => frame >= i * STEP + BADGE_DELAY
  ).length;
  const done = frame >= LAST_BADGE;

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
          gap: 12,
          height: 60,
          padding: "0 20px",
        }}
      >
        <SearchGlyph />
        <span
          style={{
            color: "#1F2937",
            flex: 1,
            fontFamily: geistMono,
            fontSize: 16,
            letterSpacing: -0.2,
          }}
        >
          {PATTERN}
        </span>
        <ModeChip />
      </div>

      <div style={{ padding: "6px 0 4px" }}>
        {MATCHES.map((name, i) => (
          <ResultRow frame={frame} index={i} key={name} name={name} />
        ))}
      </div>

      <div
        style={{
          alignItems: "center",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          color: done ? "#047857" : "#B45309",
          display: "flex",
          fontFamily: geistMono,
          fontSize: 13,
          gap: 8,
          justifyContent: "space-between",
          letterSpacing: -0.1,
          padding: "13px 22px",
        }}
      >
        <span>
          {found} {found === 1 ? "match" : "matches"}
        </span>
        <span style={{ color: "#9CA3AF" }}>streamed over list()</span>
      </div>
    </div>
  );
};
