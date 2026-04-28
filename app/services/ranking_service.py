import json
from typing import List, Dict, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, desc
from app.models.affiliate import Affiliate, AffiliateStatus
from app.models.commission import Commission, CommissionStatus
from redis.asyncio import Redis

RANKING_CACHE_KEY = "affiliate_ranking_top_10"
RANKING_CACHE_TTL = 300 # 5 minutes

async def get_top_affiliates(db: AsyncSession, redis: Redis) -> List[Dict[str, Any]]:
    # Try to get from cache
    cached_ranking = await redis.get(RANKING_CACHE_KEY)
    if cached_ranking:
        return json.loads(cached_ranking)

    # Calculate ranking
    # Top 10 by total_earned (which is already updated in confirm_commission_payment)
    query = (
        select(
            Affiliate.nome_completo,
            Affiliate.total_earned,
            func.count(Commission.id).label("conversions")
        )
        .outerjoin(Commission, (Commission.affiliate_id == Affiliate.id) & (Commission.status == CommissionStatus.PAID))
        .where(Affiliate.status == AffiliateStatus.ACTIVE)
        .group_by(Affiliate.id)
        .order_by(desc(Affiliate.total_earned))
        .limit(10)
    )
    
    result = await db.execute(query)
    ranking = []
    for row in result:
        # Privacy: only first and last name
        names = row.nome_completo.split()
        if len(names) > 1:
            display_name = f"{names[0]} {names[-1]}"
        else:
            display_name = names[0]
            
        ranking.append({
            "name": display_name,
            "total_earned": float(row.total_earned),
            "conversions": row.conversions
        })

    # Save to cache
    await redis.set(RANKING_CACHE_KEY, json.dumps(ranking), ex=RANKING_CACHE_TTL)
    
    return ranking

async def get_affiliate_rank_info(db: AsyncSession, affiliate_id: str) -> Dict[str, Any]:
    # This is a bit more complex, we need the position of the specific affiliate
    # For now, let's just return a simple version or skip for brevity if not strictly needed in the MVP service layer
    # But the prompt asks for "posição actual e quantos Kz o separam do próximo lugar"
    
    # Let's implement a simplified version
    subq = select(
        Affiliate.id,
        func.rank().over(order_by=desc(Affiliate.total_earned)).label("rank"),
        Affiliate.total_earned
    ).where(Affiliate.status == AffiliateStatus.ACTIVE).subquery()
    
    query = select(subq).where(subq.c.id == affiliate_id)
    result = await db.execute(query)
    my_rank = result.first()
    
    if not my_rank:
        return {"rank": None, "distance_to_next": 0}

    # Get the person just above
    next_above_query = select(Affiliate.total_earned).where(
        (Affiliate.status == AffiliateStatus.ACTIVE) & 
        (Affiliate.total_earned > my_rank.total_earned)
    ).order_by(Affiliate.total_earned).limit(10) # Smallest value that is larger than mine
    
    next_above_result = await db.execute(next_above_query)
    next_above = next_above_result.scalars().first()
    
    distance = 0
    if next_above:
        distance = float(next_above - my_rank.total_earned)
        
    return {
        "rank": int(my_rank.rank),
        "total_earned": float(my_rank.total_earned),
        "distance_to_next": distance
    }
