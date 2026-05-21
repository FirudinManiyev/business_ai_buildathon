from __future__ import annotations

from typing import Any
import json

from fastapi import APIRouter
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from agents.hr_agent import hr_agent
from utils.mock_data import CVS, JOB_LISTINGS


router = APIRouter()


class CVProfile(BaseModel):
    name: str
    education: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience_years: str | None = None
    projects: list[str] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)


class HRAnalyzeRequest(BaseModel):
    cv: CVProfile
    stream: bool = False


@router.get("/jobs")
def list_jobs() -> list[dict[str, Any]]:
    return list(JOB_LISTINGS.values())


@router.get("/test")
def test_hr() -> dict[str, Any]:
    return hr_agent.match(CVS["cv_amina"])


def _hr_sse_stream(cv_payload: dict[str, Any]):
    prompt = (
        "Compare this CV against the job listings using the documented scoring methodology. "
        "Return valid JSON with keys matches, skill_gap_products, finance_signal. "
        f"CV profile: {cv_payload}"
    )

    for chunk in hr_agent.stream(prompt, context={"cv_data": cv_payload, "job_listings": list(JOB_LISTINGS.values())}):
        yield f"data: {json.dumps({'token': chunk})}\n\n"

    yield "data: [DONE]\n\n"


@router.post("/analyze")
def analyze_hr(request: HRAnalyzeRequest):
    cv_payload = request.cv.model_dump()

    # Normalize skills to lowercase
    if "skills" in cv_payload and isinstance(cv_payload["skills"], list):
        cv_payload["skills"] = [s.lower() for s in cv_payload["skills"] if isinstance(s, str)]

    if request.stream:
        return StreamingResponse(_hr_sse_stream(cv_payload), media_type="text/event-stream")

    return hr_agent.match(cv_payload, context={"job_listings": list(JOB_LISTINGS.values())})