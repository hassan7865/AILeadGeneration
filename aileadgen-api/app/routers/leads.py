import uuid

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.dependencies.auth import get_current_user
from app.dependencies.db import get_db_session
from app.models.entities import LeadStatus, User
from app.schemas.leads import LeadCreateRequest, LeadListItem, LeadOut, LeadUpdateRequest
from app.services import leads_service, signals_service
from app.utils.response import ok

router = APIRouter(prefix="/leads", tags=["Leads"], dependencies=[Depends(get_current_user)])


@router.get("")
async def list_leads(db: AsyncSession = Depends(get_db_session), _: User = Depends(get_current_user)):
    leads = await leads_service.list_leads(db)
    data: list[LeadListItem] = []
    for lead in leads:
        company_name = lead.company.name if lead.company else "Unknown Company"
        contact_full_name = (
            f"{lead.contact.first_name} {lead.contact.last_name}".strip() if lead.contact else "Unknown Contact"
        )
        industry = lead.company.industry if lead.company and lead.company.industry else "Unknown"
        signal = lead.source.value.replace("_", " ").title()
        data.append(
            LeadListItem(
                id=lead.id,
                company=company_name,
                contact_name=contact_full_name,
                industry=industry,
                icp_score=lead.icp_score,
                signal=signal,
                status=lead.status,
                source=lead.source,
                added_at=lead.created_at,
            )
        )
    return ok(data, "Leads fetched")


@router.get("/{lead_id}")
async def get_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)):
    lead = await leads_service.get_lead(db, lead_id)
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    return ok(LeadOut.model_validate(lead), "Lead fetched")


@router.post("")
async def create_lead(payload: LeadCreateRequest, db: AsyncSession = Depends(get_db_session)):
    lead = await leads_service.create_lead(db, payload)
    return ok(LeadOut.model_validate(lead), "Lead created")


@router.patch("/{lead_id}")
async def update_lead(lead_id: uuid.UUID, payload: LeadUpdateRequest, db: AsyncSession = Depends(get_db_session)):
    lead = await leads_service.get_lead(db, lead_id)
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    updated = await leads_service.update_lead(db, lead, payload)
    return ok(LeadOut.model_validate(updated), "Lead updated")


@router.delete("/{lead_id}")
async def delete_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)):
    await leads_service.delete_lead(db, lead_id)
    return ok(message="Lead deleted")


@router.post("/{lead_id}/qualify")
async def qualify_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)):
    lead = await leads_service.get_lead(db, lead_id)
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    updated = await leads_service.set_status(db, lead, LeadStatus.qualified)
    return ok(LeadOut.model_validate(updated), "Lead qualified and CRM push queued")


@router.post("/{lead_id}/disqualify")
async def disqualify_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)):
    lead = await leads_service.get_lead(db, lead_id)
    if lead is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Lead not found")
    updated = await leads_service.set_status(db, lead, LeadStatus.disqualified)
    return ok(LeadOut.model_validate(updated), "Lead disqualified")


@router.post("/{lead_id}/enrich")
async def enrich_lead(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)):
    job = await leads_service.trigger_enrichment(db, lead_id)
    return ok({"job_id": str(job.id), "status": job.status.value}, "Enrichment started")


@router.get("/{lead_id}/signals")
async def lead_signals(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)):
    signals = await signals_service.get_lead_signals(db, lead_id)
    return ok(signals, "Lead signals fetched")


@router.get("/{lead_id}/score-history")
async def score_history(lead_id: uuid.UUID, db: AsyncSession = Depends(get_db_session)):
    history = await leads_service.get_score_history(db, lead_id)
    return ok(history, "Score history fetched")


@router.patch("/bulk")
async def bulk_update(payload: LeadUpdateRequest, db: AsyncSession = Depends(get_db_session)):
    leads = await leads_service.list_leads(db)
    updated_ids: list[str] = []
    for lead in leads:
        updated = await leads_service.update_lead(db, lead, payload)
        updated_ids.append(str(updated.id))
    return ok({"updated_count": len(updated_ids), "ids": updated_ids}, "Bulk update complete")
