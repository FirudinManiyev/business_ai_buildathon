from __future__ import annotations

from collections.abc import Mapping
from typing import Any

from .base import BaseAgent
from mock_data import CVS, JOB_LISTINGS, SKILL_GAP_PRODUCTS


def _build_hr_prompt() -> str:
    return (
        "You are an HR matching agent. Match each CV to the most relevant job listings and return only valid JSON. "
        "Use this scoring methodology and show it consistently in your answers: "
        "match_score = skill_overlap(40) + experience_alignment(20) + salary_alignment(20) + location_fit(10) + profile_fit(10). "
        "Skill overlap is the percentage of required skills present in the CV scaled to 40 points. "
        "Experience alignment is the closeness between candidate experience and job requirement scaled to 20 points. "
        "Salary alignment is highest when expected salary sits inside the job range and decreases as the gap grows, scaled to 20 points. "
        "Location fit gives 10 points for exact or compatible remote/hybrid match. "
        "Profile fit gives up to 10 points for education, domain experience, and role relevance. "
        "Return JSON with keys: matches, skill_gap_products, finance_signal. "
        "matches must be an array of objects with job_id, job_title, match_score, matched_skills, missing_skills, reason. "
        "skill_gap_products must be an array of learning product objects with product_id, product_name, reason. "
        "finance_signal must be an object with level, reason, salary_pressure. "
        f"Known CVs: {CVS}. "
        f"Known jobs: {JOB_LISTINGS}. "
        f"Skill-gap products: {SKILL_GAP_PRODUCTS}."
    )


class HRAgent(BaseAgent):
    def __init__(self, **kwargs: object) -> None:
        super().__init__(system_prompt=_build_hr_prompt(), **kwargs)

    def match(self, cv_profile: Mapping[str, Any]) -> dict[str, Any]:
        prompt = (
            "Compare this CV against the job listings using the documented scoring methodology. "
            "Return valid JSON with keys matches, skill_gap_products, finance_signal. "
            f"CV profile: {dict(cv_profile)}"
        )
        return self.run_json(prompt)


hr_agent = HRAgent()