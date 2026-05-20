from __future__ import annotations

import json
from typing import Any

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from ..agents.sales_agent import sales_agent
from ..utils.mock_data import SALES_CUSTOMERS, SALES_PRODUCTS


router = APIRouter()


class SalesCustomer(BaseModel):
    name: str
    age: int | None = None
    purpose: str | None = None
    goal: str
    interests: list[str] = Field(default_factory=list)
    purchase_history: list[str] = Field(default_factory=list)


class SalesRecommendationRequest(BaseModel):
    customer: SalesCustomer
    stream: bool = False


@router.get("/customers")
def list_customers() -> list[dict[str, Any]]:
    return SALES_CUSTOMERS


@router.get("/products")
def list_products() -> list[dict[str, Any]]:
    return SALES_PRODUCTS


@router.get("/test")
def test_sales() -> dict[str, Any]:
    return sales_agent.recommend(SALES_CUSTOMERS[0])


def _sales_sse_stream(customer_payload: dict[str, Any]):
    prompt = (
        "Analyze this customer profile and purchase history, then recommend the Next Best Product. "
        "Use only the mock product catalog. "
        "Do not mention jobs or workers. "
        "Return valid JSON with keys recommendations, insight, cross_sell. "
        f"Customer profile: {customer_payload}"
    )

    for chunk in sales_agent.stream(prompt, context={"customer_profile": customer_payload, "catalog": SALES_PRODUCTS}):
        yield f"data: {json.dumps({'token': chunk})}\n\n"

    yield "data: [DONE]\n\n"


@router.post("/recommend")
def recommend_sales(request: SalesRecommendationRequest):
    customer_payload = request.customer.model_dump()

    if request.stream:
        return StreamingResponse(_sales_sse_stream(customer_payload), media_type="text/event-stream")

    return sales_agent.recommend(customer_payload, context={"catalog": SALES_PRODUCTS})