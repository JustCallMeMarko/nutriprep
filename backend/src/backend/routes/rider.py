from datetime import datetime
from fastapi import APIRouter, Request, HTTPException, Depends, status
from sqlalchemy.orm import Session, joinedload
from backend.utils import authenticate_and_get_user_details
from ..database import models
from ..database.models import get_db
from clerk_backend_api import Clerk
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()

def _notification_payload(recipient: models.BroadcastRecipient) -> dict:
    broadcast = recipient.broadcast
    return {
        "id": str(broadcast.id),
        "title": broadcast.title,
        "message": broadcast.message,
        "priority": broadcast.priority.value if broadcast.priority else "normal",
        "time": broadcast.created_at.isoformat(),
        "read": recipient.read_at is not None,
    }

@router.get("/notifications", status_code=status.HTTP_200_OK)
def get_notifications(request: Request, db: Session = Depends(get_db)):
    user_id = authenticate_and_get_user_details(request).get("user_id")
    recipients = (
        db.query(models.BroadcastRecipient)
        .options(joinedload(models.BroadcastRecipient.broadcast).joinedload(models.Broadcast.priority))
        .filter(
            models.BroadcastRecipient.user_id == user_id,
            models.BroadcastRecipient.dismissed_at.is_(None),
        )
        .order_by(models.BroadcastRecipient.id.desc())
        .all()
    )
    return [_notification_payload(recipient) for recipient in recipients]

@router.patch("/notifications/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_notification_read(notification_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = authenticate_and_get_user_details(request).get("user_id")
    recipient = db.query(models.BroadcastRecipient).filter(
        models.BroadcastRecipient.broadcast_id == notification_id,
        models.BroadcastRecipient.user_id == user_id,
    ).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Notification not found.")
    recipient.read_at = datetime.now()
    db.commit()

@router.delete("/notifications/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def dismiss_notification(notification_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = authenticate_and_get_user_details(request).get("user_id")
    recipient = db.query(models.BroadcastRecipient).filter(
        models.BroadcastRecipient.broadcast_id == notification_id,
        models.BroadcastRecipient.user_id == user_id,
    ).first()
    if not recipient:
        raise HTTPException(status_code=404, detail="Notification not found.")
    recipient.dismissed_at = datetime.now()
    db.commit()

@router.get("/total-users")
def get_total_users():
    clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))
    response = clerk.users.count()
    return {"total_users": response.total_count}