from __future__ import annotations

import os
from functools import lru_cache
from typing import Literal

from pydantic import BaseModel

PAPER_BASE = "https://paper-api.alpaca.markets"
LIVE_BASE = "https://api.alpaca.markets"


class BrokerStatus(BaseModel):
    configured: bool
    mode: Literal["paper", "live"] | None
    reason: str | None = None


class BrokerAccount(BaseModel):
    mode: Literal["paper", "live"]
    cash: float
    equity: float
    buying_power: float
    portfolio_value: float
    pattern_day_trader: bool
    currency: str
    status: str


class BrokerPosition(BaseModel):
    symbol: str
    qty: float
    avg_entry_price: float
    market_value: float
    unrealized_pl: float
    unrealized_plpc: float
    side: str
    current_price: float | None = None


class BrokerOrder(BaseModel):
    id: str
    symbol: str
    side: str
    qty: float
    order_type: str
    status: str
    submitted_at: str | None
    filled_at: str | None
    limit_price: float | None
    filled_avg_price: float | None


def status() -> BrokerStatus:
    if not os.environ.get("ALPACA_API_KEY") or not os.environ.get("ALPACA_SECRET_KEY"):
        return BrokerStatus(
            configured=False,
            mode=None,
            reason="Set ALPACA_API_KEY and ALPACA_SECRET_KEY in .env",
        )
    try:
        import alpaca  # noqa: F401
    except ImportError:
        return BrokerStatus(
            configured=False,
            mode=None,
            reason="alpaca-py not installed. Run: pip install alpaca-py",
        )
    mode = "live" if os.environ.get("ALPACA_USE_LIVE", "").lower() == "true" else "paper"
    return BrokerStatus(configured=True, mode=mode)


@lru_cache(maxsize=1)
def _trading_client():
    from alpaca.trading.client import TradingClient

    paper = os.environ.get("ALPACA_USE_LIVE", "").lower() != "true"
    return TradingClient(
        api_key=os.environ["ALPACA_API_KEY"],
        secret_key=os.environ["ALPACA_SECRET_KEY"],
        paper=paper,
    )


def get_account() -> BrokerAccount:
    client = _trading_client()
    a = client.get_account()
    mode = "paper" if os.environ.get("ALPACA_USE_LIVE", "").lower() != "true" else "live"
    return BrokerAccount(
        mode=mode,
        cash=float(a.cash),
        equity=float(a.equity),
        buying_power=float(a.buying_power),
        portfolio_value=float(a.portfolio_value),
        pattern_day_trader=bool(a.pattern_day_trader),
        currency=str(a.currency),
        status=str(a.status).split(".")[-1].lower(),
    )


def get_positions() -> list[BrokerPosition]:
    client = _trading_client()
    items = client.get_all_positions()
    return [
        BrokerPosition(
            symbol=p.symbol,
            qty=float(p.qty),
            avg_entry_price=float(p.avg_entry_price),
            market_value=float(p.market_value),
            unrealized_pl=float(p.unrealized_pl),
            unrealized_plpc=float(p.unrealized_plpc) * 100,
            side=str(p.side).split(".")[-1].lower(),
            current_price=float(p.current_price) if getattr(p, "current_price", None) else None,
        )
        for p in items
    ]


def get_orders(limit: int = 50) -> list[BrokerOrder]:
    from alpaca.trading.requests import GetOrdersRequest
    from alpaca.trading.enums import QueryOrderStatus

    client = _trading_client()
    items = client.get_orders(filter=GetOrdersRequest(status=QueryOrderStatus.ALL, limit=limit))
    return [_serialize_order(o) for o in items]


def place_order(
    symbol: str,
    side: Literal["buy", "sell"],
    qty: float,
    order_type: Literal["market", "limit"] = "market",
    limit_price: float | None = None,
    time_in_force: Literal["day", "gtc"] = "day",
) -> BrokerOrder:
    from alpaca.trading.enums import OrderSide, TimeInForce
    from alpaca.trading.requests import LimitOrderRequest, MarketOrderRequest

    client = _trading_client()
    side_enum = OrderSide.BUY if side == "buy" else OrderSide.SELL
    tif_enum = TimeInForce.DAY if time_in_force == "day" else TimeInForce.GTC

    if order_type == "limit":
        if limit_price is None:
            raise ValueError("limit_price required for limit orders")
        req = LimitOrderRequest(
            symbol=symbol.upper(),
            qty=qty,
            side=side_enum,
            time_in_force=tif_enum,
            limit_price=limit_price,
        )
    else:
        req = MarketOrderRequest(
            symbol=symbol.upper(),
            qty=qty,
            side=side_enum,
            time_in_force=tif_enum,
        )
    order = client.submit_order(req)
    return _serialize_order(order)


def _serialize_order(o) -> BrokerOrder:
    return BrokerOrder(
        id=str(o.id),
        symbol=str(o.symbol),
        side=str(o.side).split(".")[-1].lower(),
        qty=float(o.qty) if o.qty else 0.0,
        order_type=str(o.order_type).split(".")[-1].lower(),
        status=str(o.status).split(".")[-1].lower(),
        submitted_at=o.submitted_at.isoformat() if getattr(o, "submitted_at", None) else None,
        filled_at=o.filled_at.isoformat() if getattr(o, "filled_at", None) else None,
        limit_price=float(o.limit_price) if getattr(o, "limit_price", None) else None,
        filled_avg_price=float(o.filled_avg_price) if getattr(o, "filled_avg_price", None) else None,
    )
