import os

from dotenv import load_dotenv
from fastapi import FastAPI
from groq import Groq

load_dotenv()

app = FastAPI()

groq_api_key = os.getenv("GROQ_API_KEY")
client = Groq(api_key=groq_api_key) if groq_api_key else None


@app.get("/health")
def health() -> dict[str, object]:
    if client is None:
        return {"status": "unhealthy", "groq_api_key": False}

    try:
        client.models.list()
    except Exception as exc:
        return {
            "status": "unhealthy",
            "groq_api_key": True,
            "groq": False,
            "detail": str(exc),
        }

    return {"status": "ok", "groq_api_key": True, "groq": True}