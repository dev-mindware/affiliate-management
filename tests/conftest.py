import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import NullPool
from app.main import app
from app.database import Base, get_db
from app.config import settings

# Test database URL
TEST_SQLALCHEMY_DATABASE_URL = settings.async_database_url.replace(
    f"/{settings.POSTGRES_DB}", f"/{settings.POSTGRES_DB}_test"
)

# Use NullPool for tests to avoid "another operation in progress" errors
engine_test = create_async_engine(TEST_SQLALCHEMY_DATABASE_URL, future=True, poolclass=NullPool)
TestingSessionLocal = async_sessionmaker(
    bind=engine_test, class_=AsyncSession, expire_on_commit=False
)

@pytest_asyncio.fixture(scope="session", autouse=True)
async def setup_test_db():
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
        await conn.run_sync(Base.metadata.create_all)
    
    # Seed Admin User in Test DB
    from app.models.user import User, UserRole
    from app.services import auth_service
    async with TestingSessionLocal() as db:
        admin = User(
            email=settings.FIRST_ADMIN_EMAIL,
            password_hash=auth_service.get_password_hash(settings.FIRST_ADMIN_PASSWORD),
            role=UserRole.ADMIN,
            is_active=True
        )
        db.add(admin)
        await db.commit()
    yield
    async with engine_test.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)

@pytest_asyncio.fixture
async def db_session():
    async with TestingSessionLocal() as session:
        yield session
        # Ensure we close properly
        await session.close()

@pytest_asyncio.fixture
async def client():
    # Define override here to use its own session
    async def override_get_db():
        async with TestingSessionLocal() as session:
            yield session

    app.dependency_overrides[get_db] = override_get_db
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    app.dependency_overrides.clear()

@pytest_asyncio.fixture
async def admin_token_headers(client: AsyncClient):
    login_data = {
        "email": settings.FIRST_ADMIN_EMAIL,
        "password": settings.FIRST_ADMIN_PASSWORD
    }
    response = await client.post("/api/v1/auth/login/json", json=login_data)
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
