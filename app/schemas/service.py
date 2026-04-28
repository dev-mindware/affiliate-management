from datetime import datetime
from pydantic import BaseModel, ConfigDict, computed_field

class ServiceBase(BaseModel):
    nome: str
    descricao: str | None = None
    preco: float
    comissao: float
    ativo: bool = True

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    nome: str | None = None
    descricao: str | None = None
    preco: float | None = None
    comissao: float | None = None
    ativo: bool | None = None

class ServiceResponse(ServiceBase):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    created_at: datetime
    updated_at: datetime

    @computed_field
    @property
    def percentagem_comissao(self) -> float:
        if self.preco > 0:
            return float((self.comissao / self.preco) * 100)
        return 0.0
