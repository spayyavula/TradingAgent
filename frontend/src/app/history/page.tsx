import Link from "next/link";
import { api, type DecisionSummary } from "@/lib/api";
import { PageHeader, RatingBadge, StatusPill, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{ ticker?: string; rating?: string }>;
}

export default async function HistoryPage({ searchParams }: PageProps) {
  const { ticker, rating } = await searchParams;
  let items: DecisionSummary[] = [];
  let error: string | undefined;
  try {
    items = await api.decisions({ ticker, rating, limit: 200 });
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load";
  }

  return (
    <div className="pb-16">
      <PageHeader
        title="Decisions"
        subtitle={`${items.length} ${items.length === 1 ? "decision" : "decisions"}${
          ticker ? ` for ${ticker}` : ""
        }`}
        actions={(ticker || rating) ? <ClearFilters /> : undefined}
      />

      <div className="px-6 lg:px-10 mt-6 space-y-4">
        {error && (
          <div className="surface-card p-5 text-[13px] text-[var(--color-accent-red)]">
            {error}
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState title="Nothing to show" description="No decisions match the current filters." />
        ) : (
          <div className="surface-card overflow-hidden">
            <ul>
              {items.map((d, i) => (
                <li key={d.id}>
                  <Link
                    href={`/decisions/${encodeURIComponent(d.id)}`}
                    className="grid grid-cols-[110px_minmax(0,1fr)_auto_auto] items-center gap-4 px-5 py-4 hover:bg-[color-mix(in_oklch,var(--separator)_50%,transparent)] transition-colors"
                  >
                    <div className="flex flex-col">
                      <span className="text-[15px] font-semibold tracking-tight text-label">
                        {d.ticker}
                      </span>
                      <span className="text-[12px] text-label-tertiary">{d.date}</span>
                    </div>
                    <RatingBadge rating={d.rating} />
                    <StatusPill status={d.status} />
                    <svg
                      viewBox="0 0 20 20"
                      className="size-4 text-label-quaternary"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    >
                      <path d="M8 5l5 5-5 5" />
                    </svg>
                  </Link>
                  {i < items.length - 1 && <div className="divider mx-5" />}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

function ClearFilters() {
  return (
    <Link
      href="/history"
      className="text-[13px] text-[var(--tint)] hover:underline underline-offset-4"
    >
      Clear filters
    </Link>
  );
}
