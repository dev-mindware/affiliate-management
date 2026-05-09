from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.routers.deps import get_current_active_admin
from app.models.commission import Commission, CommissionStatus
from app.schemas.commission import CommissionResponse, CommissionCreate
from app.schemas.common import PaginationParams, PaginatedResponse
from app.utils.pagination import paginate
from sqlalchemy.orm import selectinload
from app.services import commission_service

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[CommissionResponse])
async def list_commissions(
    status: Optional[CommissionStatus] = None,
    params: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    query = select(Commission).options(selectinload(Commission.affiliate))
    if status:
        query = query.where(Commission.status == status)
    
    # Order by creation date descending
    query = query.order_by(Commission.created_at.desc())
    
    return await paginate(db, query, params.page, params.limit)

@router.post("/", response_model=CommissionResponse)
async def manual_register_sale(
    data: CommissionCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    """Admin manually registers a sale for an affiliate"""
    try:
        commission = await commission_service.create_commission(
            db,
            affiliate_id=data.affiliate_id,
            service_id=data.service_id,
            client_nome=data.client_nome,
            client_telefone=data.client_telefone,
            lead_notification_id=data.lead_notification_id,
            notas=data.notas
        )
        await db.commit()
        return commission
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{commission_id}/approve", response_model=CommissionResponse)
async def approve_commission(
    commission_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    commission = await commission_service.approve_commission(db, commission_id)
    if not commission:
        raise HTTPException(status_code=404, detail="Comissão não encontrada ou estado inválido")
    
    await db.commit()
    # Task: Notify affiliate by email
    return commission

@router.post("/{commission_id}/reject", response_model=CommissionResponse)
async def reject_commission(
    commission_id: uuid.UUID,
    notas: str = Form(...),
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    commission = await commission_service.reject_commission(db, commission_id, notas)
    if not commission:
        raise HTTPException(status_code=404, detail="Comissão não encontrada ou estado inválido")
    
    await db.commit()
    return commission
