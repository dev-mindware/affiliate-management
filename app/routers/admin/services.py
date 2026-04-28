from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.routers.deps import get_current_active_admin
from app.models.service import Service
from app.schemas.service import ServiceCreate, ServiceUpdate, ServiceResponse
from app.schemas.common import PaginationParams, PaginatedResponse
from app.utils.pagination import paginate

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[ServiceResponse])
async def list_services(
    params: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    query = select(Service).order_by(Service.nome)
    return await paginate(db, query, params.page, params.size)

@router.post("/", response_model=ServiceResponse)
async def create_service(
    data: ServiceCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    service = Service(**data.model_dump())
    db.add(service)
    await db.commit()
    await db.refresh(service)
    return service

@router.put("/{service_id}", response_model=ServiceResponse)
async def update_service(
    service_id: int,
    data: ServiceUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalars().first()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    
    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(service, field, value)
    
    await db.commit()
    await db.refresh(service)
    return service

@router.delete("/{service_id}")
async def delete_service(
    service_id: int,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    # Check if there are commissions associated
    from app.models.commission import Commission
    count_res = await db.execute(select(Commission).where(Commission.service_id == service_id))
    if count_res.scalars().first():
        raise HTTPException(status_code=400, detail="Não é possível eliminar um serviço com comissões associadas")
    
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalars().first()
    if not service:
        raise HTTPException(status_code=404, detail="Serviço não encontrado")
    
    await db.delete(service)
    await db.commit()
    return {"msg": "Serviço eliminado com sucesso"}
