from __future__ import annotations

import asyncio
import json
from datetime import date

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from backend.services.runner import run_manager

router = APIRouter(prefix="/api", tags=["runs"])


class AnalyzeRequest(BaseModel):
    ticker: str = Field(min_length=1, max_length=12)
    date: date


@router.post("/analyze")
def start_analysis(req: AnalyzeRequest) -> dict:
    state = run_manager.start(req.ticker, req.date.isoformat())
    return {"run_id": state.id, "ticker": state.ticker, "date": state.date}


@router.get("/runs/{run_id}")
def get_run(run_id: str) -> dict:
    state = run_manager.get(run_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return state.snapshot()


@router.get("/runs/{run_id}/events")
async def stream_events(run_id: str):
    state = run_manager.get(run_id)
    if state is None:
        raise HTTPException(status_code=404, detail="Run not found")

    async def gen():
        run_manager.attach_loop(asyncio.get_running_loop())
        try:
            async for evt in run_manager.subscribe(run_id):
                yield f"data: {json.dumps(evt, default=str)}\n\n"
        except asyncio.CancelledError:
            return

    return StreamingResponse(
        gen(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache, no-transform",
            "X-Accel-Buffering": "no",
            "Connection": "keep-alive",
        },
    )
