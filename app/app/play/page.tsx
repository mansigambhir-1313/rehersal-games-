import { PlayScreen } from "@/components/PlayScreen";
import { getScenario } from "@/lib/scenarios";
import { notFound } from "next/navigation";

export default async function PlayPage({
  searchParams,
}: {
  searchParams: Promise<{ scenario?: string; demo?: string }>;
}) {
  const sp = await searchParams;
  const scenarioId = sp.scenario ?? "funnel-recovery";
  const scenario = getScenario(scenarioId);
  if (!scenario) notFound();

  return <PlayScreen scenario={scenario} demoMode={sp.demo === "1"} />;
}
