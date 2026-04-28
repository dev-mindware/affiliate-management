import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import AsyncSessionLocal, engine
from app.models.user import User, UserRole
from app.models.service import Service
from app.services import auth_service
from app.config import settings
from decimal import Decimal

async def seed_data():
    async with AsyncSessionLocal() as db:
        # 1. Create First Admin
        admin_email = settings.FIRST_ADMIN_EMAIL
        result = await db.execute(auth_service.select(User).where(User.email == admin_email))
        if not result.scalars().first():
            admin = User(
                email=admin_email,
                password_hash=auth_service.get_password_hash(settings.FIRST_ADMIN_PASSWORD),
                role=UserRole.ADMIN,
                is_active=True
            )
            db.add(admin)
            print(f"Admin {admin_email} criado.")

        # 2. Seed Services
        services_data = [
            {"nome": "Presença Digital Website", "preco": 192514, "comissao": 40000},
            {"nome": "Email Starter Business", "preco": 11881, "comissao": 1000},
            {"nome": "Email Premium Pro", "preco": 56995, "comissao": 5000},
            {"nome": "Email Premium Team Pack", "preco": 153428, "comissao": 12000},
        ]

        for s in services_data:
            res = await db.execute(auth_service.select(Service).where(Service.nome == s["nome"]))
            if not res.scalars().first():
                service = Service(
                    nome=s["nome"],
                    preco=Decimal(str(s["preco"])),
                    comissao=Decimal(str(s["comissao"])),
                    ativo=True
                )
                db.add(service)
                print(f"Serviço {s['nome']} criado.")

        await db.commit()
    print("Seed concluído com sucesso.")

if __name__ == "__main__":
    asyncio.run(seed_data())
