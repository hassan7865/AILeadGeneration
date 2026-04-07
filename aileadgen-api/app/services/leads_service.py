import uuid

from sqlalchemy import delete, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.entities import Company, Contact, EnrichmentJob, JobStatus, Lead, LeadStatus, ScoringHistory
from app.schemas.leads import LeadCreateRequest, LeadUpdateRequest


async def list_leads(db: AsyncSession) -> list[Lead]:
    result = await db.scalars(select(Lead).options(selectinload(Lead.company), selectinload(Lead.contact)))
    return list(result.all())


async def get_lead(db: AsyncSession, lead_id: uuid.UUID) -> Lead | None:
    return await db.scalar(select(Lead).where(Lead.id == lead_id))


async def create_lead(db: AsyncSession, payload: LeadCreateRequest) -> Lead:
    company = Company(name=payload.company_name)
    contact = Contact(
        company=company,
        first_name=payload.contact_first_name,
        last_name=payload.contact_last_name,
        email=payload.contact_email,
    )
    lead = Lead(company=company, contact=contact, source=payload.source, notes=payload.notes)
    db.add_all([company, contact, lead])
    await db.commit()
    await db.refresh(lead)
    return lead


async def update_lead(db: AsyncSession, lead: Lead, payload: LeadUpdateRequest) -> Lead:
    if payload.status is not None:
        lead.status = payload.status
    if payload.assigned_to is not None:
        lead.assigned_to = payload.assigned_to
    if payload.notes is not None:
        lead.notes = payload.notes
    await db.commit()
    await db.refresh(lead)
    return lead


async def delete_lead(db: AsyncSession, lead_id: uuid.UUID) -> None:
    await db.execute(delete(Lead).where(Lead.id == lead_id))
    await db.commit()


async def set_status(db: AsyncSession, lead: Lead, status: LeadStatus) -> Lead:
    lead.status = status
    await db.commit()
    await db.refresh(lead)
    return lead


async def trigger_enrichment(db: AsyncSession, lead_id: uuid.UUID) -> EnrichmentJob:
    job = EnrichmentJob(lead_id=lead_id, status=JobStatus.queued, sources_used=["linkedin", "apollo"])
    db.add(job)
    await db.commit()
    await db.refresh(job)
    return job


async def get_score_history(db: AsyncSession, lead_id: uuid.UUID) -> list[ScoringHistory]:
    result = await db.scalars(select(ScoringHistory).where(ScoringHistory.lead_id == lead_id))
    return list(result.all())
