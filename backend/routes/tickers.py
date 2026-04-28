from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException, Query

from backend.services.memory_log import load_decisions
from backend.services.prices import Range, TickerPrices, fetch_prices

router = APIRouter(prefix="/api/tickers", tags=["tickers"])


@router.get("/{symbol}/prices", response_model=TickerPrices)
def ticker_prices(
    symbol: str,
    range: Range = Query("1y", description="Lookback range"),
):
    if not symbol or len(symbol) > 12:
        raise HTTPException(status_code=400, detail="Invalid symbol")
    return fetch_prices(symbol, range)


@router.get("/{symbol}/decisions")
def ticker_decisions(symbol: str):
    wanted = symbol.upper()
    items = [d for d in load_decisions() if d.ticker == wanted]
    return [
        {
            "id": d.id,
            "date": d.date.isoformat(),
            "rating": d.rating,
            "status": d.status,
        }
        for d in items
    ]
