import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, ConfigDict
from app.models.lead_notification import LeadStatus

class LeadBase(BaseModel):
    client_nome: str
    client_telefone: str
    service_id: int
    notas: Optional[str] = None

class LeadCreate(LeadBase):
    pass

class LeadAdminCreate(LeadBase):
    affiliate_code: str

class LeadUpdate(BaseModel):
    status: LeadStatus

class LeadResponse(LeadBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    affiliate_id: uuid.UUID
    status: LeadStatus
    created_at: datetime
    updated_at: datetime
