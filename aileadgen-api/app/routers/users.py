import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db_session
from app.models.entities import User
from app.schemas.users import InviteUserRequest, UpdateUserRequest, UserListOut
from app.services import users_service
from app.utils.response import ok

router = APIRouter(prefix="/users", tags=["Users"], dependencies=[Depends(get_current_user)])


@router.get("")
async def list_users(db: AsyncSession = Depends(get_db_session)):
    users = await users_service.list_users(db)
    return ok([UserListOut.model_validate(item) for item in users], "Users fetched")


@router.post("/invite")
async def invite_user(payload: InviteUserRequest, db: AsyncSession = Depends(get_db_session)):
    user = await users_service.invite_user(db, payload)
    return ok(UserListOut.model_validate(user), "User invited")


@router.patch("/{user_id}")
async def update_user(user_id: uuid.UUID, payload: UpdateUserRequest, db: AsyncSession = Depends(get_db_session)):
    user = await db.scalar(select(User).where(User.id == user_id))
    if user is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    updated = await users_service.update_user(user, payload, db)
    return ok(UserListOut.model_validate(updated), "User updated")


@router.delete("/{user_id}")
async def delete_user(user_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)):
    await users_service.delete_user(db, user_id)
    return ok(message="User deleted")
