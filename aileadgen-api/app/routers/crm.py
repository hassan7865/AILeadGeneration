import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db_session
from app.models.entities import User
from app.schemas.crm import CrmConnectRequest, CrmConnectionOut
from app.services import crm_service
from app.utils.response import ok

router = APIRouter(prefix="/crm", tags=["CRM"], dependencies=[Depends(get_current_user)])


@router.get("/connections")
async def list_connections(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    items = await crm_service.list_connections(db, user.id)
    return ok([CrmConnectionOut.model_validate(item) for item in items], "CRM connections fetched")


@router.post("/connect")
async def connect(payload: CrmConnectRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    item = await crm_service.create_connection(db, user.id, payload)
    return ok(CrmConnectionOut.model_validate(item), "CRM connected")


@router.get("/callback")
async def callback():
    return ok({"status": "connected"}, "CRM callback handled")


@router.delete("/connections/{connection_id}")
async def disconnect(connection_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)):
    await crm_service.delete_connection(db, connection_id)
    return ok(message="CRM disconnected")


@router.post("/sync")
async def sync():
    return ok({"status": "queued"}, "CRM sync queued")


@router.get("/sync-logs")
async def sync_logs():
    return ok([], "CRM sync logs fetched")
