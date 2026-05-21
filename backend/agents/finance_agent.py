from __future__ import annotations

import json
from collections.abc import Mapping
from typing import Any

from agents.base_agent import BaseAgent
from utils.mock_data import JOB_LISTINGS, PRODUCTS


def _build_finance_prompt() -> str:
    return (
        "You are a rule-based finance agent. Always calculate profit instead of improvising. "
        "Use the formulas net_profit = revenue - cost, profit_margin_pct = (net_profit / revenue) * 100, "
        "markup_pct = (net_profit / cost) * 100, and salary_coverage_pct = (net_profit / target_salary) * 100. "
        "If orders are not provided, treat each product as one unit by default. "
        "Return only valid JSON with keys: product_analysis, salary_coverage, recommendations. "
        f"Available products: {PRODUCTS}. "
        f"Available job salary ranges: {JOB_LISTINGS}."
    )


class FinanceAgent(BaseAgent):
    temperature = 0.1

    def __init__(self, **kwargs: object) -> None:
        super().__init__(system_prompt=_build_finance_prompt(), **kwargs)

    def analyze(self, finance_profile: Mapping[str, Any], *, context: dict[str, Any] | None = None) -> dict[str, Any]:
        payload: dict[str, Any] = dict(finance_profile)
        if context:
            payload.update(context)

        products = self._resolve_products(payload)
        target_salary = float(payload.get("target_salary") or 1000)
        whatif_scenario = str(payload.get("whatif_scenario") or "").strip().lower()
        hr_signal = payload.get("hr_signal")

        product_analysis: list[dict[str, Any]] = []
        total_revenue = 0.0
        total_cost = 0.0
        total_net_profit = 0.0

        for product in products:
            quantity = self._resolve_quantity(product)
            cost_price = float(product.get("cost_price", 0))
            sell_price = float(product.get("sell_price", 0))
            adjusted_sell_price = self._apply_whatif_sell_price(sell_price, whatif_scenario)

            revenue = adjusted_sell_price * quantity
            cost = cost_price * quantity
            net_profit = revenue - cost
            profit_margin_pct = (net_profit / revenue * 100) if revenue else 0.0
            markup_pct = (net_profit / cost * 100) if cost else 0.0

            total_revenue += revenue
            total_cost += cost
            total_net_profit += net_profit

            product_analysis.append(
                {
                    "product_id": product.get("id"),
                    "product_name": product.get("name"),
                    "quantity": quantity,
                    "cost_price": round(cost_price, 2),
                    "sell_price": round(adjusted_sell_price, 2),
                    "revenue": round(revenue, 2),
                    "total_cost": round(cost, 2),
                    "net_profit": round(net_profit, 2),
                    "profit_margin_pct": round(profit_margin_pct, 2),
                    "markup_pct": round(markup_pct, 2),
                    "interpretation": self._interpret_margin(profit_margin_pct),
                }
            )

        salary_coverage_pct = (total_net_profit / target_salary * 100) if target_salary else 0.0

        return {
            "product_analysis": product_analysis,
            "salary_coverage": {
                "target_salary": round(target_salary, 2),
                "covered_by_net_profit": round(total_net_profit, 2),
                "salary_coverage_pct": round(salary_coverage_pct, 2),
                "interpretation": self._salary_interpretation(total_net_profit, target_salary),
                "total_revenue": round(total_revenue, 2),
                "total_cost": round(total_cost, 2),
            },
            "recommendations": self._build_recommendations(total_net_profit, target_salary, whatif_scenario, hr_signal),
        }

    def stream_report(self, finance_profile: Mapping[str, Any], *, context: dict[str, Any] | None = None):
        payload = json.dumps(self.analyze(finance_profile, context=context), ensure_ascii=False)
        for start in range(0, len(payload), 24):
            yield payload[start : start + 24]

    def _resolve_products(self, payload: dict[str, Any]) -> list[dict[str, Any]]:
        products = payload.get("products")
        if isinstance(products, list) and products:
            return [dict(product) for product in products if isinstance(product, Mapping)]
        return [dict(product) for product in PRODUCTS.values()]

    def _resolve_quantity(self, product: dict[str, Any]) -> int:
        quantity = product.get("quantity", product.get("units", product.get("stock", 1)))
        try:
            resolved = int(quantity)
        except (TypeError, ValueError):
            resolved = 1
        return max(resolved, 1)

    def _apply_whatif_sell_price(self, sell_price: float, scenario: str) -> float:
        multipliers = {
            "increase_price_10pct": 1.10,
            "increase_price_20pct": 1.20,
            "reduce_cost_10pct": 1.0,
            "reduce_cost_20pct": 1.0,
        }
        return sell_price * multipliers.get(scenario, 1.0)

    def _interpret_margin(self, profit_margin_pct: float) -> str:
        if profit_margin_pct >= 30:
            return "High-margin product with strong profit potential"
        if profit_margin_pct >= 15:
            return "Moderate-margin product with decent profit potential"
        return "Low-margin product that needs review"

    def _salary_interpretation(self, total_net_profit: float, target_salary: float) -> str:
        if target_salary <= 0:
            return "Salary target is not configured"
        coverage = total_net_profit / target_salary * 100
        if coverage >= 300:
            return "You can safely hire 2-3 employees"
        if coverage >= 100:
            return "You can hire 1 more employee"
        return "Not enough profit to cover 1 employee"

    def _build_recommendations(
        self,
        total_net_profit: float,
        target_salary: float,
        whatif_scenario: str,
        hr_signal: Any,
    ) -> list[dict[str, Any]]:
        coverage = total_net_profit / target_salary * 100 if target_salary else 0.0
        action = "Hire 2-3 employees" if coverage >= 300 else "Hire 1 employee" if coverage >= 100 else "Do not hire yet"
        reason = self._salary_interpretation(total_net_profit, target_salary)
        if whatif_scenario:
            reason = f"Scenario '{whatif_scenario}' applied. {reason}."
        if hr_signal:
            reason = f"HR signal: {hr_signal}. {reason}"

        return [
            {
                "action": action,
                "reason": reason,
                "priority": "high" if coverage >= 100 else "medium",
            },
            {
                "action": "Review low-margin products",
                "reason": "Increase profitability before adding payroll costs.",
                "priority": "medium",
            },
            {
                "action": "Track revenue growth monthly",
                "reason": "Use net profit trends to decide on new hires.",
                "priority": "low",
            },
        ]


finance_agent = FinanceAgent()