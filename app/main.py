import time
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from loguru import logger

from app.config import settings
from app.logging_config import setup_logging
from app.routers import auth, public, webhooks
from app.routers.admin import dashboard as admin_dashboard, approvals as admin_approvals, services as admin_services, leads as admin_leads, commissions as admin_commissions, withdrawals as admin_withdrawals, affiliates as admin_affiliates
from app.routers.affiliate import dashboard as affiliate_dashboard, leads as affiliate_leads, commissions as affiliate_commissions, wallet as affiliate_wallet, profile as affiliate_profile
from app.limiter import limiter

# Initialize Logging
setup_logging()


app = FastAPI(
    title=settings.PROJECT_NAME,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    description="Sistema de Gestão de Afiliados Mindware Angola"
)

# Setup Limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Security Middleware for Headers
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    
    response.headers["X-Process-Time"] = str(process_time)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    
    # Log request info
    logger.info(f"{request.method} {request.url.path} - {response.status_code} ({process_time:.4f}s)")
    
    return response

# Set restricted CORS origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Core Routers
app.include_router(auth.router, prefix=f"{settings.API_V1_STR}/auth", tags=["auth"])
app.include_router(public.router, prefix=f"{settings.API_V1_STR}/public", tags=["public"])
app.include_router(webhooks.router, prefix=f"{settings.API_V1_STR}/webhook", tags=["webhooks"])

# Admin Routers
app.include_router(admin_dashboard.router, prefix=f"{settings.API_V1_STR}/admin/dashboard", tags=["admin-dashboard"])
app.include_router(admin_approvals.router, prefix=f"{settings.API_V1_STR}/admin/approvals", tags=["admin-approvals"])
app.include_router(admin_services.router, prefix=f"{settings.API_V1_STR}/admin/services", tags=["admin-services"])
app.include_router(admin_leads.router, prefix=f"{settings.API_V1_STR}/admin/leads", tags=["admin-leads"])
app.include_router(admin_commissions.router, prefix=f"{settings.API_V1_STR}/admin/commissions", tags=["admin-commissions"])
app.include_router(admin_withdrawals.router, prefix=f"{settings.API_V1_STR}/admin/withdrawals", tags=["admin-withdrawals"])
app.include_router(admin_affiliates.router, prefix=f"{settings.API_V1_STR}/admin/affiliates", tags=["admin-affiliates"])

# Affiliate Routers
app.include_router(affiliate_dashboard.router, prefix=f"{settings.API_V1_STR}/affiliate/dashboard", tags=["affiliate-dashboard"])
app.include_router(affiliate_leads.router, prefix=f"{settings.API_V1_STR}/affiliate/leads", tags=["affiliate-leads"])
app.include_router(affiliate_commissions.router, prefix=f"{settings.API_V1_STR}/affiliate/commissions", tags=["affiliate-commissions"])
app.include_router(affiliate_wallet.router, prefix=f"{settings.API_V1_STR}/affiliate/wallet", tags=["affiliate-wallet"])
app.include_router(affiliate_profile.router, prefix=f"{settings.API_V1_STR}/affiliate/profile", tags=["affiliate-profile"])

@app.get("/")
async def root():
    return {"message": "Bem-vindo à API de Afiliados Mindware", "docs": "/docs"}
