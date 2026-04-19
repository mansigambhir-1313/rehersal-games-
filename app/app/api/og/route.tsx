import { ImageResponse } from "next/og";
import { getScenario } from "@/lib/scenarios";

export const runtime = "edge";

/**
 * Generate a shareable OG card for a debriefed round.
 * GET /api/og?scenario=funnel-recovery&dq=83
 * Returns 1200x630 PNG optimized for WhatsApp / LinkedIn / Twitter previews.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get("scenario") ?? "funnel-recovery";
  const dqRaw = searchParams.get("dq") ?? "0";
  const dq = Math.max(0, Math.min(100, parseInt(dqRaw, 10) || 0));

  const scenario = getScenario(scenarioId);
  const title = scenario?.title ?? "Inversion Gym";
  const subtitle = scenario?.failurePoster.subtitle ?? "The product died. Work backwards.";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#FAFAF8",
          fontFamily: "serif",
          color: "#0F0F0F",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                fontSize: 32,
                letterSpacing: "-0.01em",
              }}
            >
              <span
                style={{
                  borderBottom: "3px solid #6B46C1",
                  paddingBottom: 2,
                }}
              >
                Re
              </span>
              hearsal
            </span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#EDE5F7",
              color: "#4C1D95",
              padding: "8px 20px",
              borderRadius: 999,
              fontSize: 20,
              fontWeight: 500,
              fontFamily: "sans-serif",
            }}
          >
            INVERSION GYM
          </div>
        </div>

        {/* Center: score + title */}
        <div style={{ display: "flex", alignItems: "center", gap: 60 }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              width: 220,
              height: 220,
              border: "4px solid #0F0F0F",
              borderRadius: 999,
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 96, fontWeight: 500, lineHeight: 1 }}>{dq}</div>
            <div
              style={{
                fontSize: 14,
                letterSpacing: "0.2em",
                color: "#8A8680",
                fontFamily: "sans-serif",
                marginTop: 8,
              }}
            >
              DECISION QUALITY
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
            <div
              style={{
                fontSize: 56,
                lineHeight: 1.05,
                marginBottom: 20,
                letterSpacing: "-0.01em",
              }}
            >
              {title}
            </div>
            <div
              style={{
                fontSize: 24,
                color: "#8A8680",
                fontStyle: "italic",
                lineHeight: 1.4,
              }}
            >
              {subtitle.slice(0, 140)}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            fontSize: 22,
            fontFamily: "sans-serif",
            color: "#8A8680",
          }}
        >
          <span>Think you can do better? Play at rehearsal-inversion-gym.vercel.app</span>
          <span style={{ color: "#0F0F0F" }}>90s · 8 causes · 1 ranked list</span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
