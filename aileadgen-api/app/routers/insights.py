from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db_session
from app.services import insights_service
from app.utils.response import ok

router = APIRouter(prefix="/insights", tags=["Insights"], dependencies=[Depends(get_current_user)])


@router.get("/summary")
async def summary(db: AsyncSession = Depends(get_db_session)):
    return ok(await insights_service.summary(db), "Insights summary fetched")


@router.get("/lead-quality")
async def lead_quality(db: AsyncSession = Depends(get_db_session), days: int = Query(default=30, ge=1, le=90)):
    return ok(await insights_service.lead_quality_series(db, days=days), "Lead quality fetched")


@router.get("/signal-sources")
async def signal_sources(db: AsyncSession = Depends(get_db_session)):
    return ok(await insights_service.signal_sources_breakdown(db), "Signal sources fetched")


@router.get("/icp-health")
async def icp_health(db: AsyncSession = Depends(get_db_session)):
    data = await insights_service.icp_segment_distribution(db)
    avg_match = await insights_service.icp_match_average_pct(db)
    return ok({"segments": data, "match_avg_pct": avg_match}, "ICP health fetched")


@router.get("/signal-events")
async def signal_events(db: AsyncSession = Depends(get_db_session), limit: int = Query(default=20, ge=1, le=50)):
    return ok(await insights_service.recent_signal_events(db, limit=limit), "Signal events fetched")


@router.get("/top-sources")
async def top_sources(db: AsyncSession = Depends(get_db_session)):
    return ok(await insights_service.top_sources_quality(db), "Top sources fetched")
