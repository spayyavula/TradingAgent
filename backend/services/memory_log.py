from __future__ import annotations

import os
import re
from datetime import date as Date
from pathlib import Path
from typing import Iterable

from pydantic import ValidationError

from backend.models import Decision, DecisionSummary

ENTRY_DELIMITER = "<!-- ENTRY_END -->"
HEADER_RE = re.compile(r"^\[(?P<date>\d{4}-\d{2}-\d{2})\s*\|\s*(?P<ticker>[^|]+?)\s*\|\s*(?P<rating>[^|]+?)\s*\|\s*(?P<status>[^\]]+?)\]\s*$", re.MULTILINE)
SECTION_RE = re.compile(r"\*\*(?P<label>[^*]+)\*\*:\s*(?P<body>.*?)(?=\n\n\*\*|\Z)", re.DOTALL)


def memory_log_path() -> Path:
    override = os.environ.get("TRADINGAGENTS_MEMORY_LOG_PATH")
    if override:
        return Path(override)
    return Path.home() / ".tradingagents" / "memory" / "trading_memory.md"


def _split_entries(raw: str) -> Iterable[str]:
    for chunk in raw.split(ENTRY_DELIMITER):
        chunk = chunk.strip()
        if chunk:
            yield chunk


def _entry_id(d: Date, ticker: str, index: int) -> str:
    return f"{d.isoformat()}_{ticker}_{index}"


def _parse_sections(body: str) -> dict[str, str]:
    return {m.group("label").strip().lower(): m.group("body").strip() for m in SECTION_RE.finditer(body)}


def _parse_entry(raw: str, index: int) -> Decision | None:
    header = HEADER_RE.search(raw)
    if not header:
        return None
    try:
        d = Date.fromisoformat(header.group("date"))
    except ValueError:
        return None
    ticker = header.group("ticker").strip().upper()
    rating = header.group("rating").strip()
    status = header.group("status").strip().lower()
    if status not in {"pending", "win", "loss", "flat"}:
        status = "pending"

    sections = _parse_sections(raw[header.end():])
    try:
        return Decision(
            id=_entry_id(d, ticker, index),
            date=d,
            ticker=ticker,
            rating=rating,  # type: ignore[arg-type]
            status=status,  # type: ignore[arg-type]
            executive_summary=sections.get("executive summary"),
            investment_thesis=sections.get("investment thesis"),
            time_horizon=sections.get("time horizon"),
            raw_markdown=raw,
        )
    except ValidationError:
        return None


def load_decisions() -> list[Decision]:
    path = memory_log_path()
    if not path.exists():
        return []
    raw = path.read_text(encoding="utf-8")
    decisions: list[Decision] = []
    for index, chunk in enumerate(_split_entries(raw)):
        parsed = _parse_entry(chunk, index)
        if parsed:
            decisions.append(parsed)
    decisions.sort(key=lambda d: (d.date, d.ticker), reverse=True)
    return decisions


def load_summaries() -> list[DecisionSummary]:
    return [DecisionSummary(**d.model_dump()) for d in load_decisions()]
