import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";

import { SceneTitle } from "./scene-title";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const ENTER = 18;
const EXIT = 18;
const STEP = 7;
const HOLD = 80;

type IconName =
  | "lock"
  | "compress"
  | "sniff"
  | "hash"
  | "meter"
  | "shield"
  | "rotate"
  | "trace";

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
    accent: "#B45309",
    blurb: "AES-256-GCM at rest",
    icon: "lock",
    name: "encryption()",
    path: "files-sdk/encryption",
    tint: "rgba(217,119,6,0.12)",
  },
  {
    accent: "#0E7490",
    blurb: "gzip & deflate, transparently",
    icon: "compress",
    name: "compression()",
    path: "files-sdk/compression",
    tint: "rgba(14,116,144,0.12)",
  },
  {
    accent: "#4F46E5",
    blurb: "magic-byte MIME sniffing",
    icon: "sniff",
    name: "contentType()",
    path: "files-sdk/content-type",
    tint: "rgba(79,70,229,0.12)",
  },
  {
    accent: "#7C3AED",
    blurb: "content-addressed storage",
    icon: "hash",
    name: "dedup()",
    path: "files-sdk/dedup",
    tint: "rgba(124,58,237,0.12)",
  },
  {
    accent: "#047857",
    blurb: "meter ops & bandwidth",
    icon: "meter",
    name: "usage()",
    path: "files-sdk/usage",
    tint: "rgba(5,150,105,0.12)",
  },
  {
    accent: "#B91C1C",
    blurb: "fail-closed upload guards",
    icon: "shield",
    name: "validation()",
    path: "files-sdk/validation",
    tint: "rgba(185,28,28,0.10)",
  },
  {
    accent: "#D97706",
    blurb: "snapshots & rollback",
    icon: "rotate",
    name: "versioning()",
    path: "files-sdk/versioning",
    tint: "rgba(217,119,6,0.12)",
  },
  {
    accent: "#2563EB",
    blurb: "OpenTelemetry spans",
    icon: "trace",
    name: "tracing()",
    path: "files-sdk/tracing",
    tint: "rgba(37,99,235,0.12)",
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
      {icon === "lock" && (
        <>
          <rect fill={color} height="11" rx="2" width="15" x="4.5" y="10" />
          <path d="M7.5 10V7a4.5 4.5 0 0 1 9 0v3" {...stroke} />
        </>
      )}
      {icon === "compress" && (
        <>
          <path d="M8 4v7M8 11l-3-3M8 11l3-3" {...stroke} />
          <path d="M16 20v-7M16 13l-3 3M16 13l3 3" {...stroke} />
        </>
      )}
      {icon === "sniff" && (
        <>
          <circle cx="10.5" cy="10.5" r="6" {...stroke} />
          <path d="M15 15l5 5" {...stroke} />
        </>
      )}
      {icon === "hash" && (
        <path d="M9 4 7 20M17 4l-2 16M4.5 9h15M3.5 15h15" {...stroke} />
      )}
      {icon === "meter" && (
        <path d="M5 20V12M12 20V5M19 20v-6M3 20h18" {...stroke} />
      )}
      {icon === "shield" && (
        <>
          <path d="M12 3l7 3v5c0 5-3.5 8-7 10-3.5-2-7-5-7-10V6z" {...stroke} />
          <path d="M9 12l2 2 4-4" {...stroke} />
        </>
      )}
      {icon === "rotate" && (
        <>
          <path d="M4 9a8 8 0 0 1 14-3l2 2" {...stroke} />
          <path d="M20 4v4h-4" {...stroke} />
          <path d="M20 15a8 8 0 0 1-14 3l-2-2" {...stroke} />
          <path d="M4 20v-4h4" {...stroke} />
        </>
      )}
      {icon === "trace" && (
        <>
          <path d="M3 6h12M3 12h16M3 18h9" {...stroke} />
          <circle cx="18" cy="6" fill={color} r="2.4" />
          <circle cx="22" cy="12" fill={color} r="2.4" />
          <circle cx="15" cy="18" fill={color} r="2.4" />
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
      <SceneTitle eyebrow="New in 1.8" title="Eight official plugins." />
      <div
        style={{
          display: "grid",
          gap: 24,
          gridTemplateColumns: "repeat(4, 360px)",
          gridTemplateRows: "repeat(2, auto)",
        }}
      >
        {PLUGINS.map((plugin, i) => (
          <Card key={plugin.name} plugin={plugin} reveal={revealAt(i)} />
        ))}
      </div>
    </AbsoluteFill>
  );
};
