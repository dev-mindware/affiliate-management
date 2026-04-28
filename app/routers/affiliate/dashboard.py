from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func
from app.database import get_db
from app.routers.deps import get_current_active_affiliate
from app.models.affiliate import Affiliate
from app.models.commission import Commission, CommissionStatus
from app.models.lead_notification import LeadNotification
from app.services import ranking_service
import redis.asyncio as redis
from app.config import settings

router = APIRouter()

@router.get("/kpis", summary="Get Affiliate Dashboard KPIs", description="Retrieves main performance metrics for the affiliate, including balances, active leads, and current ranking info.")
async def get_affiliate_kpis(
    db: AsyncSession = Depends(get_db),
    affiliate: Affiliate = Depends(get_current_active_affiliate)
):
    # 1. Total earned (snapshot from affiliate table)
    total_earned = affiliate.total_earned
    
    # 2. Pending commissions (snapshot from wallet if we want, or query)
    from app.models.wallet import Wallet
    wallet_res = await db.execute(select(Wallet).where(Wallet.affiliate_id == affiliate.id))
    wallet = wallet_res.scalars().first()
    pending_balance = wallet.saldo_pendente if wallet else 0
    available_balance = wallet.saldo_disponivel if wallet else 0
    
    # 3. Active leads
    leads_res = await db.execute(
        select(func.count(LeadNotification.id))
        .where((LeadNotification.affiliate_id == affiliate.id) & (LeadNotification.status != "lost"))
    )
    leads_count = leads_res.scalar()
    
    # 4. Ranking position
    r = redis.from_url(settings.redis_url)
    rank_info = await ranking_service.get_affiliate_rank_info(db, str(affiliate.id))
    
    return {
        "available_balance": float(available_balance),
        "pending_balance": float(pending_balance),
        "total_earned": float(total_earned),
        "active_leads": leads_count,
        "rank_info": rank_info
    }
