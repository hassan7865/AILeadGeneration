import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db_session
from app.schemas.signals import SignalOut
from app.services import signals_service
from app.utils.response import ok

router = APIRouter(prefix="/signals", tags=["Signals"], dependencies=[Depends(get_current_user)])


@router.get("")
async def list_signals(db: AsyncSession = Depends(get_db_session)):
    items = await signals_service.list_signals(db)
    return ok([SignalOut.model_validate(item) for item in items], "Signals fetched")


@router.get("/{signal_id}")
async def get_signal(signal_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)):
    item = await signals_service.get_signal(db, signal_id)
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Signal not found")
    return ok(SignalOut.model_validate(item), "Signal fetched")


@router.post("/refresh")
async def refresh_signals():
    return ok({"status": "queued"}, "Signal scan queued")
