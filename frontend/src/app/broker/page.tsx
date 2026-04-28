import { api, type BrokerStatus, type BrokerAccount, type BrokerPosition, type BrokerOrder } from "@/lib/api";
import { PageHeader, EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

async function load() {
  const status = await api.brokerStatus();
  if (!status.configured) {
    return { status, account: null, positions: [], orders: [] };
  }
  const [account, positions, orders] = await Promise.all([
    api.brokerAccount().catch(() => null),
    api.brokerPositions().catch(() => []),
    api.brokerOrders(20).catch(() => []),
  ]);
  return { status, account, positions, orders };
}

export default async function BrokerPage() {
  const { status, account, positions, orders } = await load();

  return (
    <div className="pb-16">
      <PageHeader
        title="Broker"
        subtitle="Alpaca account, positions, and recent orders"
        actions={status.mode ? <ModeBadge mode={status.mode} /> : undefined}
      />

      <div className="px-6 lg:px-10 mt-6 grid gap-6">
        {!status.configured ? (
          <SetupCard status={status} />
        ) : (
          <>
            {account && <AccountCard account={account} />}
            <PositionsSection positions={positions} />
            <OrdersSection orders={orders} />
          </>
        )}
      </div>
    </div>
  );
}

function ModeBadge({ mode }: { mode: "paper" | "live" }) {
  const paper = mode === "paper";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[12px] font-semibold uppercase tracking-wider ${
        paper
          ? "bg-[color-mix(in_oklch,#0a84ff_18%,transparent)] text-[#0a84ff]"
          : "bg-[color-mix(in_oklch,#ff3b30_22%,transparent)] text-[#ff3b30]"
      }`}
    >
      {mode}
    </span>
  );
}

function SetupCard({ status }: { status: BrokerStatus }) {
  return (
    <div className="surface-card p-6 grid gap-3 max-w-2xl">
      <h2 className="text-[16px] font-semibold text-label">Broker not configured</h2>
      <p className="text-[14px] text-label-secondary leading-relaxed">{status.reason}</p>
      <pre className="rounded-xl bg-[color-mix(in_oklch,var(--separator)_60%,transparent)] p-4 text-[12px] font-mono text-label-secondary whitespace-pre">
        {`# Add to .env\nALPACA_API_KEY=...\nALPACA_SECRET_KEY=...\n# ALPACA_USE_LIVE=true   # opt-in for live trading (default: paper)`}
      </pre>
      <p className="text-[12px] text-label-tertiary">
        Get free paper-trading keys at{" "}
        <a
          className="text-[var(--tint)] hover:underline underline-offset-4"
          href="https://app.alpaca.markets/signup"
          target="_blank"
          rel="noreferrer"
        >
          alpaca.markets
        </a>
        . Restart the backend after editing .env.
      </p>
    </div>
  );
}

function AccountCard({ account }: { account: BrokerAccount }) {
  const fmt = (n: number) =>
    n.toLocaleString(undefined, { style: "currency", currency: account.currency });
  return (
    <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Stat label="Cash" value={fmt(account.cash)} />
      <Stat label="Buying power" value={fmt(account.buying_power)} />
      <Stat label="Equity" value={fmt(account.equity)} />
      <Stat label="Portfolio value" value={fmt(account.portfolio_value)} />
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="surface-tile p-5">
      <div className="text-[12px] uppercase tracking-wider text-label-tertiary font-medium">{label}</div>
      <div className="mt-3 text-[24px] font-semibold tracking-tight text-label tabular-nums">{value}</div>
    </div>
  );
}

function PositionsSection({ positions }: { positions: BrokerPosition[] }) {
  return (
    <section>
      <h2 className="text-[18px] font-semibold tracking-tight text-label mb-3">Open positions</h2>
      {positions.length === 0 ? (
        <EmptyState title="No open positions" description="Place an order to start." />
      ) : (
        <div className="surface-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-label-tertiary">
                <th className="text-left px-5 py-3 font-medium">Symbol</th>
                <th className="text-right px-5 py-3 font-medium">Qty</th>
                <th className="text-right px-5 py-3 font-medium">Avg entry</th>
                <th className="text-right px-5 py-3 font-medium">Market value</th>
                <th className="text-right px-5 py-3 font-medium">Unrealized P/L</th>
              </tr>
            </thead>
            <tbody>
              {positions.map((p) => {
                const positive = p.unrealized_pl >= 0;
                return (
                  <tr key={p.symbol} className="border-t border-[var(--separator)]">
                    <td className="px-5 py-3 text-[14px] font-semibold text-label">{p.symbol}</td>
                    <td className="px-5 py-3 text-right text-[14px] text-label tabular-nums">{p.qty}</td>
                    <td className="px-5 py-3 text-right text-[14px] text-label-secondary tabular-nums">
                      {p.avg_entry_price.toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right text-[14px] text-label tabular-nums">
                      {p.market_value.toFixed(2)}
                    </td>
                    <td
                      className={`px-5 py-3 text-right text-[14px] font-medium tabular-nums ${
                        positive ? "text-[var(--color-accent-green)]" : "text-[var(--color-accent-red)]"
                      }`}
                    >
                      {positive ? "+" : ""}
                      {p.unrealized_pl.toFixed(2)} ({p.unrealized_plpc.toFixed(2)}%)
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function OrdersSection({ orders }: { orders: BrokerOrder[] }) {
  return (
    <section>
      <h2 className="text-[18px] font-semibold tracking-tight text-label mb-3">Recent orders</h2>
      {orders.length === 0 ? (
        <EmptyState title="No orders yet" description="Run an analysis and place an order to see history." />
      ) : (
        <div className="surface-card overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-label-tertiary">
                <th className="text-left px-5 py-3 font-medium">Symbol</th>
                <th className="text-left px-5 py-3 font-medium">Side</th>
                <th className="text-right px-5 py-3 font-medium">Qty</th>
                <th className="text-left px-5 py-3 font-medium">Type</th>
                <th className="text-left px-5 py-3 font-medium">Status</th>
                <th className="text-left px-5 py-3 font-medium">Submitted</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-t border-[var(--separator)]">
                  <td className="px-5 py-3 text-[14px] font-semibold text-label">{o.symbol}</td>
                  <td
                    className={`px-5 py-3 text-[14px] font-medium ${
                      o.side === "buy" ? "text-[var(--color-accent-green)]" : "text-[var(--color-accent-red)]"
                    }`}
                  >
                    {o.side.toUpperCase()}
                  </td>
                  <td className="px-5 py-3 text-right text-[14px] text-label tabular-nums">{o.qty}</td>
                  <td className="px-5 py-3 text-[14px] text-label-secondary capitalize">{o.order_type}</td>
                  <td className="px-5 py-3 text-[14px] text-label-secondary capitalize">{o.status}</td>
                  <td className="px-5 py-3 text-[12px] text-label-tertiary tabular-nums">
                    {o.submitted_at ? new Date(o.submitted_at).toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
