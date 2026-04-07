import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import LeadSignal, Signal


async def list_signals(db: AsyncSession) -> list[Signal]:
    result = await db.scalars(select(Signal))
    return list(result.all())


async def get_signal(db: AsyncSession, signal_id: uuid.UUID) -> Signal | None:
    return await db.scalar(select(Signal).where(Signal.id == signal_id))


async def get_lead_signals(db: AsyncSession, lead_id: uuid.UUID) -> list[Signal]:
    result = await db.scalars(select(Signal).join(LeadSignal, LeadSignal.signal_id == Signal.id).where(LeadSignal.lead_id == lead_id))
    return list(result.all())
