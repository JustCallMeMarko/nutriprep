from datetime import datetime, timedelta
from fastapi import APIRouter, Request, HTTPException, Depends, status, Query
from sqlalchemy.orm import Session, joinedload
from backend.utils import authenticate_and_get_user_details
from ..database import models
from ..database.models import get_db
from clerk_backend_api import Clerk
import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)
load_dotenv()

router = APIRouter()

def _rider_id(request: Request) -> str:
    user_id = authenticate_and_get_user_details(request).get("user_id")
    if not user_id:
        raise HTTPException(status_code=401, detail="Unable to identify rider.")
    return user_id


def _rider_profile(db: Session, rider_id: str) -> models.RiderProfile:
    profile = db.query(models.RiderProfile).filter(
        models.RiderProfile.user_id == rider_id
    ).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Rider profile not found.")
    return profile

def _serialize_delivery(delivery: models.Delivery, rate: int) -> dict:
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
        "credits": order.total_credits,
        "mealSummary": meal_summary,
        "slot": "Scheduled",
        "payout": order.total_credits * rate,
        "notes": None,
        "lat": profile.delivery_lat if profile else None,
        "lng": profile.delivery_long if profile else None,
        "status": stop_status,
        "orderStatus": status_value,
    }


def _serialize_completed_delivery(delivery: models.Delivery) -> dict:
    order = delivery.order
    return {
        "deliveryId": delivery.id,
        "orderId": order.id,
        "riderId": delivery.rider_id,
        "userId": order.user_id,
        "totalCredits": order.total_credits,
        "orderStatus": order.status.value,
        "orderCreatedAt": order.created_at.isoformat() if order.created_at else None,
        "deliveredAt": delivery.delivered_at.isoformat() if delivery.delivered_at else None,
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
            models.Delivery.paid_out_at.is_(None),
            models.Order.status == models.OrderStatus.DELIVERED,
        )
        .join(models.Delivery.order)
        .order_by(models.Delivery.delivered_at.desc())
        .all()
    )

    current = [delivery for delivery in deliveries if delivery.delivered_at >= start]
    previous = [delivery for delivery in deliveries if delivery.delivered_at < start]

    rate = models.get_payout_rate(db)

    def payout(delivery: models.Delivery) -> int:
        return delivery.order.total_credits * rate

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
    delivered_credits = sum(delivery.order.total_credits for delivery in current)
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
            "deliveredCredits": delivered_credits,
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
                [
                    models.OrderStatus.PREPARING,
                    models.OrderStatus.OUT_FOR_DELIVERY,
                    models.OrderStatus.DELIVERED,
                ]
            )
        )
        .order_by(models.Delivery.id.asc())
        .all()
    )
    rate = models.get_payout_rate(db)
    return [_serialize_delivery(delivery, rate) for delivery in deliveries]

@router.get("/profile", status_code=status.HTTP_200_OK)
def get_rider_profile(request: Request, db: Session = Depends(get_db)):
    rider_id = _rider_id(request)
    profile = _rider_profile(db, rider_id)
    return {
        "plateNumber": profile.plate_number,
        "phoneNumber": profile.phone_number,
        "available": profile.is_available,
    }


@router.put("/profile", status_code=status.HTTP_200_OK)
def upsert_rider_profile(
    payload: dict,
    request: Request,
    db: Session = Depends(get_db),
):
    rider_id = _rider_id(request)
    plate_number = (payload.get("plate_number") or "").strip()
    phone_number = (payload.get("phone_number") or "").strip()
    if not plate_number or not phone_number:
        raise HTTPException(status_code=422, detail="plate_number and phone_number are required.")

    profile = db.query(models.RiderProfile).filter(
        models.RiderProfile.user_id == rider_id
    ).first()
    if not profile:
        profile = models.RiderProfile(user_id=rider_id)
        db.add(profile)
    profile.plate_number = plate_number
    profile.phone_number = phone_number
    db.commit()

    try:
        clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))
        clerk.users.update_metadata(
            user_id=rider_id,
            public_metadata={"riderOnboarded": True},
        )
    except Exception:
        logger.exception("Failed to set riderOnboarded metadata for user %s", rider_id)

    return {
        "plateNumber": profile.plate_number,
        "phoneNumber": profile.phone_number,
        "available": profile.is_available,
    }


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

    # Orders created after delivery PINs ship carry a 4-digit PIN the customer
    # shows the rider; orders without a PIN (legacy) complete without one.
    if delivery.order.delivery_pin is not None:
        provided_pin = str(payload.get("pin") or "").strip()
        if provided_pin != delivery.order.delivery_pin:
            raise HTTPException(status_code=403, detail="Invalid delivery PIN.")

    delivery.order.status = models.OrderStatus.DELIVERED
    delivery.delivered_at = datetime.now()
    db.commit()
    db.refresh(delivery)
    return {"id": str(delivery.id), "status": "delivered"}


@router.get("/status", status_code=status.HTTP_200_OK)
def get_rider_status(request: Request, db: Session = Depends(get_db)):
    rider_id = _rider_id(request)
    profile = _rider_profile(db, rider_id)
    return {
        "available": profile.is_available,
        "plateNumber": profile.plate_number,
        "location": (
            {"lat": profile.current_lat, "lng": profile.current_long}
            if profile.current_lat is not None and profile.current_long is not None
            else None
        ),
        "locationUpdatedAt": (
            profile.location_updated_at.isoformat()
            if profile.location_updated_at else None
        ),
    }


@router.patch("/status", status_code=status.HTTP_200_OK)
def update_rider_status(
    payload: dict,
    request: Request,
    db: Session = Depends(get_db),
):
    rider_id = _rider_id(request)
    profile = _rider_profile(db, rider_id)
    if not isinstance(payload.get("available"), bool):
        raise HTTPException(status_code=422, detail="available must be a boolean.")
    profile.is_available = payload["available"]
    db.commit()
    return {"available": profile.is_available}


@router.patch("/location", status_code=status.HTTP_200_OK)
def update_rider_location(
    payload: dict,
    request: Request,
    db: Session = Depends(get_db),
):
    rider_id = _rider_id(request)
    profile = _rider_profile(db, rider_id)
    try:
        latitude = float(payload["lat"])
        longitude = float(payload["lng"])
    except (KeyError, TypeError, ValueError):
        raise HTTPException(status_code=422, detail="lat and lng must be numbers.")
    if not -90 <= latitude <= 90 or not -180 <= longitude <= 180:
        raise HTTPException(status_code=422, detail="Location coordinates are invalid.")
    profile.current_lat = latitude
    profile.current_long = longitude
    profile.location_updated_at = datetime.now()
    db.commit()
    return {"lat": latitude, "lng": longitude}

def _notification_payload(broadcast: models.Broadcast, user_id: str) -> dict:
    text = f"{broadcast.title} {broadcast.message}".lower()
    notification_type = (
        "dispatch" if "dispatch" in text or "pickup" in text
        else "route" if "route" in text or "delivery" in text
        else "announcement"
    )
    return {
        "id": str(broadcast.id),
        "title": broadcast.title,
        "message": broadcast.message,
        "priority": broadcast.priority,
        "type": notification_type,
        "isUrgent": broadcast.priority == "urgent",
        "time": broadcast.created_at.isoformat(),
        "read": user_id in (broadcast.read_by or []),
    }

@router.get("/notifications", status_code=status.HTTP_200_OK)
def get_notifications(request: Request, db: Session = Depends(get_db)):
    user_id = authenticate_and_get_user_details(request).get("user_id")
    broadcasts = (
        db.query(models.Broadcast)
        .filter(models.Broadcast.created_at.is_not(None))
        .order_by(models.Broadcast.id.desc())
        .all()
    )
    return [
        _notification_payload(broadcast, user_id)
        for broadcast in broadcasts
        if user_id in (broadcast.recipient_ids or [])
        and user_id not in (broadcast.dismissed_by or [])
    ]

@router.patch("/notifications/{notification_id}/read", status_code=status.HTTP_204_NO_CONTENT)
def mark_notification_read(notification_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = authenticate_and_get_user_details(request).get("user_id")
    broadcast = db.query(models.Broadcast).filter(models.Broadcast.id == notification_id).first()
    if not broadcast or user_id not in (broadcast.recipient_ids or []):
        raise HTTPException(status_code=404, detail="Notification not found.")
    broadcast.read_by = list(dict.fromkeys([*(broadcast.read_by or []), user_id]))
    db.commit()

@router.delete("/notifications/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
def dismiss_notification(notification_id: int, request: Request, db: Session = Depends(get_db)):
    user_id = authenticate_and_get_user_details(request).get("user_id")
    broadcast = db.query(models.Broadcast).filter(models.Broadcast.id == notification_id).first()
    if not broadcast or user_id not in (broadcast.recipient_ids or []):
        raise HTTPException(status_code=404, detail="Notification not found.")
    broadcast.dismissed_by = list(dict.fromkeys([*(broadcast.dismissed_by or []), user_id]))
    db.commit()

@router.get("/total-users")
def get_total_users():
    clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))
    response = clerk.users.count()
    return {"total_users": response.total_count}