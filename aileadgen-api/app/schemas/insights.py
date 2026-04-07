import uuid
from datetime import datetime

from pydantic import BaseModel


class InsightsSummaryOut(BaseModel):
    total_leads: int
    qualified_count: int
    avg_score: float
    pipeline_value: float
    total_leads_change_pct: float | None = None
    qualified_change_pct: float | None = None
    pipeline_change_pct: float | None = None
    avg_score_label: str | None = None
    signals_last_7_days: int = 0


class LeadQualityPoint(BaseModel):
    day: str
    total: int
    qualified: int


class SignalEventOut(BaseModel):
    id: uuid.UUID
    company_name: str
    signal_type: str
    headline: str
    subtitle: str | None
    detected_at: datetime
    heat: str
