#!/usr/bin/env python3
"""Seed demo data so UI pages show real database content.

Run from API directory:
  python seed_demo.py
"""

from __future__ import annotations

import asyncio
import sys
import uuid
from datetime import UTC, datetime, timedelta
from pathlib import Path

from sqlalchemy import select


API_ROOT = Path(__file__).resolve().parent
if str(API_ROOT) not in sys.path:
    sys.path.insert(0, str(API_ROOT))

from app.core.database import SessionLocal  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.models.entities import (  # noqa: E402
    AUTOMATION_SETTINGS_SINGLETON_ID,
    Agency,
    AgencyPlan,
    AutomationSettings,
    Company,
    Contact,
    Lead,
    LeadSignal,
    LeadSource,
    LeadStatus,
    PipelineRun,
    Signal,
    SignalType,
    User,
    UserRole,
)


DEMO_USER_EMAIL = "m.hassansiddiqui9245@gmail.com"
DEMO_USER_PASSWORD = "start@123"


async def get_or_create_agency() -> Agency:
    async with SessionLocal() as db:
        agency = await db.scalar(
            select(Agency).where(Agency.name == "LeadAgent Demo Agency")
        )
        if agency:
            return agency
        agency = Agency(name="LeadAgent Demo Agency", plan=AgencyPlan.pro, seats=10)
        db.add(agency)
        await db.commit()
        await db.refresh(agency)
        return agency


async def get_or_create_user(agency_id: uuid.UUID) -> User:
    async with SessionLocal() as db:
        user = await db.scalar(select(User).where(User.email == DEMO_USER_EMAIL))
        if user:
            return user
        user = User(
            email=DEMO_USER_EMAIL,
            name="Hassan Siddiqui",
            hashed_password=hash_password(DEMO_USER_PASSWORD),
            role=UserRole.admin,
            agency_id=agency_id,
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)
        return user


async def seed_companies_contacts_leads_signals(user_id: uuid.UUID) -> None:
    dataset = [
        {
            "company": "Stripe Connect",
            "website": "https://stripe.com",
            "industry": "FinTech",
            "geo": "North America",
            "size": "200-500",
            "employee_count": 380,
            "contact": ("Maya", "Patel", "maya@stripeconnect.com"),
            "lead": {
                "score": 91,
                "status": LeadStatus.qualified,
                "source": LeadSource.linkedin,
            },
            "signal": (
                SignalType.funding_round,
                "Raised a new strategic growth round.",
            ),
        },
        {
            "company": "Veridian Corp",
            "website": "https://veridian.example",
            "industry": "SaaS",
            "geo": "Europe",
            "size": "500-1000",
            "employee_count": 620,
            "contact": ("Daniel", "Ng", "daniel@veridian.example"),
            "lead": {
                "score": 83,
                "status": LeadStatus.qualified,
                "source": LeadSource.crunchbase,
            },
            "signal": (SignalType.leadership_change, "New VP Engineering announced."),
        },
        {
            "company": "Acme AI",
            "website": "https://acmeai.example",
            "industry": "AI",
            "geo": "North America",
            "size": "50-200",
            "employee_count": 140,
            "contact": ("Sara", "Lee", "sara@acmeai.example"),
            "lead": {
                "score": 76,
                "status": LeadStatus.contacted,
                "source": LeadSource.apollo,
            },
            "signal": (SignalType.hiring_surge, "Hiring for 15 GTM roles this month."),
        },
        {
            "company": "Northstar Health",
            "website": "https://northstarhealth.example",
            "industry": "HealthTech",
            "geo": "North America",
            "size": "200-500",
            "employee_count": 260,
            "contact": ("Priya", "Nair", "priya@northstarhealth.example"),
            "lead": {
                "score": 68,
                "status": LeadStatus.new,
                "source": LeadSource.jobboard,
            },
            "signal": (SignalType.expansion, "Expanded to two new regional markets."),
        },
        {
            "company": "BlueOrbit",
            "website": "https://blueorbit.example",
            "industry": "SaaS",
            "geo": "APAC",
            "size": "50-200",
            "employee_count": 95,
            "contact": ("Leo", "Kim", "leo@blueorbit.example"),
            "lead": {
                "score": 72,
                "status": LeadStatus.new,
                "source": LeadSource.linkedin,
            },
            "signal": (SignalType.hiring_surge, "Hiring surge in sales operations."),
        },
        {
            "company": "Helio Works",
            "website": "https://helioworks.example",
            "industry": "Manufacturing",
            "geo": "Europe",
            "size": "1000+",
            "employee_count": 1400,
            "contact": ("Nora", "Silva", "nora@helioworks.example"),
            "lead": {
                "score": 61,
                "status": LeadStatus.contacted,
                "source": LeadSource.crunchbase,
            },
            "signal": (SignalType.expansion, "Opened a new enterprise business unit."),
        },
    ]

    now = datetime.now(UTC)
    async with SessionLocal() as db:
        for idx, row in enumerate(dataset):
            company = await db.scalar(
                select(Company).where(Company.name == row["company"])
            )
            if company is None:
                company = Company(
                    name=row["company"],
                    website=row["website"],
                    industry=row["industry"],
                    geography=row["geo"],
                    size_range=row["size"],
                    employee_count=row["employee_count"],
                    tech_stack=["React", "AWS", "Postgres"],
                )
                db.add(company)
                await db.flush()

            first_name, last_name, email = row["contact"]
            contact = await db.scalar(select(Contact).where(Contact.email == email))
            if contact is None:
                contact = Contact(
                    company_id=company.id,
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                    is_verified=True,
                    email_verified=True,
                )
                db.add(contact)
                await db.flush()

            lead = await db.scalar(select(Lead).where(Lead.contact_id == contact.id))
            if lead is None:
                lead = Lead(
                    company_id=company.id,
                    contact_id=contact.id,
                    assigned_to=user_id,
                    icp_score=row["lead"]["score"],
                    status=row["lead"]["status"],
                    source=row["lead"]["source"],
                    notes=f"Demo seeded lead for {row['company']}",
                    created_at=now - timedelta(days=idx * 2 + 1),
                )
                db.add(lead)
                await db.flush()

            signal_type, summary = row["signal"]
            signal = await db.scalar(
                select(Signal).where(
                    Signal.company_id == company.id,
                    Signal.signal_type == signal_type,
                )
            )
            if signal is None:
                signal = Signal(
                    company_id=company.id,
                    signal_type=signal_type,
                    detected_at=now - timedelta(hours=idx * 8 + 2),
                    signal_data={"summary": summary},
                    source_url=row["website"],
                )
                db.add(signal)
                await db.flush()

            ls = await db.scalar(
                select(LeadSignal).where(
                    LeadSignal.lead_id == lead.id, LeadSignal.signal_id == signal.id
                )
            )
            if ls is None:
                db.add(LeadSignal(lead_id=lead.id, signal_id=signal.id))

        await db.commit()


async def seed_automation_and_runs() -> None:
    async with SessionLocal() as db:
        settings = await db.get(AutomationSettings, AUTOMATION_SETTINGS_SINGLETON_ID)
        if settings is None:
            settings = AutomationSettings(
                id=AUTOMATION_SETTINGS_SINGLETON_ID,
                daily_refresh=True,
                refresh_time="08:00 AM",
                sources={
                    "linkedin": True,
                    "crunchbase": True,
                    "apollo": True,
                    "jobboard": True,
                },
                target_industries=["SaaS", "FinTech", "HealthTech"],
                company_size_min=1,
                company_size_max=500,
                geography="na",
                tech_stack=["React", "AWS"],
                crm_connections={
                    "hubspot": True,
                    "salesforce": False,
                    "pipedrive": True,
                },
            )
            db.add(settings)
        else:
            settings.sources = {
                "linkedin": True,
                "crunchbase": True,
                "apollo": True,
                "jobboard": True,
            }
            settings.target_industries = ["SaaS", "FinTech", "HealthTech"]
            settings.company_size_min = 1
            settings.company_size_max = 500
            settings.geography = "na"
            settings.tech_stack = ["React", "AWS", "Postgres"]
            settings.crm_connections = {
                "hubspot": True,
                "salesforce": False,
                "pipedrive": True,
            }

        existing_runs = (await db.scalars(select(PipelineRun).limit(1))).all()
        if not existing_runs:
            now = datetime.now(UTC)
            db.add_all(
                [
                    PipelineRun(
                        status="done",
                        started_at=now - timedelta(hours=26),
                        completed_at=now - timedelta(hours=25, minutes=42),
                        logs=[
                            "scan complete",
                            "lead scoring complete",
                            "crm sync complete",
                        ],
                    ),
                    PipelineRun(
                        status="running",
                        started_at=now - timedelta(minutes=35),
                        completed_at=None,
                        logs=["scan started", "scoring in progress"],
                    ),
                ]
            )

        await db.commit()


async def main() -> None:
    agency = await get_or_create_agency()
    user = await get_or_create_user(agency.id)
    await seed_companies_contacts_leads_signals(user.id)
    await seed_automation_and_runs()
    print("Demo ingestion complete.")
    print(f"Login email: {DEMO_USER_EMAIL}")
    print(f"Login password: {DEMO_USER_PASSWORD}")


if __name__ == "__main__":
    asyncio.run(main())
