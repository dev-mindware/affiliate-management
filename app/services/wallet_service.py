import uuid
from decimal import Decimal
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.wallet import Wallet
from app.models.affiliate import Affiliate
from app.models.commission import Commission, CommissionStatus
from app.models.withdrawal_request import WithdrawalRequest, WithdrawalStatus

async def create_wallet(db: AsyncSession, affiliate_id: uuid.UUID) -> Wallet:
    wallet = Wallet(affiliate_id=affiliate_id)
    db.add(wallet)
    return wallet

async def get_wallet(db: AsyncSession, affiliate_id: uuid.UUID, lock: bool = False) -> Wallet:
    query = select(Wallet).where(Wallet.affiliate_id == affiliate_id)
    if lock:
        query = query.with_for_update()
    result = await db.execute(query)
    return result.scalars().first()

async def add_pending_commission(db: AsyncSession, affiliate_id: uuid.UUID, amount: Decimal):
    """
    When a commission is created (PENDING).
    Adds value to saldo_pendente.
    """
    wallet = await get_wallet(db, affiliate_id, lock=True)
    if not wallet:
        return None
    
    wallet.saldo_pendente += amount
    await db.flush()
    return wallet

async def remove_pending_commission(db: AsyncSession, affiliate_id: uuid.UUID, amount: Decimal):
    """
    When a pending commission is rejected.
    Removes value from saldo_pendente.
    """
    wallet = await get_wallet(db, affiliate_id, lock=True)
    if not wallet:
        return None
    
    wallet.saldo_pendente -= amount
    await db.flush()
    return wallet

async def confirm_commission_payment(db: AsyncSession, affiliate_id: uuid.UUID, amount: Decimal):
    """
    When a commission is paid (Approved -> Paid).
    Moves from saldo_pendente to saldo_disponivel and updates total_earned.
    """
    wallet = await get_wallet(db, affiliate_id, lock=True)
    if not wallet:
        return None
    
    wallet.saldo_pendente -= amount
    wallet.saldo_disponivel += amount
    wallet.total_ganho += amount
    
    # Also update the affiliate record for ranking
    result = await db.execute(select(Affiliate).where(Affiliate.id == affiliate_id).with_for_update())
    affiliate = result.scalars().first()
    if affiliate:
        affiliate.total_earned += amount
        
    await db.flush()
    return wallet

async def request_withdrawal(db: AsyncSession, affiliate_id: uuid.UUID, amount: Decimal) -> bool:
    """
    When an affiliate requests a withdrawal.
    Deducts from saldo_disponivel immediately (reserves it).
    """
    wallet = await get_wallet(db, affiliate_id, lock=True)
    if not wallet or wallet.saldo_disponivel < amount:
        return False
    
    wallet.saldo_disponivel -= amount
    await db.flush()
    return True

async def approve_withdrawal(db: AsyncSession, affiliate_id: uuid.UUID, amount: Decimal):
    """
    When admin approves withdrawal.
    Updates total_levantado.
    """
    wallet = await get_wallet(db, affiliate_id, lock=True)
    if not wallet:
        return None
    
    wallet.total_levantado += amount
    
    # Update affiliate total_paid
    result = await db.execute(select(Affiliate).where(Affiliate.id == affiliate_id).with_for_update())
    affiliate = result.scalars().first()
    if affiliate:
        affiliate.total_paid += amount
        
    await db.flush()
    return wallet

async def reject_withdrawal(db: AsyncSession, affiliate_id: uuid.UUID, amount: Decimal):
    """
    When admin rejects withdrawal.
    Returns amount to saldo_disponivel.
    """
    wallet = await get_wallet(db, affiliate_id, lock=True)
    if not wallet:
        return None
    
    wallet.saldo_disponivel += amount
    await db.flush()
    return wallet
