export type Rating = "Strong Buy" | "Buy" | "Hold" | "Sell" | "Strong Sell";
export type DecisionStatus = "pending" | "win" | "loss" | "flat";

export interface DecisionSummary {
  id: string;
  date: string;
  ticker: string;
  rating: Rating;
  status: DecisionStatus;
}

export interface Decision extends DecisionSummary {
  executive_summary?: string | null;
  investment_thesis?: string | null;
  time_horizon?: string | null;
  raw_markdown: string;
}

export interface DashboardStats {
  total_decisions: number;
  distinct_tickers: number;
  by_rating: Record<string, number>;
  pending_count: number;
}

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ?? "http://127.0.0.1:8000";

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: { Accept: "application/json", ...(init?.headers ?? {}) },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return (await res.json()) as T;
}

export type Range = "3mo" | "6mo" | "1y" | "2y" | "5y";

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface TickerPrices {
  symbol: string;
  latest_close: number | null;
  previous_close: number | null;
  change_pct: number | null;
  range_high: number | null;
  range_low: number | null;
  candles: Candle[];
}

export interface TickerDecisionMarker {
  id: string;
  date: string;
  rating: Rating;
  status: DecisionStatus;
}

export interface BrokerStatus {
  configured: boolean;
  mode: "paper" | "live" | null;
  reason: string | null;
}

export interface BrokerAccount {
  mode: "paper" | "live";
  cash: number;
  equity: number;
  buying_power: number;
  portfolio_value: number;
  pattern_day_trader: boolean;
  currency: string;
  status: string;
}

export interface BrokerPosition {
  symbol: string;
  qty: number;
  avg_entry_price: number;
  market_value: number;
  unrealized_pl: number;
  unrealized_plpc: number;
  side: string;
  current_price: number | null;
}

export interface BrokerOrder {
  id: string;
  symbol: string;
  side: string;
  qty: number;
  order_type: string;
  status: string;
  submitted_at: string | null;
  filled_at: string | null;
  limit_price: number | null;
  filled_avg_price: number | null;
}

export interface RunSnapshot {
  id: string;
  ticker: string;
  date: string;
  created_at: string;
  status: "queued" | "running" | "complete" | "failed";
  events: RunEvent[];
  final: { rating: string | null; final_trade_decision: string; ticker: string; date: string } | null;
  error: string | null;
}

export type RunEvent =
  | {
      type: "message";
      step: number;
      role: "human" | "ai" | "tool" | "other";
      content: string;
      tool_calls: { name: string | null; args: unknown }[];
      tool_name: string | null;
      ts: string;
    }
  | { type: "section"; name: string; content: string; ts: string }
  | { type: "status"; status: string; ts: string }
  | { type: "complete"; rating: string | null; decision_text: string; ts: string }
  | { type: "error"; message: string; traceback?: string; ts: string };

export const apiBase = API_BASE;

export const api = {
  health: () => fetchJson<{ status: string }>("/api/health"),
  stats: () => fetchJson<DashboardStats>("/api/stats"),
  decisions: (params?: { ticker?: string; rating?: string; limit?: number }) => {
    const q = new URLSearchParams();
    if (params?.ticker) q.set("ticker", params.ticker);
    if (params?.rating) q.set("rating", params.rating);
    if (params?.limit) q.set("limit", String(params.limit));
    const suffix = q.toString() ? `?${q}` : "";
    return fetchJson<DecisionSummary[]>(`/api/decisions${suffix}`);
  },
  decision: (id: string) => fetchJson<Decision>(`/api/decisions/${encodeURIComponent(id)}`),
  tickers: () => fetchJson<string[]>("/api/tickers"),
  tickerPrices: (symbol: string, range: Range = "1y") =>
    fetchJson<TickerPrices>(`/api/tickers/${encodeURIComponent(symbol)}/prices?range=${range}`),
  tickerDecisions: (symbol: string) =>
    fetchJson<TickerDecisionMarker[]>(`/api/tickers/${encodeURIComponent(symbol)}/decisions`),

  startAnalysis: (ticker: string, date: string) =>
    fetchJson<{ run_id: string; ticker: string; date: string }>("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ticker, date }),
    }),
  getRun: (runId: string) => fetchJson<RunSnapshot>(`/api/runs/${runId}`),

  brokerStatus: () => fetchJson<BrokerStatus>("/api/broker/status"),
  brokerAccount: () => fetchJson<BrokerAccount>("/api/broker/account"),
  brokerPositions: () => fetchJson<BrokerPosition[]>("/api/broker/positions"),
  brokerOrders: (limit = 50) => fetchJson<BrokerOrder[]>(`/api/broker/orders?limit=${limit}`),
  placeOrder: (req: {
    symbol: string;
    side: "buy" | "sell";
    qty: number;
    order_type: "market" | "limit";
    limit_price?: number | null;
    time_in_force?: "day" | "gtc";
    confirm: boolean;
  }) =>
    fetchJson<BrokerOrder>("/api/broker/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
    }),
};
