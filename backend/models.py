from __future__ import annotations

from datetime import date
from typing import Literal, Optional

from pydantic import BaseModel

Rating = Literal["Buy", "Overweight", "Hold", "Underweight", "Sell"]
Status = Literal["pending", "win", "loss", "flat"]


class DecisionSummary(BaseModel):
    id: str
    date: date
    ticker: str
    rating: Rating
    status: Status


class Decision(DecisionSummary):
    executive_summary: Optional[str] = None
    investment_thesis: Optional[str] = None
    time_horizon: Optional[str] = None
    raw_markdown: str


class DashboardStats(BaseModel):
    total_decisions: int
    distinct_tickers: int
    by_rating: dict[str, int]
    pending_count: int
