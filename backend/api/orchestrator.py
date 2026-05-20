from __future__ import annotations

import os

from fastapi import APIRouter
from groq import Groq


router = APIRouter(tags=["orchestrator"])


@router.get("/health")
def health() -> dict[str, object]:
    groq_api_key = os.getenv("GROQ_API_KEY")

    if not groq_api_key:
        return {"status": "unhealthy", "groq_api_key": False}

    try:
        Groq(api_key=groq_api_key).models.list()
    except Exception as exc:
        return {"status": "unhealthy", "groq_api_key": True, "groq": False, "detail": str(exc)}

    return {"status": "ok", "groq_api_key": True, "groq": True}