"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { apiBase, type RunEvent, type RunSnapshot } from "@/lib/api";
import { RatingBadge } from "@/components/ui";
import { OrderDialog } from "@/components/OrderDialog";

interface Props {
  runId: string;
  initial: RunSnapshot;
}

const SECTION_TITLES: Record<string, string> = {
  market_report: "Market Analyst",
  sentiment_report: "Sentiment Analyst",
  news_report: "News Analyst",
  fundamentals_report: "Fundamentals Analyst",
  investment_plan: "Research Manager",
  trader_investment_plan: "Trader",
  risk_debate_state: "Risk Debate",
  final_trade_decision: "Portfolio Manager",
};

const SECTION_ORDER = Object.keys(SECTION_TITLES);

export function AnalyzeStream({ runId, initial }: Props) {
  const [events, setEvents] = useState<RunEvent[]>(initial.events);
  const [status, setStatus] = useState<RunSnapshot["status"]>(initial.status);
  const [final, setFinal] = useState(initial.final);
  const [error, setError] = useState<string | null>(initial.error);
  const sourceRef = useRef<EventSource | null>(null);
  const bottomRef = useRef<HTMLLIElement | null>(null);
  const [orderOpen, setOrderOpen] = useState(false);

  useEffect(() => {
    if (status === "complete" || status === "failed") return;
    const es = new EventSource(`${apiBase}/api/runs/${runId}/events`);
    sourceRef.current = es;
    es.onmessage = (e) => {
      try {
        const evt = JSON.parse(e.data) as RunEvent;
        setEvents((prev) => [...prev, evt]);
        if (evt.type === "status") setStatus(evt.status as RunSnapshot["status"]);
        if (evt.type === "complete") {
          setStatus("complete");
          setFinal({
            rating: evt.rating ?? null,
            final_trade_decision: evt.decision_text,
            ticker: initial.ticker,
            date: initial.date,
          });
        }
        if (evt.type === "error") {
          setStatus("failed");
          setError(evt.message);
        }
      } catch {
        // ignore
      }
    };
    es.onerror = () => {
      es.close();
    };
    return () => {
      es.close();
      sourceRef.current = null;
    };
  }, [runId, status, initial.ticker, initial.date]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [events.length]);

  // Group section events by name (latest wins)
  const sections = new Map<string, string>();
  for (const e of events) {
    if (e.type === "section") sections.set(e.name, e.content);
  }

  // Filter for the message stream (skip non-message events for the timeline)
  const messages = events.filter((e) => e.type === "message");

  const bgRating = final?.rating;

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <section className="space-y-3 min-w-0">
          <div className="flex items-center gap-3">
            <StatusDot status={status} />
            <span className="text-[13px] font-medium text-label-secondary">
              {status === "running"
                ? "Agents are thinking…"
                : status === "complete"
                ? "Analysis complete"
                : status === "failed"
                ? "Run failed"
                : "Queued"}
            </span>
            <span className="ml-auto text-[12px] text-label-tertiary tabular-nums">
              {messages.length} messages · step {currentStep(events)}
            </span>
          </div>

          {error && (
            <div className="surface-card p-5 text-[13px] text-[var(--color-accent-red)]">
              {error}
            </div>
          )}

          <div className="surface-card overflow-hidden">
            <ul className="max-h-[60vh] overflow-y-auto">
              {messages.length === 0 && (
                <li className="px-5 py-8 text-center text-[13px] text-label-tertiary">
                  Waiting for first agent message…
                </li>
              )}
              {messages.map((e, i) => {
                if (e.type !== "message") return null;
                return (
                  <li key={i}>
                    <MessageRow evt={e} />
                    {i < messages.length - 1 && <div className="divider mx-5" />}
                  </li>
                );
              })}
              <li ref={bottomRef} />
            </ul>
          </div>
        </section>

        <aside className="space-y-4 lg:sticky lg:top-24 self-start">
          <div className="surface-card p-5">
            <div className="text-[12px] uppercase tracking-wider text-label-tertiary font-medium">
              Final decision
            </div>
            {bgRating ? (
              <div className="mt-3 flex flex-col gap-3">
                <RatingBadge rating={bgRating as never} />
                <div className="text-[13px] text-label-secondary leading-relaxed line-clamp-[10] max-h-72 overflow-y-auto whitespace-pre-wrap">
                  {final?.final_trade_decision?.slice(0, 1200)}
                  {(final?.final_trade_decision?.length ?? 0) > 1200 && "…"}
                </div>
                <button
                  onClick={() => setOrderOpen(true)}
                  className="rounded-xl bg-[var(--tint)] text-white font-semibold tracking-tight px-4 py-2 text-[14px] hover:opacity-90 transition-opacity"
                >
                  Place order…
                </button>
              </div>
            ) : (
              <div className="mt-3 text-[13px] text-label-tertiary">
                {status === "running" ? "Pending — agents are still debating." : "Will appear here when run completes."}
              </div>
            )}
          </div>

          <div className="surface-card p-5">
            <div className="text-[12px] uppercase tracking-wider text-label-tertiary font-medium mb-3">
              Pipeline
            </div>
            <ul className="space-y-1">
              {SECTION_ORDER.map((key) => {
                const filled = sections.has(key);
                return (
                  <li key={key} className="flex items-center gap-2 text-[13px]">
                    <span
                      className={`size-1.5 rounded-full ${
                        filled ? "bg-[var(--color-accent-green)]" : "bg-[var(--separator-strong)]"
                      }`}
                    />
                    <span className={filled ? "text-label" : "text-label-tertiary"}>
                      {SECTION_TITLES[key]}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="text-[11px] text-label-tertiary px-1 leading-relaxed">
            <Link href="/analyze" className="text-[var(--tint)] hover:underline underline-offset-4">
              Start another →
            </Link>
          </div>
        </aside>
      </div>

      {orderOpen && final && bgRating && (
        <OrderDialog
          ticker={initial.ticker}
          rating={bgRating}
          onClose={() => setOrderOpen(false)}
        />
      )}
    </>
  );
}

function StatusDot({ status }: { status: RunSnapshot["status"] }) {
  const cls =
    status === "running"
      ? "bg-[var(--color-accent-blue)] animate-pulse"
      : status === "complete"
      ? "bg-[var(--color-accent-green)]"
      : status === "failed"
      ? "bg-[var(--color-accent-red)]"
      : "bg-[var(--separator-strong)]";
  return <span className={`size-2 rounded-full ${cls}`} />;
}

function currentStep(events: RunEvent[]): number {
  for (let i = events.length - 1; i >= 0; i--) {
    const e = events[i];
    if (e.type === "message") return e.step;
  }
  return 0;
}

function MessageRow({ evt }: { evt: Extract<RunEvent, { type: "message" }> }) {
  const roleLabel =
    evt.role === "ai"
      ? "Agent"
      : evt.role === "tool"
      ? `Tool · ${evt.tool_name ?? "?"}`
      : evt.role === "human"
      ? "Human"
      : "—";
  const tone =
    evt.role === "ai"
      ? "text-[var(--color-accent-blue)]"
      : evt.role === "tool"
      ? "text-[var(--color-accent-purple)]"
      : "text-label-tertiary";

  return (
    <div className="px-5 py-3">
      <div className="flex items-center gap-2 mb-1">
        <span className={`text-[11px] uppercase tracking-wider font-semibold ${tone}`}>
          {roleLabel}
        </span>
        <span className="text-[10px] text-label-quaternary tabular-nums">step {evt.step}</span>
      </div>
      {evt.tool_calls.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {evt.tool_calls.map((tc, i) => (
            <code
              key={i}
              className="rounded-md border border-[var(--separator)] px-1.5 py-0.5 text-[11px] font-mono text-label-secondary"
            >
              {tc.name}()
            </code>
          ))}
        </div>
      )}
      {evt.content && (
        <p className="text-[13px] leading-relaxed text-label whitespace-pre-wrap line-clamp-6">
          {evt.content}
        </p>
      )}
    </div>
  );
}
