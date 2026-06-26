


# backend/app/tasks.py

from .celery_app import celery_app
from .dependencies import ticket_collection, user_collection, ticket_helper
from bson import ObjectId
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import asyncio 

def _send_email(to_email: str, subject: str, html_content: str, text_content: str):
    smtp_server = os.getenv("SMTP_SERVER")
    smtp_port = int(os.getenv("SMTP_PORT", 587))
    sender_email = os.getenv("EMAIL_SENDER")
    sender_password = os.getenv("EMAIL_PASSWORD")

    if not all([smtp_server, smtp_port, sender_email, sender_password]):
        print(" [CELERY WORKER] ERROR: SMTP settings are missing.")
        return False

    message = MIMEMultipart("alternative")
    message["Subject"] = subject
    message["From"] = f"Support Tickets App <{sender_email}>"
    message["To"] = to_email
    message.attach(MIMEText(text_content, "plain"))
    message.attach(MIMEText(html_content, "html"))

    try:
        print(f" [CELERY WORKER] Connecting to SMTP to send email to {to_email}...")
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, to_email, message.as_string())
            print(f" [CELERY WORKER] Email sent successfully to {to_email}!")
            return True
    except Exception as e:
        print(f" [CELERY WORKER] FAILED to send email to {to_email}. Error: {e}")
        return False


async def _async_send_ticket_creation_email(ticket_id: str, user_id: str):
    """
    An async helper to perform database lookups before sending the email.
    """
    # Fetch the ticket details from MongoDB (with await)
    ticket = await ticket_collection.find_one({"_id": ObjectId(ticket_id)})
    if not ticket:
        print(f" [CELERY WORKER] ERROR: Ticket with ID {ticket_id} not found in database.")
        return

    # Fetch the user's email from MongoDB (with await)
    user = await user_collection.find_one({"_id": ObjectId(user_id)})
    if not user:
        print(f" [CELERY WORKER] ERROR: User with ID {user_id} not found in database.")
        return

    formatted_ticket = ticket_helper(ticket)
    
    subject = f"Ticket Created: #{formatted_ticket['id']} - {formatted_ticket['title']}"
    text_content = f"Your ticket '{formatted_ticket['title']}' has been created. ID: {formatted_ticket['id']}"
    html_content = f"<h2>Ticket Created!</h2><p>Your ticket '{formatted_ticket['title']}' (ID: {formatted_ticket['id']}) has been successfully created.</p>"
    
    _send_email(user['email'], subject, html_content, text_content)
    return f"Email sent to {user['email']} for ticket {ticket_id}"


@celery_app.task(name="send_ticket_creation_email")
def send_ticket_creation_email(ticket_id: str, user_id: str):
    """
    Synchronous Celery task that correctly runs our async helper function.
    """
    print(f" [CELERY WORKER] Received task: send_ticket_creation_email for ticket_id: {ticket_id}")
    
    try:
        loop = asyncio.get_event_loop()
        if loop.is_running():
            
            future = asyncio.run_coroutine_threadsafe(_async_send_ticket_creation_email(ticket_id, user_id), loop)
            return future.result()
        else:
            return loop.run_until_complete(_async_send_ticket_creation_email(ticket_id, user_id))
    except RuntimeError:
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        return loop.run_until_complete(_async_send_ticket_creation_email(ticket_id, user_id))



@celery_app.task(name="send_password_reset_email")
def send_password_reset_email(email: str, token: str):
    print(f" [CELERY WORKER] Received task: send_password_reset_email for email: {email}")
    
    frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
    reset_link = f"{frontend_url}/reset-password?token={token}"
    
    subject = "Your Password Reset Link"
    text_content = f"Hello, please reset your password using this link: {reset_link}"
    html_content = f'<h2>Password Reset Request</h2><p>Please click the button to reset your password:</p><p><a href="{reset_link}">Reset Password</a></p>'
    
    _send_email(email, subject, html_content, text_content)
    return f"Password reset email task for {email} completed."