import os
import json
import logging
from fastapi import APIRouter, Depends, HTTPException
from dotenv import load_dotenv
from svix.webhooks import Webhook

from ..database.db import get_db, get_users
from ..database.models import Profile
from ..utils import authenticate_and_get_user_details
logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/users")
def get_all_users(
    db=Depends(get_db),
    current_user=Depends(authenticate_and_get_user_details),
):
    profile = db.query(Profile).filter(Profile.user_id == current_user["user_id"]).first()
    if not profile or profile.role != "admin":
        raise HTTPException(status_code=403, detail="Admin role required")

    users = get_users(db)
    return {"users": users}