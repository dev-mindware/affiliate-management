from math import ceil
from typing import TypeVar, List, Type
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from app.schemas.common import PaginatedResponse

T = TypeVar("T")


async def paginate(
    db: AsyncSession,
    query,
    page: int,
    size: int,
) -> dict:
    # 1. Count total items
    count_query = select(func.count()).select_from(query.subquery())
    total_result = await db.execute(count_query)
    total = total_result.scalar() or 0
    
    # 2. Fetch page items
    offset = (page - 1) * size
    items_query = query.offset(offset).limit(size)
    result = await db.execute(items_query)
    items = result.scalars().all()
    
    pages = ceil(total / size) if total > 0 else 1
    
    return {
        "items": items,
        "total": total,
        "page": page,
        "size": size,
        "pages": pages
    }
