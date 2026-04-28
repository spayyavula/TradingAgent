import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui";
import { AnalyzeStream } from "@/components/AnalyzeStream";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ run_id: string }>;
}

export default async function AnalyzeRunPage({ params }: PageProps) {
  const { run_id } = await params;
  let snapshot;
  try {
    snapshot = await api.getRun(run_id);
  } catch {
    notFound();
  }

  return (
    <div className="pb-20">
      <PageHeader
        title={`${snapshot.ticker} · ${snapshot.date}`}
        subtitle={`Run ${run_id.slice(0, 8)} · started ${new Date(snapshot.created_at).toLocaleString()}`}
      />
      <div className="px-6 lg:px-10 mt-6">
        <AnalyzeStream runId={run_id} initial={snapshot} />
      </div>
    </div>
  );
}
