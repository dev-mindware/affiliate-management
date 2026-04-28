import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr, ConfigDict, Field
from app.models.affiliate import AffiliateStatus

class AffiliateBase(BaseModel):
    nome_completo: str = Field(..., json_schema_extra={"example": "João da Silva"}, description="Full name of the affiliate")
    email: EmailStr = Field(..., json_schema_extra={"example": "joao@example.com"}, description="Registered email address")
    telefone: str = Field(..., json_schema_extra={"example": "+244 923 000 000"}, description="Phone number")
    conta_bancaria: str = Field(..., description="IBAN/Bank account for payouts")
    banco: str = Field(..., json_schema_extra={"example": "BFA"}, description="Financial institution name")

class AffiliateCreate(AffiliateBase):
    pass

class AffiliateUpdate(BaseModel):
    telefone: Optional[str] = Field(None, json_schema_extra={"example": "+244 923 000 001"})
    conta_bancaria: Optional[str] = Field(None, description="Updated IBAN")
    banco: Optional[str] = Field(None, json_schema_extra={"example": "BAI"})
    status: Optional[AffiliateStatus] = Field(None, description="Admin update of status")

class AffiliateResponse(AffiliateBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID = Field(..., description="Unique internal identifier")
    codigo_afiliado: str = Field(..., json_schema_extra={"example": "MWD-AO-1234"}, description="Public affiliate code used for lead tracking")
    status: AffiliateStatus = Field(..., description="Current status (pending, active, suspended, etc.)")
    total_earned: float = Field(0.0, description="Cumulative commissions earned to date")
    total_paid: float = Field(0.0, description="Total amount successfully withdrawn")
    created_at: datetime = Field(..., description="Timestamp of registration")
    approved_at: Optional[datetime] = Field(None, description="Timestamp of admin approval")

class RankingItem(BaseModel):
    name: str = Field(..., description="Affiliate name")
    total_earned: float = Field(..., description="Total commission value")
    conversions: int = Field(..., description="Number of successful conversions")

class AffiliateRankInfo(BaseModel):
    rank: Optional[int] = Field(None, description="Current rank position in the system")
    total_earned: float = Field(..., description="Total commission earned")
    distance_to_next: float = Field(..., description="Value needed to reach the next rank position")
