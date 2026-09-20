import os
import json
import logging
from fastapi import APIRouter, Request, HTTPException, Depends
from dotenv import load_dotenv
from svix.webhooks import Webhook
from clerk_backend_api import Clerk

from ..database.db import get_users
from ..database.models import get_db
logger = logging.getLogger(__name__)
router = APIRouter()

@router.get("/users")
def get_all_users(request: Request, db=Depends(get_db)):
    users = get_users(db)
    return {"users": users}