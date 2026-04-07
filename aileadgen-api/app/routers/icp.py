import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db_session
from app.models.entities import IcpDefinition, User
from app.schemas.icp import IcpCreateRequest, IcpOut, IcpUpdateRequest
from app.services import icp_service
from app.utils.response import ok

router = APIRouter(prefix="/icp", tags=["ICP"], dependencies=[Depends(get_current_user)])


@router.get("")
async def list_icp(user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    items = await icp_service.list_icp(db, user.id)
    return ok([IcpOut(id=item.id, name=item.name, is_active=item.is_active) for item in items], "ICP fetched")


@router.post("")
async def create_icp(payload: IcpCreateRequest, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    item = await icp_service.create_icp(db, user.id, payload)
    return ok(IcpOut(id=item.id, name=item.name, is_active=item.is_active), "ICP created")


@router.patch("/{icp_id}")
async def update_icp(icp_id: uuid.UUID, payload: IcpUpdateRequest, db: AsyncSession = Depends(get_db_session)):
    item = await db.scalar(select(IcpDefinition).where(IcpDefinition.id == icp_id))
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ICP not found")
    updated = await icp_service.update_icp(db, item, payload)
    return ok(IcpOut(id=updated.id, name=updated.name, is_active=updated.is_active), "ICP updated")


@router.delete("/{icp_id}")
async def delete_icp(icp_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)):
    await icp_service.delete_icp(db, icp_id)
    return ok(message="ICP deleted")


@router.post("/{icp_id}/activate")
async def activate_icp(icp_id: uuid.UUID, user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db_session)):
    item = await db.scalar(select(IcpDefinition).where(IcpDefinition.id == icp_id))
    if item is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="ICP not found")
    updated = await icp_service.activate_icp(db, item, user.id)
    return ok(IcpOut(id=updated.id, name=updated.name, is_active=updated.is_active), "ICP activated")


@router.post("/{icp_id}/rescore")
async def rescore_icp(icp_id: uuid.UUID):
    return ok({"icp_id": str(icp_id), "job": "rescore-queued"}, "Rescore queued")
