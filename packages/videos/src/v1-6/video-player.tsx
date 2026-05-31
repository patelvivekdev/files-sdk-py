import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

/** Frames the playhead takes to scrub across the clip. */
export const VIDEO_ACTION_FRAMES = 112;

// 48 MiB clip, read in 4 MiB ranged chunks
const TOTAL_BYTES = 50_331_648;
const CHUNK = 4_194_304;
const TOTAL_SECONDS = 135;
// playhead settles at 80% of the clip
const SCRUB_TO = 0.8;

const positionAt = (frame: number): number =>
  interpolate(frame, [0, VIDEO_ACTION_FRAMES], [0, SCRUB_TO], {
    easing: Easing.bezier(0.4, 0, 0.2, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const chunkAt = (frame: number): number =>
  Math.floor((positionAt(frame) * TOTAL_BYTES) / CHUNK);

const fmtTime = (seconds: number): string => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s < 10 ? "0" : ""}${s}`;
};

const PlayGlyph: React.FC<{ playing: boolean }> = ({ playing }) =>
  playing ? (
    <span style={{ display: "flex", gap: 4 }}>
      <span style={{ background: "#1F2937", height: 14, width: 4 }} />
      <span style={{ background: "#1F2937", height: 14, width: 4 }} />
    </span>
  ) : (
    <span
      style={{
        borderBottom: "7px solid transparent",
        borderLeft: "12px solid #1F2937",
        borderTop: "7px solid transparent",
        height: 0,
        width: 0,
      }}
    />
  );

export const VideoPlayer: React.FC<{ frame: number }> = ({ frame }) => {
  const pos = positionAt(frame);
  const playing = frame > 0 && frame < VIDEO_ACTION_FRAMES;

  const currentByte = Math.floor(pos * TOTAL_BYTES);
  const chunk = Math.floor(currentByte / CHUNK);
  const rangeStart = chunk * CHUNK;
  const rangeEnd = Math.min(rangeStart + CHUNK - 1, TOTAL_BYTES - 1);
  const buffered = Math.min(1, ((chunk + 1) * CHUNK) / TOTAL_BYTES);
  const justSeeked = chunkAt(frame) !== chunkAt(frame - 6);

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
          background:
            "radial-gradient(120% 120% at 30% 20%, #3A2C1E, #14100B 70%)",
          display: "flex",
          height: 240,
          justifyContent: "center",
          position: "relative",
        }}
      >
        <div
          style={{
            color: "rgba(255,255,255,0.5)",
            fontFamily: geistMono,
            fontSize: 13,
            left: 18,
            letterSpacing: -0.1,
            position: "absolute",
            top: 16,
          }}
        >
          video.mp4
        </div>
        <div
          style={{
            alignItems: "center",
            background: "rgba(255,255,255,0.92)",
            borderRadius: 999,
            display: "flex",
            height: 64,
            justifyContent: "center",
            paddingLeft: playing ? 0 : 4,
            width: 64,
          }}
        >
          <PlayGlyph playing={playing} />
        </div>
        <div
          style={{
            background: "rgba(0,0,0,0.5)",
            borderRadius: 6,
            bottom: 16,
            color: "rgba(255,255,255,0.85)",
            fontFamily: geistMono,
            fontSize: 12,
            padding: "3px 8px",
            position: "absolute",
            right: 18,
          }}
        >
          {fmtTime(TOTAL_SECONDS)}
        </div>
      </div>

      <div
        style={{
          alignItems: "center",
          display: "flex",
          gap: 16,
          padding: "18px 22px 14px",
        }}
      >
        <PlayGlyph playing={playing} />
        <div
          style={{
            background: "#E5E1D8",
            borderRadius: 999,
            flex: 1,
            height: 6,
            position: "relative",
          }}
        >
          <div
            style={{
              background: "rgba(217,119,6,0.28)",
              borderRadius: 999,
              height: "100%",
              width: `${buffered * 100}%`,
            }}
          />
          <div
            style={{
              background: "#D97706",
              borderRadius: 999,
              height: "100%",
              position: "absolute",
              top: 0,
              width: `${pos * 100}%`,
            }}
          />
          <div
            style={{
              background: "#FFFFFF",
              borderRadius: 999,
              boxShadow: "0 1px 4px rgba(60,40,20,0.35)",
              height: 14,
              left: `${pos * 100}%`,
              marginLeft: -7,
              position: "absolute",
              top: -4,
              width: 14,
            }}
          />
        </div>
        <span
          style={{
            color: "#6B7280",
            fontFamily: geistMono,
            fontSize: 13,
            minWidth: 86,
            textAlign: "right",
          }}
        >
          {fmtTime(pos * TOTAL_SECONDS)} / {fmtTime(TOTAL_SECONDS)}
        </span>
      </div>

      <div
        style={{
          alignItems: "center",
          borderTop: "1px solid rgba(0,0,0,0.05)",
          display: "flex",
          height: 48,
          justifyContent: "space-between",
          padding: "0 22px",
        }}
      >
        <span
          style={{
            background: justSeeked ? "rgba(217,119,6,0.12)" : "transparent",
            borderRadius: 6,
            color: "#B45309",
            fontFamily: geistMono,
            fontSize: 13,
            margin: "0 -6px",
            padding: "3px 6px",
          }}
        >
          bytes={rangeStart}-{rangeEnd}
        </span>
        <span
          style={{
            alignItems: "center",
            background: "rgba(5,150,105,0.12)",
            borderRadius: 999,
            color: "#059669",
            display: "flex",
            fontFamily: geistMono,
            fontSize: 12,
            gap: 6,
            padding: "4px 10px",
          }}
        >
          <span
            style={{
              background: "#059669",
              borderRadius: 999,
              height: 6,
              width: 6,
            }}
          />
          206 Partial Content
        </span>
      </div>
    </div>
  );
};
