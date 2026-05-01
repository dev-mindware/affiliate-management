from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Response, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.schemas.auth import Token, UserRegister, Msg, TokenPayload, UserLogin
from app.schemas.affiliate import AffiliateResponse
from app.services import auth_service, affiliate_service
from app.routers.deps import get_current_user
from app.config import settings
from jose import jwt, JWTError
from app.limiter import limiter

router = APIRouter()

@router.post("/register", response_model=AffiliateResponse, summary="Register a new affiliate", description="Creates a new affiliate account. The account will be pending until approved by an administrator.")
@limiter.limit("5/minute")
async def register(
    request: Request,
    data: UserRegister,
    db: AsyncSession = Depends(get_db)
):
    user = await auth_service.get_user_by_email(db, data.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="O utilizador com este email já existe no sistema.",
        )
    
    affiliate = await affiliate_service.register_affiliate(
        db,
        email=data.email,
        password=data.password,
        nome_completo=data.nome_completo,
        telefone=data.telefone,
        conta_bancaria=data.conta_bancaria,
        banco=data.banco
    )
    await db.commit()
    return affiliate

@router.post("/login", response_model=Token, summary="OAuth2 Login (Form Data)", description="Standard OAuth2 login using form-data (username/password). Used by Swagger 'Authorize' button.")
@limiter.limit("5/minute")
async def login(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    return await _perform_login(response, db, form_data.username, form_data.password)

@router.post("/login/json", response_model=Token, summary="JSON Login", description="Alternative login using JSON body. More convenient for standard web/mobile clients.")
@limiter.limit("5/minute")
async def login_json(
    request: Request,
    response: Response,
    data: UserLogin,
    db: AsyncSession = Depends(get_db)
):
    return await _perform_login(response, db, data.email, data.password)

async def _perform_login(response: Response, db: AsyncSession, email: str, password: str):
    user = await auth_service.get_user_by_email(db, email)
    if not user or not auth_service.verify_password(password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email ou senha incorrectos",
        )
    
    if user.role == "affiliate":
        from sqlalchemy.future import select
        from app.models.affiliate import Affiliate, AffiliateStatus
        res = await db.execute(select(Affiliate).where(Affiliate.user_id == user.id))
        affiliate = res.scalars().first()
        if affiliate.status == AffiliateStatus.PENDING_APPROVAL:
            raise HTTPException(status_code=403, detail="O seu cadastro está a aguardar aprovação pelo administrador")
        if affiliate.status == AffiliateStatus.SUSPENDED:
            raise HTTPException(status_code=403, detail="A sua conta está suspensa")

    access_token = auth_service.create_access_token(subject=user.id)
    refresh_token, jti = auth_service.create_refresh_token(subject=user.id)
    
    response.set_cookie(
        key="mw.af.rt.v1",
        value=refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        samesite="lax",
        secure=False
    )
    
    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }

@router.post("/refresh", response_model=Token, summary="Refresh access token", description="Uses the refresh token from the HttpOnly cookie to generate a new access token and a new refresh token (rotation).")
async def refresh(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db)
):
    refresh_token = request.cookies.get("mw.af.rt.v1")
    if not refresh_token:
        raise HTTPException(status_code=401, detail="Refresh token ausente")
    
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[auth_service.ALGORITHM])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Token inválido")
        
        jti = payload.get("jti")
        if await auth_service.is_token_blacklisted(db, jti):
            raise HTTPException(status_code=401, detail="Token revogado")
            
        user_id = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido ou expirado")
        
    from datetime import datetime
    await auth_service.blacklist_token(db, jti, datetime.fromtimestamp(payload["exp"]))
    
    access_token = auth_service.create_access_token(subject=user_id)
    new_refresh_token, new_jti = auth_service.create_refresh_token(subject=user_id)
    
    response.set_cookie(
        key="mw.af.rt.v1",
        value=new_refresh_token,
        httponly=True,
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 24 * 3600,
        samesite="lax",
        secure=False
    )
    
    await db.commit()
    
    return {
        "access_token": access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer",
    }

@router.post("/logout", response_model=Msg)
async def logout(request: Request, response: Response, db: AsyncSession = Depends(get_db)):
    refresh_token = request.cookies.get("mw.af.rt.v1")
    if refresh_token:
        try:
            payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=[auth_service.ALGORITHM])
            jti = payload.get("jti")
            from datetime import datetime
            await auth_service.blacklist_token(db, jti, datetime.fromtimestamp(payload["exp"]))
            await db.commit()
        except:
            pass
            
    response.delete_cookie("mw.af.rt.v1")
    return {"msg": "Sessão encerrada com sucesso"}

@router.get("/me")
async def get_me(current_user=Depends(get_current_user)):
    return current_user
