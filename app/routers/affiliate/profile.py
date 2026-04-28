from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.routers.deps import get_current_active_affiliate
from app.models.affiliate import Affiliate
from app.schemas.affiliate import AffiliateResponse, AffiliateUpdate

router = APIRouter()

@router.get("/", response_model=AffiliateResponse)
async def get_my_profile(
    affiliate: Affiliate = Depends(get_current_active_affiliate)
):
    return affiliate

@router.patch("/", response_model=AffiliateResponse)
async def update_my_profile(
    data: AffiliateUpdate,
    db: AsyncSession = Depends(get_db),
    affiliate: Affiliate = Depends(get_current_active_affiliate)
):
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(affiliate, field, value)
    
    await db.commit()
    await db.refresh(affiliate)
    return affiliate
