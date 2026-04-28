from __future__ import annotations

from collections import Counter
from typing import Optional

from fastapi import APIRouter, HTTPException, Query

from backend.models import DashboardStats, Decision, DecisionSummary
from backend.services.memory_log import load_decisions

router = APIRouter(prefix="/api", tags=["decisions"])


@router.get("/decisions", response_model=list[DecisionSummary])
def list_decisions(
    ticker: Optional[str] = Query(None, description="Filter by ticker symbol"),
    rating: Optional[str] = Query(None, description="Filter by rating"),
    limit: int = Query(100, ge=1, le=500),
):
    items = load_decisions()
    if ticker:
        wanted = ticker.upper()
        items = [d for d in items if d.ticker == wanted]
    if rating:
        items = [d for d in items if d.rating == rating]
    return [DecisionSummary(**d.model_dump()) for d in items[:limit]]


@router.get("/decisions/{decision_id}", response_model=Decision)
def get_decision(decision_id: str):
    for d in load_decisions():
        if d.id == decision_id:
            return d
    raise HTTPException(status_code=404, detail="Decision not found")


@router.get("/stats", response_model=DashboardStats)
def stats():
    items = load_decisions()
    rating_counts = Counter(d.rating for d in items)
    distinct_tickers = len({d.ticker for d in items})
    pending = sum(1 for d in items if d.status == "pending")
    return DashboardStats(
        total_decisions=len(items),
        distinct_tickers=distinct_tickers,
        by_rating=dict(rating_counts),
        pending_count=pending,
    )


@router.get("/tickers", response_model=list[str])
def list_tickers():
    return sorted({d.ticker for d in load_decisions()})
