import { loadFont as loadGeist } from "@remotion/google-fonts/Geist";
import { loadFont as loadGeistMono } from "@remotion/google-fonts/GeistMono";
import { Easing, interpolate } from "remotion";

const { fontFamily: geist } = loadGeist();
const { fontFamily: geistMono } = loadGeistMono();

const RAMP = 74;

interface Group {
  name: string;
  ops: number;
  mbUp: number;
}

const GROUPS: Group[] = [
  { mbUp: 3.1, name: "acme", ops: 8 },
  { mbUp: 1.1, name: "globex", ops: 4 },
];
const MAX_MB = Math.max(...GROUPS.map((g) => g.mbUp));

/** Counters ramp as operations stream through, then settle. */
export const USAGE_ACTION_FRAMES = RAMP + 30;

const ramp = (frame: number, to: number): number =>
  interpolate(frame, [0, RAMP], [0, to], {
    easing: Easing.bezier(0.33, 1, 0.68, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

const Stat: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div
    style={{
      background: "#FBF9F4",
      border: "1px solid rgba(0,0,0,0.05)",
      borderRadius: 10,
      flex: 1,
      padding: "14px 16px",
    }}
  >
    <div
      style={{
        color: "#1F2937",
        fontFamily: geistMono,
        fontSize: 26,
        fontWeight: 500,
        letterSpacing: -0.6,
      }}
    >
      {value}
    </div>
    <div
      style={{
        color: "#9CA3AF",
        fontFamily: geistMono,
        fontSize: 12,
        marginTop: 4,
      }}
    >
      {label}
    </div>
  </div>
);

const GroupRow: React.FC<{ group: Group; frame: number }> = ({
  group,
  frame,
}) => {
  const grow = interpolate(frame, [10, RAMP], [0, 1], {
    easing: Easing.bezier(0.33, 1, 0.68, 1),
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const width = (group.mbUp / MAX_MB) * 100 * grow;
  const ops = Math.round(ramp(frame, group.ops));

  return (
    <div style={{ padding: "8px 22px" }}>
      <div
        style={{
          alignItems: "baseline",
          display: "flex",
          justifyContent: "space-between",
          marginBottom: 7,
        }}
      >
        <span
          style={{
            color: "#1F2937",
            fontFamily: geistMono,
            fontSize: 14,
            letterSpacing: -0.2,
          }}
        >
          {group.name}
        </span>
        <span style={{ color: "#9CA3AF", fontFamily: geistMono, fontSize: 13 }}>
          {ops} ops · {(group.mbUp * grow).toFixed(1)} MB up
        </span>
      </div>
      <div
        style={{
          background: "#EFEDE6",
          borderRadius: 999,
          height: 7,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <div
          style={{
            background: "#059669",
            borderRadius: 999,
            height: "100%",
            width: `${width}%`,
          }}
        />
      </div>
    </div>
  );
};

export const UsagePanel: React.FC<{ frame: number }> = ({ frame }) => {
  const ops = Math.round(ramp(frame, 12));
  const up = ramp(frame, 4.2);
  const down = ramp(frame, 1.8);
  const pulse = 0.5 + 0.5 * Math.sin(frame / 4);

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
          files.usage()
        </span>
        <span
          style={{
            alignItems: "center",
            color: "#047857",
            display: "flex",
            fontFamily: geistMono,
            fontSize: 13,
            gap: 7,
          }}
        >
          <span
            style={{
              background: "#059669",
              borderRadius: 999,
              height: 6,
              opacity: pulse,
              width: 6,
            }}
          />
          live
        </span>
      </div>

      <div style={{ display: "flex", gap: 12, padding: "18px 22px 6px" }}>
        <Stat label="operations" value={`${ops}`} />
        <Stat label="bytes up" value={`${up.toFixed(1)} MB`} />
        <Stat label="bytes down" value={`${down.toFixed(1)} MB`} />
      </div>

      <div
        style={{
          color: "#B59A7A",
          fontFamily: geistMono,
          fontSize: 12,
          letterSpacing: 0.4,
          padding: "12px 22px 2px",
          textTransform: "uppercase",
        }}
      >
        usageByGroup()
      </div>
      <div style={{ paddingBottom: 14 }}>
        {GROUPS.map((group) => (
          <GroupRow frame={frame} group={group} key={group.name} />
        ))}
      </div>
    </div>
  );
};
