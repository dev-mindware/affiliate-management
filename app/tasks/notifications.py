import asyncio
from app.tasks.celery_app import celery_app
from app.integrations.email import send_email, get_welcome_email

@celery_app.task(name="send_welcome_email_task")
def send_welcome_email_task(email: str, nome: str, codigo: str):
    loop = asyncio.get_event_loop()
    body = get_welcome_email(nome, codigo)
    loop.run_until_complete(send_email("Bem-vindo à Mindware Angola", [email], body))

@celery_app.task(name="send_admin_notification_task")
def send_admin_notification_task(subject: str, message: str):
    from app.config import settings
    loop = asyncio.get_event_loop()
    loop.run_until_complete(send_email(subject, [settings.FIRST_ADMIN_EMAIL], f"<p>{message}</p>"))
