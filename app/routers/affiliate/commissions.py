from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.routers.deps import get_current_active_affiliate
from app.models.commission import Commission
from app.models.affiliate import Affiliate
from app.schemas.commission import CommissionResponse

router = APIRouter()

@router.get("/", response_model=List[CommissionResponse])
async def my_commissions(
    db: AsyncSession = Depends(get_db),
    affiliate: Affiliate = Depends(get_current_active_affiliate)
):
    result = await db.execute(
        select(Commission).where(Commission.affiliate_id == affiliate.id)
    )
    return result.scalars().all()
