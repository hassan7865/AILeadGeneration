import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import AUTOMATION_SETTINGS_SINGLETON_ID, AutomationSettings, PipelineRun
from app.schemas.automation import AutomationConfigOut, AutomationConfigUpdate


def _to_out(row: AutomationSettings) -> AutomationConfigOut:
    return AutomationConfigOut(
        daily_refresh=row.daily_refresh,
        refresh_time=row.refresh_time,
        sources={k: bool(v) for k, v in (row.sources or {}).items()},
        target_industries=[str(v) for v in (row.target_industries or [])],
        company_size_min=int(row.company_size_min),
        company_size_max=int(row.company_size_max),
        geography=row.geography,
        tech_stack=[str(v) for v in (row.tech_stack or [])],
        crm_connections={k: bool(v) for k, v in (row.crm_connections or {}).items()},
    )


async def get_config(db: AsyncSession) -> AutomationConfigOut:
    row = await db.get(AutomationSettings, AUTOMATION_SETTINGS_SINGLETON_ID)
    if row is None:
        row = AutomationSettings(
            id=AUTOMATION_SETTINGS_SINGLETON_ID,
            daily_refresh=True,
            refresh_time="08:00 AM",
            sources={"linkedin": True, "crunchbase": True, "apollo": True, "jobboard": True},
            target_industries=["SaaS", "FinTech", "HealthTech"],
            company_size_min=1,
            company_size_max=500,
            geography="na",
            tech_stack=["React", "AWS"],
            crm_connections={"hubspot": False, "salesforce": False, "pipedrive": False},
        )
        db.add(row)
        await db.commit()
        await db.refresh(row)
    return _to_out(row)


async def update_config(db: AsyncSession, payload: AutomationConfigUpdate) -> AutomationConfigOut:
    row = await db.get(AutomationSettings, AUTOMATION_SETTINGS_SINGLETON_ID)
    if row is None:
        row = AutomationSettings(
            id=AUTOMATION_SETTINGS_SINGLETON_ID,
            daily_refresh=payload.daily_refresh,
            refresh_time=payload.refresh_time,
            sources=payload.model_dump()["sources"],
            target_industries=payload.target_industries,
            company_size_min=payload.company_size_min,
            company_size_max=payload.company_size_max,
            geography=payload.geography,
            tech_stack=payload.tech_stack,
            crm_connections=payload.crm_connections,
        )
        db.add(row)
    else:
        row.daily_refresh = payload.daily_refresh
        row.refresh_time = payload.refresh_time
        row.sources = payload.model_dump()["sources"]
        row.target_industries = payload.target_industries
        row.company_size_min = payload.company_size_min
        row.company_size_max = payload.company_size_max
        row.geography = payload.geography
        row.tech_stack = payload.tech_stack
        row.crm_connections = payload.crm_connections
    await db.commit()
    await db.refresh(row)
    return _to_out(row)


async def start_run(db: AsyncSession) -> PipelineRun:
    run = PipelineRun(status="running", started_at=datetime.now(UTC), logs=["scan", "score", "sync"])
    db.add(run)
    await db.commit()
    await db.refresh(run)
    return run


async def list_runs(db: AsyncSession, limit: int = 50) -> list[PipelineRun]:
    result = await db.scalars(select(PipelineRun).order_by(PipelineRun.started_at.desc()).limit(limit))
    return list(result.all())


async def get_run(db: AsyncSession, run_id: uuid.UUID) -> PipelineRun | None:
    return await db.get(PipelineRun, run_id)
