from typing import List
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.routers.deps import get_current_active_admin
from app.models.affiliate import Affiliate, AffiliateStatus
from app.schemas.affiliate import AffiliateResponse
from app.schemas.common import PaginationParams, PaginatedResponse
from app.utils.pagination import paginate
from app.services import affiliate_service

router = APIRouter()

@router.get("/pending", response_model=PaginatedResponse[AffiliateResponse])
async def list_pending_affiliates(
    params: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    query = select(Affiliate).where(Affiliate.status == AffiliateStatus.PENDING_APPROVAL)
    return await paginate(db, query, params.page, params.limit)

@router.post("/{affiliate_id}/approve", response_model=AffiliateResponse)
async def approve_affiliate(
    affiliate_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    affiliate = await affiliate_service.approve_affiliate(db, affiliate_id, admin.id)
    if not affiliate:
        raise HTTPException(status_code=404, detail="Afiliado não encontrado ou já processado")
    
    await db.commit()
    # Task: Send welcome email with code
    return affiliate

@router.post("/{affiliate_id}/reject", response_model=AffiliateResponse)
async def reject_affiliate(
    affiliate_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    affiliate = await affiliate_service.reject_affiliate(db, affiliate_id)
    if not affiliate:
        raise HTTPException(status_code=404, detail="Afiliado não encontrado ou já processado")
    
    await db.commit()
    # Task: Send rejection email
    return affiliate
