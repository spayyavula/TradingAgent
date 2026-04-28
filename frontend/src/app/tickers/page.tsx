import Link from "next/link";
import { api } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export default async function TickersPage() {
  let tickers: string[] = [];
  let error: string | undefined;
  try {
    tickers = await api.tickers();
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load";
  }

  return (
    <div className="pb-16">
      <PageHeader title="Tickers" subtitle={`${tickers.length} symbols analyzed`} />

      <div className="px-6 lg:px-10 mt-6">
        {error && (
          <div className="surface-card p-5 text-[13px] text-[var(--color-accent-red)]">{error}</div>
        )}
        {tickers.length === 0 && !error ? (
          <EmptyState title="No tickers yet" description="Run an analysis to populate this list." />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {tickers.map((t) => (
              <Link
                key={t}
                href={`/tickers/${encodeURIComponent(t)}`}
                className="surface-tile px-5 py-6 text-center hover:translate-y-[-1px] transition-transform"
              >
                <div className="text-[20px] font-semibold tracking-tight text-label">{t}</div>
                <div className="text-[11px] uppercase tracking-wider text-label-tertiary mt-1">
                  Chart & decisions
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
