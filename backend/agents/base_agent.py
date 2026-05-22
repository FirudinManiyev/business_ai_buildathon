from __future__ import annotations

import json
import os
from abc import ABC
from collections.abc import Iterator
from typing import Any

from dotenv import load_dotenv


load_dotenv()

# Import Groq if available; otherwise fall back to deterministic local generation.
try:
    from groq import Groq
except Exception:
    Groq = None

try:
    from ..utils.mock_data import CUSTOMERS, JOB_LISTINGS, PRODUCTS, SKILL_GAP_PRODUCTS, WORKERS
except ImportError:
    from utils.mock_data import CUSTOMERS, JOB_LISTINGS, PRODUCTS, SKILL_GAP_PRODUCTS, WORKERS


class BaseAgent(ABC):
    system_prompt: str | None = None
    model: str = "llama-3.3-70b-versatile"
    temperature: float = 0.7
    max_tokens: int = 1024

    def __init__(
        self,
        *,
        model: str | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
        api_key: str | None = None,
        system_prompt: str | None = None,
    ) -> None:
        self.model = model if model is not None else self.__class__.model
        self.temperature = temperature if temperature is not None else self.__class__.temperature
        self.max_tokens = max_tokens if max_tokens is not None else self.__class__.max_tokens
        self.system_prompt = system_prompt if system_prompt is not None else self.system_prompt
        resolved_api_key = api_key or os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=resolved_api_key) if Groq is not None and resolved_api_key else None

    def run(self, prompt: str, *, context: dict[str, Any] | None = None) -> str:
        if self.client is None:
            return self._fallback_run(prompt, context=context)

        response = self.client.chat.completions.create(
            model=self.model,
            messages=self._build_messages(prompt, context=context),
            temperature=self.temperature,
            max_tokens=self.max_tokens,
        )
        return response.choices[0].message.content or ""

    def stream(self, prompt: str, *, context: dict[str, Any] | None = None) -> Iterator[str]:
        if self.client is None:
            yield from self._fallback_stream(prompt, context=context)
            return

        response_stream = self.client.chat.completions.create(
            model=self.model,
            messages=self._build_messages(prompt, context=context),
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            stream=True,
        )

        for chunk in response_stream:
            content = chunk.choices[0].delta.content
            if content:
                yield content

    def run_json(self, prompt: str, *, context: dict[str, Any] | None = None) -> dict[str, Any]:
        if self.client is None:
            return self._fallback_run_json(prompt, context=context)

        response = self.client.chat.completions.create(
            model=self.model,
            messages=self._build_messages(prompt, context=context),
            temperature=self.temperature,
            max_tokens=self.max_tokens,
            response_format={"type": "json_object"},
        )

        content = response.choices[0].message.content or "{}"

        try:
            parsed = json.loads(content)
        except json.JSONDecodeError as exc:
            raise ValueError("Groq response was not valid JSON") from exc

        if not isinstance(parsed, dict):
            raise ValueError("Groq response JSON must be an object")

        return parsed

    def _build_messages(self, prompt: str, *, context: dict[str, Any] | None = None) -> list[dict[str, str]]:
        messages: list[dict[str, str]] = []

        if self.system_prompt:
            messages.append({"role": "system", "content": self.system_prompt})

        if context:
            prompt = f"{prompt}\n\nContext:\n{json.dumps(context, ensure_ascii=False)}"

        messages.append({"role": "user", "content": prompt})
        return messages

    def _fallback_run(self, prompt: str, *, context: dict[str, Any] | None = None) -> str:
        payload = self._fallback_run_json(prompt, context=context)
        return json.dumps(payload, ensure_ascii=False)

    def _fallback_stream(self, prompt: str, *, context: dict[str, Any] | None = None) -> Iterator[str]:
        payload = self._fallback_run_json(prompt, context=context)
        yield json.dumps(payload, ensure_ascii=False)

    def _fallback_run_json(self, prompt: str, *, context: dict[str, Any] | None = None) -> dict[str, Any]:
        system_text = (self.system_prompt or "").lower()
        payload = context or {}

        if "sales agent" in system_text:
            return self._fallback_sales(payload)
        if "hr matching agent" in system_text:
            return self._fallback_hr(payload)
        if "finance agent" in system_text:
            return self._fallback_finance(payload)

        return {
            "message": prompt,
            "status": "ok",
        }

    def _fallback_sales(self, payload: dict[str, Any]) -> dict[str, Any]:
        customer = payload.get("customer_profile") or payload.get("customer") or payload
        purchased = {str(item).lower() for item in customer.get("purchase_history", []) if isinstance(item, str)}
        catalog = payload.get("catalog") or list(PRODUCTS.values())
        customer_goal = customer.get("purpose") or customer.get("goal") or "general purchasing"
        recommendations: list[dict[str, Any]] = []
        cross_sell: list[dict[str, Any]] = []

        for product in catalog:
            name = str(product.get("name", ""))
            lower_name = name.lower()
            if lower_name in purchased:
                continue
            bucket = {
                "product_id": product.get("id"),
                "product_name": name,
                "reason": f"Fits the customer's {customer_goal} goal.",
                "priority": len(recommendations) + 1,
            }
            if len(recommendations) < 3:
                recommendations.append(bucket)
            elif len(cross_sell) < 2:
                cross_sell.append(bucket)

        if not recommendations:
            recommendations = [
                {
                    "product_id": list(PRODUCTS.values())[0]["id"],
                    "product_name": list(PRODUCTS.values())[0]["name"],
                    "reason": "Default catalog recommendation.",
                    "priority": 1,
                }
            ]

        return {
            "recommendations": recommendations,
            "insight": f"Customer is focused on {customer_goal}.",
            "cross_sell": cross_sell,
        }

    def _fallback_hr(self, payload: dict[str, Any]) -> dict[str, Any]:
        cv = payload.get("cv_data") or payload.get("cv") or payload
        skills = [str(skill).lower() for skill in cv.get("skills", []) if isinstance(skill, str)]
        if not skills:
            return {
                "matches": [],
                "skill_gap_products": [],
                "finance_signal": {
                    "level": "low",
                    "reason": "No skills provided, so no reliable matching can be performed.",
                    "salary_pressure": 0,
                },
            }

        try:
            experience_years = int("".join(ch for ch in str(cv.get("experience_years", cv.get("experience", 0))) if ch.isdigit()) or "0")
        except Exception:
            experience_years = 0

        matches: list[dict[str, Any]] = []
        for job in JOB_LISTINGS.values():
            required_skills = [str(skill).lower() for skill in job.get("required_skills", [])]
            overlap = len(set(skills) & set(required_skills))
            if not overlap:
                continue

            required_count = max(len(required_skills), 1)
            skill_score = (overlap / required_count) * 40
            exp_target = int("".join(ch for ch in str(job.get("experience_years", "0")) if ch.isdigit()) or "0")
            experience_score = max(0.0, 20 - abs(experience_years - exp_target) * 5)
            salary_score = 20 if cv.get("expected_salary", job.get("salary_max", 0)) <= job.get("salary_max", 0) else 10
            location_score = 10 if str(cv.get("location", "")).lower() in {"", str(job.get("location", "")).lower(), "remote", "hybrid"} else 5
            profile_score = 10 if cv.get("education") else 5
            match_score = min(100, round(skill_score + experience_score + salary_score + location_score + profile_score))

            matches.append(
                {
                    "job_id": job.get("id"),
                    "job_title": job.get("title"),
                    "match_score": int(match_score),
                    "matched_skills": sorted(set(skills) & set(required_skills)),
                    "missing_skills": [skill for skill in required_skills if skill not in skills],
                    "reason": f"Matched {overlap} required skills.",
                }
            )

        matches.sort(key=lambda item: item["match_score"], reverse=True)

        skill_gap_products = []
        for product in SKILL_GAP_PRODUCTS.values():
            skill_gap_products.append(
                {
                    "product_id": product.get("id"),
                    "product_name": product.get("name"),
                    "reason": "Can strengthen job-relevant capability.",
                }
            )

        top_score = matches[0]["match_score"] if matches else 0
        return {
            "matches": matches,
            "skill_gap_products": skill_gap_products[:3],
            "finance_signal": {
                "level": "high" if top_score >= 70 else "medium" if top_score >= 40 else "low",
                "reason": "Derived from the best matching role scores.",
                "salary_pressure": max(0, 100 - top_score),
            },
        }

    def _fallback_finance(self, payload: dict[str, Any]) -> dict[str, Any]:
        products = payload.get("products") or list(PRODUCTS.values())
        target_salary = payload.get("target_salary") or 2500
        if not isinstance(target_salary, (int, float)):
            target_salary = 2500

        product_analysis: list[dict[str, Any]] = []
        total_net_profit = 0.0

        for product in products:
            cost_price = float(product.get("cost_price", 0))
            sell_price = float(product.get("sell_price", 0))
            net_profit = sell_price - cost_price
            total_net_profit += net_profit
            profit_margin_pct = (net_profit / sell_price * 100) if sell_price else 0.0
            markup_pct = (net_profit / cost_price * 100) if cost_price else 0.0

            product_analysis.append(
                {
                    "product_id": product.get("id"),
                    "product_name": product.get("name"),
                    "cost_price": round(cost_price, 2),
                    "sell_price": round(sell_price, 2),
                    "net_profit": round(net_profit, 2),
                    "profit_margin_pct": round(profit_margin_pct, 2),
                    "markup_pct": round(markup_pct, 2),
                    "interpretation": "Healthy margin" if profit_margin_pct >= 15 else "Needs review",
                }
            )

        salary_coverage_pct = (total_net_profit / float(target_salary) * 100) if float(target_salary) else 0.0
        return {
            "product_analysis": product_analysis,
            "salary_coverage": {
                "target_salary": round(float(target_salary), 2),
                "covered_by_net_profit": round(total_net_profit, 2),
                "salary_coverage_pct": round(salary_coverage_pct, 2),
                "interpretation": "Net profit can cover target salary" if salary_coverage_pct >= 100 else "Net profit does not fully cover the target salary",
            },
            "recommendations": [
                {
                    "action": "Focus on high-margin items",
                    "reason": "Improves salary coverage and operating leverage.",
                    "priority": 1,
                },
                {
                    "action": "Review low-margin pricing",
                    "reason": "Protects profitability.",
                    "priority": 2,
                },
            ],
        }