from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database import get_db
from app.routers.deps import get_current_active_admin
from app.models.affiliate import Affiliate, AffiliateStatus
from app.models.commission import Commission, CommissionStatus
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/kpis")
async def get_admin_kpis(
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    # 1. Pending approvals
    pending_res = await db.execute(select(func.count(Affiliate.id)).where(Affiliate.status == AffiliateStatus.PENDING_APPROVAL))
    pending_count = pending_res.scalar()
    
    # 2. Active affiliates
    active_res = await db.execute(select(func.count(Affiliate.id)).where(Affiliate.status == AffiliateStatus.ACTIVE))
    active_count = active_res.scalar()
    
    # 3. Pending commissions (Kz)
    pending_comm_res = await db.execute(select(func.sum(Commission.valor_comissao)).where(Commission.status == CommissionStatus.PENDING))
    pending_comm_sum = pending_comm_res.scalar() or 0
    
    # 4. Total paid this month
    start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0, microsecond=0)
    paid_month_res = await db.execute(
        select(func.sum(Commission.valor_comissao))
        .where((Commission.status == CommissionStatus.PAID) & (Commission.paid_at >= start_of_month))
    )
    paid_month_sum = paid_month_res.scalar() or 0
    
    return {
        "pending_approvals": pending_count,
        "active_affiliates": active_count,
        "pending_commissions_kz": float(pending_comm_sum),
        "total_paid_month_kz": float(paid_month_sum)
    }
