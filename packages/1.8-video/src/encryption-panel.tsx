import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const PLAINTEXT = "Quarterly revenue — $4.2M";

// Deterministic hex blob the same shape as a GCM ciphertext, derived from the
// plaintext so the render is stable frame-to-frame.
const hex2 = (n: number): string => {
  const h = n.toString(16);
  return h.length < 2 ? `0${h}` : h;
};
const CIPHER = [...PLAINTEXT]
  .map((c, i) => {
    const pair = hex2(((c.codePointAt(0) ?? 0) * 31 + i * 17) % 256);
    return i % 4 === 3 ? `${pair} ` : pair;
  })
  .join("")
  .trim();

const ENCRYPT_AT = 38;
const DOWNLOAD_AT = 92;

/** Encrypt-on-write, then decrypt-on-read beats. */
export const ENCRYPTION_ACTION_FRAMES = DOWNLOAD_AT + 38;

const LockIcon: React.FC<{ open: boolean; color: string }> = ({
  open,
  color,
}) => (
  <svg height="20" viewBox="0 0 20 22" width="18">
    <title>{open ? "Unlocked" : "Locked"}</title>
    <rect fill={color} height="11" rx="2" width="14" x="3" y="9" />
    <path
      d={open ? "M6 9V6a4 4 0 0 1 7.7-1.4" : "M6 9V6a4 4 0 0 1 8 0v3"}
      fill="none"
      stroke={color}
      strokeWidth="2"
    />
  </svg>
);

const KeyIcon: React.FC = () => (
  <svg height="14" viewBox="0 0 20 20" width="14">
    <title>Key</title>
    <circle cx="7" cy="7" fill="none" r="4" stroke="#B45309" strokeWidth="2" />
    <path
      d="M10 10 L17 17 M14 14 L16 12 M16 16 L18 14"
      stroke="#B45309"
      strokeLinecap="round"
      strokeWidth="2"
    />
  </svg>
);

const MetaRow: React.FC<{
  label: string;
  value: React.ReactNode;
  reveal: number;
}> = ({ label, value, reveal }) => (
  <div
    style={{
      alignItems: "center",
      display: "flex",
      gap: 10,
      height: 30,
      justifyContent: "space-between",
      opacity: reveal,
      transform: `translateY(${(1 - reveal) * 5}px)`,
    }}
  >
    <span style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 13 }}>
      {label}
    </span>
    <span
      style={{
        alignItems: "center",
        color: "#B45309",
        display: "flex",
        fontFamily: geistMono,
        fontSize: 13,
        gap: 6,
      }}
    >
      {value}
    </span>
  </div>
);

type Phase = "encrypting" | "encrypted" | "decrypted";

const STATUS: Record<Phase, { label: string; color: string; bg: string }> = {
  decrypted: {
    bg: "rgba(5,150,105,0.12)",
    color: "#059669",
    label: "Decrypted",
  },
  encrypted: {
    bg: "rgba(217,119,6,0.12)",
    color: "#B45309",
    label: "Encrypted at rest",
  },
  encrypting: {
    bg: "rgba(217,119,6,0.12)",
    color: "#B45309",
    label: "Encrypting…",
  },
};

const phaseAt = (frame: number): Phase => {
  if (frame >= DOWNLOAD_AT) {
    return "decrypted";
  }
  if (frame >= ENCRYPT_AT) {
    return "encrypted";
  }
  return "encrypting";
};

export const EncryptionPanel: React.FC<{ frame: number }> = ({ frame }) => {
  const phase = phaseAt(frame);

  // Plaintext fades to ciphertext as the lock closes; on download it returns.
  const cipherIn = interpolate(frame, [10, ENCRYPT_AT], [0, 1], {
    easing: Easing.bezier(0.45, 0, 0.55, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const plainBack = interpolate(
    frame,
    [DOWNLOAD_AT, DOWNLOAD_AT + 16],
    [0, 1],
    {
      easing: Easing.bezier(0.16, 1, 0.3, 1),
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    }
  );
  const cipherShown = cipherIn * (1 - plainBack);
  const plainShown = 1 - cipherShown;

  const scan = interpolate(frame, [10, ENCRYPT_AT], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const scanVisible = frame > 8 && frame < ENCRYPT_AT;

  const metaReveal = interpolate(frame, [ENCRYPT_AT, ENCRYPT_AT + 18], [0, 1], {
    easing: Easing.bezier(0.16, 1, 0.3, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const downloadReveal = interpolate(
    frame,
    [DOWNLOAD_AT - 4, DOWNLOAD_AT + 12],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const status = STATUS[phase];
  const open = phase === "decrypted";

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
          gap: 11,
          height: 58,
          padding: "0 22px",
        }}
      >
        <LockIcon color={open ? "#059669" : "#B45309"} open={open} />
        <span
          style={{
            color: "#1F2937",
            fontFamily: geistMono,
            fontSize: 16,
            letterSpacing: -0.2,
          }}
        >
          secret.txt
        </span>
        <span
          style={{
            alignItems: "center",
            background: status.bg,
            borderRadius: 999,
            color: status.color,
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
              background: status.color,
              borderRadius: 999,
              height: 6,
              width: 6,
            }}
          />
          {status.label}
        </span>
      </div>

      <div style={{ padding: "20px 22px 8px" }}>
        <div
          style={{
            background: "#FBF9F4",
            border: "1px solid rgba(0,0,0,0.05)",
            borderRadius: 10,
            height: 78,
            overflow: "hidden",
            padding: "14px 16px",
            position: "relative",
          }}
        >
          <div
            style={{
              color: "#1F2937",
              fontFamily: geistMono,
              fontSize: 16,
              letterSpacing: -0.1,
              opacity: plainShown,
              position: "absolute",
            }}
          >
            {PLAINTEXT}
          </div>
          <div
            style={{
              color: "#B45309",
              fontFamily: geistMono,
              fontSize: 14,
              letterSpacing: 0.5,
              lineHeight: 1.5,
              opacity: cipherShown,
              position: "absolute",
              width: "calc(100% - 32px)",
              wordBreak: "break-all",
            }}
          >
            {CIPHER}
          </div>
          {scanVisible && (
            <div
              style={{
                background:
                  "linear-gradient(90deg, transparent, rgba(217,119,6,0.55), transparent)",
                bottom: 0,
                left: `${scan}%`,
                position: "absolute",
                top: 0,
                width: 40,
              }}
            />
          )}
        </div>
      </div>

      <div style={{ opacity: metaReveal, padding: "6px 22px 4px" }}>
        <MetaRow label="fsenc_scheme" reveal={metaReveal} value="AES-256-GCM" />
        <MetaRow
          label="fsenc_dek"
          reveal={metaReveal}
          value={
            <>
              <KeyIcon />
              wrapped
            </>
          }
        />
        <MetaRow label="fsenc_iv" reveal={metaReveal} value="a91f…7c4d" />
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
          opacity: downloadReveal,
          padding: "13px 22px",
        }}
      >
        <span style={{ fontSize: 13 }}>✓</span>
        download() decrypts transparently
      </div>
    </div>
  );
};
