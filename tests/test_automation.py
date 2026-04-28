import pytest
from httpx import AsyncClient
import uuid
from app.models.lead_notification import LeadStatus
from app.models.commission import CommissionStatus
from tests.conftest import TestingSessionLocal

@pytest.mark.asyncio
async def test_lead_to_commission_automation(client: AsyncClient, admin_token_headers):
    # 1. Get an affiliate and a service
    from app.models.affiliate import Affiliate, AffiliateStatus
    from app.models.service import Service
    from sqlalchemy.future import select
    from app.models.user import User, UserRole
    
    # We need to ensure there's an affiliate and service in the test DB
    async with TestingSessionLocal() as db:
        # Create a test affiliate
        user = User(
            email="aff_auto@example.com", 
            password_hash="...", 
            role=UserRole.AFFILIATE, 
            is_active=True
        )
        db.add(user)
        await db.flush()
        
        affiliate = Affiliate(
            id=user.id,
            user_id=user.id,
            nome_completo="Affiliate Auto",
            email=user.email,
            telefone="123",
            conta_bancaria="123",
            banco="123",
            status=AffiliateStatus.ACTIVE
        )
        db.add(affiliate)
        
        # Create a test service
        service = Service(nome="Test Service Auto", preco=100.0, comissao=20.0, ativo=True)
        db.add(service)
        
        await db.commit()
        await db.refresh(affiliate)
        await db.refresh(service)
        affiliate_id = affiliate.id
        service_id = service.id
        
    # 2. Create a lead
    from app.models.lead_notification import LeadNotification
    async with TestingSessionLocal() as db:
        lead = LeadNotification(
            affiliate_id=affiliate_id,
            service_id=service_id,
            client_nome="Test Lead Automation",
            client_telefone="998877665"
        )
        db.add(lead)
        await db.commit()
        await db.refresh(lead)
        lead_id = lead.id

    # 3. Update lead status to CONTACTED as Admin
    response = await client.patch(
        f"/api/v1/admin/leads/{lead_id}/status",
        headers=admin_token_headers,
        json={"status": "contacted"}
    )
    assert response.status_code == 200
    
    # 4. Check if commission was created
    from app.models.commission import Commission
    async with TestingSessionLocal() as db:
        res = await db.execute(select(Commission).where(Commission.lead_notification_id == lead_id))
        commission = res.scalars().first()
        assert commission is not None
        assert commission.status == CommissionStatus.PENDING

    # 5. Update lead status to CONVERTED as Admin
    response = await client.patch(
        f"/api/v1/admin/leads/{lead_id}/status",
        headers=admin_token_headers,
        json={"status": "converted"}
    )
    assert response.status_code == 200
    
    # 6. Check if commission was approved
    async with TestingSessionLocal() as db:
        res = await db.execute(select(Commission).where(Commission.id == commission.id))
        commission = res.scalars().first()
        assert commission.status == CommissionStatus.APPROVED

@pytest.mark.asyncio
async def test_admin_manual_lead_registration(client: AsyncClient, admin_token_headers):
    # 1. Ensure we have an affiliate and a service
    from app.models.affiliate import Affiliate, AffiliateStatus
    from app.models.service import Service
    from sqlalchemy.future import select
    from app.models.user import User, UserRole
    
    async with TestingSessionLocal() as db:
        # Check if they exist or create
        res = await db.execute(select(Affiliate))
        affiliate = res.scalars().first()
        if not affiliate:
             # reuse logic from above or simplified
             user = User(email="manual@example.com", password_hash="...", role=UserRole.AFFILIATE, is_active=True)
             db.add(user)
             await db.flush()
             affiliate = Affiliate(id=user.id, user_id=user.id, nome_completo="Manual Aff", email=user.email, telefone="1", conta_bancaria="1", banco="1", status=AffiliateStatus.ACTIVE)
             db.add(affiliate)
        
        res = await db.execute(select(Service))
        service = res.scalars().first()
        if not service:
            service = Service(nome="Manual Service", preco=100, comissao=10, ativo=True)
            db.add(service)
        
        await db.commit()
        await db.refresh(affiliate)
        await db.refresh(service)
        aff_code = affiliate.codigo_afiliado
        service_id = service.id

    # 2. Register lead as Admin
    payload = {
        "client_nome": "Admin Client",
        "client_telefone": "123456789",
        "service_id": service_id,
        "affiliate_code": aff_code,
        "notas": "Manual entry"
    }
    response = await client.post(
        "/api/v1/admin/leads/",
        headers=admin_token_headers,
        json=payload
    )
    assert response.status_code == 200
    data = response.json()
    assert data["client_nome"] == payload["client_nome"]
    assert data["affiliate_id"] is not None
