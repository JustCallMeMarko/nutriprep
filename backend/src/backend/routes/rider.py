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

def _rider_id(request: Request) -> str:
    user_id = authenticate_and_get_user_details(request).get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unable to identify rider.")
    return user_id

def _serialize_delivery(delivery: models.Delivery) -> dict:
    order = delivery.order
    profile = order.user.customer_profile
    items = order.items
    meal_summary = ", ".join(
        f"{item.quantity}x {item.meal.title}" for item in items
    ) or "Meal order"
    status_value = order.status.value
    stop_status = (
        "delivered"
        if status_value == models.OrderStatus.DELIVERED.value
        else "in_transit"
        if status_value == models.OrderStatus.OUT_FOR_DELIVERY.value
        else "pending"
    )
    return {
        "id": str(delivery.id),
        "orderId": f"ORD-{order.id:04d}",
        "customerName": order.user.full_name,
        "customerPhone": profile.phone_number if profile else "",
        "address": profile.delivery_address if profile else "No delivery address",
        "district": "",
        "mealsCount": sum(item.quantity for item in items),
        "mealSummary": meal_summary,
        "slot": "Scheduled",
        "payout": order.total_credits,
        "notes": None,
        "lat": profile.delivery_lat if profile else None,
        "lng": profile.delivery_long if profile else None,
        "status": stop_status,
        "orderStatus": status_value,
    }

@router.get("/deliveries", status_code=status.HTTP_200_OK)
def get_deliveries(request: Request, db: Session = Depends(get_db)):
    rider_id = _rider_id(request)
    deliveries = (
        db.query(models.Delivery)
        .options(
            joinedload(models.Delivery.order)
            .joinedload(models.Order.user)
            .joinedload(models.User.customer_profile),
            joinedload(models.Delivery.order)
            .joinedload(models.Order.items)
            .joinedload(models.OrderItem.meal),
        )
        .filter(models.Delivery.rider_id == rider_id)
        .join(models.Delivery.order)
        .filter(
            models.Order.status.in_(
                [models.OrderStatus.PREPARING, models.OrderStatus.OUT_FOR_DELIVERY]
            )
        )
        .order_by(models.Delivery.id.asc())
        .all()
    )
    return [_serialize_delivery(delivery) for delivery in deliveries]

@router.patch("/deliveries/{delivery_id}/status", status_code=status.HTTP_200_OK)
def update_delivery_status(
    delivery_id: int,
    payload: dict,
    request: Request,
    db: Session = Depends(get_db),
):
    rider_id = _rider_id(request)
    delivery = (
        db.query(models.Delivery)
        .options(joinedload(models.Delivery.order))
        .filter(
            models.Delivery.id == delivery_id,
            models.Delivery.rider_id == rider_id,
        )
        .first()
    )
    if not delivery:
        raise HTTPException(status_code=404, detail="Delivery not found.")
    if payload.get("status") != models.OrderStatus.DELIVERED.value:
        raise HTTPException(status_code=422, detail="Only delivery completion is supported.")
    if delivery.order.status == models.OrderStatus.CANCELLED:
        raise HTTPException(status_code=409, detail="Cancelled orders cannot be delivered.")

    delivery.order.status = models.OrderStatus.DELIVERED
    delivery.delivered_at = datetime.now()
    db.commit()
    db.refresh(delivery)
    return {"id": str(delivery.id), "status": "delivered"}

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