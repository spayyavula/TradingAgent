"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { PageHeader } from "@/components/ui";

export default function AnalyzePage() {
  const router = useRouter();
  const [ticker, setTicker] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!ticker.trim()) {
      setError("Enter a ticker");
      return;
    }
    setBusy(true);
    try {
      const res = await api.startAnalysis(ticker.trim().toUpperCase(), date);
      router.push(`/analyze/${res.run_id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start");
      setBusy(false);
    }
  }

  return (
    <div className="pb-16">
      <PageHeader title="New analysis" subtitle="Run the multi-agent debate on a ticker" />

      <div className="px-6 lg:px-10 mt-6 max-w-xl">
        <form onSubmit={submit} className="surface-card p-6 grid gap-5">
          <div className="grid gap-2">
            <label htmlFor="ticker" className="text-[12px] uppercase tracking-wider font-medium text-label-tertiary">
              Ticker
            </label>
            <input
              id="ticker"
              autoFocus
              value={ticker}
              onChange={(e) => setTicker(e.target.value)}
              placeholder="NVDA"
              autoComplete="off"
              spellCheck={false}
              className="rounded-xl border border-[var(--separator)] bg-transparent px-4 py-3 text-[16px] font-medium tracking-tight text-label outline-none focus:border-[var(--tint)] focus:focus-ring uppercase"
            />
          </div>

          <div className="grid gap-2">
            <label htmlFor="date" className="text-[12px] uppercase tracking-wider font-medium text-label-tertiary">
              Trade date
            </label>
            <input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-xl border border-[var(--separator)] bg-transparent px-4 py-3 text-[16px] font-medium tracking-tight text-label outline-none focus:border-[var(--tint)]"
            />
          </div>

          {error && <div className="text-[13px] text-[var(--color-accent-red)]">{error}</div>}

          <button
            type="submit"
            disabled={busy}
            className="rounded-xl bg-[var(--tint)] text-white font-semibold tracking-tight px-5 py-3 text-[15px] disabled:opacity-50 transition-opacity"
          >
            {busy ? "Starting…" : "Run analysis"}
          </button>

          <p className="text-[12px] text-label-tertiary leading-relaxed">
            This launches the full multi-agent pipeline (analysts, researcher debate, trader, risk, portfolio
            manager). It will hit your configured LLM provider and may take several minutes. You can watch each
            agent&apos;s output stream live on the next screen.
          </p>
        </form>
      </div>
    </div>
  );
}
