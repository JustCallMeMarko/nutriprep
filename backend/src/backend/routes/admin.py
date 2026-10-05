import os
from backend.utils import authenticate_and_get_user_details
import boto3
from botocore.config import Config
from fastapi import APIRouter, Request, HTTPException, Depends, File, UploadFile, status
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
def create_meal(meal_data: dict):
    pass