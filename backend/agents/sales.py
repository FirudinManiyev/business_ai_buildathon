from __future__ import annotations

from .base import BaseAgent
from mock_data import CUSTOMERS, JOB_LISTINGS, PRODUCTS, WORKERS


def _build_sales_prompt() -> str:
    return (
        "You are a sales assistant. Use the provided mock business data when relevant. "
        f"Products: {PRODUCTS}. "
        f"Jobs: {JOB_LISTINGS}. "
        f"Workers: {WORKERS}. "
        f"Customers: {CUSTOMERS}."
    )


class SalesAgent(BaseAgent):
    def __init__(self, **kwargs: object) -> None:
        super().__init__(system_prompt=_build_sales_prompt(), **kwargs)


sales_agent = SalesAgent()