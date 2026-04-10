import uuid

from pydantic import BaseModel

from app.models.entities import UserRole
from app.schemas.email_types import AccountEmail


class InviteUserRequest(BaseModel):
    email: AccountEmail
    name: str
    role: UserRole = UserRole.member


class UpdateUserRequest(BaseModel):
    name: str | None = None
    role: UserRole | None = None


class UserListOut(BaseModel):
    id: uuid.UUID
    email: AccountEmail
    name: str
    role: UserRole
