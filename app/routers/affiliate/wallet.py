from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.routers.deps import get_current_active_affiliate
from app.models.wallet import Wallet
from app.models.withdrawal_request import WithdrawalRequest, WithdrawalStatus
from app.models.affiliate import Affiliate
from app.schemas.wallet import WalletResponse, WithdrawalCreate, WithdrawalResponse
from app.services import wallet_service
from decimal import Decimal

router = APIRouter()

@router.get("/", response_model=WalletResponse)
async def get_my_wallet(
    db: AsyncSession = Depends(get_db),
    affiliate: Affiliate = Depends(get_current_active_affiliate)
):
    result = await db.execute(select(Wallet).where(Wallet.affiliate_id == affiliate.id))
    wallet = result.scalars().first()
    if not wallet:
        raise HTTPException(status_code=404, detail="Carteira não encontrada")
    return wallet

@router.post("/withdraw", response_model=WithdrawalResponse)
async def request_withdrawal(
    data: WithdrawalCreate,
    db: AsyncSession = Depends(get_db),
    affiliate: Affiliate = Depends(get_current_active_affiliate)
):
    if data.valor < 10000:
        raise HTTPException(status_code=400, detail="O valor mínimo para levantamento é de 10.000 Kz")
    
    # Check balance and deduct (atomic)
    success = await wallet_service.request_withdrawal(db, affiliate.id, Decimal(str(data.valor)))
    if not success:
        raise HTTPException(status_code=400, detail="Saldo insuficiente")
    
    withdrawal = WithdrawalRequest(
        affiliate_id=affiliate.id,
        valor=data.valor,
        conta_bancaria=data.conta_bancaria,
        banco=data.banco,
        status=WithdrawalStatus.PENDING
    )
    db.add(withdrawal)
    await db.commit()
    await db.refresh(withdrawal)
    # Task: Notify admin
    return withdrawal
