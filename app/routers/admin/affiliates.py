from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.routers.deps import get_current_active_admin
from app.models.affiliate import Affiliate, AffiliateStatus
from app.schemas.affiliate import AffiliateResponse, AffiliateUpdate
from app.schemas.common import PaginationParams, PaginatedResponse
from app.utils.pagination import paginate

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[AffiliateResponse])
async def list_affiliates(
    status: Optional[AffiliateStatus] = None,
    params: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    query = select(Affiliate)
    if status:
        query = query.where(Affiliate.status == status)
    
    # Order by creation date descending
    query = query.order_by(Affiliate.created_at.desc())
    
    return await paginate(db, query, params.page, params.size)

@router.get("/{affiliate_id}", response_model=AffiliateResponse)
async def get_affiliate_details(
    affiliate_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    result = await db.execute(select(Affiliate).where(Affiliate.id == affiliate_id))
    affiliate = result.scalars().first()
    if not affiliate:
        raise HTTPException(status_code=404, detail="Afiliado não encontrado")
    return affiliate

@router.patch("/{affiliate_id}/status", response_model=AffiliateResponse)
async def update_affiliate_status(
    affiliate_id: uuid.UUID,
    data: AffiliateUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    result = await db.execute(select(Affiliate).where(Affiliate.id == affiliate_id))
    affiliate = result.scalars().first()
    if not affiliate:
        raise HTTPException(status_code=404, detail="Afiliado não encontrado")
    
    affiliate.status = data.status
    await db.commit()
    await db.refresh(affiliate)
    return affiliate
