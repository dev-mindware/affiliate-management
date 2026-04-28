import uuid
import enum
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, Enum, ForeignKey, Numeric, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class WithdrawalStatus(str, enum.Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"

class WithdrawalRequest(Base):
    __tablename__ = "withdrawal_requests"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    affiliate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("affiliates.id"), nullable=False)
    
    valor: Mapped[float] = mapped_column(Numeric(precision=20, scale=2), nullable=False)
    
    # Snapshots of bank details at time of request
    conta_bancaria: Mapped[str] = mapped_column(String(100), nullable=False)
    banco: Mapped[str] = mapped_column(String(100), nullable=False)
    
    status: Mapped[WithdrawalStatus] = mapped_column(Enum(WithdrawalStatus), default=WithdrawalStatus.PENDING, nullable=False)
    notas_admin: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    # R2 Storage links for proof
    comprovativo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    processed_at: Mapped[Optional[datetime]] = mapped_column(DateTime, nullable=True)

    affiliate: Mapped["Affiliate"] = relationship("Affiliate")

    def __repr__(self) -> str:
        return f"<WithdrawalRequest {self.id} - {self.status}>"
