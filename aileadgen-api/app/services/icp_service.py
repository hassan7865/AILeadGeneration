import uuid

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import IcpDefinition
from app.schemas.icp import IcpCreateRequest, IcpUpdateRequest


async def list_icp(db: AsyncSession, user_id: uuid.UUID) -> list[IcpDefinition]:
    result = await db.scalars(select(IcpDefinition).where(IcpDefinition.user_id == user_id))
    return list(result.all())


async def create_icp(db: AsyncSession, user_id: uuid.UUID, payload: IcpCreateRequest) -> IcpDefinition:
    icp = IcpDefinition(user_id=user_id, **payload.model_dump())
    db.add(icp)
    await db.commit()
    await db.refresh(icp)
    return icp


async def update_icp(db: AsyncSession, icp: IcpDefinition, payload: IcpUpdateRequest) -> IcpDefinition:
    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(icp, key, value)
    await db.commit()
    await db.refresh(icp)
    return icp


async def delete_icp(db: AsyncSession, icp_id: uuid.UUID) -> None:
    await db.execute(delete(IcpDefinition).where(IcpDefinition.id == icp_id))
    await db.commit()


async def activate_icp(db: AsyncSession, icp: IcpDefinition, user_id: uuid.UUID) -> IcpDefinition:
    await db.execute(update(IcpDefinition).where(IcpDefinition.user_id == user_id).values(is_active=False))
    icp.is_active = True
    await db.commit()
    await db.refresh(icp)
    return icp
