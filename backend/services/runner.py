from __future__ import annotations

import asyncio
import re
import threading
import traceback
import uuid
from collections import deque
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any, AsyncIterator, Literal

RunStatus = Literal["queued", "running", "complete", "failed"]

_RATING_RE = re.compile(
    r"\*\*Rating\*\*:\s*(?P<rating>[A-Za-z ]+?)(?:\s*\n|$)", re.IGNORECASE
)
_FINAL_RE = re.compile(
    r"FINAL TRANSACTION PROPOSAL:\s*\*\*?(?P<rating>[A-Z][A-Z ]+?)\*?\*?", re.IGNORECASE
)


@dataclass
class RunState:
    id: str
    ticker: str
    date: str
    created_at: str
    status: RunStatus = "queued"
    events: list[dict] = field(default_factory=list)
    final: dict | None = None
    error: str | None = None
    _subscribers: set[asyncio.Queue] = field(default_factory=set)
    _lock: threading.Lock = field(default_factory=threading.Lock)

    def snapshot(self) -> dict:
        return {
            "id": self.id,
            "ticker": self.ticker,
            "date": self.date,
            "created_at": self.created_at,
            "status": self.status,
            "events": self.events,
            "final": self.final,
            "error": self.error,
        }


class RunManager:
    """In-process registry of streaming TradingAgents runs."""

    def __init__(self) -> None:
        self._runs: dict[str, RunState] = {}
        self._lock = threading.Lock()
        self._loop: asyncio.AbstractEventLoop | None = None

    def attach_loop(self, loop: asyncio.AbstractEventLoop) -> None:
        self._loop = loop

    def start(self, ticker: str, date: str) -> RunState:
        run_id = uuid.uuid4().hex[:12]
        state = RunState(
            id=run_id,
            ticker=ticker.upper(),
            date=date,
            created_at=datetime.now(timezone.utc).isoformat(),
        )
        with self._lock:
            self._runs[run_id] = state
        thread = threading.Thread(
            target=self._run, args=(state,), name=f"run-{run_id}", daemon=True
        )
        thread.start()
        return state

    def get(self, run_id: str) -> RunState | None:
        return self._runs.get(run_id)

    async def subscribe(self, run_id: str) -> AsyncIterator[dict]:
        state = self._runs.get(run_id)
        if state is None:
            return
        # Replay history first
        for evt in list(state.events):
            yield evt
        if state.status in ("complete", "failed"):
            return

        queue: asyncio.Queue = asyncio.Queue()
        with state._lock:
            state._subscribers.add(queue)
        try:
            while True:
                evt = await queue.get()
                if evt is None:
                    return
                yield evt
                if evt.get("type") in ("complete", "error"):
                    return
        finally:
            with state._lock:
                state._subscribers.discard(queue)

    def _publish(self, state: RunState, event: dict) -> None:
        with state._lock:
            state.events.append(event)
            subs = list(state._subscribers)
        loop = self._loop
        if loop is None:
            return
        for q in subs:
            try:
                loop.call_soon_threadsafe(q.put_nowait, event)
            except RuntimeError:
                pass

    def _run(self, state: RunState) -> None:
        try:
            self._publish(state, {"type": "status", "status": "running", "ts": _now()})
            with state._lock:
                state.status = "running"

            from dotenv import load_dotenv
            load_dotenv()

            from tradingagents.graph.trading_graph import TradingAgentsGraph
            from tradingagents.default_config import DEFAULT_CONFIG

            config = DEFAULT_CONFIG.copy()
            config["max_debate_rounds"] = 1
            config["data_vendors"] = {
                "core_stock_apis": "yfinance",
                "technical_indicators": "yfinance",
                "fundamental_data": "yfinance",
                "news_data": "yfinance",
            }

            ta = TradingAgentsGraph(debug=False, config=config)
            ta.ticker = state.ticker
            ta._resolve_pending_entries(state.ticker)

            past_context = ta.memory_log.get_past_context(state.ticker)
            init_state = ta.propagator.create_initial_state(
                state.ticker, state.date, past_context=past_context
            )
            args = ta.propagator.get_graph_args()

            final_state: Any = None
            step = 0
            seen = 0
            for chunk in ta.graph.stream(init_state, **args):
                step += 1
                final_state = chunk
                messages = chunk.get("messages", []) if isinstance(chunk, dict) else []
                # Emit only new messages since last chunk
                while seen < len(messages):
                    msg = messages[seen]
                    seen += 1
                    self._publish(state, _serialize_message(step, msg))

                # Per-section finalizations
                for section in (
                    "market_report",
                    "sentiment_report",
                    "news_report",
                    "fundamentals_report",
                    "investment_plan",
                    "trader_investment_plan",
                    "risk_debate_state",
                    "final_trade_decision",
                ):
                    if isinstance(chunk, dict) and chunk.get(section):
                        last_section_evt = next(
                            (
                                e
                                for e in reversed(state.events)
                                if e.get("type") == "section" and e.get("name") == section
                            ),
                            None,
                        )
                        # Only publish when the section grows
                        new_value = chunk[section]
                        prev_value = last_section_evt["content"] if last_section_evt else None
                        if isinstance(new_value, str) and new_value != prev_value:
                            self._publish(
                                state,
                                {
                                    "type": "section",
                                    "name": section,
                                    "content": new_value,
                                    "ts": _now(),
                                },
                            )

            # Finalize: persist via memory log + extract decision
            ta.curr_state = final_state
            ta._log_state(state.date, final_state)
            decision_text = (final_state or {}).get("final_trade_decision", "")
            ta.memory_log.store_decision(
                ticker=state.ticker,
                trade_date=state.date,
                final_trade_decision=decision_text,
            )

            rating = _extract_rating(decision_text)
            with state._lock:
                state.status = "complete"
                state.final = {
                    "rating": rating,
                    "final_trade_decision": decision_text,
                    "ticker": state.ticker,
                    "date": state.date,
                }
            self._publish(
                state,
                {
                    "type": "complete",
                    "rating": rating,
                    "decision_text": decision_text,
                    "ts": _now(),
                },
            )
        except Exception as exc:  # noqa: BLE001
            tb = traceback.format_exc()
            with state._lock:
                state.status = "failed"
                state.error = str(exc)
            self._publish(
                state,
                {"type": "error", "message": str(exc), "traceback": tb, "ts": _now()},
            )


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _serialize_message(step: int, msg: Any) -> dict:
    cls = type(msg).__name__
    role = "human" if "Human" in cls else "ai" if "AI" in cls else "tool" if "Tool" in cls else "other"
    content = getattr(msg, "content", "")
    if isinstance(content, list):
        content = " ".join(str(p) for p in content)
    content = str(content)[:4000]
    tool_calls = []
    raw_calls = getattr(msg, "tool_calls", None) or []
    for call in raw_calls:
        name = call.get("name") if isinstance(call, dict) else getattr(call, "name", None)
        args = call.get("args") if isinstance(call, dict) else getattr(call, "args", None)
        tool_calls.append({"name": name, "args": args})
    tool_name = getattr(msg, "name", None) if role == "tool" else None
    return {
        "type": "message",
        "step": step,
        "role": role,
        "content": content,
        "tool_calls": tool_calls,
        "tool_name": tool_name,
        "ts": _now(),
    }


def _extract_rating(text: str) -> str | None:
    if not text:
        return None
    m = _RATING_RE.search(text)
    if m:
        return m.group("rating").strip().title()
    m = _FINAL_RE.search(text)
    if m:
        raw = m.group("rating").strip().title()
        return raw
    return None


run_manager = RunManager()
