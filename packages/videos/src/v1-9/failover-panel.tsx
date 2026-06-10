import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const FAIL_AT = 42;
const SERVE_AT = 66;

/** Primary times out, the request fails over to the secondary. */
export const FAILOVER_ACTION_FRAMES = SERVE_AT + 46;

const ServerGlyph: React.FC<{ color: string }> = ({ color }) => (
  <svg height="22" viewBox="0 0 24 24" width="22">
    <title>Backend</title>
    <rect
      fill="none"
      height="6"
      rx="1.5"
      stroke={color}
      strokeWidth="1.8"
      width="16"
      x="4"
      y="4"
    />
    <rect
      fill="none"
      height="6"
      rx="1.5"
      stroke={color}
      strokeWidth="1.8"
      width="16"
      x="4"
      y="14"
    />
    <circle cx="7.5" cy="7" fill={color} r="1" />
    <circle cx="7.5" cy="17" fill={color} r="1" />
  </svg>
);

const Backend: React.FC<{
  label: string;
  region: string;
  accent: string;
  bg: string;
  status: string;
  dim: number;
}> = ({ label, region, accent, bg, status, dim }) => (
  <div
    style={{
      alignItems: "center",
      background: bg,
      border: `1.5px solid ${accent}44`,
      borderRadius: 12,
      display: "flex",
      gap: 14,
      opacity: dim,
      padding: "14px 18px",
    }}
  >
    <ServerGlyph color={accent} />
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <span
        style={{
          color: "#1F2937",
          fontFamily: geistMono,
          fontSize: 15,
          letterSpacing: -0.2,
        }}
      >
        {label}
      </span>
      <span style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 12 }}>
        {region}
      </span>
    </div>
    <span
      style={{
        alignItems: "center",
        background: `${accent}1F`,
        borderRadius: 999,
        color: accent,
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
          background: accent,
          borderRadius: 999,
          height: 6,
          width: 6,
        }}
      />
      {status}
    </span>
  </div>
);

export const FailoverPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const down = frame >= FAIL_AT;
  const served = frame >= SERVE_AT;

  const primaryAccent = down ? "#DC2626" : "#D97706";
  const primaryStatus = down ? "✕ timeout" : "trying…";

  const failoverReveal = interpolate(frame, [FAIL_AT, FAIL_AT + 12], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const secondaryDim = interpolate(
    frame,
    [SERVE_AT - 8, SERVE_AT + 8],
    [0.4, 1],
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
          files.download("avatar.png")
        </span>
        <span
          style={{
            color: served ? "#047857" : "#B45309",
            fontFamily: geistMono,
            fontSize: 13,
          }}
        >
          {served ? "✓ served" : "routing"}
        </span>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          padding: "20px 22px",
        }}
      >
        <Backend
          accent={primaryAccent}
          bg={down ? "rgba(220,38,38,0.07)" : "rgba(217,119,6,0.07)"}
          dim={1}
          label="primary"
          region="s3 · us-east-1"
          status={primaryStatus}
        />
        <div
          style={{
            alignItems: "center",
            color: "#DC2626",
            display: "flex",
            fontFamily: geistMono,
            fontSize: 12,
            gap: 8,
            justifyContent: "center",
            opacity: failoverReveal,
          }}
        >
          <span style={{ fontSize: 15 }}>↓</span>
          shouldFailover — next backend
        </div>
        <Backend
          accent={served ? "#059669" : "#9CA3AF"}
          bg={served ? "rgba(5,150,105,0.08)" : "rgba(107,114,128,0.06)"}
          dim={secondaryDim}
          label="secondary"
          region="s3 · eu-west-1"
          status={served ? "✓ served" : "standby"}
        />
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
        <span>fails over on timeouts &amp; 5xx</span>
        <span style={{ color: "#9CA3AF" }}>onFailover(op, idx)</span>
      </div>
    </div>
  );
};
