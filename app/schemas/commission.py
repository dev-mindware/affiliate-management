import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.commission import CommissionStatus

class CommissionBase(BaseModel):
    client_nome: str
    client_telefone: str
    service_id: int
    notas: Optional[str] = None

class CommissionCreate(CommissionBase):
    affiliate_id: uuid.UUID
    lead_notification_id: Optional[uuid.UUID] = None

class CommissionWebhookCreate(CommissionBase):
    affiliate_code: str

class CommissionResponse(CommissionBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    affiliate_id: uuid.UUID
    affiliate_nome: Optional[str] = None
    valor_servico: float
    valor_comissao: float
    status: CommissionStatus
    comprovativo_url: Optional[str] = None
    created_at: datetime
    approved_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
