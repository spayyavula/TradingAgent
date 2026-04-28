import Link from "next/link";
import { notFound } from "next/navigation";
import { api } from "@/lib/api";
import { PageHeader, RatingBadge, StatusPill } from "@/components/ui";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DecisionDetailPage({ params }: PageProps) {
  const { id } = await params;
  let decision;
  try {
    decision = await api.decision(decodeURIComponent(id));
  } catch {
    notFound();
  }

  return (
    <div className="pb-20">
      <PageHeader
        title={`${decision.ticker} · ${decision.date}`}
        subtitle="Trading agent decision"
        actions={
          <Link
            href="/history"
            className="text-[13px] text-[var(--tint)] hover:underline underline-offset-4"
          >
            ← Back
          </Link>
        }
      />

      <div className="px-6 lg:px-10 mt-6 grid gap-6 max-w-4xl">
        <section className="surface-card p-6 flex flex-wrap items-center gap-4">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-label-tertiary font-medium">
              Rating
            </span>
            <RatingBadge rating={decision.rating} />
          </div>
          <div className="h-10 w-px bg-[var(--separator)]" />
          <div className="flex flex-col gap-1">
            <span className="text-[11px] uppercase tracking-wider text-label-tertiary font-medium">
              Status
            </span>
            <StatusPill status={decision.status} />
          </div>
          {decision.time_horizon && (
            <>
              <div className="h-10 w-px bg-[var(--separator)]" />
              <div className="flex flex-col gap-1">
                <span className="text-[11px] uppercase tracking-wider text-label-tertiary font-medium">
                  Horizon
                </span>
                <span className="text-[14px] font-medium text-label">{decision.time_horizon}</span>
              </div>
            </>
          )}
        </section>

        {decision.executive_summary && (
          <Section title="Executive summary" body={decision.executive_summary} />
        )}
        {decision.investment_thesis && (
          <Section title="Investment thesis" body={decision.investment_thesis} />
        )}

        <details className="surface-card p-5">
          <summary className="cursor-pointer text-[14px] font-medium text-label-secondary hover:text-label">
            Raw markdown
          </summary>
          <pre className="mt-4 text-[12px] leading-relaxed text-label-secondary overflow-x-auto whitespace-pre-wrap font-mono">
            {decision.raw_markdown}
          </pre>
        </details>
      </div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  return (
    <section className="surface-card p-6">
      <h2 className="text-[12px] uppercase tracking-wider font-medium text-label-tertiary">
        {title}
      </h2>
      <p className="mt-3 text-[15px] leading-relaxed text-label whitespace-pre-wrap">{body}</p>
    </section>
  );
}
