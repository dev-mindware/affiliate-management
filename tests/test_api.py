import pytest
from httpx import AsyncClient
from app.config import settings

@pytest.mark.asyncio
async def test_register_affiliate(client: AsyncClient):
    payload = {
        "email": "test_affiliate@example.com",
        "password": "securepassword123",
        "nome_completo": "Test Affiliate",
        "telefone": "+244900000000",
        "conta_bancaria": "AO06000000000000000000001",
        "banco": "BFA"
    }
    response = await client.post("/api/v1/auth/register", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == payload["email"]
    assert data["status"] == "pending_approval"

@pytest.mark.asyncio
async def test_login_affiliate(client: AsyncClient):
    # First, register (already done in DB if tests run sequentially, but let's be safe)
    register_payload = {
        "email": "login_test@example.com",
        "password": "loginpassword123",
        "nome_completo": "Login Test",
        "telefone": "+244900000001",
        "conta_bancaria": "AO06000000000000000000002",
        "banco": "BAI"
    }
    await client.post("/api/v1/auth/register", json=register_payload)
    
    # Note: Affiliate is PENDING, login should fail with 403 according to our router
    login_data = {
        "username": register_payload["email"],
        "password": register_payload["password"]
    }
    response = await client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 403
    assert response.json()["detail"] == "O seu cadastro está a aguardar aprovação pelo administrador"

@pytest.mark.asyncio
async def test_admin_login(client: AsyncClient):
    # Seeding is done outside usually, but let's assume it's there or seed it
    from app.services import auth_service
    from app.models.user import User, UserRole
    from sqlalchemy.ext.asyncio import AsyncSession
    from app.database import get_db
    
    # We use the existing seeded admin from .env
    login_data = {
        "email": settings.FIRST_ADMIN_EMAIL,
        "password": settings.FIRST_ADMIN_PASSWORD
    }
    response = await client.post("/api/v1/auth/login/json", json=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_public_ranking(client: AsyncClient):
    response = await client.get("/api/v1/public/ranking")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_public_services(client: AsyncClient):
    response = await client.get("/api/v1/public/services")
    assert response.status_code == 200
    data = response.json()
    assert "items" in data
    assert "total" in data
    assert isinstance(data["items"], list)
