from __future__ import annotations

from typing import Any
import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from fastapi import HTTPException

from sqlalchemy import select, func
try:
    from ..db import SessionLocal
    from ..models.product import Product
    from ..models.order import Order
    from ..models.user import User
except ImportError:
    from db import SessionLocal
    from models.product import Product
    from models.order import Order
    from models.user import User

try:
    from ..agents.finance_agent import finance_agent
    from ..utils.mock_data import PRODUCTS, WORKERS
except ImportError:
    from agents.finance_agent import finance_agent
    from utils.mock_data import PRODUCTS, WORKERS


router = APIRouter()


class FinanceAnalyzeRequest(BaseModel):
    whatif_scenario: str | None = None
    hr_signal: str | None = None
    stream: bool = False


class WhatIfBase(BaseModel):
    sales: float | None = None
    other_costs: float | None = None
    salary_total: float | None = None
    headcount: int | None = None
    unit_price: float | None = None
    units_sold: int | None = None
    products: list[dict] | None = None
    workers: list[dict] | None = None


class WhatIfSpec(BaseModel):
    action: str
    # optional params depending on action
    count: int | None = None
    salary_per_hire: float | None = None
    delta: float | None = None
    roi: float | None = None
    delta_pct: float | None = None
    delta_units: int | None = None


class WhatIfRequest(BaseModel):
    base: WhatIfBase | None = None
    whatif: WhatIfSpec


class ChatRequest(BaseModel):
    question: str


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


@router.post("/whatif")
def whatif_finance(request: WhatIfRequest):
    base = request.base.model_dump() if request.base else {}
    whatif = request.whatif.model_dump()
    # Merge mock products/workers into base if not provided
    if "products" not in base or not base.get("products"):
        base["products"] = list(PRODUCTS.values())
    if "workers" not in base or not base.get("workers"):
        base["workers"] = list(WORKERS.values())

    result = finance_agent.apply_whatif(base, whatif)
    return result


@router.get("/summary")
def finance_summary() -> dict[str, float]:
    session = SessionLocal()
    try:
        # total revenue from completed orders
        total_revenue = session.execute(
            select(func.sum(Order.total_price)).where(Order.status == "completed")
        ).scalar() or 0.0

        # total COGS: sum(quantity * product.cost_price) for completed orders
        cogs_sum = session.execute(
            select(func.sum(Order.quantity * Product.cost_price)).join(Product, Product.id == Order.product_id).where(Order.status == "completed")
        ).scalar() or 0.0

        total_orders = session.execute(select(func.count()).select_from(Order).where(Order.status == "completed")).scalar() or 0

        gross_profit = float(total_revenue) - float(cogs_sum)

        return {
            "total_revenue": float(total_revenue),
            "cogs": float(cogs_sum),
            "gross_profit": float(gross_profit),
            "total_orders": int(total_orders),
        }
    finally:
        session.close()


@router.post("/chat")
def finance_chat(req: ChatRequest):
    # Build a brief profile from DB and mock data
    session = SessionLocal()
    try:
        products = [p.__dict__ for p in session.query(Product).all()]
        # sanitize SQLAlchemy objects
        for p in products:
            p.pop("_sa_instance_state", None)

        workers = list(WORKERS.values())

        profile = {
            "products": products,
            "workers": workers,
            "currency": "USD",
        }
    finally:
        session.close()

    # Use finance_agent to answer where possible, fallback to analyze
    try:
        if hasattr(finance_agent, "chat"):
            answer = finance_agent.chat(req.question, profile)
        else:
            # attach question as a signal for analysis
            profile["question"] = req.question
            answer = finance_agent.analyze(profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

    return {"answer": answer}