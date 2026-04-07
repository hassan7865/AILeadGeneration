"""initial schema

Revision ID: 20260407_01
Revises:
Create Date: 2026-04-07
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "20260407_01"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "agencies",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("plan", sa.Enum("starter", "pro", "enterprise", name="agencyplan"), nullable=False),
        sa.Column("seats", sa.Integer(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "users",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("hashed_password", sa.String(length=255), nullable=False),
        sa.Column("role", sa.Enum("admin", "member", name="userrole"), nullable=False),
        sa.Column("agency_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("agencies.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    # Remaining tables are created to match full spec
    op.create_table("companies", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("name", sa.String(255), nullable=False), sa.Column("website", sa.String(255)), sa.Column("industry", sa.String(120)), sa.Column("size_range", sa.String(60)), sa.Column("geography", sa.String(120)), sa.Column("tech_stack", sa.JSON()), sa.Column("founded_year", sa.Integer()), sa.Column("funding_stage", sa.String(60)), sa.Column("total_funding", sa.String(80)), sa.Column("employee_count", sa.Integer()), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False))
    op.create_table("contacts", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id"), nullable=False), sa.Column("first_name", sa.String(120), nullable=False), sa.Column("last_name", sa.String(120), nullable=False), sa.Column("email", sa.String(255)), sa.Column("phone", sa.String(64)), sa.Column("linkedin_url", sa.String(255)), sa.Column("job_title", sa.String(255)), sa.Column("seniority_level", sa.String(120)), sa.Column("is_verified", sa.Boolean(), nullable=False), sa.Column("email_verified", sa.Boolean(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False))
    op.create_table("leads", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("contact_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("contacts.id"), nullable=False), sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id"), nullable=False), sa.Column("icp_score", sa.Integer(), nullable=False), sa.Column("status", sa.Enum("new", "contacted", "qualified", "disqualified", name="leadstatus"), nullable=False), sa.Column("assigned_to", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id")), sa.Column("source", sa.Enum("linkedin", "crunchbase", "apollo", "jobboard", name="leadsource"), nullable=False), sa.Column("notes", sa.String(2000)), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False))
    op.create_table("signals", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("company_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("companies.id"), nullable=False), sa.Column("signal_type", sa.Enum("funding_round", "hiring_surge", "leadership_change", "expansion", name="signaltype"), nullable=False), sa.Column("signal_data", sa.JSON()), sa.Column("detected_at", sa.DateTime(timezone=True), nullable=False), sa.Column("source_url", sa.String(255)))
    op.create_table("lead_signals", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("lead_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leads.id"), nullable=False), sa.Column("signal_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("signals.id"), nullable=False))
    op.create_table("icp_definitions", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False), sa.Column("name", sa.String(255), nullable=False), sa.Column("industries", sa.JSON()), sa.Column("company_size_min", sa.Integer()), sa.Column("company_size_max", sa.Integer()), sa.Column("geographies", sa.JSON()), sa.Column("tech_stack_required", sa.JSON()), sa.Column("scoring_weights", sa.JSON()), sa.Column("is_active", sa.Boolean(), nullable=False), sa.Column("created_at", sa.DateTime(timezone=True), nullable=False), sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False))
    op.create_table("scoring_history", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("lead_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leads.id"), nullable=False), sa.Column("old_score", sa.Integer(), nullable=False), sa.Column("new_score", sa.Integer(), nullable=False), sa.Column("reason", sa.String(512)), sa.Column("scored_at", sa.DateTime(timezone=True), nullable=False))
    op.create_table("crm_connections", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("user_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("users.id"), nullable=False), sa.Column("crm_type", sa.Enum("hubspot", "salesforce", "pipedrive", name="crmtype"), nullable=False), sa.Column("access_token", sa.String(4000), nullable=False), sa.Column("refresh_token", sa.String(4000)), sa.Column("workspace_id", sa.String(255)), sa.Column("last_synced_at", sa.DateTime(timezone=True)), sa.Column("is_active", sa.Boolean(), nullable=False))
    op.create_table("sync_logs", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("crm_connection_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("crm_connections.id"), nullable=False), sa.Column("lead_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leads.id")), sa.Column("direction", sa.Enum("push", "pull", name="syncdirection"), nullable=False), sa.Column("status", sa.Enum("success", "failed", name="syncstatus"), nullable=False), sa.Column("error_message", sa.String(1000)), sa.Column("synced_at", sa.DateTime(timezone=True), nullable=False))
    op.create_table("enrichment_jobs", sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True), sa.Column("lead_id", postgresql.UUID(as_uuid=True), sa.ForeignKey("leads.id"), nullable=False), sa.Column("status", sa.Enum("queued", "running", "done", "failed", name="jobstatus"), nullable=False), sa.Column("sources_used", sa.JSON()), sa.Column("result_data", sa.JSON()), sa.Column("started_at", sa.DateTime(timezone=True)), sa.Column("completed_at", sa.DateTime(timezone=True)))


def downgrade() -> None:
    for table_name in ["enrichment_jobs", "sync_logs", "crm_connections", "scoring_history", "icp_definitions", "lead_signals", "signals", "leads", "contacts", "companies", "users", "agencies"]:
        op.drop_table(table_name)
