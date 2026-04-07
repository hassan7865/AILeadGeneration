import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db_session
from app.schemas.automation import AutomationConfigUpdate
from app.services import automation_service
from app.utils.response import ok

router = APIRouter(prefix="/automation", tags=["Automation"], dependencies=[Depends(get_current_user)])


@router.get("/config")
async def get_config(db: AsyncSession = Depends(get_db_session)):
    return ok(await automation_service.get_config(db), "Automation config fetched")


@router.patch("/config")
async def update_config(payload: AutomationConfigUpdate, db: AsyncSession = Depends(get_db_session)):
    return ok(await automation_service.update_config(db, payload), "Automation config updated")


@router.post("/run")
async def run_pipeline(db: AsyncSession = Depends(get_db_session)):
    run = await automation_service.start_run(db)
    return ok({"run_id": str(run.id), "status": run.status}, "Pipeline run started")


@router.get("/runs")
async def list_runs(db: AsyncSession = Depends(get_db_session)):
    runs = await automation_service.list_runs(db)
    return ok([{"id": str(r.id), "status": r.status} for r in runs], "Pipeline runs fetched")


@router.get("/runs/{run_id}")
async def get_run(run_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)):
    run = await automation_service.get_run(db, run_id)
    if run is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Run not found")
    return ok({"id": str(run.id), "status": run.status, "logs": run.logs or []}, "Run fetched")
