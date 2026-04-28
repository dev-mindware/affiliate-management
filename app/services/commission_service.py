import uuid
from decimal import Decimal
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.commission import Commission, CommissionStatus
from app.models.service import Service
from app.models.affiliate import Affiliate
from app.services import wallet_service

async def create_commission(
    db: AsyncSession, 
    affiliate_id: uuid.UUID, 
    service_id: int, 
    client_nome: str, 
    client_telefone: str,
    lead_notification_id: Optional[uuid.UUID] = None,
    notas: Optional[str] = None
) -> Commission:
    # Get service to snapshot values
    result = await db.execute(select(Service).where(Service.id == service_id))
    service = result.scalars().first()
    if not service:
        raise ValueError("Serviço não encontrado")

    commission = Commission(
        affiliate_id=affiliate_id,
        service_id=service_id,
        lead_notification_id=lead_notification_id,
        client_nome=client_nome,
        client_telefone=client_telefone,
        valor_servico=service.preco,
        valor_comissao=service.comissao,
        status=CommissionStatus.PENDING,
        notas=notas
    )
    db.add(commission)
    await db.flush()
    return commission

async def create_commission_from_lead(db: AsyncSession, lead) -> Commission:
    """Helper to create a pending commission when a lead is contacted."""
    # Check if a commission already exists for this lead
    existing = await db.execute(select(Commission).where(Commission.lead_notification_id == lead.id))
    if existing.scalars().first():
        return None
        
    return await create_commission(
        db,
        affiliate_id=lead.affiliate_id,
        service_id=lead.service_id,
        client_nome=lead.client_nome,
        client_telefone=lead.client_telefone,
        lead_notification_id=lead.id,
        notas=lead.notas
    )

async def approve_commission(db: AsyncSession, commission_id: uuid.UUID) -> Commission:
    result = await db.execute(select(Commission).where(Commission.id == commission_id))
    commission = result.scalars().first()
    
    if not commission or commission.status != CommissionStatus.PENDING:
        return None
    
    commission.status = CommissionStatus.APPROVED
    commission.approved_at = datetime.utcnow()
    
    # Update wallet (pending balance)
    await wallet_service.add_pending_commission(db, commission.affiliate_id, Decimal(str(commission.valor_comissao)))
    
    await db.flush()
    return commission


async def reject_commission(db: AsyncSession, commission_id: uuid.UUID, notas: str) -> Commission:
    result = await db.execute(select(Commission).where(Commission.id == commission_id))
    commission = result.scalars().first()
    
    if not commission or commission.status != CommissionStatus.PENDING:
        return None
    
    commission.status = CommissionStatus.REJECTED
    commission.notas = notas
    
    await db.flush()
    return commission
