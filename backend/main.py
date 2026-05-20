from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.finance import router as finance_router
from .api.hr import router as hr_router
from .api.orchestrator import router as orchestrator_router
from .api.sales import router as sales_router

app = FastAPI()

# Allow frontend dev server and local tools to access the API
app.add_middleware(
	CORSMiddleware,
	allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000"],
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
	return {"status": "ok"}

app.include_router(orchestrator_router, prefix="/api/orchestrator", tags=["orchestrator"])
app.include_router(sales_router, prefix="/api/sales", tags=["sales"])
app.include_router(hr_router, prefix="/api/hr", tags=["hr"])
app.include_router(finance_router, prefix="/api/finance", tags=["finance"])
