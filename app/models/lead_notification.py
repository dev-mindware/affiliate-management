import uuid
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Enum, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class LeadStatus(str, enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    CONVERTED = "converted"
    LOST = "lost"

class LeadNotification(Base):
    __tablename__ = "lead_notifications"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    affiliate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("affiliates.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), nullable=False)
    
    client_nome: Mapped[str] = mapped_column(String(255), nullable=False)
    client_telefone: Mapped[str] = mapped_column(String(50), nullable=False)
    notas: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[LeadStatus] = mapped_column(Enum(LeadStatus), default=LeadStatus.NEW, nullable=False)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    affiliate: Mapped["Affiliate"] = relationship("Affiliate", back_populates="leads")
    service: Mapped["Service"] = relationship("Service")

    def __repr__(self) -> str:
        return f"<Lead {self.client_nome} - {self.status}>"
