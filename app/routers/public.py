from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.affiliate import RankingItem
from app.schemas.service import ServiceResponse
from app.schemas.common import PaginationParams, PaginatedResponse
from app.utils.pagination import paginate
from app.services import ranking_service
from app.models.service import Service
from sqlalchemy.future import select
import redis.asyncio as redis
from app.config import settings

router = APIRouter()

@router.get("/ranking", response_model=List[RankingItem], summary="Get Top Affiliates Ranking", description="Retrieves the global leaderboard of the most successful affiliates based on conversions.")
async def get_ranking(
    db: AsyncSession = Depends(get_db)
):
    # Initialize redis for caching
    r = redis.from_url(settings.redis_url)
    ranking = await ranking_service.get_top_affiliates(db, r)
    return ranking

@router.get("/services", response_model=PaginatedResponse[ServiceResponse], summary="List Active Services", description="Retrieves all services currently available for promotion by affiliates.")
async def list_active_services(
    params: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db)
):
    query = select(Service).where(Service.ativo == True)
    return await paginate(db, query, params.page, params.size)
