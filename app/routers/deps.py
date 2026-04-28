import uuid
from typing import Generator, Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.config import settings
from app.database import get_db
from app.models.user import User, UserRole
from app.models.affiliate import Affiliate, AffiliateStatus
from app.schemas.auth import TokenPayload
from app.services import auth_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Poderia não validar as credenciais",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[auth_service.ALGORITHM])
        user_id: str = payload.get("sub")
        token_type: str = payload.get("type")
        if user_id is None or token_type != "access":
            raise credentials_exception
        token_data = TokenPayload(sub=user_id)
    except JWTError:
        raise credentials_exception
    
    result = await db.execute(select(User).where(User.id == uuid.UUID(token_data.sub)))
    user = result.scalars().first()
    
    if user is None:
        raise credentials_exception
    if not user.is_active:
        raise HTTPException(status_code=400, detail="Utilizador inactivo")
    return user

async def get_current_active_admin(
    current_user: User = Depends(get_current_user),
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="O utilizador não tem privilégios suficientes"
        )
    return current_user

async def get_current_active_affiliate(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
) -> Affiliate:
    if current_user.role != UserRole.AFFILIATE:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="O utilizador não é um afiliado"
        )
    
    result = await db.execute(select(Affiliate).where(Affiliate.user_id == current_user.id))
    affiliate = result.scalars().first()
    
    if not affiliate:
        raise HTTPException(status_code=404, detail="Perfil de afiliado não encontrado")
    
    if affiliate.status == AffiliateStatus.PENDING_APPROVAL:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="O seu cadastro está a aguardar aprovação pelo administrador"
        )
    if affiliate.status in [AffiliateStatus.SUSPENDED, AffiliateStatus.INACTIVE]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="A sua conta está suspensa ou inactiva"
        )
    
    return affiliate
