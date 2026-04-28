from fastapi_mail import FastMail, MessageSchema, ConnectionConfig, MessageType
from pydantic import EmailStr
from app.config import settings
from pathlib import Path

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

async def send_email(subject: str, recipients: list, body: str):
    message = MessageSchema(
        subject=subject,
        recipients=recipients,
        body=body,
        subtype=MessageType.html
    )
    fm = FastMail(conf)
    await fm.send_message(message)

# Example template generator
def get_welcome_email(nome: str, codigo: str):
    return f"""
    <html>
        <body>
            <h1>Bem-vindo à Mindware!</h1>
            <p>Olá {nome},</p>
            <p>O seu cadastro de afiliado foi aprovado com sucesso.</p>
            <p>O seu código único é: <strong>{codigo}</strong></p>
            <p>Já pode começar a reportar os seus leads e ganhar comissões.</p>
        </body>
    </html>
    """
