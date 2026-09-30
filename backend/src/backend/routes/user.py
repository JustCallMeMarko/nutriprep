import os
import json
import logging
import uuid
import boto3
from botocore.config import Config
from fastapi import APIRouter, Request, HTTPException, Depends, File, UploadFile
from dotenv import load_dotenv
from svix.webhooks import Webhook
from clerk_backend_api import Clerk

from ..database.db import get_users
from ..database.models import get_db

logger = logging.getLogger(__name__)
router = APIRouter()

# ------------------------------------------------------------------
# RustFS / S3 Configuration
# ------------------------------------------------------------------
RUSTFS_ENDPOINT = os.getenv("RUSTFS_ENDPOINT", "http://rustfs:9000")
RUSTFS_PUBLIC_ENDPOINT = os.getenv("RUSTFS_PUBLIC_ENDPOINT", "http://localhost:9000")
RUSTFS_BUCKET = os.getenv("RUSTFS_BUCKET", "meals")
RUSTFS_ACCESS_KEY = os.getenv("RUSTFS_ACCESS_KEY", "admin")
RUSTFS_SECRET_KEY = os.getenv("RUSTFS_SECRET_KEY", "adminpassword")

load_dotenv()

# Initialize S3 Client targeting RustFS
s3_client = boto3.client(
    "s3",
    endpoint_url=RUSTFS_ENDPOINT,
    aws_access_key_id=RUSTFS_ACCESS_KEY,
    aws_secret_access_key=RUSTFS_SECRET_KEY,
    config=Config(s3={"addressing_style": "path"}),
    region_name="us-east-1"
)


# ------------------------------------------------------------------
# Routes
# ------------------------------------------------------------------
@router.get("/users")
def get_all_users(request: Request, db=Depends(get_db)):
    users = get_users(db)
    return {"users": users}


@router.post("/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Uploads a meal image to RustFS and returns its public URL."""
    # Restrict file types
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Only image files are allowed")

    # Generate a unique filename to prevent overwrites
    file_extension = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_extension}"

    try:
        # Stream upload directly to RustFS
        s3_client.upload_fileobj(
            file.file,
            RUSTFS_BUCKET,
            unique_filename,
            ExtraArgs={"ContentType": file.content_type}
        )
    except Exception as e:
        logger.error(f"Failed to upload image to RustFS: {e}")
        raise HTTPException(status_code=500, detail="Image upload failed")
    finally:
        await file.close()

    # Construct the public URL for the frontend
    image_url = f"{RUSTFS_PUBLIC_ENDPOINT}/{RUSTFS_BUCKET}/{unique_filename}"

    return {
        "message": "Image uploaded successfully",
        "filename": unique_filename,
        "url": image_url
    }


@router.get("/images")
def get_images():
    """Lists all stored meal images with their public URLs."""
    try:
        response = s3_client.list_objects_v2(Bucket=RUSTFS_BUCKET)
        
        images = []
        if "Contents" in response:
            for obj in response["Contents"]:
                images.append({
                    "filename": obj["Key"],
                    "url": f"{RUSTFS_PUBLIC_ENDPOINT}/{RUSTFS_BUCKET}/{obj['Key']}",
                    "size": obj["Size"],
                    "last_modified": obj["LastModified"]
                })

        return {"images": images}
    except Exception as e:
        logger.error(f"Failed to fetch images from RustFS: {e}")
        raise HTTPException(status_code=500, detail="Could not retrieve images")