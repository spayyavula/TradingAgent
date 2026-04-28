from __future__ import annotations

import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.routes import broker, decisions, runs, tickers

app = FastAPI(title="TradingAgents API", version="0.1.0")

_default_origins = "http://localhost:3000,http://127.0.0.1:3000"
_origins = [
    o.strip()
    for o in os.environ.get("CORS_ORIGINS", _default_origins).split(",")
    if o.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(decisions.router)
app.include_router(tickers.router)
app.include_router(runs.router)
app.include_router(broker.router)


@app.get("/api/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
