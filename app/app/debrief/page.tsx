import { DebriefScreen } from "@/components/DebriefScreen";

export default async function DebriefPage({
  searchParams,
}: {
  searchParams: Promise<{ session?: string; demo?: string }>;
}) {
  const sp = await searchParams;
  return (
    <DebriefScreen
      sessionId={sp.session ?? null}
      demoMode={sp.demo === "1"}
    />
  );
}
