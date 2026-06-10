import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { SceneTitle } from "./scene-title";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const ENTER = 18;
const EXIT = 18;
const STEP = 8;
const HOLD = 54;

type IconName =
  | "trash"
  | "layers"
  | "branch"
  | "bolt"
  | "ledger"
  | "shield"
  | "archive";

interface Plugin {
  name: string;
  blurb: string;
  path: string;
  accent: string;
  tint: string;
  icon: IconName;
}

const PLUGINS: Plugin[] = [
  {
    accent: "#E11D48",
    blurb: "a recoverable recycle bin",
    icon: "trash",
    name: "softDelete()",
    path: "files-sdk/soft-delete",
    tint: "rgba(225,29,72,0.10)",
  },
  {
    accent: "#0D9488",
    blurb: "hot / cold tier routing",
    icon: "layers",
    name: "tiering()",
    path: "files-sdk/tiering",
    tint: "rgba(13,148,136,0.12)",
  },
  {
    accent: "#EA580C",
    blurb: "automatic backend failover",
    icon: "branch",
    name: "failover()",
    path: "files-sdk/failover",
    tint: "rgba(234,88,12,0.12)",
  },
  {
    accent: "#9333EA",
    blurb: "LRU cache for cheap reads",
    icon: "bolt",
    name: "cache()",
    path: "files-sdk/cache",
    tint: "rgba(147,51,234,0.12)",
  },
  {
    accent: "#475569",
    blurb: "awaited who/what/when log",
    icon: "ledger",
    name: "audit()",
    path: "files-sdk/audit",
    tint: "rgba(71,85,105,0.12)",
  },
  {
    accent: "#0369A1",
    blurb: "safe signed-URL defaults",
    icon: "shield",
    name: "signedUrlPolicy()",
    path: "files-sdk/signed-url-policy",
    tint: "rgba(3,105,161,0.12)",
  },
  {
    accent: "#CA8A04",
    blurb: "bundle objects into ZIPs",
    icon: "archive",
    name: "zip()",
    path: "files-sdk/zip",
    tint: "rgba(202,138,4,0.12)",
  },
];

const Glyph: React.FC<{ icon: IconName; color: string }> = ({
  icon,
  color,
}) => {
  const stroke = {
    fill: "none",
    stroke: color,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    strokeWidth: 2,
  };
  return (
    <svg height="24" viewBox="0 0 24 24" width="24">
      <title>{icon}</title>
      {icon === "trash" && (
        <path d="M4 6h16M9 6V3.5h6V6M6 6l1 15h10l1-15" {...stroke} />
      )}
      {icon === "layers" && (
        <path d="M12 3l9 5-9 5-9-5zM3 13l9 5 9-5M3 16.5l9 5 9-5" {...stroke} />
      )}
      {icon === "branch" && (
        <>
          <path d="M6 4v6a4 4 0 0 0 4 4h7" {...stroke} />
          <path d="M14 11l3 3-3 3" {...stroke} />
          <circle cx="6" cy="4" fill={color} r="2.2" />
        </>
      )}
      {icon === "bolt" && <path d="M13 2L4 14h6l-1 8 9-12h-6z" {...stroke} />}
      {icon === "ledger" && (
        <>
          <rect height="18" rx="2" width="15" x="4.5" y="3" {...stroke} />
          <path d="M8 8h8M8 12h8M8 16h4" {...stroke} />
        </>
      )}
      {icon === "shield" && (
        <>
          <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" {...stroke} />
          <path d="M9 12l2 2 4-4" {...stroke} />
        </>
      )}
      {icon === "archive" && (
        <>
          <path
            d="M4 6a2 2 0 0 1 2-2h4l2 2h6a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
            {...stroke}
          />
          <path d="M13 11v2M13 14v2" {...stroke} />
        </>
      )}
    </svg>
  );
};

const Card: React.FC<{ plugin: Plugin; reveal: number }> = ({
  plugin,
  reveal,
}) => (
  <div
    style={{
      background: "#FFFFFF",
      borderRadius: 16,
      boxShadow:
        "0 16px 40px rgba(60, 40, 20, 0.16), 0 1px 0 rgba(255,255,255,0.6) inset",
      opacity: reveal,
      padding: "22px 22px 20px",
      transform: `translateY(${(1 - reveal) * 16}px) scale(${0.96 + reveal * 0.04})`,
      width: 360,
    }}
  >
    <div
      style={{
        alignItems: "center",
        background: plugin.tint,
        borderRadius: 12,
        display: "flex",
        height: 48,
        justifyContent: "center",
        marginBottom: 16,
        width: 48,
      }}
    >
      <Glyph color={plugin.accent} icon={plugin.icon} />
    </div>
    <div
      style={{
        color: "#1F2937",
        fontFamily: geistMono,
        fontSize: 19,
        letterSpacing: -0.4,
        marginBottom: 6,
      }}
    >
      {plugin.name}
    </div>
    <div
      style={{
        color: "#6B7280",
        fontFamily: geist,
        fontSize: 15,
        letterSpacing: -0.1,
        lineHeight: 1.35,
        marginBottom: 14,
        minHeight: 40,
      }}
    >
      {plugin.blurb}
    </div>
    <div
      style={{
        color: "#B8AF9F",
        fontFamily: geistMono,
        fontSize: 12.5,
        letterSpacing: -0.1,
      }}
    >
      {plugin.path}
    </div>
  </div>
);

export const GALLERY_SCENE_DURATION =
  ENTER + (PLUGINS.length - 1) * STEP + 16 + HOLD + EXIT;

export const GalleryScene: React.FC = () => {
  const frame = useCurrentFrame();

  const enterOpacity = interpolate(frame, [0, ENTER], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitOpacity = interpolate(
    frame,
    [GALLERY_SCENE_DURATION - EXIT, GALLERY_SCENE_DURATION - 2],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );
  const exitLift = interpolate(
    frame,
    [GALLERY_SCENE_DURATION - EXIT, GALLERY_SCENE_DURATION - 2],
    [0, -14],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const revealAt = (index: number): number =>
    interpolate(
      frame,
      [ENTER + index * STEP, ENTER + index * STEP + 16],
      [0, 1],
      {
        easing: Easing.bezier(0.16, 1, 0.3, 1),
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }
    );

  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        flexDirection: "column",
        gap: 44,
        justifyContent: "center",
        opacity: enterOpacity * exitOpacity,
        transform: `translateY(${exitLift}px)`,
      }}
    >
      <SceneTitle eyebrow="New in 1.9" title="Seven more plugins." />
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 24,
          justifyContent: "center",
          maxWidth: 1536,
        }}
      >
        {PLUGINS.map((plugin, i) => (
          <Card key={plugin.name} plugin={plugin} reveal={revealAt(i)} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
