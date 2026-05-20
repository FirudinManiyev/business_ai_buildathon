from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .base_agent import BaseAgent
from utils.mock_data import JOB_LISTINGS, PRODUCTS


def _build_finance_prompt() -> str:
    return (
        "You are a finance agent. Analyze product prices and costs, then evaluate salary coverage. "
        "Use these formulas consistently: net_profit = sell_price - cost_price; "
        "profit_margin_pct = (net_profit / sell_price) * 100; markup_pct = (net_profit / cost_price) * 100; "
        "salary_coverage_pct = (net_profit / target_salary) * 100 when comparing one product's net profit to a salary target. "
        "If multiple products are provided, sum their net profits before comparing to salary targets. "
        "Return only valid JSON with keys: product_analysis, salary_coverage, recommendations. "
        "product_analysis must be an array of objects with product_id, product_name, cost_price, sell_price, net_profit, profit_margin_pct, markup_pct, interpretation. "
        "salary_coverage must be an object with target_salary, covered_by_net_profit, salary_coverage_pct, interpretation. "
        "recommendations must be an array of objects with action, reason, priority. "
        f"Available products: {PRODUCTS}. "
        f"Available job salary ranges: {JOB_LISTINGS}."
    )


class FinanceAgent(BaseAgent):
    def __init__(self, **kwargs: object) -> None:
        super().__init__(system_prompt=_build_finance_prompt(), **kwargs)

    def analyze(self, finance_profile: Mapping[str, Any]) -> dict[str, Any]:
        prompt = (
            "Analyze these products and salary expectations using the documented finance formulas. "
            "Return valid JSON with keys product_analysis, salary_coverage, recommendations. "
            f"Finance profile: {dict(finance_profile)}"
        )
        return self.run_json(prompt)


finance_agent = FinanceAgent()