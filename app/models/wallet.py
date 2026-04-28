import uuid
from datetime import datetime
from sqlalchemy import Numeric, DateTime, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database import Base

class Wallet(Base):
    __tablename__ = "wallets"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    affiliate_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("affiliates.id"), unique=True, nullable=False)
    
    saldo_disponivel: Mapped[float] = mapped_column(Numeric(precision=20, scale=2), default=0.0, nullable=False)
    saldo_pendente: Mapped[float] = mapped_column(Numeric(precision=20, scale=2), default=0.0, nullable=False)
    total_ganho: Mapped[float] = mapped_column(Numeric(precision=20, scale=2), default=0.0, nullable=False)
    total_levantado: Mapped[float] = mapped_column(Numeric(precision=20, scale=2), default=0.0, nullable=False)
    
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    affiliate: Mapped["Affiliate"] = relationship("Affiliate", back_populates="wallet")

    def __repr__(self) -> str:
        return f"<Wallet Affiliate:{self.affiliate_id} Saldo:{self.saldo_disponivel}>"
