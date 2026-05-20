from fastapi import FastAPI
from api.finance import router as finance_router
from api.hr import router as hr_router
from api.orchestrator import router as orchestrator_router
from api.sales import router as sales_router

app = FastAPI()

app.include_router(orchestrator_router)
app.include_router(sales_router)
app.include_router(hr_router)
app.include_router(finance_router)
