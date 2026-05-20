from fastapi import FastAPI

from api.finance import router as finance_router
from api.hr import router as hr_router
from api.orchestrator import router as orchestrator_router
from api.sales import router as sales_router

app = FastAPI()

app.include_router(orchestrator_router, prefix="/api/orchestrator", tags=["orchestrator"])
app.include_router(sales_router, prefix="/api/sales", tags=["sales"])
app.include_router(hr_router, prefix="/api/hr", tags=["hr"])
app.include_router(finance_router, prefix="/api/finance", tags=["finance"])
