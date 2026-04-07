import uuid
from datetime import datetime

from pydantic import BaseModel

from app.models.entities import CrmType


class CrmConnectRequest(BaseModel):
    crm_type: CrmType


class CrmConnectionOut(BaseModel):
    id: uuid.UUID
    crm_type: CrmType
    workspace_id: str | None
    is_active: bool
    last_synced_at: datetime | None
