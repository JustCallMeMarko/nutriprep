from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException, Depends, status, Query
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


def _serialize_completed_delivery(delivery: models.Delivery) -> dict:
    order = delivery.order
    profile = order.user.customer_profile
    items = order.items
    payout = order.total_credits
    return {
        "id": f"ORD-{order.id:04d}",
        "customerName": order.user.full_name,
        "completedAt": delivery.delivered_at.isoformat() if delivery.delivered_at else None,
        "mealsCount": sum(item.quantity for item in items),
        "mealSummary": ", ".join(
            f"{item.quantity}x {item.meal.title}" for item in items
        ) or "Meal order",
        "distanceKm": None,
        "basePay": payout,
        "tip": 0,
        "totalPayout": payout,
        "status": "Paid",
        "customerAddress": profile.delivery_address if profile else None,
    }


@router.get("/analytics", status_code=status.HTTP_200_OK)
def get_analytics(
    request: Request,
    timeframe: str = Query("weekly", pattern="^(weekly|monthly)$"),
    db: Session = Depends(get_db),
):
    rider_id = _rider_id(request)
    now = datetime.now()
    period_days = 7 if timeframe == "weekly" else 28
    start = now - timedelta(days=period_days)
    previous_start = start - timedelta(days=period_days)

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
        .filter(
            models.Delivery.rider_id == rider_id,
            models.Delivery.delivered_at >= previous_start,
            models.Order.status == models.OrderStatus.DELIVERED,
        )
        .join(models.Delivery.order)
        .order_by(models.Delivery.delivered_at.desc())
        .all()
    )

    current = [delivery for delivery in deliveries if delivery.delivered_at >= start]
    previous = [delivery for delivery in deliveries if delivery.delivered_at < start]

    def payout(delivery: models.Delivery) -> int:
        return delivery.order.total_credits

    def period_change(current_value: int, previous_value: int) -> float:
        if previous_value == 0:
            return 100.0 if current_value else 0.0
        return round((current_value - previous_value) / previous_value * 100, 1)

    if timeframe == "weekly":
        bucket_count = 7
        bucket_labels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
        def bucket_index(delivery: models.Delivery) -> int:
            return delivery.delivered_at.weekday()
    else:
        bucket_count = 4
        bucket_labels = ["Week 1", "Week 2", "Week 3", "Week 4"]
        def bucket_index(delivery: models.Delivery) -> int:
            return min((delivery.delivered_at.date() - start.date()).days // 7, 3)

    chart = [
        {"label": label, "earnings": 0, "orders": 0, "tips": 0}
        for label in bucket_labels[:bucket_count]
    ]
    for delivery in current:
        index = bucket_index(delivery)
        if 0 <= index < len(chart):
            chart[index]["earnings"] += payout(delivery)
            chart[index]["orders"] += 1

    earnings = sum(payout(delivery) for delivery in current)
    previous_earnings = sum(payout(delivery) for delivery in previous)
    orders = len(current)
    previous_orders = len(previous)
    completed_orders = [_serialize_completed_delivery(delivery) for delivery in current]

    return {
        "timeframe": timeframe,
        "chart": chart,
        "orders": completed_orders,
        "summary": {
            "earnings": earnings,
            "orders": orders,
            "tips": 0,
            "averagePayout": round(earnings / orders) if orders else 0,
            "earningsChange": period_change(earnings, previous_earnings),
            "ordersChange": period_change(orders, previous_orders),
        },
        "capabilities": {
            "cashOut": False,
            "distanceTracking": False,
            "tipsTracking": False,
        },
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