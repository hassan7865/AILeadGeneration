"""automation settings and pipeline runs

Revision ID: 20260407_02
Revises: 20260407_01
"""
from __future__ import annotations

import uuid
from datetime import UTC, datetime

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql

revision = "20260407_02"
down_revision = "20260407_01"
branch_labels = None
depends_on = None

SINGLETON_ID = uuid.UUID("00000000-0000-4000-8000-000000000001")


def upgrade() -> None:
    now = datetime.now(UTC)
    op.create_table(
        "automation_settings",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("daily_refresh", sa.Boolean(), nullable=False),
        sa.Column("refresh_time", sa.String(length=32), nullable=False),
        sa.Column("sources", sa.JSON(), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )
    op.create_table(
        "pipeline_runs",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("status", sa.String(length=32), nullable=False),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("logs", sa.JSON(), nullable=True),
    )
    op.bulk_insert(
        sa.table(
            "automation_settings",
            sa.column("id", postgresql.UUID(as_uuid=True)),
            sa.column("daily_refresh", sa.Boolean),
            sa.column("refresh_time", sa.String),
            sa.column("sources", sa.JSON),
            sa.column("created_at", sa.DateTime(timezone=True)),
            sa.column("updated_at", sa.DateTime(timezone=True)),
        ),
        [
            {
                "id": SINGLETON_ID,
                "daily_refresh": True,
                "refresh_time": "08:00 AM",
                "sources": {"linkedin": True, "crunchbase": True, "apollo": True, "jobboard": True},
                "created_at": now,
                "updated_at": now,
            }
        ],
    )


def downgrade() -> None:
    op.drop_table("pipeline_runs")
    op.drop_table("automation_settings")
