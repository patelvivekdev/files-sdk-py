import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const ACCENT = "#0369A1";
const STEP = 18;

interface Guard {
  rule: string;
  before: string;
  after: string;
  tag: string;
}

const GUARDS: Guard[] = [
  {
    after: "attachment",
    before: "inline",
    rule: "Content-Disposition",
    tag: "forced",
  },
  { after: "1h", before: "7d", rule: "expiresIn", tag: "clamped" },
  { after: "10 MB", before: "—", rule: "maxSize", tag: "injected" },
];

const LAST = (GUARDS.length - 1) * STEP;
/** Each URL guard is rewritten to a safe default in turn. */
export const SIGNED_URL_ACTION_FRAMES = LAST + 46;

const ShieldGlyph: React.FC = () => (
  <svg height="20" viewBox="0 0 24 24" width="18">
    <title>Shield</title>
    <path
      d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z"
      fill="none"
      stroke={ACCENT}
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
    <path
      d="M9 12l2 2 4-4"
      fill="none"
      stroke={ACCENT}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  </svg>
);

const GuardRow: React.FC<{ guard: Guard; reveal: number }> = ({
  guard,
  reveal,
}) => (
  <div
    style={{
      alignItems: "center",
      display: "flex",
      gap: 10,
      height: 48,
      opacity: reveal,
      padding: "0 22px",
      transform: `translateX(${(1 - reveal) * 10}px)`,
    }}
  >
    <span
      style={{
        color: "#1F2937",
        flex: 1,
        fontFamily: geistMono,
        fontSize: 13,
        letterSpacing: -0.2,
      }}
    >
      {guard.rule}
    </span>
    <span
      style={{
        color: "#B8AF9F",
        fontFamily: geistMono,
        fontSize: 13,
        textDecoration: "line-through",
      }}
    >
      {guard.before}
    </span>
    <span style={{ color: "#9CA3AF", fontSize: 13 }}>→</span>
    <span
      style={{
        color: ACCENT,
        fontFamily: geistMono,
        fontSize: 13,
        width: 78,
      }}
    >
      {guard.after}
    </span>
    <span
      style={{
        background: `${ACCENT}18`,
        borderRadius: 999,
        color: ACCENT,
        fontFamily: geistMono,
        fontSize: 11,
        padding: "2px 9px",
      }}
    >
      {guard.tag}
    </span>
  </div>
);

export const SignedUrlPanel: React.FC<{ frame: number }> = ({ frame }) => (
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
        gap: 10,
        height: 58,
        padding: "0 22px",
      }}
    >
      <ShieldGlyph />
      <span
        style={{
          color: "#1F2937",
          fontFamily: geistMono,
          fontSize: 16,
          letterSpacing: -0.2,
        }}
      >
        files.url("user-upload.svg")
      </span>
    </div>

    <div style={{ padding: "10px 0" }}>
      {GUARDS.map((guard, i) => (
        <GuardRow
          guard={guard}
          key={guard.rule}
          reveal={interpolate(frame, [i * STEP, i * STEP + 12], [0, 1], {
            easing: Easing.bezier(0.16, 1, 0.3, 1),
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          })}
        />
      ))}
    </div>

    <div
      style={{
        alignItems: "center",
        borderTop: "1px solid rgba(0,0,0,0.05)",
        color: "#047857",
        display: "flex",
        fontFamily: geistMono,
        fontSize: 13,
        gap: 8,
        letterSpacing: -0.1,
        padding: "13px 22px",
      }}
    >
      <span style={{ fontSize: 13 }}>✓</span>
      safe by default — no inline execution at your origin
    </div>
  </div>
);
