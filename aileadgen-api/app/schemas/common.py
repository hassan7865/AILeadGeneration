import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict


class ORMBase(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class IdModel(ORMBase):
    id: uuid.UUID


class TimestampModel(ORMBase):
    created_at: datetime
    updated_at: datetime
