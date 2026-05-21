from __future__ import annotations

from typing import Any
import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from agents.finance_agent import finance_agent
from utils.mock_data import PRODUCTS, WORKERS


router = APIRouter()


class FinanceAnalyzeRequest(BaseModel):
    whatif_scenario: str | None = None
    hr_signal: str | None = None
    stream: bool = False


@router.get("/employees")
def list_employees() -> list[dict[str, Any]]:
    return list(WORKERS.values())


@router.get("/test")
def test_finance() -> dict[str, Any]:
    profile = {
        "products": list(PRODUCTS.values()),
        "workers": list(WORKERS.values()),
        "target_salary": 1000,
        "currency": "USD",
    }
    return finance_agent.analyze(profile)


def _finance_sse_stream(profile: dict[str, Any]):
    prompt = (
        "Analyze the company's products and workforce for profitability and salary coverage. "
        "Use net_profit, profit_margin_pct, markup_pct and the salary coverage formulas. "
        "Return streaming JSON tokens. "
        f"Context profile: {profile}"
    )

    for chunk in finance_agent.stream_report(profile):
        yield f"data: {json.dumps({'token': chunk})}\n\n"

    yield "data: [DONE]\n\n"


@router.post("/analyze")
def analyze_finance(request: FinanceAnalyzeRequest):
    # Build profile from backend mock data only
    profile: dict[str, Any] = {
        "products": list(PRODUCTS.values()),
        "workers": list(WORKERS.values()),
        "target_salary": 1000,
        "currency": "USD",
    }

    if request.whatif_scenario:
        profile["whatif_scenario"] = request.whatif_scenario

    if request.hr_signal:
        profile["hr_signal"] = request.hr_signal

    if request.stream:
        return StreamingResponse(_finance_sse_stream(profile), media_type="text/event-stream")

    return finance_agent.analyze(profile)