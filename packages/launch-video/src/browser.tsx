import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate, useCurrentFrame } from "remotion";

import { ADAPTERS } from "./code";
import type { AdapterId } from "./code";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

interface BrowserProps {
  adapter: AdapterId;
  listAt: number;
  uploadAt: number;
  deleteAt: number;
  downloadAt: number;
}

const BUCKET = "files.example.com";

type FileKind = "image" | "pdf";

const FILES: {
  name: string;
  size: string;
  modified: string;
  kind: FileKind;
}[] = [
  { kind: "image", modified: "2d ago", name: "profile.png", size: "1.8 MB" },
  { kind: "image", modified: "5h ago", name: "hero.jpg", size: "4.2 MB" },
  { kind: "image", modified: "1w ago", name: "banner.webp", size: "240 KB" },
  {
    kind: "pdf",
    modified: "3d ago",
    name: "meeting-notes.pdf",
    size: "92 KB",
  },
];

const fade = (frame: number, at: number) =>
  interpolate(frame, [at, at + 14], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const scale = (frame: number, at: number) =>
  interpolate(frame, [at, at + 14], [0.85, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const NavArrow: React.FC<{ forward?: boolean }> = ({ forward }) => (
  <div
    style={{
      alignItems: "center",
      borderRadius: 8,
      color: "#9CA3AF",
      display: "flex",
      fontSize: 24,
      height: 32,
      justifyContent: "center",
      lineHeight: 1,
      width: 32,
    }}
  >
    {forward ? "›" : "‹"}
  </div>
);

const NavReload: React.FC = () => (
  <div
    style={{
      alignItems: "center",
      borderRadius: 8,
      color: "#9CA3AF",
      display: "flex",
      fontSize: 18,
      height: 32,
      justifyContent: "center",
      lineHeight: 1,
      width: 32,
    }}
  >
    ↻
  </div>
);

const ProviderDot: React.FC<{ adapter: AdapterId }> = ({ adapter }) => {
  const color = {
    minio: "#DC2626",
    r2: "#F97316",
    s3: "#F59E0B",
    vercelBlob: "#1F2937",
  }[adapter];
  return (
    <div style={{ background: color, borderRadius: 4, height: 8, width: 8 }} />
  );
};

const AdapterChip: React.FC<{ label: string; adapter: AdapterId }> = ({
  label,
  adapter,
}) => (
  <div
    style={{
      alignItems: "center",
      background: "#F5F3EE",
      borderRadius: 999,
      color: "#4B5563",
      display: "flex",
      fontSize: 13,
      fontWeight: 500,
      gap: 8,
      letterSpacing: -0.1,
      padding: "6px 12px",
    }}
  >
    <ProviderDot adapter={adapter} />
    {label}
  </div>
);

const UploadButton: React.FC<{ opacity: number; scaleAmount: number }> = ({
  opacity,
  scaleAmount,
}) => (
  <div
    style={{
      alignItems: "center",
      background: "transparent",
      border: "1px solid #D1D5DB",
      borderRadius: 999,
      color: "#4B5563",
      display: "flex",
      fontSize: 12,
      fontWeight: 500,
      gap: 5,
      letterSpacing: -0.1,
      opacity,
      padding: "5px 12px",
      transform: `scale(${scaleAmount})`,
      transformOrigin: "right center",
    }}
  >
    <span
      style={{ fontSize: 13, lineHeight: 1, transform: "translateY(-1px)" }}
    >
      ↑
    </span>
    Upload
  </div>
);

const RowIconButton: React.FC<{
  glyph: string;
  opacity: number;
  scaleAmount: number;
}> = ({ glyph, opacity, scaleAmount }) => (
  <div
    style={{
      alignItems: "center",
      color: "#9CA3AF",
      display: "flex",
      fontSize: 18,
      height: 22,
      justifyContent: "center",
      lineHeight: 1,
      opacity,
      transform: `scale(${scaleAmount})`,
      transformOrigin: "right center",
      width: 22,
    }}
  >
    {glyph}
  </div>
);

const Thumb: React.FC<{ kind: FileKind; name: string }> = ({ kind }) => (
  <div
    style={{
      alignItems: "center",
      background: "#F3F1EA",
      borderRadius: 6,
      color: "#9CA3AF",
      display: "flex",
      fontFamily: geistMono,
      fontSize: 9,
      fontWeight: 600,
      height: 32,
      justifyContent: "center",
      letterSpacing: 0.2,
      width: 32,
    }}
  >
    {kind === "pdf" ? "PDF" : ""}
  </div>
);

const EmptyState: React.FC<{ visible: boolean; opacity: number }> = ({
  visible,
  opacity,
}) => {
  if (!visible) {
    return null;
  }
  return (
    <div
      style={{
        alignItems: "center",
        color: "#9CA3AF",
        display: "flex",
        fontSize: 14,
        inset: 0,
        justifyContent: "center",
        letterSpacing: -0.1,
        opacity,
        position: "absolute",
      }}
    >
      No files yet
    </div>
  );
};

const FileRow: React.FC<{
  file: { name: string; size: string; modified: string; kind: FileKind };
  appearFrame: number;
  currentFrame: number;
  deleteAt: number;
  downloadAt: number;
}> = ({ file, appearFrame, currentFrame, deleteAt, downloadAt }) => {
  const opacity = fade(currentFrame, appearFrame);
  const lift = interpolate(
    currentFrame,
    [appearFrame, appearFrame + 14],
    [10, 0],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const deleteOpacity = fade(currentFrame, deleteAt);
  const deleteScale = scale(currentFrame, deleteAt);
  const downloadOpacity = fade(currentFrame, downloadAt);
  const downloadScale = scale(currentFrame, downloadAt);

  return (
    <div
      style={{
        alignItems: "center",
        borderRadius: 10,
        display: "flex",
        gap: 12,
        opacity,
        padding: "8px 12px",
        transform: `translateY(${lift}px)`,
      }}
    >
      <Thumb kind={file.kind} name={file.name} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            color: "#1F2937",
            fontFamily: geistMono,
            fontSize: 15,
            letterSpacing: -0.1,
          }}
        >
          {file.name}
        </div>
      </div>
      <div
        style={{
          alignItems: "center",
          color: "#9CA3AF",
          display: "flex",
          fontFamily: geistMono,
          fontSize: 12,
          gap: 14,
        }}
      >
        <span style={{ minWidth: 56, textAlign: "right" }}>{file.size}</span>
        <span style={{ minWidth: 46, textAlign: "right" }}>
          {file.modified}
        </span>
      </div>
      {downloadOpacity > 0 && (
        <RowIconButton
          glyph="↓"
          opacity={downloadOpacity}
          scaleAmount={downloadScale}
        />
      )}
      {deleteOpacity > 0 && (
        <RowIconButton
          glyph="×"
          opacity={deleteOpacity}
          scaleAmount={deleteScale}
        />
      )}
    </div>
  );
};

export const Browser: React.FC<BrowserProps> = ({
  adapter,
  listAt,
  uploadAt,
  deleteAt,
  downloadAt,
}) => {
  const frame = useCurrentFrame();
  const ad = ADAPTERS[adapter];

  const uploadOpacity = fade(frame, uploadAt);
  const uploadScale = scale(frame, uploadAt);

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
          gap: 6,
          height: 60,
          padding: "0 16px",
        }}
      >
        <NavArrow />
        <NavArrow forward />
        <NavReload />
        <div
          style={{
            alignItems: "center",
            background: "#EFEDE6",
            borderRadius: 10,
            color: "#6B7280",
            display: "flex",
            flex: 1,
            fontFamily: geistMono,
            fontSize: 15,
            height: 36,
            letterSpacing: -0.1,
            marginLeft: 8,
            padding: "0 14px",
          }}
        >
          {BUCKET}/photos
        </div>
      </div>
      <div style={{ padding: "22px 22px 18px" }}>
        <div
          style={{
            alignItems: "center",
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 18,
          }}
        >
          <div
            style={{
              color: "#1F2937",
              fontSize: 22,
              fontWeight: 600,
              letterSpacing: -0.4,
            }}
          >
            Files
          </div>
          <div style={{ alignItems: "center", display: "flex", gap: 8 }}>
            <AdapterChip label={ad.label} adapter={adapter} />
            {uploadOpacity > 0 && (
              <UploadButton opacity={uploadOpacity} scaleAmount={uploadScale} />
            )}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 8,
            minHeight: 280,
            position: "relative",
          }}
        >
          {FILES.map((f, i) => (
            <FileRow
              key={f.name}
              file={f}
              appearFrame={listAt + i * 5}
              currentFrame={frame}
              deleteAt={deleteAt}
              downloadAt={downloadAt}
            />
          ))}
          <EmptyState
            visible={frame < listAt}
            opacity={interpolate(frame, [listAt - 8, listAt], [1, 0], {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            })}
          />
        </div>
      </div>
    </div>
  );
};
