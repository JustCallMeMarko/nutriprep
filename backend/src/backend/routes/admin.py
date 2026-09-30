from fastapi import APIRouter, Request, HTTPException, Depends, File, UploadFile
from clerk_backend_api import Clerk
import os
from dotenv import load_dotenv

load_dotenv()

router = APIRouter()
clerk = Clerk(bearer_auth=os.getenv("CLERK_SECRET_KEY"))

@router.get("/total-users")
def get_total_users():
    response = clerk.users.count()
    return {"total_users": response.total_count}