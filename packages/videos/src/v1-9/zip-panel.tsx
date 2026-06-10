import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const ACCENT = "#CA8A04";
const STEP = 16;

interface Entry {
  name: string;
  size: string;
}

const ENTRIES: Entry[] = [
  { name: "photos/a.jpg", size: "1.2 MB" },
  { name: "photos/b.jpg", size: "0.9 MB" },
  { name: "photos/c.jpg", size: "1.4 MB" },
  { name: "photos/d.jpg", size: "1.1 MB" },
];

const LAST = (ENTRIES.length - 1) * STEP;
/** Each key is streamed into the archive one entry at a time. */
export const ZIP_ACTION_FRAMES = LAST + 48;

const addedAt = (index: number): number => index * STEP + 10;

const SourceRow: React.FC<{
  entry: Entry;
  added: boolean;
  active: boolean;
}> = ({ entry, added, active }) => (
  <div
    style={{
      alignItems: "center",
      background: active ? `${ACCENT}12` : "transparent",
      borderRadius: 8,
      display: "flex",
      gap: 8,
      height: 38,
      justifyContent: "space-between",
      opacity: added ? 0.55 : 1,
      padding: "0 12px",
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
      {entry.name}
    </span>
    {added ? (
      <span style={{ color: "#047857", fontSize: 13 }}>✓</span>
    ) : (
      <span style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 12 }}>
        {entry.size}
      </span>
    )}
  </div>
);

export const ZipPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const added = ENTRIES.filter((_, i) => frame >= addedAt(i)).length;
  const activeIdx = ENTRIES.findIndex((_, i) => frame < addedAt(i));
  const progress = interpolate(frame, [0, LAST + 10], [0, 1], {
    easing: Easing.bezier(0.33, 1, 0.68, 1),
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
        width: 580,
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
          files.zip({"{ prefix }"})
        </span>
        <span style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 13 }}>
          method: store
        </span>
      </div>

      <div style={{ display: "flex", gap: 16, padding: "18px 22px" }}>
        <div style={{ display: "flex", flex: 1, flexDirection: "column" }}>
          {ENTRIES.map((entry, i) => (
            <SourceRow
              active={i === activeIdx}
              added={frame >= addedAt(i)}
              entry={entry}
              key={entry.name}
            />
          ))}
        </div>

        <div style={{ alignItems: "center", display: "flex" }}>
          <span style={{ color: "#D8D2C6", fontSize: 22 }}>→</span>
        </div>

        <div
          style={{
            alignItems: "center",
            background: `${ACCENT}10`,
            border: `1.5px solid ${ACCENT}33`,
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            gap: 12,
            justifyContent: "center",
            padding: "20px 18px",
            width: 190,
          }}
        >
          <svg height="40" viewBox="0 0 24 24" width="40">
            <title>Archive</title>
            <path
              d="M4 5a2 2 0 0 1 2-2h5l2 2h5a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"
              fill="none"
              stroke={ACCENT}
              strokeLinejoin="round"
              strokeWidth="1.6"
            />
            <path
              d="M12 8v2M12 12v2M12 16v1.5"
              stroke={ACCENT}
              strokeLinecap="round"
              strokeWidth="1.6"
            />
          </svg>
          <span
            style={{
              color: "#1F2937",
              fontFamily: geistMono,
              fontSize: 15,
              letterSpacing: -0.2,
            }}
          >
            bundle.zip
          </span>
          <span style={{ color: ACCENT, fontFamily: geistMono, fontSize: 13 }}>
            {added} / {ENTRIES.length} entries
          </span>
          <div
            style={{
              background: "#EFEDE6",
              borderRadius: 999,
              height: 6,
              overflow: "hidden",
              width: "100%",
            }}
          >
            <div
              style={{
                background: ACCENT,
                borderRadius: 999,
                height: "100%",
                width: `${progress * 100}%`,
              }}
            />
          </div>
        </div>
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
        <span>lazy entries — memory stays flat</span>
        <span style={{ color: "#9CA3AF" }}>zipTo() · unzip()</span>
      </div>
    </div>
  );
};
