import uuid
from datetime import UTC, datetime

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import CrmConnection
from app.schemas.crm import CrmConnectRequest


async def list_connections(db: AsyncSession, user_id: uuid.UUID) -> list[CrmConnection]:
    result = await db.scalars(select(CrmConnection).where(CrmConnection.user_id == user_id))
    return list(result.all())


async def create_connection(db: AsyncSession, user_id: uuid.UUID, payload: CrmConnectRequest) -> CrmConnection:
    connection = CrmConnection(
        user_id=user_id,
        crm_type=payload.crm_type,
        access_token="placeholder-access",
        refresh_token="placeholder-refresh",
        workspace_id="workspace-demo",
        last_synced_at=datetime.now(UTC),
        is_active=True,
    )
    db.add(connection)
    await db.commit()
    await db.refresh(connection)
    return connection


async def delete_connection(db: AsyncSession, connection_id: uuid.UUID) -> None:
    await db.execute(delete(CrmConnection).where(CrmConnection.id == connection_id))
    await db.commit()
