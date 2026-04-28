from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from app.config import settings
from pydantic import EmailStr
from typing import List

conf = ConnectionConfig(
    MAIL_USERNAME=settings.MAIL_USERNAME,
    MAIL_PASSWORD=settings.MAIL_PASSWORD,
    MAIL_FROM=settings.MAIL_FROM,
    MAIL_PORT=settings.MAIL_PORT,
    MAIL_SERVER=settings.MAIL_SERVER,
    MAIL_STARTTLS=settings.MAIL_STARTTLS,
    MAIL_SSL_TLS=settings.MAIL_SSL_TLS,
    USE_CREDENTIALS=settings.USE_CREDENTIALS,
    VALIDATE_CERTS=True
)

class EmailService:
    def __init__(self):
        self.fastmail = FastMail(conf)

    async def send_withdrawal_approved_email(
        self, 
        email: EmailStr, 
        amount: float, 
        proof_url: str
    ):
        message = MessageSchema(
            subject="Seu Levantamento foi Aprovado!",
            recipients=[email],
            body=f"""
            Olá,
            
            Boas notícias! O seu pedido de levantamento no valor de {amount} foi aprovado e processado.
            
            Pode visualizar o comprovativo de pagamento aqui:
            {proof_url}
            
            Obrigado por trabalhar conosco!
            Equipa {settings.PROJECT_NAME}
            """,
            subtype=MessageType.plain
        )
        await self.fastmail.send_message(message)

email_service = EmailService()
