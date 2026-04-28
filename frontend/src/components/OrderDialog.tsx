"use client";

import { useEffect, useState } from "react";
import { api, type BrokerStatus } from "@/lib/api";

interface Props {
  ticker: string;
  rating: string;
  onClose: () => void;
}

function suggestedSide(rating: string): "buy" | "sell" | null {
  if (/strong\s*buy|^buy$/i.test(rating)) return "buy";
  if (/strong\s*sell|^sell$/i.test(rating)) return "sell";
  return null;
}

export function OrderDialog({ ticker, rating, onClose }: Props) {
  const initialSide = suggestedSide(rating) ?? "buy";
  const [side, setSide] = useState<"buy" | "sell">(initialSide);
  const [qty, setQty] = useState("1");
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [limitPrice, setLimitPrice] = useState("");
  const [timeInForce, setTimeInForce] = useState<"day" | "gtc">("day");
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [broker, setBroker] = useState<BrokerStatus | null>(null);

  useEffect(() => {
    api.brokerStatus().then(setBroker).catch(() => setBroker({ configured: false, mode: null, reason: "Unreachable" }));
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const order = await api.placeOrder({
        symbol: ticker,
        side,
        qty: Number(qty),
        order_type: orderType,
        limit_price: orderType === "limit" ? Number(limitPrice) : null,
        time_in_force: timeInForce,
        confirm: true,
      });
      setResult(`${order.side.toUpperCase()} ${order.qty} ${order.symbol} — status: ${order.status} (id ${order.id.slice(0, 8)}…)`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="surface-card w-full max-w-md p-6 grid gap-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-wider text-label-tertiary font-medium">
              Place order · {ticker}
            </div>
            <div className="text-[15px] font-semibold tracking-tight text-label">
              Suggested by {rating} rating
            </div>
          </div>
          {broker?.mode && (
            <span
              className={`ml-auto rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${
                broker.mode === "paper"
                  ? "bg-[color-mix(in_oklch,#0a84ff_18%,transparent)] text-[#0a84ff]"
                  : "bg-[color-mix(in_oklch,#ff3b30_22%,transparent)] text-[#ff3b30]"
              }`}
            >
              {broker.mode}
            </span>
          )}
        </div>

        {!broker?.configured && (
          <div className="rounded-xl border border-[var(--separator)] p-4 text-[13px] text-label-secondary">
            <strong className="text-label">Broker not configured.</strong>{" "}
            {broker?.reason ?? "Add Alpaca keys to .env to enable order placement."}
          </div>
        )}

        {result ? (
          <div className="rounded-xl border border-[var(--separator)] p-4 text-[13px]">
            <div className="text-[var(--color-accent-green)] font-semibold mb-1">Order accepted</div>
            <div className="text-label-secondary">{result}</div>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid grid-cols-2 gap-3">
              <FieldLabel label="Side">
                <SegControl
                  value={side}
                  onChange={(v) => setSide(v as "buy" | "sell")}
                  options={[
                    { value: "buy", label: "Buy" },
                    { value: "sell", label: "Sell" },
                  ]}
                />
              </FieldLabel>
              <FieldLabel label="Type">
                <SegControl
                  value={orderType}
                  onChange={(v) => setOrderType(v as "market" | "limit")}
                  options={[
                    { value: "market", label: "Market" },
                    { value: "limit", label: "Limit" },
                  ]}
                />
              </FieldLabel>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FieldLabel label="Quantity">
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="rounded-xl border border-[var(--separator)] bg-transparent px-4 py-2.5 text-[15px] text-label outline-none focus:border-[var(--tint)] tabular-nums"
                />
              </FieldLabel>
              {orderType === "limit" ? (
                <FieldLabel label="Limit price">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={limitPrice}
                    onChange={(e) => setLimitPrice(e.target.value)}
                    className="rounded-xl border border-[var(--separator)] bg-transparent px-4 py-2.5 text-[15px] text-label outline-none focus:border-[var(--tint)] tabular-nums"
                  />
                </FieldLabel>
              ) : (
                <FieldLabel label="Time in force">
                  <SegControl
                    value={timeInForce}
                    onChange={(v) => setTimeInForce(v as "day" | "gtc")}
                    options={[
                      { value: "day", label: "Day" },
                      { value: "gtc", label: "GTC" },
                    ]}
                  />
                </FieldLabel>
              )}
            </div>

            {error && <div className="text-[13px] text-[var(--color-accent-red)]">{error}</div>}

            <p className="text-[11px] text-label-tertiary leading-relaxed">
              Submitting will send a real order to your{" "}
              <strong className="text-label">{broker?.mode ?? "broker"}</strong> Alpaca account. This framework is
              for research only — not financial advice.
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl px-4 py-2 text-[14px] text-label-secondary hover:text-label"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!broker?.configured || submitting}
                className="rounded-xl bg-[var(--tint)] text-white font-semibold tracking-tight px-4 py-2 text-[14px] disabled:opacity-50"
              >
                {submitting ? "Submitting…" : "Confirm order"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FieldLabel({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="grid gap-1">
      <span className="text-[11px] uppercase tracking-wider font-medium text-label-tertiary">{label}</span>
      {children}
    </label>
  );
}

function SegControl<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="inline-flex rounded-xl border border-[var(--separator)] p-0.5">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
              active
                ? "bg-[color-mix(in_oklch,var(--tint)_18%,transparent)] text-[var(--tint)]"
                : "text-label-secondary hover:text-label"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
