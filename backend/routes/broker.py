from __future__ import annotations

from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from backend.services import broker

router = APIRouter(prefix="/api/broker", tags=["broker"])


class OrderRequest(BaseModel):
    symbol: str = Field(min_length=1, max_length=12)
    side: Literal["buy", "sell"]
    qty: float = Field(gt=0)
    order_type: Literal["market", "limit"] = "market"
    limit_price: float | None = Field(default=None, gt=0)
    time_in_force: Literal["day", "gtc"] = "day"
    confirm: bool = False


def _ensure_configured() -> None:
    s = broker.status()
    if not s.configured:
        raise HTTPException(status_code=503, detail=s.reason or "Broker not configured")


@router.get("/status", response_model=broker.BrokerStatus)
def get_status():
    return broker.status()


@router.get("/account", response_model=broker.BrokerAccount)
def account():
    _ensure_configured()
    try:
        return broker.get_account()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Alpaca error: {exc}") from exc


@router.get("/positions", response_model=list[broker.BrokerPosition])
def positions():
    _ensure_configured()
    try:
        return broker.get_positions()
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Alpaca error: {exc}") from exc


@router.get("/orders", response_model=list[broker.BrokerOrder])
def orders(limit: int = 50):
    _ensure_configured()
    try:
        return broker.get_orders(limit=limit)
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Alpaca error: {exc}") from exc


@router.post("/orders", response_model=broker.BrokerOrder)
def place_order(req: OrderRequest):
    _ensure_configured()
    if not req.confirm:
        raise HTTPException(
            status_code=400,
            detail="Order requires explicit confirmation. Set confirm: true.",
        )
    try:
        return broker.place_order(
            symbol=req.symbol,
            side=req.side,
            qty=req.qty,
            order_type=req.order_type,
            limit_price=req.limit_price,
            time_in_force=req.time_in_force,
        )
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    except Exception as exc:  # noqa: BLE001
        raise HTTPException(status_code=502, detail=f"Alpaca error: {exc}") from exc
