import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from app.models.withdrawal_request import WithdrawalStatus

class WalletResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    saldo_disponivel: float
    saldo_pendente: float
    total_ganho: float
    total_levantado: float
    updated_at: datetime

class WithdrawalBase(BaseModel):
    valor: float
    conta_bancaria: str
    banco: str

class WithdrawalCreate(WithdrawalBase):
    pass

class WithdrawalResponse(WithdrawalBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: uuid.UUID
    affiliate_id: uuid.UUID
    status: WithdrawalStatus
    notas_admin: Optional[str] = None
    comprovativo_url: Optional[str] = None
    created_at: datetime
    processed_at: Optional[datetime] = None
