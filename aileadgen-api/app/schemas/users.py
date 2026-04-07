import uuid

from pydantic import BaseModel, EmailStr

from app.models.entities import UserRole


class InviteUserRequest(BaseModel):
    email: EmailStr
    name: str
    role: UserRole = UserRole.member


class UpdateUserRequest(BaseModel):
    name: str | None = None
    role: UserRole | None = None


class UserListOut(BaseModel):
    id: uuid.UUID
    email: EmailStr
    name: str
    role: UserRole
