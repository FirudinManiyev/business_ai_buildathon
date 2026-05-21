from __future__ import annotations

from typing import Any
import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

try:
    from ..agents.hr_agent import hr_agent
    from ..utils.mock_data import CVS, JOB_LISTINGS
except ImportError:
    from agents.hr_agent import hr_agent
    from utils.mock_data import CVS, JOB_LISTINGS


router = APIRouter()


class CVProfile(BaseModel):
    name: str
    education: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience: str | None = None
    experience_years: float | int | str | None = None
    projects: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    expected_salary: float | int | str | None = None
    location: str | None = None
    target_roles: list[str] = Field(default_factory=list)


class HRAnalyzeRequest(BaseModel):
    cv: CVProfile
    stream: bool = False
    use_ai_check: bool = False


@router.get("/jobs")
def list_jobs() -> list[dict[str, Any]]:
    return list(JOB_LISTINGS.values())


@router.get("/test")
def test_hr() -> dict[str, Any]:
    return hr_agent.match(CVS["cv_amina"])


def _hr_sse_stream(cv_payload: dict[str, Any]):
    for chunk in hr_agent.stream_report(cv_payload, context={"job_listings": list(JOB_LISTINGS.values())}):
        yield f"data: {json.dumps({'token': chunk})}\n\n"

    yield "data: [DONE]\n\n"


@router.post("/analyze")
def analyze_hr(request: HRAnalyzeRequest):
    cv_payload = request.cv.model_dump()

    # Normalize skills to lowercase
    if "skills" in cv_payload and isinstance(cv_payload["skills"], list):
        cv_payload["skills"] = [s.lower() for s in cv_payload["skills"] if isinstance(s, str)]

    context = {"job_listings": list(JOB_LISTINGS.values())}
    if request.use_ai_check:
        # forward flag to agent so it can run enrichment/AI-check
        cv_payload["use_ai_check"] = True
        context["use_ai_check"] = True

    if request.stream:
        return StreamingResponse(_hr_sse_stream(cv_payload), media_type="text/event-stream")

    return hr_agent.match(cv_payload, context=context)