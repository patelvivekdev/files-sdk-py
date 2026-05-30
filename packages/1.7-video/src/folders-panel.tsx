import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const STEP = 8;
const SETTLE = 18;

interface BrowserRow {
  kind: "folder" | "file";
  name: string;
  meta: string;
}

// `prefixes` (folders) list first, then the direct `items` (files) — exactly
// what `list({ delimiter: "/" })` splits a flat key space into.
const FOLDERS: BrowserRow[] = [
  { kind: "folder", meta: "", name: "2023/" },
  { kind: "folder", meta: "", name: "2024/" },
  { kind: "folder", meta: "", name: "2025/" },
  { kind: "folder", meta: "", name: "raw/" },
];
const FILES: BrowserRow[] = [
  { kind: "file", meta: "2.1 MB", name: "cover.jpg" },
  { kind: "file", meta: "1.2 KB", name: "index.json" },
];
const ROWS = [...FOLDERS, ...FILES];

/** Frames for every row to stagger in. */
export const FOLDERS_ACTION_FRAMES = ROWS.length * STEP + SETTLE;

const FolderIcon: React.FC = () => (
  <svg height="18" viewBox="0 0 24 20" width="22">
    <title>Folder</title>
    <path
      d="M2 5a2 2 0 0 1 2-2h5l2 2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z"
      fill="#F0A93B"
    />
    <path d="M2 7h22v1H2z" fill="#D98E22" opacity="0.4" />
  </svg>
);

const FileIcon: React.FC = () => (
  <svg height="20" viewBox="0 0 20 24" width="17">
    <title>File</title>
    <path
      d="M4 2h8l4 4v14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z"
      fill="#CBD2DA"
    />
    <path d="M12 2l4 4h-4z" fill="#9AA6B2" />
  </svg>
);

const SectionLabel: React.FC<{ text: string; reveal: number }> = ({
  text,
  reveal,
}) => (
  <div
    style={{
      color: "#B59A7A",
      fontFamily: geistMono,
      fontSize: 12,
      letterSpacing: 0.4,
      opacity: reveal,
      padding: "10px 22px 4px",
      textTransform: "uppercase",
    }}
  >
    {text}
  </div>
);

const Row: React.FC<{ row: BrowserRow; reveal: number }> = ({
  row,
  reveal,
}) => {
  const isFolder = row.kind === "folder";
  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        gap: 13,
        height: 44,
        opacity: reveal,
        padding: "0 22px",
        transform: `translateX(${(1 - reveal) * 10}px)`,
      }}
    >
      {isFolder ? <FolderIcon /> : <FileIcon />}
      <span
        style={{
          color: isFolder ? "#1F2937" : "#4B5563",
          flex: 1,
          fontFamily: geistMono,
          fontSize: 16,
          fontWeight: isFolder ? 500 : 400,
          letterSpacing: -0.2,
        }}
      >
        {row.name}
      </span>
      {isFolder ? (
        <span style={{ color: "#C7B59C", fontSize: 17 }}>›</span>
      ) : (
        <span style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 13 }}>
          {row.meta}
        </span>
      )}
    </div>
  );
};

export const FoldersPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const revealAt = (index: number): number =>
    interpolate(frame, [index * STEP, index * STEP + 12], [0, 1], {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
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
        paddingBottom: 12,
        width: 480,
      }}
    >
      <div
        style={{
          alignItems: "center",
          background: "#FAFAF7",
          borderBottom: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          gap: 10,
          height: 56,
          padding: "0 22px",
        }}
      >
        <FolderIcon />
        <span
          style={{
            color: "#1F2937",
            fontFamily: geistMono,
            fontSize: 16,
            letterSpacing: -0.2,
          }}
        >
          photos/
        </span>
        <span
          style={{
            color: "#9CA3AF",
            fontFamily: geistMono,
            fontSize: 13,
            marginLeft: "auto",
          }}
        >
          delimiter: "/"
        </span>
      </div>

      <SectionLabel reveal={revealAt(0)} text="prefixes" />
      {FOLDERS.map((row, i) => (
        <Row key={row.name} reveal={revealAt(i)} row={row} />
      ))}
      <SectionLabel reveal={revealAt(FOLDERS.length)} text="items" />
      {FILES.map((row, i) => (
        <Row key={row.name} reveal={revealAt(FOLDERS.length + i)} row={row} />
      ))}
    </div>
  );
};
