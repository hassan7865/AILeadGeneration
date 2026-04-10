import uuid

from pydantic import BaseModel, ConfigDict

from app.models.entities import UserRole
from app.schemas.email_types import AccountEmail


class RegisterRequest(BaseModel):
    email: AccountEmail
    name: str
    password: str


class LoginRequest(BaseModel):
    email: AccountEmail
    password: str


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: AccountEmail
    name: str
    role: UserRole
