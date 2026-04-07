import uuid

from pydantic import BaseModel


class IcpCreateRequest(BaseModel):
    name: str
    industries: list[str] = []
    company_size_min: int | None = None
    company_size_max: int | None = None
    geographies: list[str] = []
    tech_stack_required: list[str] = []
    scoring_weights: dict[str, float] = {}


class IcpUpdateRequest(BaseModel):
    name: str | None = None
    industries: list[str] | None = None
    company_size_min: int | None = None
    company_size_max: int | None = None
    geographies: list[str] | None = None
    tech_stack_required: list[str] | None = None
    scoring_weights: dict[str, float] | None = None
    is_active: bool | None = None


class IcpOut(BaseModel):
    id: uuid.UUID
    name: str
    is_active: bool
