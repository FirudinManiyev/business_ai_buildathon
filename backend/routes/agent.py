from fastapi import APIRouter, HTTPException
from typing import Any, Dict

from backend.agents.smartshop_agent import process as smartshop_process

router = APIRouter(prefix="/agent", tags=["agent"])


@router.post("/process")
def process_agent(payload: Dict[str, Any]):
    try:
        result = smartshop_process(payload)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
