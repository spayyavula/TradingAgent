from __future__ import annotations

from datetime import date, timedelta
from functools import lru_cache
from typing import Literal

import yfinance as yf

from pydantic import BaseModel


class Candle(BaseModel):
    date: date
    open: float
    high: float
    low: float
    close: float
    volume: int


class TickerPrices(BaseModel):
    symbol: str
    latest_close: float | None
    previous_close: float | None
    change_pct: float | None
    range_high: float | None
    range_low: float | None
    candles: list[Candle]


Range = Literal["3mo", "6mo", "1y", "2y", "5y"]


@lru_cache(maxsize=64)
def _cached_history(symbol: str, period: str, today: str):
    # `today` is a cache key only; yfinance fetches as of "now" regardless.
    ticker = yf.Ticker(symbol)
    return ticker.history(period=period, auto_adjust=True)


def fetch_prices(symbol: str, range_: Range = "1y") -> TickerPrices:
    today_key = date.today().isoformat()
    df = _cached_history(symbol.upper(), range_, today_key)

    if df is None or df.empty:
        return TickerPrices(
            symbol=symbol.upper(),
            latest_close=None,
            previous_close=None,
            change_pct=None,
            range_high=None,
            range_low=None,
            candles=[],
        )

    candles: list[Candle] = []
    for idx, row in df.iterrows():
        d = idx.date() if hasattr(idx, "date") else idx
        candles.append(
            Candle(
                date=d,
                open=float(row["Open"]),
                high=float(row["High"]),
                low=float(row["Low"]),
                close=float(row["Close"]),
                volume=int(row["Volume"]) if row["Volume"] == row["Volume"] else 0,
            )
        )

    latest = candles[-1].close if candles else None
    prev = candles[-2].close if len(candles) > 1 else None
    change_pct = ((latest - prev) / prev * 100.0) if latest and prev else None
    high = max(c.high for c in candles) if candles else None
    low = min(c.low for c in candles) if candles else None

    return TickerPrices(
        symbol=symbol.upper(),
        latest_close=latest,
        previous_close=prev,
        change_pct=change_pct,
        range_high=high,
        range_low=low,
        candles=candles,
    )
