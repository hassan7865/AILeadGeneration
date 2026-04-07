import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import hash_password
from app.models.entities import User
from app.schemas.users import InviteUserRequest, UpdateUserRequest


async def list_users(db: AsyncSession) -> list[User]:
    result = await db.scalars(select(User))
    return list(result.all())


async def invite_user(db: AsyncSession, payload: InviteUserRequest) -> User:
    user = User(email=payload.email, name=payload.name, role=payload.role, hashed_password=hash_password("ChangeMe123!"))
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return user


async def update_user(user: User, payload: UpdateUserRequest, db: AsyncSession) -> User:
    if payload.name is not None:
        user.name = payload.name
    if payload.role is not None:
        user.role = payload.role
    await db.commit()
    await db.refresh(user)
    return user


async def delete_user(db: AsyncSession, user_id: uuid.UUID) -> None:
    await db.execute(delete(User).where(User.id == user_id))
    await db.commit()
