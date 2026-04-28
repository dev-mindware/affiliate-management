from fastapi import APIRouter, Depends, HTTPException, Header, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.config import settings
from app.schemas.commission import CommissionWebhookCreate, CommissionResponse
from app.models.affiliate import Affiliate, AffiliateStatus
from app.services import commission_service

router = APIRouter()

@router.post("/conversion", response_model=CommissionResponse)
async def webhook_conversion(
    data: CommissionWebhookCreate,
    x_webhook_secret: str = Header(None),
    db: AsyncSession = Depends(get_db)
):
    if not x_webhook_secret or x_webhook_secret != settings.WEBHOOK_SECRET:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Secret de webhook inválido"
        )
    
    # Find affiliate by code
    result = await db.execute(select(Affiliate).where(Affiliate.codigo_afiliado == data.affiliate_code))
    affiliate = result.scalars().first()
    
    if not affiliate:
        raise HTTPException(status_code=404, detail="Afiliado não encontrado")
    
    if affiliate.status != AffiliateStatus.ACTIVE:
        raise HTTPException(status_code=400, detail="Afiliado não está activo")
    
    try:
        commission = await commission_service.create_commission(
            db,
            affiliate_id=affiliate.id,
            service_id=data.service_id,
            client_nome=data.client_nome,
            client_telefone=data.client_telefone,
            notas=data.notas
        )
        await db.commit()
        return commission
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
