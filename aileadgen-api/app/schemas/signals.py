import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel

from app.models.entities import SignalType


class SignalOut(BaseModel):
    id: uuid.UUID
    company_id: uuid.UUID
    signal_type: SignalType
    signal_data: dict[str, Any] | None
    detected_at: datetime
    source_url: str | None
