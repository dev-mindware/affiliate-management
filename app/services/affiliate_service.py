import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.user import User, UserRole
from app.models.affiliate import Affiliate, AffiliateStatus
from app.services import auth_service, wallet_service

async def register_affiliate(
    db: AsyncSession,
    email: str,
    password: str,
    nome_completo: str,
    telefone: str,
    conta_bancaria: str,
    banco: str
) -> Affiliate:
    # 1. Create User
    user = User(
        email=email,
        password_hash=auth_service.get_password_hash(password),
        role=UserRole.AFFILIATE,
        is_active=True
    )
    db.add(user)
    await db.flush()

    # 2. Create Affiliate Profile
    affiliate = Affiliate(
        user_id=user.id,
        nome_completo=nome_completo,
        email=email,
        telefone=telefone,
        conta_bancaria=conta_bancaria,
        banco=banco,
        status=AffiliateStatus.PENDING_APPROVAL
    )
    db.add(affiliate)
    await db.flush()
    
    return affiliate

async def approve_affiliate(db: AsyncSession, affiliate_id: uuid.UUID, admin_id: uuid.UUID) -> Affiliate:
    result = await db.execute(select(Affiliate).where(Affiliate.id == affiliate_id))
    affiliate = result.scalars().first()
    
    if not affiliate or affiliate.status != AffiliateStatus.PENDING_APPROVAL:
        return None
    
    affiliate.status = AffiliateStatus.ACTIVE
    affiliate.approved_at = datetime.utcnow()
    affiliate.approved_by = admin_id
    
    # Create Wallet
    await wallet_service.create_wallet(db, affiliate.id)
    
    await db.flush()
    return affiliate

async def reject_affiliate(db: AsyncSession, affiliate_id: uuid.UUID) -> bool:
    result = await db.execute(select(Affiliate).where(Affiliate.id == affiliate_id))
    affiliate = result.scalars().first()
    
    if not affiliate or affiliate.status != AffiliateStatus.PENDING_APPROVAL:
        return False
    
    affiliate.status = AffiliateStatus.REJECTED
    await db.flush()
    return True
