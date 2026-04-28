import uuid
from datetime import datetime
from typing import Optional
from sqlalchemy import String, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    affiliate_id: Mapped[Optional[uuid.UUID]] = mapped_column(ForeignKey("affiliates.id"), nullable=True)
    
    tipo: Mapped[str] = mapped_column(String(100), nullable=False) # e.g., 'email_welcome', 'commission_paid'
    mensagem: Mapped[str] = mapped_column(Text, nullable=False)
    
    enviado: Mapped[bool] = mapped_column(Boolean, default=False)
    erro: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    affiliate: Mapped[Optional["Affiliate"]] = relationship("Affiliate")

    def __repr__(self) -> str:
        return f"<Notification {self.tipo} Sent:{self.enviado}>"
