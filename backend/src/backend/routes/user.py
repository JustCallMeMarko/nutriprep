import os
import logging
import uuid
import boto3
from botocore.config import Config
from fastapi import APIRouter, Request, HTTPException, Depends, File, UploadFile, status
from sqlalchemy.orm import Session
from dotenv import load_dotenv
from ..database import models
from ..schemas import user
from ..database.models import get_db
from clerk_backend_api import Clerk

load_dotenv()

logger = logging.getLogger(__name__)
router = APIRouter()

# ------------------------------------------------------------------
# RustFS / AWS S3 Configuration
# ------------------------------------------------------------------
AWS_ENDPOINT = os.getenv("AWS_ENDPOINT")
AWS_BUCKET = os.getenv("AWS_BUCKET")
AWS_ACCESS_KEY = os.getenv("AWS_ACCESS_KEY")
AWS_SECRET_KEY = os.getenv("AWS_SECRET_KEY")
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

# Initialize S3 Client targeting AWS
s3_client = boto3.client(
    "s3",
    endpoint_url=AWS_ENDPOINT,
    aws_access_key_id=AWS_ACCESS_KEY,
    aws_secret_access_key=AWS_SECRET_KEY,
    config=Config(s3={"addressing_style": "path"}),
    region_name="us-east-1",
)

clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)

# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Uploads a meal image to S3 Bucket and returns its public URL."""
    # Restrict file types
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    # Generate a unique filename to prevent overwrites
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    try:
        # Stream upload directly to S3 Bucket (RustFS)
        s3_client.upload_fileobj(
            file.file,
            AWS_BUCKET,
            unique_filename,
            ExtraArgs={"ContentType": file.content_type},
        )
    except Exception as e:
        logger.error(f"Failed to upload image to S3 Bucket: {e}")
        raise HTTPException(status_code=500, detail="Image upload failed")
    finally:
        await file.close()

    # Construct the public URL for the frontend
    image_url = f"{AWS_ENDPOINT}/{AWS_BUCKET}/{unique_filename}"

    return {
        "message": "Image uploaded successfully",
        "filename": unique_filename,
        "url": image_url,
    }


@router.get("/images")
def get_images():
    """Lists all stored meal images with their public URLs."""
    try:
        response = s3_client.list_objects_v2(Bucket=AWS_BUCKET)

        images = []
        if "Contents" in response:
            for obj in response["Contents"]:
                images.append(
                    {
                        "filename": obj["Key"],
                        "url": f"{AWS_ENDPOINT}/{AWS_BUCKET}/{obj['Key']}",
                        "size": obj["Size"],
                        "last_modified": obj["LastModified"],
                    }
                )

        return {"images": images}
    except Exception as e:
        logger.error(f"Failed to fetch images from S3 Bucket: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve images")

@router.post("/profile", status_code=status.HTTP_201_CREATED)
async def create_profile(
    payload: user.ProfileCreate,
    db: Session = Depends(get_db),
):
    """Creates a customer profile in the database and sets onboarded metadata in Clerk."""

    db_user = db.query(models.User).filter(models.User.id == payload.user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User does not exist"
        )

    existing_profile = (
        db.query(models.CustomerProfile)
        .filter(models.CustomerProfile.user_id == payload.user_id)
        .first()
    )
    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists for this user",
        )

    profile = models.CustomerProfile(
        user_id=payload.user_id,
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
    db.commit()
    db.refresh(profile)

    try:
        await clerk.users.update_metadata_async(
            user_id=payload.user_id,
            public_metadata={
                "onboarded": True,
            },
        )
    except Exception as clerk_err:
        logger.error(f"Failed to update Clerk metadata for user {payload.user_id}: {clerk_err}")

    return profile