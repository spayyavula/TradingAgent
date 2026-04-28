import Link from "next/link";
import { api, type DashboardStats, type DecisionSummary } from "@/lib/api";
import { PageHeader, StatTile, RatingBadge, StatusPill, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

async function loadData(): Promise<{
  stats: DashboardStats | null;
  recent: DecisionSummary[];
  error?: string;
}> {
  try {
    const [stats, recent] = await Promise.all([api.stats(), api.decisions({ limit: 8 })]);
    return { stats, recent };
  } catch (err) {
    return {
      stats: null,
      recent: [],
      error: err instanceof Error ? err.message : "Failed to reach API",
    };
  }
}

export default async function DashboardPage() {
  const { stats, recent, error } = await loadData();

  return (
    <div className="pb-16">
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your trading agent decisions"
      />

      <div className="px-6 lg:px-10 mt-6 grid gap-6">
        {error && (
          <div className="surface-card p-5 text-[13px] text-[var(--color-accent-red)]">
            Backend unreachable — {error}. Make sure FastAPI is running on port 8000.
          </div>
        )}

        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatTile label="Decisions" value={stats?.total_decisions ?? "—"} hint="All time" />
          <StatTile label="Tickers" value={stats?.distinct_tickers ?? "—"} hint="Distinct" />
          <StatTile
            label="Pending"
            value={stats?.pending_count ?? "—"}
            hint="Awaiting outcome"
            tone="warning"
          />
          <StatTile
            label="Most common"
            value={mostCommonRating(stats?.by_rating) ?? "—"}
            hint="Across all runs"
          />
        </section>

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[18px] font-semibold tracking-tight text-label">Recent decisions</h2>
            <Link
              href="/history"
              className="text-[13px] text-[var(--tint)] hover:underline underline-offset-4"
            >
              View all →
            </Link>
          </div>

          {recent.length === 0 ? (
            <EmptyState
              title="No decisions yet"
              description="Run main.py or use the analyze flow to create your first decision. It will appear here automatically."
            />
          ) : (
            <div className="surface-card overflow-hidden">
              <ul>
                {recent.map((d, i) => (
                  <li key={d.id}>
                    <Link
                      href={`/decisions/${encodeURIComponent(d.id)}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-[color-mix(in_oklch,var(--separator)_50%,transparent)] transition-colors"
                    >
                      <div className="flex flex-col min-w-[110px]">
                        <span className="text-[15px] font-semibold tracking-tight text-label">
                          {d.ticker}
                        </span>
                        <span className="text-[12px] text-label-tertiary">{d.date}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <RatingBadge rating={d.rating} />
                      </div>
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
                    {i < recent.length - 1 && <div className="divider mx-5" />}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function mostCommonRating(by: Record<string, number> | undefined): string | null {
  if (!by) return null;
  let best: [string, number] | null = null;
  for (const [k, v] of Object.entries(by)) {
    if (!best || v > best[1]) best = [k, v];
  }
  return best?.[0] ?? null;
}
