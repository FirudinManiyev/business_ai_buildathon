import os
from typing import Any

from dotenv import load_dotenv
from fastapi import FastAPI
from pydantic import BaseModel, Field
from groq import Groq

from agents import finance_agent, hr_agent, sales_agent
from mock_data import CUSTOMERS, CVS, PRODUCTS

load_dotenv()

app = FastAPI()

groq_api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=groq_api_key) if groq_api_key else None


class SalesRecommendationRequest(BaseModel):
    customer_profile: dict[str, Any] = Field(default_factory=dict)


class HRMatchRequest(BaseModel):
    cv_profile: dict[str, Any] = Field(default_factory=dict)


class FinanceAnalysisRequest(BaseModel):
    finance_profile: dict[str, Any] = Field(default_factory=dict)


@app.get("/health")
def health() -> dict[str, object]:
    if client is None:
        return {"status": "unhealthy", "groq_api_key": False}

    try:
        client.models.list()
    except Exception as exc:
        return {
            "status": "unhealthy",
            "groq_api_key": True,
            "groq": False,
            "detail": str(exc),
        }

    return {"status": "ok", "groq_api_key": True, "groq": True}


@app.get("/sales/test")
def sales_test() -> dict[str, Any]:
    return sales_agent.recommend(CUSTOMERS["customer_acme"])


@app.post("/sales/recommend")
def sales_recommend(request: SalesRecommendationRequest) -> dict[str, Any]:
    return sales_agent.recommend(request.customer_profile)


@app.get("/hr/test")
def hr_test() -> dict[str, Any]:
    return hr_agent.match(CVS["cv_amina"])


@app.post("/hr/match")
def hr_match(request: HRMatchRequest) -> dict[str, Any]:
    return hr_agent.match(request.cv_profile)


@app.get("/finance/test")
def finance_test() -> dict[str, Any]:
    return finance_agent.analyze({
        "products": list(PRODUCTS.values()),
        "target_salary": 2500,
        "currency": "USD",
    })


@app.post("/finance/analyze")
def finance_analyze(request: FinanceAnalysisRequest) -> dict[str, Any]:
    return finance_agent.analyze(request.finance_profile)