from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.routers.deps import get_current_active_affiliate
from app.models.lead_notification import LeadNotification
from app.schemas.lead import LeadCreate, LeadResponse
from app.models.affiliate import Affiliate

router = APIRouter()

@router.get("/", response_model=List[LeadResponse])
async def my_leads(
    db: AsyncSession = Depends(get_db),
    affiliate: Affiliate = Depends(get_current_active_affiliate)
):
    result = await db.execute(
        select(LeadNotification).where(LeadNotification.affiliate_id == affiliate.id)
    )
    return result.scalars().all()

@router.post("/", response_model=LeadResponse)
async def report_new_client(
    data: LeadCreate,
    db: AsyncSession = Depends(get_db),
    affiliate: Affiliate = Depends(get_current_active_affiliate)
):
    lead = LeadNotification(
        affiliate_id=affiliate.id,
        **data.model_dump()
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    # Task: Send email to admin
    return lead
