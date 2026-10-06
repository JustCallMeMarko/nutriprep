import os
from pathlib import Path
from uuid import uuid4
from datetime import date, datetime, timedelta
from backend.database.db import get_total_admins, get_total_riders, get_total_user_credits, get_total_users
from backend.utils import authenticate_and_get_user_details
import boto3
from botocore.config import Config
from fastapi import APIRouter, Form, Request, HTTPException, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from sqlalchemy import func
from dotenv import load_dotenv
from ..database import models
from ..schemas import user
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

def _require_admin(request: Request) -> None:
    user_details = authenticate_and_get_user_details(request)
    role = (user_details.get("public_metadata") or {}).get("role")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required.",
        )

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
            detail=f"Access denied. Admin privileges required.",
        )

    image_key = f"meals/{uuid4()}{Path(img.filename or '').suffix}"
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

    return {"id": meal.id}

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
            detail=f"Access denied. Admin privileges required.",
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