import os
import logging
from datetime import date, datetime, timedelta
from backend.utils import authenticate_and_get_user_details
from fastapi import APIRouter, Request, HTTPException, Depends, status
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from ..database import models
from ..database.db import (
    favorite_meal,
    get_all_favorite_meals,
    log_meal_consumption,
    unfavorite_meal,
)
from ..schemas import user
from ..database.models import get_db
from clerk_backend_api import Clerk

load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

if not CLERK_SECRET_KEY:
    raise ValueError("CLERK_SECRET_KEY is not set in the environment variables.")

logger = logging.getLogger(__name__)
router = APIRouter()
clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)

VALID_PLAN_SLOTS = {slot.value for slot in models.PlanSlot}

def _notification_payload(broadcast: models.Broadcast, user_id: str) -> dict:
    return {
        "id": str(broadcast.id),
        "title": broadcast.title,
        "message": broadcast.message,
        "priority": broadcast.priority,
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

def _plan_unlock_date(today: date) -> date:
    """Deliveries go out every day, so today's batch is already locked."""
    return today + timedelta(days=1)

def _validate_plan_date(plan_date: date, slot: str) -> None:
    if slot not in VALID_PLAN_SLOTS:
        raise HTTPException(status_code=422, detail="Invalid meal slot")
    if plan_date < _plan_unlock_date(datetime.now().date()):
        raise HTTPException(status_code=409, detail="This date is no longer editable")

@router.get("/plan", status_code=status.HTTP_200_OK)
def get_plan(request: Request, db: Session = Depends(get_db)):
    user_id = authenticate_and_get_user_details(request).get("user_id")
    entries = (
        db.query(models.PlanEntry)
        .options(joinedload(models.PlanEntry.meal))
        .filter(models.PlanEntry.user_id == user_id)
        .order_by(models.PlanEntry.plan_date, models.PlanEntry.slot)
        .all()
    )
    return [
        {
            "date": entry.plan_date.isoformat(),
            "slot": entry.slot.value,
            "meal": {
                "id": str(entry.meal.id),
                "name": entry.meal.title,
                "kcal": entry.meal.calories,
                "credits": entry.meal.credits,
                "image_url": entry.meal.image_url,
                "tag": "Favorite",
            } if entry.meal else {
                "id": f"custom-{entry.id}",
                "name": entry.custom_name,
                "kcal": entry.kcal,
                "tag": "Custom",
            },
            "ordered": entry.order_id is not None,
        }
        for entry in entries
    ]

@router.put("/plan", status_code=status.HTTP_200_OK)
def upsert_plan_entry(
    request: Request,
    payload: user.PlanEntryUpsert,
    db: Session = Depends(get_db),
):
    user_id = authenticate_and_get_user_details(request).get("user_id")
    _validate_plan_date(payload.plan_date, payload.slot)

    if payload.meal_id is None and not payload.custom_name:
        raise HTTPException(status_code=422, detail="A meal or custom meal name is required")
    meal = None
    if payload.meal_id is not None:
        meal = db.query(models.Meal).filter(
            models.Meal.id == payload.meal_id,
            models.Meal.status == models.MealStatus.ACTIVE,
        ).first()
        if not meal:
            raise HTTPException(status_code=404, detail="Meal does not exist")

    entry = db.query(models.PlanEntry).filter(
        models.PlanEntry.user_id == user_id,
        models.PlanEntry.plan_date == payload.plan_date,
        models.PlanEntry.slot == payload.slot,
    ).first()
    if entry and entry.order_id is not None:
        raise HTTPException(status_code=409, detail="This meal is already part of an order")
    if not entry:
        entry = models.PlanEntry(
            user_id=user_id,
            plan_date=payload.plan_date,
            slot=payload.slot,
        )
        db.add(entry)

    entry.meal_id = payload.meal_id
    entry.custom_name = None if meal else payload.custom_name.strip()
    entry.kcal = meal.calories if meal else max(0, payload.kcal)
    db.commit()
    db.refresh(entry)
    return {"date": payload.plan_date.isoformat(), "slot": payload.slot}

@router.delete("/plan/{plan_date}/{slot}", status_code=status.HTTP_204_NO_CONTENT)
def delete_plan_entry(
    plan_date: date,
    slot: str,
    request: Request,
    db: Session = Depends(get_db),
):
    user_id = authenticate_and_get_user_details(request).get("user_id")
    _validate_plan_date(plan_date, slot)
    entry = db.query(models.PlanEntry).filter(
        models.PlanEntry.user_id == user_id,
        models.PlanEntry.plan_date == plan_date,
        models.PlanEntry.slot == slot,
    ).first()
    if entry and entry.order_id is not None:
        raise HTTPException(status_code=409, detail="This meal is already part of an order")
    if entry:
        db.delete(entry)
        db.commit()


def _serialize_user_order(order: models.Order) -> dict:
    profile = order.user.customer_profile
    return {
        "id": f"#ORD-{order.id:04d}",
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
        "address": profile.delivery_address if profile else "No delivery address",
        "status": order.status.value,
        "rider": (
            {
                "name": order.delivery.rider.user.full_name,
                "vehicle": order.delivery.rider.plate_number or "No vehicle",
                "phone": (
                    order.delivery.rider.user.customer_profile.phone_number
                    if order.delivery.rider.user.customer_profile
                    else ""
                ),
            }
            if order.delivery and order.delivery.rider
            else None
        ),
        "placedAt": order.created_at.isoformat(),
    }


@router.get("/orders", status_code=status.HTTP_200_OK)
def get_orders(request: Request, db: Session = Depends(get_db)):
    user_id = authenticate_and_get_user_details(request).get("user_id")
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
        .filter(models.Order.user_id == user_id)
        .order_by(models.Order.created_at.desc())
        .all()
    )
    return [_serialize_user_order(order) for order in orders]


@router.post("/orders", status_code=status.HTTP_201_CREATED)
def place_order(
    request: Request,
    payload: user.OrderCreate,
    db: Session = Depends(get_db),
):
    user_id = authenticate_and_get_user_details(request).get("user_id")
    if not payload.plan_dates:
        raise HTTPException(status_code=422, detail="No plan dates provided")

    entries = (
        db.query(models.PlanEntry)
        .options(joinedload(models.PlanEntry.meal))
        .filter(
            models.PlanEntry.user_id == user_id,
            models.PlanEntry.plan_date.in_(payload.plan_dates),
            models.PlanEntry.order_id.is_(None),
            models.PlanEntry.meal_id.isnot(None),
        )
        .all()
    )
    if not entries:
        raise HTTPException(status_code=422, detail="No planned meals to order")

    total_credits = sum(entry.meal.credits for entry in entries)
    profile = (
        db.query(models.CustomerProfile)
        .filter(models.CustomerProfile.user_id == user_id)
        .first()
    )
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
    if profile.credits < total_credits:
        raise HTTPException(
            status_code=409,
            detail=f"Not enough credits: this order costs {total_credits} but you have {profile.credits}",
        )

    order = models.Order(user_id=user_id, total_credits=total_credits)
    db.add(order)
    db.flush()

    ordered_meal_counts: dict[int, int] = {}
    for entry in entries:
        ordered_meal_counts[entry.meal_id] = ordered_meal_counts.get(entry.meal_id, 0) + 1
        entry.order_id = order.id
    for meal_id, quantity in ordered_meal_counts.items():
        db.add(models.OrderItem(order_id=order.id, meal_id=meal_id, quantity=quantity))

    profile.credits -= total_credits
    db.commit()
    db.refresh(order)
    return _serialize_user_order(order)

@router.post("/profile", status_code=status.HTTP_201_CREATED)
def create_profile(
    request: Request,
    payload: user.ProfileCreate,
    db: Session = Depends(get_db),
):
    """Creates a customer profile in the database and sets onboarded metadata in Clerk."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User does not exist"
        )

    profile = (
        db.query(models.CustomerProfile)
        .filter(models.CustomerProfile.user_id == user_id)
        .first()
    )
    if profile:
        profile.phone_number = payload.phone_number
        profile.height = payload.height
        profile.weight = payload.weight
        profile.target_weight = payload.target_weight
        profile.goal = payload.goal
        profile.delivery_address = payload.delivery_address
        profile.delivery_lat = payload.delivery_lat
        profile.delivery_long = payload.delivery_long
        db.commit()
        db.refresh(profile)
    else:
        profile = models.CustomerProfile(
            user_id=user_id,
            phone_number=payload.phone_number,
            height=payload.height,
            weight=payload.weight,
            target_weight=payload.target_weight,
            goal=payload.goal,
            delivery_address=payload.delivery_address,
            delivery_lat=payload.delivery_lat,
            delivery_long=payload.delivery_long,
            credits=0,
        )

        db.add(profile)

        try:
            db.commit()
            db.refresh(profile)
        except IntegrityError:
            db.rollback()
            profile = (
                db.query(models.CustomerProfile)
                .filter(models.CustomerProfile.user_id == user_id)
                .first()
            )
            if profile is None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Profile already exists for this user",
                )

    try:
        clerk.users.update_metadata(
            user_id=user_id,
            public_metadata={
                "onboarded": True,
            },
        )
    except Exception as clerk_err:
        logger.error(f"Failed to update Clerk metadata for user {user_id}: {clerk_err}")

    return profile

@router.get("/profile", status_code=status.HTTP_200_OK)
async def get_profile(
    request: Request,
    db: Session = Depends(get_db),
):
    """Retrieves the customer profile from the database."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    profile = (
        db.query(models.CustomerProfile)
        .filter(models.CustomerProfile.user_id == user_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Profile does not exist"
        )

    return profile

@router.get("/dashboard", status_code=status.HTTP_200_OK)
def get_dashboard(
    request: Request,
    db: Session = Depends(get_db),
):
    """Returns the authenticated user's nutrition totals and recent meal logs."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")
    profile = (
        db.query(models.CustomerProfile)
        .filter(models.CustomerProfile.user_id == user_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile does not exist",
        )

    today = datetime.now().date()
    week_start = today - timedelta(days=6)

    logs = (
        db.query(models.MealLog)
        .options(joinedload(models.MealLog.meal))
        .filter(
            models.MealLog.user_id == user_id,
            models.MealLog.consumed_at >= datetime.combine(week_start, datetime.min.time()),
        )
        .order_by(models.MealLog.consumed_at.desc())
        .all()
    )

    # Profile data does not include age, sex, or activity level, so use a
    # conservative weight-based estimate until those inputs are available.
    calorie_adjustment = {
        models.Goals.LOSE_WEIGHT: -300,
        models.Goals.MAINTAIN_WEIGHT: 0,
        models.Goals.GAIN_WEIGHT: 300,
    }[profile.goal]
    calorie_target = max(1200, round(profile.weight * 30 + calorie_adjustment))
    protein_target = max(1, round(profile.target_weight * 1.6))
    fat_target = max(1, round((calorie_target * 0.25) / 9))
    carbs_target = max(1, round((calorie_target - protein_target * 4 - fat_target * 9) / 4))
    daily_target = {
        "calories": calorie_target,
        "protein": protein_target,
        "carbs": carbs_target,
        "fat": fat_target,
    }
    daily_logs = [log for log in logs if log.consumed_at.date() == today]
    totals = {
        "calories": sum(log.meal.calories for log in daily_logs),
        "protein": sum(log.meal.protein for log in daily_logs),
        "carbs": sum(log.meal.carb for log in daily_logs),
        "fat": sum(log.meal.fat for log in daily_logs),
    }

    weekly = []
    for offset in range(6, -1, -1):
        day = today - timedelta(days=offset)
        day_logs = [log for log in logs if log.consumed_at.date() == day]
        weekly.append({
            "date": day.isoformat(),
            "day": day.strftime("%a"),
            "calories": sum(log.meal.calories for log in day_logs),
            "target": daily_target["calories"],
        })

    recent = []
    for log in logs[:5]:
        recent.append({
            "id": log.id,
            "meal_id": log.meal_id,
            "name": log.meal.title,
            "consumed_at": log.consumed_at.isoformat(),
            "calories": log.meal.calories,
            "protein": log.meal.protein,
            "carbs": log.meal.carb,
            "fat": log.meal.fat,
        })

    return {
        "date": today.isoformat(),
        "totals": totals,
        "targets": daily_target,
        "weekly": weekly,
        "recent_meals": recent,
    }

@router.put("/profile", status_code=status.HTTP_200_OK)
def update_profile(
    request: Request,
    payload: user.ProfileCreate,
    db: Session = Depends(get_db),
):
    """Updates the authenticated user's customer profile."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    profile = (
        db.query(models.CustomerProfile)
        .filter(models.CustomerProfile.user_id == user_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Profile does not exist",
        )

    profile.phone_number = payload.phone_number
    profile.height = payload.height
    profile.weight = payload.weight
    profile.target_weight = payload.target_weight
    profile.goal = payload.goal
    profile.delivery_address = payload.delivery_address
    profile.delivery_lat = payload.delivery_lat
    profile.delivery_long = payload.delivery_long

    db.commit()
    db.refresh(profile)
    return profile

@router.get("/meals/{id}", status_code=status.HTTP_200_OK)
async def get_meal(
    id: int,
    db: Session = Depends(get_db),
):
    """Retrieves a specific meal from the database."""
    return db.query(models.Meal).filter(models.Meal.id == id).first()

@router.get("/meals", status_code=status.HTTP_200_OK)
async def get_meals(
    db: Session = Depends(get_db),
):
    """Retrieves all meals from the database."""
    return db.query(models.Meal).all()

@router.post("/meal-logs", status_code=status.HTTP_201_CREATED)
def create_meal_log(
    request: Request,
    payload: user.MealLogCreate,
    db: Session = Depends(get_db),
):
    """Logs one serving of a meal for the authenticated user."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")
    meal = db.query(models.Meal).filter(models.Meal.id == payload.meal_id).first()
    if not meal:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Meal does not exist")

    log = log_meal_consumption(db, user_id, meal.id)
    return {
        "id": log.id,
        "meal_id": log.meal_id,
        "consumed_at": log.consumed_at.isoformat(),
    }

@router.post("/fav-meal", status_code=status.HTTP_201_CREATED)
def add_favorite_meal(
    request: Request,
    meal_id: int,
    db: Session = Depends(get_db),
):
    """Adds a meal to the user's favorites."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    # Check if the meal exists
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Meal does not exist"
        )

    # Add to favorites
    favorite = favorite_meal(db, user_id, meal_id)
    return favorite

@router.delete("/fav-meal", status_code=status.HTTP_200_OK)
def remove_favorite_meal(
    request: Request,
    meal_id: int,
    db: Session = Depends(get_db),
):
    """Removes a meal from the user's favorites."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    # Check if the meal exists
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Meal does not exist"
        )

    # Remove from favorites
    success = unfavorite_meal(db, user_id, meal_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Favorite meal entry does not exist"
        )

    return {"detail": "Meal removed from favorites"}

@router.get("/fav-meal", status_code=status.HTTP_200_OK)
def get_favorite_meals(
    request: Request,
    db: Session = Depends(get_db),
):
    """Retrieves the user's favorite meals."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    favorites = get_all_favorite_meals(db, user_id)
    return favorites
# @router.put("/meal-logs", status_code=status.HTTP_200_OK)
# async def log_meal(
#     request: Request,
#     meal_log: user.MealLogCreate,
#     db: Session = Depends(get_db),
# ):
#     """Logs a meal for the authenticated user."""
#     user_details = authenticate_and_get_user_details(request)
#     user_id = user_details.get("user_id")

#     # Check if the meal exists
#     meal = db.query(models.Meal).filter(models.Meal.id == meal_log.meal_id).first()
#     if not meal:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, 
#             detail="Meal does not exist"
#         )

#     # Create a new MealLog entry
#     new_meal_log = models.MealLog(
#         user_id=user_id,
#         meal_id=meal_log.meal_id,
#         quantity=meal_log.quantity,
#         logged_at=meal_log.logged_at
#     )

#     db.add(new_meal_log)
#     db.commit()
#     db.refresh(new_meal_log)

#     return new_meal_log
