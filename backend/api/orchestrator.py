from __future__ import annotations

import os
from typing import Any, Literal

from fastapi import APIRouter
from pydantic import BaseModel, Field
from groq import Groq

from agents.finance_agent import finance_agent
from agents.hr_agent import hr_agent
from agents.sales_agent import sales_agent
from utils.mock_data import CUSTOMERS, JOB_LISTINGS, PRODUCTS, SALES_CUSTOMERS, WORKERS


router = APIRouter()


class OrchestratorRunRequest(BaseModel):
    scenario: Literal["full_analysis", "cv_with_finance"]
    customer_id: str | None = None
    cv_data: dict[str, Any] | None = Field(default=None)
    whatif: str | None = None


def _resolve_customer(customer_id: str | None) -> dict[str, Any] | None:
    if not customer_id:
        return None

    if customer_id in CUSTOMERS:
        return CUSTOMERS[customer_id]

    if customer_id in SALES_CUSTOMERS:
        return SALES_CUSTOMERS[customer_id]

    for customer in CUSTOMERS.values():
        if str(customer.get("id")) == customer_id:
            return customer

    for customer in SALES_CUSTOMERS:
        if str(customer.get("id")) == customer_id:
            return customer

    return None


def _build_hr_context(cv_data: dict[str, Any] | None) -> dict[str, Any]:
    return {
        "cv_data": cv_data or {},
        "job_listings": list(JOB_LISTINGS.values()),
    }


def _build_finance_context(hr_result: dict[str, Any], whatif: str | None) -> dict[str, Any]:
    finance_signal = hr_result.get("finance_signal", {}) if isinstance(hr_result, dict) else {}
    return {
        "products": list(PRODUCTS.values()),
        "workers": list(WORKERS.values()),
        "whatif_scenario": whatif,
        "hr_signal": finance_signal,
    }


def _build_sales_context(
    customer: dict[str, Any],
    hr_result: dict[str, Any],
    finance_result: dict[str, Any],
) -> dict[str, Any]:
    return {
        "customer_profile": customer,
        "hr_result": hr_result,
        "finance_result": finance_result,
    }


@router.get("/health")
def health() -> dict[str, object]:
    groq_api_key = os.getenv("GROQ_API_KEY")

    if not groq_api_key:
        return {"status": "unhealthy", "groq_api_key": False}

    try:
        Groq(api_key=groq_api_key).models.list()
    except Exception as exc:
        return {"status": "unhealthy", "groq_api_key": True, "groq": False, "detail": str(exc)}

    return {"status": "ok", "groq_api_key": True, "groq": True}


@router.post("/run")
def run_orchestrator(request: OrchestratorRunRequest) -> dict[str, Any]:
    shared_context: dict[str, Any] = {"scenario": request.scenario, "results": []}
    agents_used: list[str] = []

    hr_input = {**_build_hr_context(request.cv_data), "shared_context": shared_context}
    hr_result = hr_agent.match(hr_input)
    shared_context["hr"] = hr_result
    shared_context["results"].append({"agent": "hr", "result": hr_result})
    agents_used.append("hr")

    finance_input = {**_build_finance_context(hr_result, request.whatif), "shared_context": shared_context}
    finance_result = finance_agent.analyze(finance_input)
    shared_context["finance"] = finance_result
    shared_context["results"].append({"agent": "finance", "result": finance_result})
    agents_used.append("finance")

    customer = _resolve_customer(request.customer_id)
    if request.scenario == "full_analysis" and customer is not None:
        sales_input = {**_build_sales_context(customer, hr_result, finance_result), "shared_context": shared_context}
        sales_result = sales_agent.recommend(sales_input)
        shared_context["sales"] = sales_result
        shared_context["results"].append({"agent": "sales", "result": sales_result})
        agents_used.append("sales")

    return {
        "scenario": request.scenario,
        "pipeline_steps": len(agents_used),
        "agents_used": agents_used,
        "results": shared_context["results"],
    }