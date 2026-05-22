from __future__ import annotations

from typing import Any
import json

from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy import select

try:
    from ..agents.hr_agent import hr_agent
    from ..db import SessionLocal
    from ..models.application import Application
    from ..models.job import Job
    from ..utils.mock_data import CVS
except ImportError:
    from agents.hr_agent import hr_agent
    from db import SessionLocal
    from models.application import Application
    from models.job import Job
    from utils.mock_data import CVS


router = APIRouter()


class CVProfile(BaseModel):
    name: str
    email: str | None = None
    phone: str | None = None
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


class ApplicationSubmitRequest(BaseModel):
    job_id: int
    cv: CVProfile


class ApplicationActionRequest(BaseModel):
    status: str = Field(pattern="^(accepted|rejected)$")
    admin_message: str | None = None


class JobUpsertRequest(BaseModel):
    title: str
    company_name: str | None = None
    required_skills: list[str] = Field(default_factory=list)
    experience_years: str | None = None
    salary_min: float | None = None
    salary_max: float | None = None
    location: str | None = None


def _job_payloads(session) -> list[dict[str, Any]]:
    jobs = session.execute(select(Job).order_by(Job.created_at.desc())).scalars().all()
    return [
        {
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name,
            "required_skills": job.required_skills or [],
            "experience_years": job.experience_years,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "location": job.location,
        }
        for job in jobs
    ]


@router.get("/jobs")
def list_jobs() -> list[dict[str, Any]]:
    session = SessionLocal()
    try:
        return _job_payloads(session)
    finally:
        session.close()


@router.post("/jobs")
def create_job(request: JobUpsertRequest) -> dict[str, Any]:
    session = SessionLocal()
    try:
        job = Job(
            title=request.title,
            company_name=request.company_name,
            required_skills=request.required_skills,
            experience_years=request.experience_years,
            salary_min=request.salary_min,
            salary_max=request.salary_max,
            location=request.location,
        )
        session.add(job)
        session.commit()
        session.refresh(job)
        return {
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name,
            "required_skills": job.required_skills or [],
            "experience_years": job.experience_years,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "location": job.location,
        }
    finally:
        session.close()


@router.put("/jobs/{job_id}")
def update_job(job_id: int, request: JobUpsertRequest) -> dict[str, Any]:
    session = SessionLocal()
    try:
        job = session.get(Job, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        job.title = request.title
        job.company_name = request.company_name
        job.required_skills = request.required_skills
        job.experience_years = request.experience_years
        job.salary_min = request.salary_min
        job.salary_max = request.salary_max
        job.location = request.location
        session.commit()
        session.refresh(job)
        return {
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name,
            "required_skills": job.required_skills or [],
            "experience_years": job.experience_years,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "location": job.location,
        }
    finally:
        session.close()


@router.delete("/jobs/{job_id}")
def delete_job(job_id: int) -> dict[str, bool]:
    session = SessionLocal()
    try:
        job = session.get(Job, job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        session.delete(job)
        session.commit()
        return {"deleted": True}
    finally:
        session.close()


@router.get("/applications")
def list_applications(job_id: int | None = None) -> list[dict[str, Any]]:
    session = SessionLocal()
    try:
        query = select(Application)
        if job_id is not None:
            query = query.where(Application.job_id == job_id)
        applications = session.execute(query.order_by(Application.created_at.desc())).scalars().all()
        return [
            {
                "id": app.id,
                "job_id": app.job_id,
                "job_title": app.job_title,
                "applicant_name": app.applicant_name,
                "applicant_email": app.applicant_email,
                "applicant_phone": app.applicant_phone,
                "cv": app.cv_payload,
                "status": app.status,
                "admin_message": app.admin_message,
                "created_at": app.created_at,
                "updated_at": app.updated_at,
            }
            for app in applications
        ]
    finally:
        session.close()


@router.get("/test")
def test_hr() -> dict[str, Any]:
    return hr_agent.match(CVS["cv_amina"])


@router.post("/apply")
def apply_job(request: ApplicationSubmitRequest) -> dict[str, Any]:
    session = SessionLocal()
    try:
        job = session.get(Job, request.job_id)
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")

        job_payload = {
            "id": job.id,
            "title": job.title,
            "company_name": job.company_name,
            "required_skills": job.required_skills or [],
            "experience_years": job.experience_years,
            "salary_min": job.salary_min,
            "salary_max": job.salary_max,
            "location": job.location,
        }

        cv_payload = request.cv.model_dump()
        if "skills" in cv_payload and isinstance(cv_payload["skills"], list):
            cv_payload["skills"] = [s.lower() for s in cv_payload["skills"] if isinstance(s, str)]

        match_result = hr_agent.match(cv_payload, context={"job_listings": [job_payload]})
        top_match = match_result.get("matches", [{}])[0] if match_result.get("matches") else {}

        existing = session.execute(
            select(Application).where(
                Application.job_id == request.job_id,
                Application.applicant_email == (cv_payload.get("email") or ""),
            )
        ).scalars().first()
        if existing:
            existing.cv_payload = cv_payload
            existing.status = existing.status or "pending"
            existing.job_title = job_payload.get("title", existing.job_title)
            existing.applicant_name = cv_payload.get("name") or cv_payload.get("full_name") or existing.applicant_name
            existing.applicant_phone = cv_payload.get("phone") or existing.applicant_phone
            session.commit()
            session.refresh(existing)
            app = existing
        else:
            app = Application(
                job_id=request.job_id,
                job_title=job_payload.get("title", ""),
                applicant_name=cv_payload.get("name") or cv_payload.get("full_name") or "",
                applicant_email=cv_payload.get("email") or "",
                applicant_phone=cv_payload.get("phone") or None,
                cv_payload=cv_payload,
                status="pending",
                admin_message=None,
            )
            session.add(app)
            session.commit()
            session.refresh(app)

        return {
            "application_id": app.id,
            "job_id": app.job_id,
            "job_title": app.job_title,
            "status": app.status,
            "match": top_match,
            "application": {
                "id": app.id,
                "job_id": app.job_id,
                "job_title": app.job_title,
                "applicant_name": app.applicant_name,
                "applicant_email": app.applicant_email,
                "applicant_phone": app.applicant_phone,
                "cv": app.cv_payload,
                "status": app.status,
                "admin_message": app.admin_message,
                "created_at": app.created_at,
                "updated_at": app.updated_at,
            },
        }
    finally:
        session.close()


@router.post("/applications/{application_id}/action")
def action_application(application_id: int, request: ApplicationActionRequest) -> dict[str, Any]:
    session = SessionLocal()
    try:
        app = session.get(Application, application_id)
        if not app:
            raise HTTPException(status_code=404, detail="Application not found")
        app.status = request.status
        app.admin_message = request.admin_message
        session.commit()
        session.refresh(app)
        return {
            "id": app.id,
            "job_id": app.job_id,
            "job_title": app.job_title,
            "applicant_name": app.applicant_name,
            "applicant_email": app.applicant_email,
            "applicant_phone": app.applicant_phone,
            "cv": app.cv_payload,
            "status": app.status,
            "admin_message": app.admin_message,
            "created_at": app.created_at,
            "updated_at": app.updated_at,
        }
    finally:
        session.close()


def _hr_sse_stream(cv_payload: dict[str, Any]):
    session = SessionLocal()
    try:
        job_listings = _job_payloads(session)
    finally:
        session.close()

    for chunk in hr_agent.stream_report(cv_payload, context={"job_listings": job_listings}):
        yield f"data: {json.dumps({'token': chunk})}\n\n"

    yield "data: [DONE]\n\n"


@router.post("/analyze")
def analyze_hr(request: HRAnalyzeRequest):
    cv_payload = request.cv.model_dump()

    # Normalize skills to lowercase
    if "skills" in cv_payload and isinstance(cv_payload["skills"], list):
        cv_payload["skills"] = [s.lower() for s in cv_payload["skills"] if isinstance(s, str)]

    session = SessionLocal()
    try:
        context = {"job_listings": _job_payloads(session)}
    finally:
        session.close()
    if request.use_ai_check:
        # forward flag to agent so it can run enrichment/AI-check
        cv_payload["use_ai_check"] = True
        context["use_ai_check"] = True

    if request.stream:
        return StreamingResponse(_hr_sse_stream(cv_payload), media_type="text/event-stream")

    return hr_agent.match(cv_payload, context=context)