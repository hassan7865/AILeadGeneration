"""add dynamic automation config fields

Revision ID: 20260407_03
Revises: 20260407_02
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op

revision = "20260407_03"
down_revision = "20260407_02"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column(
        "automation_settings",
        sa.Column("target_industries", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
    )
    op.add_column(
        "automation_settings",
        sa.Column("company_size_min", sa.Integer(), nullable=False, server_default="1"),
    )
    op.add_column(
        "automation_settings",
        sa.Column("company_size_max", sa.Integer(), nullable=False, server_default="1000"),
    )
    op.add_column(
        "automation_settings",
        sa.Column("geography", sa.String(length=32), nullable=False, server_default="na"),
    )
    op.add_column(
        "automation_settings",
        sa.Column("tech_stack", sa.JSON(), nullable=False, server_default=sa.text("'[]'::json")),
    )
    op.add_column(
        "automation_settings",
        sa.Column("crm_connections", sa.JSON(), nullable=False, server_default=sa.text("'{}'::json")),
    )

    op.execute(
        """
        UPDATE automation_settings
        SET target_industries = '["SaaS","FinTech","HealthTech"]'::json,
            company_size_min = 1,
            company_size_max = 500,
            geography = 'na',
            tech_stack = '["React","AWS"]'::json,
            crm_connections = '{"hubspot": false, "salesforce": false, "pipedrive": false}'::json
        """
    )

    op.alter_column("automation_settings", "target_industries", server_default=None)
    op.alter_column("automation_settings", "company_size_min", server_default=None)
    op.alter_column("automation_settings", "company_size_max", server_default=None)
    op.alter_column("automation_settings", "geography", server_default=None)
    op.alter_column("automation_settings", "tech_stack", server_default=None)
    op.alter_column("automation_settings", "crm_connections", server_default=None)


def downgrade() -> None:
    op.drop_column("automation_settings", "crm_connections")
    op.drop_column("automation_settings", "tech_stack")
    op.drop_column("automation_settings", "geography")
    op.drop_column("automation_settings", "company_size_max")
    op.drop_column("automation_settings", "company_size_min")
    op.drop_column("automation_settings", "target_industries")
