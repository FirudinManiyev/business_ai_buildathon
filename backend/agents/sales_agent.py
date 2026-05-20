from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .base_agent import BaseAgent
from ..utils.mock_data import CUSTOMERS, PRODUCTS


def _build_sales_prompt() -> str:
    return (
        "You are a sales agent that recommends the Next Best Product. "
        "Use the customer profile and purchase history to generate practical recommendations. "
        "Only recommend products from the product catalog. Do not mention jobs or workers. "
        "Return only valid JSON with keys: recommendations, insight, cross_sell. "
        "recommendations must be an array of product objects with product_id, product_name, reason, priority. "
        "insight must be a short string. cross_sell must be an array of complementary product objects with product_id, product_name, reason. "
        f"Available products: {PRODUCTS}. "
        f"Known customers: {CUSTOMERS}."
    )


class SalesAgent(BaseAgent):
    temperature = 0.4

    def __init__(self, **kwargs: object) -> None:
        super().__init__(system_prompt=_build_sales_prompt(), **kwargs)

    def recommend(self, customer_profile: Mapping[str, Any], *, context: dict[str, Any] | None = None) -> dict[str, Any]:
        prompt = (
            "Analyze this customer profile and purchase history, then recommend the Next Best Product. "
            "Use only the mock product catalog. "
            "Do not mention jobs or workers. "
            "Return valid JSON with keys recommendations, insight, cross_sell. "
            f"Customer profile: {dict(customer_profile)}"
        )
        payload_context = {"customer_profile": dict(customer_profile)}
        if context:
            payload_context.update(context)
        return self.run_json(prompt, context=payload_context)


sales_agent = SalesAgent()