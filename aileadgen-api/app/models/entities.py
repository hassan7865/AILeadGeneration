import enum
import uuid
from datetime import UTC, datetime
from typing import Any

from sqlalchemy import JSON, Boolean, DateTime, Enum, ForeignKey, Integer, String, event
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class AgencyPlan(str, enum.Enum):
    starter = "starter"
    pro = "pro"
    enterprise = "enterprise"


class UserRole(str, enum.Enum):
    admin = "admin"
    member = "member"


class LeadStatus(str, enum.Enum):
    new = "new"
    contacted = "contacted"
    qualified = "qualified"
    disqualified = "disqualified"


class LeadSource(str, enum.Enum):
    linkedin = "linkedin"
    crunchbase = "crunchbase"
    apollo = "apollo"
    jobboard = "jobboard"


class SignalType(str, enum.Enum):
    funding_round = "funding_round"
    hiring_surge = "hiring_surge"
    leadership_change = "leadership_change"
    expansion = "expansion"


class CrmType(str, enum.Enum):
    hubspot = "hubspot"
    salesforce = "salesforce"
    pipedrive = "pipedrive"


class SyncDirection(str, enum.Enum):
    push = "push"
    pull = "pull"


class SyncStatus(str, enum.Enum):
    success = "success"
    failed = "failed"


class JobStatus(str, enum.Enum):
    queued = "queued"
    running = "running"
    done = "done"
    failed = "failed"


class Agency(Base, TimestampMixin):
    __tablename__ = "agencies"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255))
    plan: Mapped[AgencyPlan] = mapped_column(Enum(AgencyPlan), default=AgencyPlan.starter)
    seats: Mapped[int] = mapped_column(Integer, default=1)
    users: Mapped[list["User"]] = relationship(back_populates="agency", lazy="selectin")


class User(Base, TimestampMixin):
    __tablename__ = "users"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255))
    hashed_password: Mapped[str] = mapped_column(String(255))
    role: Mapped[UserRole] = mapped_column(Enum(UserRole), default=UserRole.member)
    agency_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("agencies.id"))
    agency: Mapped[Agency | None] = relationship(back_populates="users", lazy="selectin")


class Company(Base, TimestampMixin):
    __tablename__ = "companies"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(255), index=True)
    website: Mapped[str | None] = mapped_column(String(255))
    industry: Mapped[str | None] = mapped_column(String(120))
    size_range: Mapped[str | None] = mapped_column(String(60))
    geography: Mapped[str | None] = mapped_column(String(120))
    tech_stack: Mapped[list[str] | None] = mapped_column(JSON)
    founded_year: Mapped[int | None] = mapped_column(Integer)
    funding_stage: Mapped[str | None] = mapped_column(String(60))
    total_funding: Mapped[str | None] = mapped_column(String(80))
    employee_count: Mapped[int | None] = mapped_column(Integer)


class Contact(Base, TimestampMixin):
    __tablename__ = "contacts"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id"), index=True)
    first_name: Mapped[str] = mapped_column(String(120))
    last_name: Mapped[str] = mapped_column(String(120))
    email: Mapped[str | None] = mapped_column(String(255), index=True)
    phone: Mapped[str | None] = mapped_column(String(64))
    linkedin_url: Mapped[str | None] = mapped_column(String(255))
    job_title: Mapped[str | None] = mapped_column(String(255))
    seniority_level: Mapped[str | None] = mapped_column(String(120))
    is_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    email_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    company: Mapped[Company] = relationship(lazy="selectin")


class Lead(Base, TimestampMixin):
    __tablename__ = "leads"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    contact_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("contacts.id"))
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id"))
    icp_score: Mapped[int] = mapped_column(Integer, default=0)
    status: Mapped[LeadStatus] = mapped_column(Enum(LeadStatus), default=LeadStatus.new)
    assigned_to: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"))
    source: Mapped[LeadSource] = mapped_column(Enum(LeadSource), default=LeadSource.linkedin)
    notes: Mapped[str | None] = mapped_column(String(2000))
    contact: Mapped[Contact] = relationship(lazy="selectin")
    company: Mapped[Company] = relationship(lazy="selectin")
    assignee: Mapped[User | None] = relationship(lazy="selectin")


class Signal(Base):
    __tablename__ = "signals"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    company_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("companies.id"), index=True)
    signal_type: Mapped[SignalType] = mapped_column(Enum(SignalType))
    signal_data: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    source_url: Mapped[str | None] = mapped_column(String(255))


class LeadSignal(Base):
    __tablename__ = "lead_signals"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id"), index=True)
    signal_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("signals.id"), index=True)


class IcpDefinition(Base, TimestampMixin):
    __tablename__ = "icp_definitions"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(255))
    industries: Mapped[list[str] | None] = mapped_column(JSON)
    company_size_min: Mapped[int | None] = mapped_column(Integer)
    company_size_max: Mapped[int | None] = mapped_column(Integer)
    geographies: Mapped[list[str] | None] = mapped_column(JSON)
    tech_stack_required: Mapped[list[str] | None] = mapped_column(JSON)
    scoring_weights: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)


class ScoringHistory(Base):
    __tablename__ = "scoring_history"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id"), index=True)
    old_score: Mapped[int] = mapped_column(Integer)
    new_score: Mapped[int] = mapped_column(Integer)
    reason: Mapped[str | None] = mapped_column(String(512))
    scored_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class CrmConnection(Base):
    __tablename__ = "crm_connections"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), index=True)
    crm_type: Mapped[CrmType] = mapped_column(Enum(CrmType))
    access_token: Mapped[str] = mapped_column(String(4000))
    refresh_token: Mapped[str | None] = mapped_column(String(4000))
    workspace_id: Mapped[str | None] = mapped_column(String(255))
    last_synced_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)


class SyncLog(Base):
    __tablename__ = "sync_logs"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    crm_connection_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("crm_connections.id"))
    lead_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id"))
    direction: Mapped[SyncDirection] = mapped_column(Enum(SyncDirection))
    status: Mapped[SyncStatus] = mapped_column(Enum(SyncStatus))
    error_message: Mapped[str | None] = mapped_column(String(1000))
    synced_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))


class EnrichmentJob(Base):
    __tablename__ = "enrichment_jobs"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lead_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("leads.id"), index=True)
    status: Mapped[JobStatus] = mapped_column(Enum(JobStatus), default=JobStatus.queued)
    sources_used: Mapped[list[str] | None] = mapped_column(JSON)
    result_data: Mapped[dict[str, Any] | None] = mapped_column(JSON)
    started_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))


AUTOMATION_SETTINGS_SINGLETON_ID = uuid.UUID("00000000-0000-4000-8000-000000000001")


class AutomationSettings(Base, TimestampMixin):
    __tablename__ = "automation_settings"
    id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), primary_key=True, default=lambda: AUTOMATION_SETTINGS_SINGLETON_ID
    )
    daily_refresh: Mapped[bool] = mapped_column(Boolean, default=True)
    refresh_time: Mapped[str] = mapped_column(String(32), default="08:00 AM")
    sources: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)
    target_industries: Mapped[list[str]] = mapped_column(JSON, default=list)
    company_size_min: Mapped[int] = mapped_column(Integer, default=1)
    company_size_max: Mapped[int] = mapped_column(Integer, default=1000)
    geography: Mapped[str] = mapped_column(String(32), default="na")
    tech_stack: Mapped[list[str]] = mapped_column(JSON, default=list)
    crm_connections: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)


class PipelineRun(Base):
    __tablename__ = "pipeline_runs"
    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    status: Mapped[str] = mapped_column(String(32), default="running")
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(UTC))
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    logs: Mapped[list[str] | None] = mapped_column(JSON)


@event.listens_for(Base, "before_update", propagate=True)
def _update_timestamp(_: type[Base], __: object, target: object) -> None:
    if hasattr(target, "updated_at"):
        setattr(target, "updated_at", datetime.now(UTC))
