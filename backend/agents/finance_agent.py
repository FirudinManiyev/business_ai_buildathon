from __future__ import annotations

import json
from collections.abc import Mapping
from typing import Any

try:
    from .base_agent import BaseAgent
    from ..utils.mock_data import JOB_LISTINGS, PRODUCTS
except ImportError:
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
        total_cost_products = 0.0

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
            total_cost_products += cost

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

        # Include salaries and other operating costs into total cost
        salary_total = 0.0
        workers = payload.get("workers") or []
        if isinstance(workers, list):
            for w in workers:
                try:
                    salary_total += float(w.get("salary", 0) or 0)
                except Exception:
                    continue

        # Allow explicit base other costs
        other_costs = float(payload.get("other_costs") or payload.get("costs") or 0)

        total_cost = total_cost_products + salary_total + other_costs
        total_net_profit = total_revenue - total_cost

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
                "salary_total": round(salary_total, 2),
                "other_costs": round(other_costs, 2),
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

    def apply_whatif(self, base: Mapping[str, Any], whatif: Mapping[str, Any]) -> dict[str, Any]:
        """
        Apply a structured what-if scenario to base financials and return
        new_values, deltas, classification, explanation and recommendation.
        Supported actions: 'hire', 'ad_spend', 'price_change', 'volume_change', 'sales_delta', 'costs_delta'
        """
        # Resolve base values
        # sales: either explicit or computed from products
        sales = float(base.get("sales") or 0)
        products = base.get("products") or []
        if not sales and isinstance(products, list) and products:
            for p in products:
                try:
                    qty = int(p.get("quantity", p.get("units", p.get("stock", 1))))
                except Exception:
                    qty = 1
                sales += float(p.get("sell_price", 0)) * qty

        # product costs
        product_costs = 0.0
        if isinstance(products, list) and products:
            for p in products:
                try:
                    qty = int(p.get("quantity", p.get("units", p.get("stock", 1))))
                except Exception:
                    qty = 1
                product_costs += float(p.get("cost_price", 0)) * qty

        # salaries
        salary_total = float(base.get("salary_total") or 0)
        workers = base.get("workers") or []
        if isinstance(workers, list) and not salary_total:
            for w in workers:
                try:
                    salary_total += float(w.get("salary", 0) or 0)
                except Exception:
                    continue

        other_costs = float(base.get("other_costs") or base.get("costs") or 0)

        headcount = int(base.get("headcount") or (len(workers) if isinstance(workers, list) else 0))
        unit_price = float(base.get("unit_price") or 0)
        units_sold = int(base.get("units_sold") or 0)

        base_total_cost = product_costs + salary_total + other_costs
        base_profit = sales - base_total_cost

        # Start with copies
        new_sales = sales
        new_salary_total = salary_total
        new_other_costs = other_costs
        new_product_costs = product_costs

        action = str(whatif.get("action") or "").lower()

        if action in {"hire", "hiring"}:
            count = int(whatif.get("count") or 0)
            salary_per_hire = float(whatif.get("salary_per_hire") or whatif.get("salary") or (salary_total / max(1, headcount) if headcount else 1000))
            new_salary_total = salary_total + count * salary_per_hire
            headcount += count

        elif action in {"ad_spend", "marketing", "ads"}:
            delta = float(whatif.get("delta") or whatif.get("amount") or 0)
            new_other_costs = other_costs + delta
            # optional ROI-based sales uplift
            roi = float(whatif.get("roi") or 0)
            if roi:
                new_sales = sales + delta * roi

        elif action in {"price_change", "price_increase", "price"}:
            delta_pct = float(whatif.get("delta_pct") or whatif.get("pct") or 0)
            if unit_price and units_sold:
                new_sales = (unit_price * (1 + delta_pct / 100)) * units_sold
            elif sales:
                new_sales = sales * (1 + delta_pct / 100)

        elif action in {"volume_change", "volume", "units"}:
            delta_units = int(whatif.get("delta_units") or whatif.get("units") or 0)
            if unit_price:
                new_sales = sales + delta_units * unit_price
            elif units_sold and sales:
                avg_price = sales / max(1, units_sold)
                new_sales = sales + delta_units * avg_price

        elif action in {"sales_delta", "sales_change"}:
            delta = float(whatif.get("delta") or 0)
            new_sales = sales + delta

        elif action in {"costs_delta", "costs_change"}:
            delta = float(whatif.get("delta") or 0)
            new_other_costs = other_costs + delta

        # Final totals
        new_total_cost = new_product_costs + new_salary_total + new_other_costs
        new_profit = new_sales - new_total_cost

        delta_profit = new_profit - base_profit
        pct_change = (delta_profit / (abs(base_profit) if base_profit else 1)) * 100

        # classification
        classification = "neutral"
        risk = "watch"
        if new_profit > base_profit * 1.05:
            classification = "positive"
            risk = "safe"
        elif new_profit < base_profit * 0.95:
            classification = "negative"
            risk = "risky"
        if base_profit >= 0 and new_profit < 0:
            classification = "negative"
            risk = "risky"

        explanation = f"Applied action '{action}': sales {sales} -> {round(new_sales,2)}, costs {round(base_total_cost,2)} -> {round(new_total_cost,2)}, profit {round(base_profit,2)} -> {round(new_profit,2)}."

        recommendation = None
        if classification == "negative":
            recommendation = "Avoid this change or offset with sales growth, reduce costs, or hire fewer people. Compute break-even hires or required sales uplift."
        elif classification == "positive":
            recommendation = "Change looks positive; consider piloting and monitoring KPIs."
        else:
            recommendation = "Change has small effect; monitor and run sensitivity analysis."

        return {
            "base": {
                "sales": round(sales, 2),
                "product_costs": round(product_costs, 2),
                "salary_total": round(salary_total, 2),
                "other_costs": round(other_costs, 2),
                "total_cost": round(base_total_cost, 2),
                "profit": round(base_profit, 2),
            },
            "whatif": dict(whatif),
            "new_values": {
                "sales": round(new_sales, 2),
                "product_costs": round(new_product_costs, 2),
                "salary_total": round(new_salary_total, 2),
                "other_costs": round(new_other_costs, 2),
                "total_cost": round(new_total_cost, 2),
                "profit": round(new_profit, 2),
            },
            "deltas": {
                "profit": round(delta_profit, 2),
                "profit_pct": round(pct_change, 2),
            },
            "classification": classification,
            "risk": risk,
            "explanation": explanation,
            "recommendation": recommendation,
        }


finance_agent = FinanceAgent()