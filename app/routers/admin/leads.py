from typing import List, Optional
import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.routers.deps import get_current_active_admin
from app.models.lead_notification import LeadNotification, LeadStatus
from app.schemas.lead import LeadResponse, LeadUpdate, LeadAdminCreate
from app.schemas.common import PaginationParams, PaginatedResponse
from app.utils.pagination import paginate
from app.models.affiliate import Affiliate

router = APIRouter()

@router.post("/", response_model=LeadResponse)
async def admin_register_lead(
    data: LeadAdminCreate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    """Admin registers a lead on behalf of an affiliate using their code"""
    # Find affiliate by code
    aff_res = await db.execute(select(Affiliate).where(Affiliate.codigo_afiliado == data.affiliate_code))
    affiliate = aff_res.scalars().first()
    if not affiliate:
        raise HTTPException(status_code=404, detail="Código de afiliado inválido")
    
    lead = LeadNotification(
        affiliate_id=affiliate.id,
        service_id=data.service_id,
        client_nome=data.client_nome,
        client_telefone=data.client_telefone,
        notas=data.notas,
        status=LeadStatus.NEW
    )
    db.add(lead)
    await db.commit()
    await db.refresh(lead)
    return lead

@router.get("/", response_model=PaginatedResponse[LeadResponse])
async def list_leads(
    status: Optional[LeadStatus] = None,
    params: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    query = select(LeadNotification)
    if status:
        query = query.where(LeadNotification.status == status)
    
    # Order by creation date descending
    query = query.order_by(LeadNotification.created_at.desc())
    
    return await paginate(db, query, params.page, params.limit)

@router.patch("/{lead_id}/status", response_model=LeadResponse)
async def update_lead_status(
    lead_id: uuid.UUID,
    data: LeadUpdate,
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    result = await db.execute(select(LeadNotification).where(LeadNotification.id == lead_id))
    lead = result.scalars().first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead não encontrado")
    
    lead.status = data.status
    
    # Automation logic
    from app.services import commission_service
    if data.status == LeadStatus.CONTACTED:
        await commission_service.create_commission_from_lead(db, lead)
    elif data.status == LeadStatus.CONVERTED:
        # Find associated commission
        res = await db.execute(select(LeadNotification.__table__.columns).where(LeadNotification.id == lead_id)) # dummy to avoid circular or model issues if any
        # Better: just query Commission
        from app.models.commission import Commission
        c_res = await db.execute(select(Commission).where(Commission.lead_notification_id == lead_id))
        commission = c_res.scalars().first()
        
        if not commission:
            # Create it first if it doesn't exist
            commission = await commission_service.create_commission_from_lead(db, lead)
            
        if commission:
            await commission_service.approve_commission(db, commission.id)

    await db.commit()
    await db.refresh(lead)
    return lead
