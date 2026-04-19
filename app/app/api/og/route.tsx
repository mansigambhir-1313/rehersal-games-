import { ImageResponse } from "next/og";
import { getScenario } from "@/lib/scenarios";
import { getPartner } from "@/lib/partners";

export const runtime = "edge";

/**
 * Share card for a debriefed round.
 * GET /api/og?scenario=funnel-recovery&dq=83
 * Every div in a Satori template MUST declare display: flex (or none) — that's
 * non-negotiable, even for single-child containers. Keep the layout simple.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const scenarioId = searchParams.get("scenario") ?? "funnel-recovery";
  const dqRaw = searchParams.get("dq") ?? "0";
  const dq = Math.max(0, Math.min(100, parseInt(dqRaw, 10) || 0));

  const scenario = getScenario(scenarioId);
  const title = scenario?.title ?? "Inversion Gym";
  const subtitle =
    scenario?.failurePoster.subtitle ?? "The product died. Work backwards.";
  const partner = scenario ? getPartner(scenario.seniorPartnerId) : null;

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
          color: "#0F0F0F",
        }}
      >
        {/* Top row */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            width: "100%",
          }}
        >
          <div style={{ display: "flex", fontSize: 30, fontWeight: 500 }}>
            Rehearsal
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#EDE5F7",
              color: "#4C1D95",
              padding: "8px 20px",
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 500,
              letterSpacing: 2,
            }}
          >
            INVERSION GYM
          </div>
        </div>

        {/* Center — score + title */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 56,
            width: "100%",
          }}
        >
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
            <div style={{ display: "flex", fontSize: 96, fontWeight: 600, lineHeight: 1 }}>
              {dq}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 13,
                letterSpacing: 4,
                color: "#8A8680",
                marginTop: 10,
              }}
            >
              DECISION QUALITY
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              flex: 1,
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 58,
                lineHeight: 1.05,
                marginBottom: 20,
                fontWeight: 500,
              }}
            >
              {title}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 24,
                color: "#8A8680",
                lineHeight: 1.4,
              }}
            >
              {subtitle.slice(0, 140)}
            </div>
            {partner && (
              <div
                style={{
                  display: "flex",
                  fontSize: 18,
                  color: "#4C1D95",
                  marginTop: 18,
                }}
              >
                Graded by {partner.name}
              </div>
            )}
          </div>
        </div>

        {/* Bottom row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "baseline",
            width: "100%",
            fontSize: 22,
            color: "#8A8680",
          }}
        >
          <div style={{ display: "flex" }}>
            Think you can do better? rehearsal-inversion-gym.vercel.app
          </div>
          <div style={{ display: "flex", color: "#0F0F0F" }}>
            90s · 8 causes · 1 ranked list
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
