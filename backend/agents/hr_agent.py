from __future__ import annotations

import json
import re
import difflib
from collections.abc import Mapping
from typing import Any

try:
    from .base_agent import BaseAgent
    from ..utils.mock_data import CVS, JOB_LISTINGS, SKILL_GAP_PRODUCTS
except ImportError:
    from agents.base_agent import BaseAgent
    from utils.mock_data import CVS, JOB_LISTINGS, SKILL_GAP_PRODUCTS


def _build_hr_prompt() -> str:
    return (
        "You are an HR matching agent. Match each CV to the most relevant job listings and return only valid JSON. "
        "Use this scoring methodology to calculate match_score: "
        "1) skill_overlap = (intersection of required_skills and CV skills) / total_required_skills * 40; "
        "2) experience_alignment uses job min_experience and max_experience in years plus CV experience_years; "
        "score = 20 * (1 - abs((experience_years - min_experience) / 10)) and clamp it to 0-20; "
        "3) salary_alignment uses job salary_min, salary_max and candidate expected_salary; "
        "if expected_salary is inside the range, score 20; if the gap is greater than 20%, score 10; otherwise 0; "
        "4) location_fit gives 10 for exact match or remote OK, otherwise 0; "
        "5) profile_fit gives role relevance from 1 to 3 multiplied by 3.33, for up to 10 points. "
        "match_score = skill_overlap + experience_alignment + salary_alignment + location_fit + profile_fit. "
        "Return JSON with keys: matches, skill_gap_products, finance_signal. "
        "matches must be an array of objects with job_id, job_title, match_score, matched_skills, missing_skills, reason. "
        "skill_gap_products must be an array of learning product objects with product_id, product_name, reason. "
        "finance_signal must be an object with level, reason, salary_pressure. "
        f"Known CVs: {CVS}. "
        f"Known jobs: {JOB_LISTINGS}. "
        f"Skill-gap products: {SKILL_GAP_PRODUCTS}."
    )


class HRAgent(BaseAgent):
    temperature = 0.1

    def __init__(self, **kwargs: object) -> None:
        super().__init__(system_prompt=_build_hr_prompt(), **kwargs)

    def match(self, cv_profile: Mapping[str, Any], *, context: dict[str, Any] | None = None) -> dict[str, Any]:
        payload = dict(cv_profile)
        if context:
            payload.update(context)

        use_ai_check = bool(payload.get("use_ai_check") or payload.get("ai_check") or False)
        # If AI-check requested, run enrichment (local fuzzy-normalization acts as the AI step here).
        if use_ai_check:
            cv = self._ai_enrich_cv(payload.get("cv_data") or payload.get("cv") or payload)
        else:
            cv = self._normalize_cv(payload.get("cv_data") or payload.get("cv") or payload)
        jobs = self._resolve_jobs(payload)
        products = self._resolve_products(payload)

        job_matches: list[dict[str, Any]] = []
        missing_skill_buckets: list[tuple[str, int]] = []

        for job in jobs:
            required_skills = self._normalize_list(job.get("required_skills", []))
            matched_skills = []
            missing_skills = []
            for req in required_skills:
                found = self._find_best_skill_match(req, cv["skills"])
                if found:
                    matched_skills.append(req)
                else:
                    missing_skills.append(req)
            skill_overlap = self._skill_overlap_score(matched_skills, required_skills)
            experience_alignment = self._experience_alignment_score(cv, job)
            salary_alignment = self._salary_alignment_score(cv, job)
            location_fit = self._location_fit_score(cv, job)
            profile_fit, role_relevance = self._profile_fit_score(cv, job)
            match_score = round(skill_overlap + experience_alignment + salary_alignment + location_fit + profile_fit)
            match_score = max(0, min(100, match_score))

            if missing_skills:
                missing_skill_buckets.append((" ".join(missing_skills), match_score))

            job_matches.append(
                {
                    "job_id": job.get("id"),
                    "title": job.get("title"),
                    "job_title": job.get("title"),
                    "company_name": job.get("company_name"),
                    "match_score": int(match_score),
                    "reason": self._build_job_reason(matched_skills, missing_skills, role_relevance),
                    "matched_skills": matched_skills,
                    "missing_skills": missing_skills,
                }
            )

        job_matches.sort(key=lambda item: item["match_score"], reverse=True)

        product_suggestions = self._build_product_suggestions(job_matches, products)
        finance_signal = self._build_finance_signal(job_matches)

        top_match = job_matches[0] if job_matches else None
        if top_match and top_match["match_score"] < 50:
            summary_message = (
                f"Bu CV üçün uyğunluq zəifdir. Ən uyğun elan: {top_match['job_title']} ({top_match['match_score']} bal). "
                f"Çatışmayan bacarıqlar: {', '.join(top_match['missing_skills']) or 'yoxdur'}."
            )
        elif top_match and top_match["match_score"] < 100:
            summary_message = (
                f"Bu CV üçün ən uyğun elan: {top_match['job_title']} ({top_match['match_score']} bal). "
                f"Tam uyğun deyil, çatışmayan bacarıqlar: {', '.join(top_match['missing_skills']) or 'yoxdur'}."
            )
        else:
            summary_message = (
                f"Bu CV {top_match['job_title']} roluna tam uyğundur." if top_match else "Bu CV üçün uyğun elan tapılmadı."
            )

        report = {
            "role": "HR Agent",
            "message": "HR talent recommendation.",
            "summary_message": summary_message,
            "job_matches": job_matches,
            "product_suggestions": product_suggestions,
            "finance_signal": finance_signal,
            "ai_checked": use_ai_check,
            "cv_normalized": cv,
            # Backward-compatible aliases for the existing frontend/orchestrator.
            "matches": job_matches,
            "skill_gap_products": product_suggestions,
        }

        if missing_skill_buckets:
            report["missing_skill_summary"] = [
                {"skills": bucket, "score": score} for bucket, score in missing_skill_buckets[:5]
            ]

        return report

    def stream_report(self, cv_profile: Mapping[str, Any], *, context: dict[str, Any] | None = None):
        payload = json.dumps(self.match(cv_profile, context=context), ensure_ascii=False)
        for start in range(0, len(payload), 24):
            yield payload[start : start + 24]

    def _normalize_cv(self, cv_payload: Mapping[str, Any]) -> dict[str, Any]:
        return {
            "name": str(cv_payload.get("name") or cv_payload.get("full_name") or cv_payload.get("fullName") or "Unknown Candidate"),
            "education": cv_payload.get("education"),
            "skills": self._normalize_list(cv_payload.get("skills", [])),
            "experience": cv_payload.get("experience") or cv_payload.get("experience_years"),
            "experience_years": self._parse_years(cv_payload.get("experience_years") or cv_payload.get("experience")),
            "projects": cv_payload.get("projects"),
            "languages": self._normalize_list(cv_payload.get("languages", [])),
            "expected_salary": self._parse_salary(cv_payload.get("expected_salary")),
            "location": cv_payload.get("location"),
            "target_roles": self._normalize_list(cv_payload.get("target_roles", [])),
        }

    def _normalize_list(self, values: Any) -> list[str]:
        if isinstance(values, str):
            values = [values]
        if not isinstance(values, list):
            return []
        normalized = [self._normalize_skill(value) for value in values if isinstance(value, str) and value.strip()]
        return [skill for skill in normalized if skill]

    def _normalize_skill(self, value: str) -> str:
        cleaned = value.strip().lower()
        cleaned = cleaned.replace(".js", "js")
        cleaned = cleaned.replace("node.js", "node")
        cleaned = cleaned.replace("fastapi", "fastapi")
        cleaned = re.sub(r"\s+", " ", cleaned)
        return cleaned

    def _find_best_skill_match(self, required_skill: str, cv_skills: list[str]) -> str | None:
        """Return the best matching CV skill for a required skill (tolerant to case and typos).

        Returns the matched cv skill string if a close match was found, otherwise None.
        """
        if not required_skill:
            return None

        req = self._normalize_skill(required_skill)
        if not cv_skills:
            return None

        # exact
        if req in cv_skills:
            return req

        # substring / token containment
        for s in cv_skills:
            s_norm = self._normalize_skill(s)
            if req in s_norm or s_norm in req:
                return s_norm

        # use difflib close matches as a tolerant fallback
        candidates = [self._normalize_skill(s) for s in cv_skills]
        close = difflib.get_close_matches(req, candidates, n=1, cutoff=0.72)
        if close:
            return close[0]

        # sequence ratio check
        best_ratio = 0.0
        best = None
        for cand in candidates:
            ratio = difflib.SequenceMatcher(None, req, cand).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best = cand

        if best_ratio >= 0.72:
            return best

        return None

    def _ai_enrich_cv(self, cv_payload: Mapping[str, Any]) -> dict[str, Any]:
        """Perform a local "AI-like" enrichment of the CV by normalizing and correcting skill typos.

        This is intentionally deterministic: it uses the known job skill vocabulary and fuzzy
        matching to suggest corrected/normalized skills. If a real LLM integration is desired,
        this method can be replaced to call the external service and merge results here.
        """
        normalized = self._normalize_cv(cv_payload)

        # build canonical skill set from known job listings
        canonical_skills: set[str] = set()
        for job in JOB_LISTINGS.values():
            for s in self._normalize_list(job.get("required_skills", [])):
                canonical_skills.add(s)

        corrected: list[str] = []
        corrections_map: dict[str, str] = {}

        for s in normalized.get("skills", []):
            s_norm = self._normalize_skill(s)
            # if already canonical, keep
            if s_norm in canonical_skills:
                corrected.append(s_norm)
                continue

            # try to find close canonical skill
            match = difflib.get_close_matches(s_norm, list(canonical_skills), n=1, cutoff=0.78)
            if match:
                corrections_map[s] = match[0]
                corrected.append(match[0])
            else:
                # keep the normalized original as fallback
                corrected.append(s_norm)

        # deduplicate while preserving order
        seen = set()
        deduped = []
        for s in corrected:
            if s not in seen:
                deduped.append(s)
                seen.add(s)

        normalized["skills_corrected"] = deduped
        # expose combined skills (corrected first, then originals that weren't matched)
        combined = list(deduped)
        for s in normalized.get("skills", []):
            if s not in seen:
                combined.append(s)
                seen.add(s)

        normalized["skills"] = combined
        normalized["ai_corrections"] = corrections_map
        return normalized

    def _resolve_jobs(self, payload: dict[str, Any]) -> list[dict[str, Any]]:
        jobs = payload.get("job_listings") or payload.get("jobs")
        if isinstance(jobs, list) and jobs:
            return [dict(job) for job in jobs if isinstance(job, Mapping)]
        return [dict(job) for job in JOB_LISTINGS.values()]

    def _resolve_products(self, payload: dict[str, Any]) -> list[dict[str, Any]]:
        products = payload.get("skill_gap_products") or payload.get("products")
        if isinstance(products, list) and products:
            return [dict(product) for product in products if isinstance(product, Mapping)]
        return [dict(product) for product in SKILL_GAP_PRODUCTS.values()]

    def _build_job_reason(self, matched_skills: list[str], missing_skills: list[str], role_relevance: int) -> str:
        if not matched_skills:
            return "Bu rol üçün birbaşa skill uyğunluğu yoxdur."
        if not missing_skills:
            return f"Bu rol üçün skill-lər uyğun gəlir: {', '.join(matched_skills)}. Role relevance: {role_relevance}/3."
        return (
            f"Bu rol üçün {', '.join(matched_skills)} uyğun gəlir, amma hələ {', '.join(missing_skills)} çatışmır. Role relevance: {role_relevance}/3."
        )

    def _parse_years(self, value: Any) -> float | None:
        if value is None:
            return None
        if isinstance(value, (int, float)):
            return float(value)

        text = str(value).lower()
        match = re.search(r"(\d+(?:\.\d+)?)", text)
        if not match:
            return None
        return float(match.group(1))

    def _parse_salary(self, value: Any) -> float | None:
        parsed = self._parse_years(value)
        return parsed

    def _skill_overlap_score(self, matched_skills: list[str], required_skills: list[str]) -> float:
        if not required_skills:
            return 0.0
        return (len(matched_skills) / len(required_skills)) * 40

    def _experience_alignment_score(self, cv: Mapping[str, Any], job: Mapping[str, Any]) -> float:
        experience_years = cv.get("experience_years")
        if experience_years is None:
            experience_years = self._parse_years(cv.get("experience"))

        min_experience = job.get("min_experience")
        if min_experience is None:
            min_experience = self._parse_years(job.get("experience_years")) or 0.0

        if experience_years is None:
            return 0.0

        score = 20 * (1 - abs((float(experience_years) - float(min_experience)) / 10))
        return max(0.0, min(20.0, score))

    def _salary_alignment_score(self, cv: Mapping[str, Any], job: Mapping[str, Any]) -> float:
        expected_salary = cv.get("expected_salary")
        salary_min = self._parse_salary(job.get("salary_min")) or 0.0
        salary_max = self._parse_salary(job.get("salary_max")) or 0.0
        if expected_salary is None or salary_min <= 0 or salary_max <= 0:
            return 0.0

        expected_salary = float(expected_salary)
        if salary_min <= expected_salary <= salary_max:
            return 20.0

        nearest_bound = salary_min if expected_salary < salary_min else salary_max
        if nearest_bound <= 0:
            return 0.0

        gap_pct = abs(expected_salary - nearest_bound) / nearest_bound
        if gap_pct > 0.20:
            return 10.0
        return 0.0

    def _location_fit_score(self, cv: Mapping[str, Any], job: Mapping[str, Any]) -> float:
        cv_location = str(cv.get("location") or "").strip().lower()
        job_location = str(job.get("location") or "").strip().lower()
        if not cv_location or not job_location:
            return 0.0

        if cv_location == job_location:
            return 10.0

        if "remote" in job_location and cv_location in {"remote", "hybrid"}:
            return 10.0

        if "hybrid" in job_location and cv_location in {"remote", "hybrid"}:
            return 10.0

        return 0.0

    def _profile_fit_score(self, cv: Mapping[str, Any], job: Mapping[str, Any]) -> tuple[float, int]:
        target_roles = self._normalize_list(cv.get("target_roles", []))
        job_title = self._normalize_skill(str(job.get("title") or ""))
        education_text = str(cv.get("education") or "").lower()
        project_text = str(cv.get("projects") or "").lower()
        experience_text = str(cv.get("experience") or "").lower()

        relevance = 1
        if any(job_title in role or role in job_title for role in target_roles):
            relevance = 3
        elif any(keyword in education_text for keyword in job_title.split() if keyword):
            relevance = 2
        elif any(keyword in project_text or keyword in experience_text for keyword in job_title.split() if keyword):
            relevance = 2

        if cv.get("education") and cv.get("experience") and cv.get("projects"):
            relevance = max(relevance, 2)

        return min(10.0, relevance * 3.33), relevance

    def _build_product_suggestions(
        self,
        job_matches: list[dict[str, Any]],
        products: list[dict[str, Any]],
    ) -> list[dict[str, Any]]:
        suggestions: list[dict[str, Any]] = []
        used_product_ids: set[Any] = set()

        for match in job_matches:
            for missing_skill in match.get("missing_skills", []):
                product = self._find_product_for_skill(missing_skill, products)
                if not product:
                    continue

                product_id = product.get("id")
                if product_id in used_product_ids:
                    continue

                suggestions.append(
                    {
                        "product_id": product_id,
                        "name": product.get("name"),
                        "product_name": product.get("name"),
                        "reason": self._build_product_reason(product, missing_skill, match),
                    }
                )
                used_product_ids.add(product_id)

        return suggestions

    def _find_product_for_skill(self, missing_skill: str, products: list[dict[str, Any]]) -> dict[str, Any] | None:
        normalized = self._normalize_skill(missing_skill)
        priority_keywords = [normalized]
        if normalized in {"sql", "excel", "dashboarding"}:
            priority_keywords.extend(["sql", "excel", "dashboard"])
        if normalized in {"recruitment", "interviews", "onboarding"}:
            priority_keywords.extend(["interview", "onboarding", "hr"])
        if normalized in {"crm", "sales", "negotiation"}:
            priority_keywords.extend(["crm", "sales"])

        for product in products:
            haystack = f"{product.get('name', '')} {product.get('description', '')}".lower()
            if any(keyword in haystack for keyword in priority_keywords if keyword):
                return product

        return None

    def _build_product_reason(self, product: dict[str, Any], missing_skill: str, match: dict[str, Any]) -> str:
        return (
            f"Bu məhsul '{missing_skill}' skill-inı gücləndirər və {match.get('job_title') or match.get('title')} roluna yaxınlaşdırar."
        )

    def _build_finance_signal(self, job_matches: list[dict[str, Any]]) -> dict[str, Any]:
        top_score = job_matches[0]["match_score"] if job_matches else 0
        if top_score >= 70:
            level = "high"
        elif top_score >= 40:
            level = "medium"
        else:
            level = "low"

        return {
            "level": level,
            "reason": "Ən uyğun iş elanının balına əsasən hesablanıb.",
            "salary_pressure": max(0, 100 - top_score),
        }


hr_agent = HRAgent()