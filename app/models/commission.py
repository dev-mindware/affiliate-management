import uuid
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Enum, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class CommissionStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    PAID = "paid"
    REJECTED = "rejected"

class Commission(Base):
    __tablename__ = "commissions"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    affiliate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("affiliates.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(ForeignKey("services.id"), nullable=False)
    lead_notification_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("lead_notifications.id"), nullable=True)
    
    client_nome: Mapped[str] = mapped_column(String(255), nullable=False)
    client_telefone: Mapped[str] = mapped_column(String(50), nullable=False)
    
    # Snapshots
    valor_servico: Mapped[float] = mapped_column(Numeric(precision=20, scale=2), nullable=False)
    valor_comissao: Mapped[float] = mapped_column(Numeric(precision=20, scale=2), nullable=False)
    
    status: Mapped[CommissionStatus] = mapped_column(Enum(CommissionStatus), default=CommissionStatus.PENDING, nullable=False)
    notas: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # R2 Storage links
    comprovativo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    comprovativo_filename: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    paid_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    affiliate: Mapped["Affiliate"] = relationship("Affiliate", back_populates="commissions")
    service: Mapped["Service"] = relationship("Service")
    lead: Mapped[Optional["LeadNotification"]] = relationship("LeadNotification")

    @property
    def affiliate_nome(self) -> Optional[str]:
        return self.affiliate.nome_completo if self.affiliate else None

    def __repr__(self) -> str:
        return f"<Commission {self.id} - {self.status}>"
