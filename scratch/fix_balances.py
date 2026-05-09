import asyncio
import uuid
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy.future import select
from decimal import Decimal

# Assuming we can import from the app
import sys
import os
sys.path.append(os.getcwd())

from app.config import settings
from app.models.commission import Commission, CommissionStatus
from app.models.wallet import Wallet
from app.services import wallet_service

async def fix_balances():
    engine = create_async_engine(settings.async_database_url)
    async_session = sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

    async with async_session() as db:
        # Find all APPROVED commissions
        result = await db.execute(select(Commission).where(Commission.status == CommissionStatus.APPROVED))
        commissions = result.scalars().all()
        
        print(f"Found {len(commissions)} approved commissions to process.")
        
        for comm in commissions:
            print(f"Processing commission {comm.id} for affiliate {comm.affiliate_id} (Value: {comm.valor_comissao})")
            # Move from pending to available
            await wallet_service.confirm_commission_payment(db, comm.affiliate_id, Decimal(str(comm.valor_comissao)))
        
        await db.commit()
        print("Balances updated successfully.")

if __name__ == "__main__":
    asyncio.run(fix_balances())
