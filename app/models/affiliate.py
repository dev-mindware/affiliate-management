import uuid
import enum
import random
import string
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Enum, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class AffiliateStatus(str, enum.Enum):
    PENDING_APPROVAL = "pending_approval"
    ACTIVE = "active"
    INACTIVE = "inactive"
    SUSPENDED = "suspended"
    REJECTED = "rejected"

def generate_affiliate_code():
    random_digits = ''.join(random.choices(string.digits, k=4))
    return f"MWD-AO-{random_digits}"

class Affiliate(Base):
    __tablename__ = "affiliates"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id"), unique=True, nullable=False)
    nome_completo: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    telefone: Mapped[str] = mapped_column(String(50), nullable=False)
    conta_bancaria: Mapped[str] = mapped_column(String(100), nullable=False)
    banco: Mapped[str] = mapped_column(String(100), nullable=False)
    codigo_afiliado: Mapped[str] = mapped_column(String(20), unique=True, default=generate_affiliate_code, nullable=False)
    status: Mapped[AffiliateStatus] = mapped_column(Enum(AffiliateStatus), default=AffiliateStatus.PENDING_APPROVAL, nullable=False)
    
    total_earned: Mapped[float] = mapped_column(Numeric(precision=20, scale=2), default=0.0)
    total_paid: Mapped[float] = mapped_column(Numeric(precision=20, scale=2), default=0.0)
    
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("users.id"), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    user: Mapped["User"] = relationship("User", foreign_keys=[user_id], back_populates="affiliate")
    wallet: Mapped["Wallet"] = relationship("Wallet", back_populates="affiliate", uselist=False)
    commissions: Mapped[list["Commission"]] = relationship("Commission", back_populates="affiliate")
    leads: Mapped[list["LeadNotification"]] = relationship("LeadNotification", back_populates="affiliate")

    def __repr__(self) -> str:
        return f"<Affiliate {self.nome_completo} ({self.codigo_afiliado})>"
