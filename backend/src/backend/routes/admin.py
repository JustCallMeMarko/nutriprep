import os
from pathlib import Path
from uuid import uuid4
from datetime import date, datetime, timedelta
from pydantic import BaseModel, Field
from backend.database.db import get_total_admins, get_total_riders, get_total_user_credits, get_total_users
from backend.utils import authenticate_and_get_user_details
import boto3
from botocore.config import Config
from fastapi import APIRouter, Form, Request, HTTPException, Depends, File, UploadFile, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from dotenv import load_dotenv
from ..database import models
from ..database.models import get_db
from clerk_backend_api import Clerk


load_dotenv()

AWS_ENDPOINT = os.getenv("AWS_ENDPOINT")
AWS_BUCKET = os.getenv("AWS_BUCKET")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

if not AWS_ENDPOINT or not AWS_BUCKET or not AWS_ACCESS_KEY or not AWS_SECRET_KEY or not CLERK_SECRET_KEY:
    raise ValueError("One or more required environment variables are not set.")

router = APIRouter()
s3_client = boto3.client(
    "s3",
    endpoint_url=AWS_ENDPOINT,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    config=Config(s3={"addressing_style": "path"}),
    region_name="us-east-1",
)
clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)

class OrderStatusUpdate(BaseModel):
    status: models.OrderStatus

class OrderRiderUpdate(BaseModel):
    rider_id: str

class UserRoleUpdate(BaseModel):
    role: models.Roles

class UserCreditsUpdate(BaseModel):
    amount: int
    operation: str

class UserSubscriptionUpdate(BaseModel):
    plan: str

class BroadcastCreate(BaseModel):
    title: str = Field(min_length=1, max_length=100)
    message: str = Field(min_length=1)
    audience: str
    priority: str = "normal"

def _serialize_broadcast(broadcast: models.Broadcast) -> dict:
    recipient_ids = broadcast.recipient_ids or []
    read_by = broadcast.read_by or []
    return {
        "id": str(broadcast.id),
        "title": broadcast.title,
        "message": broadcast.message,
        "audience": broadcast.audience,
        "priority": broadcast.priority,
        "sentAt": broadcast.created_at.isoformat(),
        "sentBy": broadcast.user.full_name,
        "recipientCount": len(recipient_ids),
        "readCount": sum(1 for user_id in recipient_ids if user_id in read_by),
    }

def _require_admin(request: Request) -> None:
    user_details = authenticate_and_get_user_details(request)
    role = (user_details.get("public_metadata") or {}).get("role")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required.",
        )

def _clerk_metadata(clerk_user) -> dict:
    return dict(getattr(clerk_user, "public_metadata", None) or {})

def _format_clerk_date(value) -> str:
    if not value:
        return ""
    if isinstance(value, datetime):
        return value.isoformat()
    if isinstance(value, (int, float)):
        return datetime.fromtimestamp(value / 1000).isoformat()
    return str(value)

def _serialize_admin_user(clerk_user, db: Session) -> dict:
    user_id = clerk_user.id
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    profile = db_user.customer_profile if db_user else None
    metadata = _clerk_metadata(clerk_user)
    email_addresses = getattr(clerk_user, "email_addresses", []) or []
    primary_email_id = getattr(clerk_user, "primary_email_address_id", None)
    email = next(
        (
            getattr(address, "email_address", "")
            for address in email_addresses
            if getattr(address, "id", None) == primary_email_id
        ),
        getattr(email_addresses[0], "email_address", "") if email_addresses else "",
    )
    role = (db_user.role.value if db_user else metadata.get("role", "user"))
    plan = metadata.get("subscription_plan", "None")
    if role == "admin":
        plan = "None"
    return {
        "id": user_id,
        "name": " ".join(
            part for part in [getattr(clerk_user, "first_name", ""), getattr(clerk_user, "last_name", "")]
            if part
        ) or getattr(clerk_user, "username", None) or email.split("@")[0],
        "email": email,
        "emailVerified": bool(
            next(
                (
                    getattr(address, "verification", None)
                    for address in email_addresses
                    if getattr(address, "id", None) == primary_email_id
                ),
                None,
            )
        ),
        "avatarUrl": getattr(clerk_user, "image_url", "") or "",
        "role": role,
        "subscriptionPlan": plan,
        "subscriptionStatus": metadata.get("subscription_status", "None") if plan != "None" else "None",
        "credits": profile.credits if profile and role == "user" else 0,
        "joinedAt": _format_clerk_date(getattr(clerk_user, "created_at", None)),
        "lastActiveAt": _format_clerk_date(getattr(clerk_user, "last_active_at", None)),
        "status": "suspended" if getattr(clerk_user, "banned", False) else "active",
        "ordersCount": len(db_user.orders) if db_user else 0,
    }

def _get_clerk_user(user_id: str):
    try:
        return clerk.users.get(user_id=user_id)
    except Exception as exc:
        raise HTTPException(status_code=404, detail="User not found in Clerk.") from exc

def _update_clerk_metadata(clerk_user, updates: dict) -> None:
    metadata = _clerk_metadata(clerk_user)
    metadata.update(updates)
    clerk.users.update_metadata(user_id=clerk_user.id, public_metadata=metadata)

@router.get("/broadcasts", status_code=status.HTTP_200_OK)
def get_broadcasts(request: Request, db: Session = Depends(get_db)):
    _require_admin(request)
    broadcasts = (
        db.query(models.Broadcast)
        .options(
            joinedload(models.Broadcast.user),
        )
        .order_by(models.Broadcast.created_at.desc())
        .all()
    )
    return [_serialize_broadcast(broadcast) for broadcast in broadcasts]

@router.post("/broadcasts", status_code=status.HTTP_201_CREATED)
def create_broadcast(
    payload: BroadcastCreate,
    request: Request,
    db: Session = Depends(get_db),
):
    user_details = authenticate_and_get_user_details(request)
    if (user_details.get("public_metadata") or {}).get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")
    if payload.audience not in {"all", "users", "riders", "admins"}:
        raise HTTPException(status_code=422, detail="Unsupported broadcast audience.")
    if payload.priority not in {"normal", "urgent"}:
        raise HTTPException(status_code=422, detail="Unsupported broadcast priority.")

    audience_roles = {
        "users": [models.Roles.USER],
        "riders": [models.Roles.RIDER],
        "admins": [models.Roles.ADMIN],
        "all": list(models.Roles),
    }[payload.audience]
    sender_id = user_details.get("user_id")
    sender = db.query(models.User).filter(models.User.id == sender_id).first()
    if not sender:
        raise HTTPException(status_code=404, detail="Admin is not provisioned in the database.")

    broadcast = models.Broadcast(
        user_id=sender_id,
        title=payload.title.strip(),
        message=payload.message.strip(),
        audience=payload.audience,
        priority=payload.priority,
    )
    recipients = (
        db.query(models.User)
        .filter(models.User.role.in_(audience_roles))
        .all()
    )
    broadcast.recipient_ids = [recipient.id for recipient in recipients]
    db.add(broadcast)
    db.commit()
    db.refresh(broadcast)
    return _serialize_broadcast(broadcast)

@router.delete("/broadcasts/{broadcast_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_broadcast(
    broadcast_id: int,
    request: Request,
    db: Session = Depends(get_db),
):
    _require_admin(request)
    broadcast = db.query(models.Broadcast).filter(models.Broadcast.id == broadcast_id).first()
    if not broadcast:
        raise HTTPException(status_code=404, detail="Broadcast not found.")
    db.delete(broadcast)
    db.commit()

@router.get("/users", status_code=status.HTTP_200_OK)
def get_admin_users(request: Request, db: Session = Depends(get_db)):
    _require_admin(request)
    clerk_users = clerk.users.list(request={"limit": 500})
    return [_serialize_admin_user(clerk_user, db) for clerk_user in clerk_users]

@router.patch("/users/{user_id}/role", status_code=status.HTTP_200_OK)
def update_admin_user_role(
    user_id: str,
    payload: UserRoleUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    _require_admin(request)
    clerk_user = _get_clerk_user(user_id)
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User is not provisioned in the database.")
    db_user.role = payload.role
    if payload.role == models.Roles.RIDER and not db_user.rider_profile:
        db_user.rider_profile = models.RiderProfile(user_id=user_id)
    elif payload.role != models.Roles.RIDER and db_user.rider_profile:
        db.delete(db_user.rider_profile)
    if payload.role == models.Roles.ADMIN and db_user.customer_profile:
        db_user.customer_profile.credits = 0
    db.commit()
    _update_clerk_metadata(
        clerk_user,
        {
            "role": payload.role.value,
            **(
                {"subscription_plan": "None", "subscription_status": "None"}
                if payload.role == models.Roles.ADMIN
                else {}
            ),
        },
    )
    return _serialize_admin_user(clerk_user, db)

@router.patch("/users/{user_id}/credits", status_code=status.HTTP_200_OK)
def update_admin_user_credits(
    user_id: str,
    payload: UserCreditsUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    _require_admin(request)
    if payload.amount <= 0 or payload.operation not in {"add", "deduct"}:
        raise HTTPException(status_code=422, detail="Amount must be positive and operation must be add or deduct.")
    clerk_user = _get_clerk_user(user_id)
    profile = db.query(models.CustomerProfile).filter(models.CustomerProfile.user_id == user_id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="This user does not have a customer profile.")
    profile.credits = (
        profile.credits + payload.amount
        if payload.operation == "add"
        else max(0, profile.credits - payload.amount)
    )
    db.commit()
    return _serialize_admin_user(clerk_user, db)

@router.patch("/users/{user_id}/subscription", status_code=status.HTTP_200_OK)
def update_admin_user_subscription(
    user_id: str,
    payload: UserSubscriptionUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    _require_admin(request)
    if payload.plan not in {"Bronze", "Silver", "Gold", "Free", "None"}:
        raise HTTPException(status_code=422, detail="Unsupported subscription plan.")
    clerk_user = _get_clerk_user(user_id)
    status_value = "Active" if payload.plan not in {"Free", "None"} else "None"
    _update_clerk_metadata(
        clerk_user,
        {"subscription_plan": payload.plan, "subscription_status": status_value},
    )
    return _serialize_admin_user(clerk_user, db)

@router.patch("/users/{user_id}/status", status_code=status.HTTP_200_OK)
def update_admin_user_status(
    user_id: str,
    request: Request,
    db: Session = Depends(get_db),
):
    _require_admin(request)
    clerk_user = _get_clerk_user(user_id)
    if getattr(clerk_user, "banned", False):
        clerk.users.unban(user_id=user_id)
    else:
        clerk.users.ban(user_id=user_id)
    return _serialize_admin_user(_get_clerk_user(user_id), db)

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_admin_user(user_id: str, request: Request, db: Session = Depends(get_db)):
    _require_admin(request)
    current_user = authenticate_and_get_user_details(request).get("user_id")
    if current_user == user_id:
        raise HTTPException(status_code=400, detail="You cannot delete your own admin account.")
    _get_clerk_user(user_id)
    clerk.users.delete(user_id=user_id)
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
    return None

def _order_status_label(status_value: models.OrderStatus) -> str:
    return {
        models.OrderStatus.PENDING: "Upcoming",
        models.OrderStatus.PREPARING: "Preparing",
        models.OrderStatus.OUT_FOR_DELIVERY: "Out for Delivery",
        models.OrderStatus.DELIVERED: "Delivered",
        models.OrderStatus.CANCELLED: "Cancelled",
    }[status_value]

def _serialize_order(order: models.Order) -> dict:
    profile = order.user.customer_profile
    return {
        "id": f"#ORD-{order.id:04d}",
        "customerName": order.user.full_name,
        "customerPhone": profile.phone_number if profile else "",
        "customerEmail": order.user.email,
        "items": [
            {
                "title": item.meal.title,
                "quantity": item.quantity,
                "calories": item.meal.calories,
                "protein_g": item.meal.protein,
                "carb": item.meal.carb,
                "fat": item.meal.fat,
                "credits": item.meal.credits,
                "image_url": item.meal.image_url,
            }
            for item in order.items
        ],
        "totalAmount": order.total_credits,
        "deliveryWave": "Lunch Wave",
        "deliverySlot": "Scheduled",
        "address": profile.delivery_address if profile else "No delivery address",
        "city": "",
        "deliveryNotes": None,
        "status": _order_status_label(order.status),
        "rider": (
            {
                "id": order.delivery.rider.user_id,
                "name": order.delivery.rider.user.full_name,
                "vehicle": order.delivery.rider.plate_number or "No vehicle",
                "phone": (
                    order.delivery.rider.user.customer_profile.phone_number
                    if order.delivery.rider.user.customer_profile
                    else ""
                ),
                "rating": "—",
                "activeLoads": 0,
            }
            if order.delivery and order.delivery.rider
            else None
        ),
        "placedAt": order.created_at.isoformat(),
        "paymentMethod": "NutriPrep Credits",
        "paymentStatus": "Paid",
    }

def _get_order(db: Session, order_id: int) -> models.Order:
    order = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.user).joinedload(models.User.customer_profile),
            joinedload(models.Order.items).joinedload(models.OrderItem.meal),
            joinedload(models.Order.delivery)
            .joinedload(models.Delivery.rider)
            .joinedload(models.RiderProfile.user)
            .joinedload(models.User.customer_profile),
        )
        .filter(models.Order.id == order_id)
        .first()
    )
    if not order:
        raise HTTPException(status_code=404, detail="Order not found.")
    return order

@router.get("/orders", status_code=status.HTTP_200_OK)
def get_admin_orders(request: Request, db: Session = Depends(get_db)):
    _require_admin(request)
    orders = (
        db.query(models.Order)
        .options(
            joinedload(models.Order.user).joinedload(models.User.customer_profile),
            joinedload(models.Order.items).joinedload(models.OrderItem.meal),
            joinedload(models.Order.delivery)
            .joinedload(models.Delivery.rider)
            .joinedload(models.RiderProfile.user)
            .joinedload(models.User.customer_profile),
        )
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return [_serialize_order(order) for order in orders]

@router.get("/riders", status_code=status.HTTP_200_OK)
def get_admin_riders(request: Request, db: Session = Depends(get_db)):
    _require_admin(request)
    riders = (
        db.query(models.RiderProfile)
        .options(
            joinedload(models.RiderProfile.user).joinedload(models.User.customer_profile),
        )
        .join(models.RiderProfile.user)
        .filter(models.User.role == models.Roles.RIDER)
        .order_by(models.User.full_name.asc())
        .all()
    )
    active_loads = dict(
        db.query(models.Delivery.rider_id, func.count(models.Delivery.id))
        .join(models.Delivery.order)
        .filter(
            models.Order.status.in_(
                [models.OrderStatus.PREPARING, models.OrderStatus.OUT_FOR_DELIVERY]
            )
        )
        .group_by(models.Delivery.rider_id)
        .all()
    )
    return [
        {
            "id": rider.user_id,
            "name": rider.user.full_name,
            "vehicle": rider.plate_number or "No vehicle",
            "phone": rider.user.customer_profile.phone_number
            if rider.user.customer_profile
            else "",
            "rating": "—",
            "activeLoads": active_loads.get(rider.user_id, 0),
        }
        for rider in riders
    ]

@router.patch("/orders/{order_id}/status", status_code=status.HTTP_200_OK)
def update_order_status(
    order_id: int,
    payload: OrderStatusUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    _require_admin(request)
    order = _get_order(db, order_id)
    order.status = payload.status
    db.commit()
    return _serialize_order(_get_order(db, order_id))

@router.put("/orders/{order_id}/rider", status_code=status.HTTP_200_OK)
def assign_order_rider(
    order_id: int,
    payload: OrderRiderUpdate,
    request: Request,
    db: Session = Depends(get_db),
):
    _require_admin(request)
    order = _get_order(db, order_id)
    rider = (
        db.query(models.RiderProfile)
        .join(models.RiderProfile.user)
        .filter(
            models.RiderProfile.user_id == payload.rider_id,
            models.User.role == models.Roles.RIDER,
        )
        .first()
    )
    if not rider:
        raise HTTPException(status_code=404, detail="Rider not found.")

    if order.delivery:
        order.delivery.rider_id = rider.user_id
    else:
        order.delivery = models.Delivery(order_id=order.id, rider_id=rider.user_id)
    if order.status == models.OrderStatus.PENDING:
        order.status = models.OrderStatus.PREPARING
    db.commit()
    return _serialize_order(_get_order(db, order_id))

@router.get("/dashboard", status_code=status.HTTP_200_OK)
def get_dashboard_metrics(
    request: Request,
    db: Session = Depends(get_db),
):
    """Return the metrics used by the admin dashboard for the last seven days."""
    _require_admin(request)

    today = date.today()
    start_date = today - timedelta(days=6)
    previous_start = start_date - timedelta(days=7)

    acquisition_rows = (
        db.query(func.date(models.User.created_at), func.count(models.User.id))
        .filter(models.User.created_at >= datetime.combine(start_date, datetime.min.time()))
        .group_by(func.date(models.User.created_at))
        .all()
    )
    acquisition_by_day = {str(day): count for day, count in acquisition_rows}
    acquisition = [
        {
            "day": (start_date + timedelta(days=offset)).strftime("%a"),
            "date": str(start_date + timedelta(days=offset)),
            "users": acquisition_by_day.get(str(start_date + timedelta(days=offset)), 0),
        }
        for offset in range(7)
    ]

    today_start = datetime.combine(today, datetime.min.time())
    tomorrow_start = today_start + timedelta(days=1)
    daily_credits = (
        db.query(func.coalesce(func.sum(models.Order.total_credits), 0))
        .filter(
            models.Order.created_at >= today_start,
            models.Order.created_at < tomorrow_start,
            models.Order.status != models.OrderStatus.CANCELLED,
        )
        .scalar()
    )
    active_deliveries = (
        db.query(models.Order)
        .filter(
            models.Order.status.in_(
                [models.OrderStatus.PREPARING, models.OrderStatus.OUT_FOR_DELIVERY]
            )
        )
        .count()
    )
    total_orders = db.query(models.Order).count()
    current_users = db.query(models.User).count()
    previous_users = (
        db.query(models.User)
        .filter(
            models.User.created_at >= datetime.combine(previous_start, datetime.min.time()),
            models.User.created_at < datetime.combine(start_date, datetime.min.time()),
        )
        .count()
    )
    current_period_users = (
        db.query(models.User)
        .filter(models.User.created_at >= datetime.combine(start_date, datetime.min.time()))
        .count()
    )
    user_change = (
        ((current_period_users - previous_users) / previous_users) * 100
        if previous_users
        else (100.0 if current_period_users else 0.0)
    )

    return {
        "total_users": current_users,
        "daily_credits": int(daily_credits or 0),
        "active_deliveries": active_deliveries,
        "active_delivery_rate": round((active_deliveries / total_orders) * 100)
        if total_orders
        else 0,
        "user_change_percent": round(user_change, 1),
        "acquisition": acquisition,
    }

@router.post("/meals")
async def create_meal(
    request: Request,
    title: str = Form(...),
    description: str = Form(...),
    img: UploadFile = File(...),
    meal_status: str = Form(...),
    calories: int = Form(...),
    protein: float = Form(...),
    carb: float = Form(...),
    fat: float = Form(...),
    credits: int = Form(...),
    stocks: int = Form(...),
    db: Session = Depends(get_db),
):
    """Create a meal from multipart form data; user_id is passed separately."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")
    public_metadata = user_details.get("public_metadata")
    role = public_metadata.get("role")

    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required.",
        )
    if meal_status not in {status.value for status in models.MealStatus}:
        raise HTTPException(status_code=422, detail="Invalid meal status.")

    image_key = f"{uuid4()}{Path(img.filename or '').suffix}"
    try:
        img.file.seek(0)
        s3_client.upload_fileobj(
            img.file,
            AWS_BUCKET,
            image_key,
            ExtraArgs={
                "ContentType": img.content_type or "application/octet-stream"
            },
        )
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="Failed to upload meal image.",
        )

    image_url = f"{AWS_ENDPOINT.rstrip('/')}/{AWS_BUCKET}/{image_key}"

    meal = models.Meal(
        user_id=user_id,
        title=title,
        description=description,
        image_url=image_url,
        status=meal_status,
        calories=calories,
        protein=protein,
        carb=carb,
        fat=fat,
        credits=credits,
        stocks=stocks,
    )

    db.add(meal)

    try:
        db.commit()
        db.refresh(meal)
    except Exception as db_err:
        db.rollback()
        try:
            s3_client.delete_object(Bucket=AWS_BUCKET, Key=image_key)
        except Exception:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error and failed to clean up meal image.",
            ) from db_err

        raise HTTPException(
            status_code=(
                status.HTTP_400_BAD_REQUEST
                if isinstance(db_err, IntegrityError)
                else status.HTTP_500_INTERNAL_SERVER_ERROR
            ),
            detail=(
                "Invalid meal data or duplicate entry."
                if isinstance(db_err, IntegrityError)
                else "Failed to create meal."
            ),
        )

    return meal

@router.patch("/meals/{meal_id}")
async def update_meal(
    meal_id: int,
    request: Request,
    title: str = Form(...),
    description: str = Form(...),
    img: UploadFile | None = File(None),
    meal_status: str = Form(...),
    calories: int = Form(...),
    protein: float = Form(...),
    carb: float = Form(...),
    fat: float = Form(...),
    credits: int = Form(...),
    stocks: int = Form(...),
    db: Session = Depends(get_db),
):
    user_details = authenticate_and_get_user_details(request)
    if (user_details.get("public_metadata") or {}).get("role") != "admin":
        raise HTTPException(status_code=403, detail="Access denied. Admin privileges required.")
    if meal_status not in {status.value for status in models.MealStatus}:
        raise HTTPException(status_code=422, detail="Invalid meal status.")

    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found.")

    old_image_url = meal.image_url
    new_image_key = None
    if img and img.filename:
        new_image_key = f"{uuid4()}{Path(img.filename).suffix}"
        try:
            img.file.seek(0)
            s3_client.upload_fileobj(
                img.file,
                AWS_BUCKET,
                new_image_key,
                ExtraArgs={"ContentType": img.content_type or "application/octet-stream"},
            )
            meal.image_url = f"{AWS_ENDPOINT.rstrip('/')}/{AWS_BUCKET}/{new_image_key}"
        except Exception as exc:
            raise HTTPException(
                status_code=status.HTTP_502_BAD_GATEWAY,
                detail="Failed to upload meal image.",
            ) from exc

    meal.title = title.strip()
    meal.description = description.strip()
    meal.status = meal_status
    meal.calories = calories
    meal.protein = protein
    meal.carb = carb
    meal.fat = fat
    meal.credits = credits
    meal.stocks = stocks

    try:
        db.commit()
        db.refresh(meal)
    except Exception as db_err:
        db.rollback()
        if new_image_key:
            s3_client.delete_object(Bucket=AWS_BUCKET, Key=new_image_key)
        raise HTTPException(status_code=500, detail="Failed to update meal.") from db_err

    if new_image_key and old_image_url:
        old_key = old_image_url.rsplit("/", 1)[-1]
        try:
            s3_client.delete_object(Bucket=AWS_BUCKET, Key=old_key)
        except Exception:
            pass

    return meal

@router.get("/meals", status_code=status.HTTP_200_OK)
async def get_meals(
    db: Session = Depends(get_db),
):
    """Retrieves all meals from the database."""
    return db.query(models.Meal).all()

@router.get("/users-kpi", status_code=status.HTTP_200_OK)
def get_users_kpi(
    request: Request,
    db: Session = Depends(get_db),
):
    """Retrieves the total number of users and the total number of meals."""
    user_details = authenticate_and_get_user_details(request)
    public_metadata = user_details.get("public_metadata")
    role = public_metadata.get("role")

    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required.",
        )
    
    total_users = get_total_users(db)
    total_admins = get_total_admins(db)
    total_riders = get_total_riders(db)
    total_credits = get_total_user_credits(db)

    return {
        "total_users": total_users,
        "total_admins": total_admins,
        "total_riders": total_riders,
        "total_credits": total_credits,
    }