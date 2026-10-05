import os
from pathlib import Path
from uuid import uuid4
from backend.utils import authenticate_and_get_user_details
import boto3
from botocore.config import Config
from fastapi import APIRouter, Form, Request, HTTPException, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
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

@router.get("/total-users", status_code=status.HTTP_200_OK)
async def get_total_users(
    request: Request
):
    """Retrieves the customer profile from the database."""
    user_details = authenticate_and_get_user_details(request)
    role = user_details.get("role")
    if role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied. Admin privileges required."
        )
    response = clerk.users.count()
    return {"total_users": response.total_count}

@router.post("/meal")
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
    public_metadata = user_details.get("public_metadata") or {}
    role = user_details.get("role") or public_metadata.get("role")

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