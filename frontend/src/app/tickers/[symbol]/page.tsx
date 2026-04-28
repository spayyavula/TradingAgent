import Link from "next/link";
import { notFound } from "next/navigation";
import { api, type Range } from "@/lib/api";
import { PageHeader, RatingBadge, StatusPill, EmptyState } from "@/components/ui";
import { PriceChart } from "@/components/PriceChart";

export const dynamic = "force-dynamic";

const RANGES: Range[] = ["3mo", "6mo", "1y", "2y", "5y"];

interface PageProps {
  params: Promise<{ symbol: string }>;
  searchParams: Promise<{ range?: string }>;
}

export default async function TickerDetailPage({ params, searchParams }: PageProps) {
  const { symbol } = await params;
  const { range: rangeParam } = await searchParams;
  const range = (RANGES as string[]).includes(rangeParam ?? "")
    ? (rangeParam as Range)
    : "5y";
  const sym = decodeURIComponent(symbol).toUpperCase();

  let prices, decisions;
  try {
    [prices, decisions] = await Promise.all([
      api.tickerPrices(sym, range),
      api.tickerDecisions(sym),
    ]);
  } catch {
    notFound();
  }

  if (!prices || prices.candles.length === 0) {
    return (
      <div className="pb-16">
        <PageHeader title={sym} subtitle="No price data available" />
        <div className="px-6 lg:px-10 mt-6">
          <EmptyState
            title="No data"
            description="Could not retrieve price data for this symbol. Verify the ticker is valid."
          />
        </div>
      </div>
    );
  }

  const change = prices.change_pct ?? 0;
  const positive = change >= 0;

  return (
    <div className="pb-20">
      <PageHeader
        title={sym}
        subtitle={`${prices.candles.length} sessions · ${range}`}
        actions={
          <Link
            href="/tickers"
            className="text-[13px] text-[var(--tint)] hover:underline underline-offset-4"
          >
            ← Tickers
          </Link>
        }
      />

      <div className="px-6 lg:px-10 mt-6 grid gap-6">
        <section className="surface-card p-6 flex flex-wrap items-center gap-6">
          <div>
            <div className="text-[12px] uppercase tracking-wider text-label-tertiary font-medium">
              Last close
            </div>
            <div className="mt-1 text-[34px] font-semibold tracking-tight text-label tabular-nums">
              {prices.latest_close?.toFixed(2)}
            </div>
            <div
              className={`text-[13px] font-medium tabular-nums ${
                positive
                  ? "text-[var(--color-accent-green)]"
                  : "text-[var(--color-accent-red)]"
              }`}
            >
              {positive ? "▲" : "▼"} {Math.abs(change).toFixed(2)}%
            </div>
          </div>
          <div className="h-12 w-px bg-[var(--separator)]" />
          <div>
            <div className="text-[12px] uppercase tracking-wider text-label-tertiary font-medium">
              {range} high
            </div>
            <div className="mt-1 text-[20px] font-semibold tracking-tight text-label tabular-nums">
              {prices.range_high?.toFixed(2)}
            </div>
          </div>
          <div className="h-12 w-px bg-[var(--separator)]" />
          <div>
            <div className="text-[12px] uppercase tracking-wider text-label-tertiary font-medium">
              {range} low
            </div>
            <div className="mt-1 text-[20px] font-semibold tracking-tight text-label tabular-nums">
              {prices.range_low?.toFixed(2)}
            </div>
          </div>
          <div className="h-12 w-px bg-[var(--separator)]" />
          <div>
            <div className="text-[12px] uppercase tracking-wider text-label-tertiary font-medium">
              Decisions
            </div>
            <div className="mt-1 text-[20px] font-semibold tracking-tight text-label tabular-nums">
              {decisions.length}
            </div>
          </div>

          <div className="ml-auto inline-flex items-center rounded-full border border-[var(--separator)] p-0.5">
            {RANGES.map((r) => {
              const active = r === range;
              return (
                <Link
                  key={r}
                  href={`/tickers/${encodeURIComponent(sym)}?range=${r}`}
                  className={`px-3 py-1 rounded-full text-[12px] font-medium transition-colors ${
                    active
                      ? "bg-[color-mix(in_oklch,var(--tint)_18%,transparent)] text-[var(--tint)]"
                      : "text-label-secondary hover:text-label"
                  }`}
                >
                  {r}
                </Link>
              );
            })}
          </div>
        </section>

        <section className="surface-card p-4">
          <PriceChart candles={prices.candles} markers={decisions} />
        </section>

        {decisions.length > 0 && (
          <section>
            <h2 className="text-[18px] font-semibold tracking-tight text-label mb-3">
              Decisions for {sym}
            </h2>
            <div className="surface-card overflow-hidden">
              <ul>
                {decisions.map((d, i) => (
                  <li key={d.id}>
                    <Link
                      href={`/decisions/${encodeURIComponent(d.id)}`}
                      className="flex items-center gap-4 px-5 py-4 hover:bg-[color-mix(in_oklch,var(--separator)_50%,transparent)] transition-colors"
                    >
                      <span className="text-[13px] text-label-tertiary min-w-[100px] tabular-nums">
                        {d.date}
                      </span>
                      <RatingBadge rating={d.rating} />
                      <StatusPill status={d.status} />
                      <svg
                        viewBox="0 0 20 20"
                        className="size-4 ml-auto text-label-quaternary"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      >
                        <path d="M8 5l5 5-5 5" />
                      </svg>
                    </Link>
                    {i < decisions.length - 1 && <div className="divider mx-5" />}
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
