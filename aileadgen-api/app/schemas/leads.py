import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict

from app.models.entities import LeadSource, LeadStatus


class LeadCreateRequest(BaseModel):
    company_name: str
    contact_first_name: str
    contact_last_name: str
    contact_email: str | None = None
    source: LeadSource = LeadSource.linkedin
    notes: str | None = None


class LeadUpdateRequest(BaseModel):
    status: LeadStatus | None = None
    assigned_to: uuid.UUID | None = None
    notes: str | None = None


class LeadOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    company_id: uuid.UUID
    contact_id: uuid.UUID
    icp_score: int
    status: LeadStatus
    source: LeadSource
    notes: str | None
    created_at: datetime
    updated_at: datetime


class LeadListItem(BaseModel):
    id: uuid.UUID
    company: str
    contact_name: str
    industry: str
    icp_score: int
    signal: str
    status: LeadStatus
    source: LeadSource
    added_at: datetime
