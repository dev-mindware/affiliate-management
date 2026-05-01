from typing import List, Optional
import uuid
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Form, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.routers.deps import get_current_active_admin
from app.models.withdrawal_request import WithdrawalRequest, WithdrawalStatus
from app.schemas.wallet import WithdrawalResponse
from app.schemas.common import PaginationParams, PaginatedResponse
from app.utils.pagination import paginate
from app.services import wallet_service

router = APIRouter()

@router.get("/", response_model=PaginatedResponse[WithdrawalResponse])
async def list_withdrawals(
    status: Optional[WithdrawalStatus] = None,
    params: PaginationParams = Depends(),
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    query = select(WithdrawalRequest)
    if status:
        query = query.where(WithdrawalRequest.status == status)
    
    # Order by creation date descending
    query = query.order_by(WithdrawalRequest.created_at.desc())
    
    return await paginate(db, query, params.page, params.limit)

@router.post("/{withdrawal_id}/approve", response_model=WithdrawalResponse)
async def approve_withdrawal(
    withdrawal_id: uuid.UUID,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    from app.services.storage_service import storage_service
    from app.services.email_service import email_service
    from app.models.affiliate import Affiliate
    from app.models.user import User
    
    result = await db.execute(select(WithdrawalRequest).where(WithdrawalRequest.id == withdrawal_id))
    request = result.scalars().first()
    
    if not request or request.status != WithdrawalStatus.PENDING:
        raise HTTPException(status_code=404, detail="Pedido não encontrado ou já processado")
    
    # 1. Upload proof to R2
    proof_url = await storage_service.upload_file(file)
    
    # 2. Update status
    request.status = WithdrawalStatus.APPROVED
    request.processed_at = datetime.utcnow()
    request.comprovativo_url = proof_url
    
    # 3. Update wallet (total_levantado)
    from decimal import Decimal
    await wallet_service.approve_withdrawal(db, request.affiliate_id, Decimal(str(request.valor)))
    
    # 4. Get affiliate email for notification
    aff_res = await db.execute(
        select(User.email).join(Affiliate).where(Affiliate.id == request.affiliate_id)
    )
    email = aff_res.scalar()
    
    await db.commit()
    
    # 5. Send email notification
    if email:
        try:
            await email_service.send_withdrawal_approved_email(
                email=email,
                amount=float(request.valor),
                proof_url=proof_url
            )
        except Exception as e:
            # Log error but don't fail the approval if email fails
            print(f"Error sending email: {e}")
            
    return request

@router.post("/{withdrawal_id}/reject", response_model=WithdrawalResponse)
async def reject_withdrawal(
    withdrawal_id: uuid.UUID,
    notas_admin: str = Form(...),
    db: AsyncSession = Depends(get_db),
    admin=Depends(get_current_active_admin)
):
    result = await db.execute(select(WithdrawalRequest).where(WithdrawalRequest.id == withdrawal_id))
    request = result.scalars().first()
    
    if not request or request.status != WithdrawalStatus.PENDING:
        raise HTTPException(status_code=404, detail="Pedido não encontrado ou já processado")
    
    request.status = WithdrawalStatus.REJECTED
    request.processed_at = datetime.utcnow()
    request.notas_admin = notas_admin
    
    # Return money to wallet
    from decimal import Decimal
    await wallet_service.reject_withdrawal(db, request.affiliate_id, Decimal(str(request.valor)))
    
    await db.commit()
    return request
