import os
import json
import logging
from fastapi import APIRouter, Request, HTTPException, Depends
from dotenv import load_dotenv
from svix.webhooks import Webhook
from clerk_backend_api import Clerk

from ..database.db import create_profile
from ..database.models import get_db

logger = logging.getLogger(__name__)

load_dotenv()

router = APIRouter()

ALLOWED_SIGNUP_ROLES = {"member", "rider"}

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")

clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)


def resolve_role(user_data: dict) -> str:
    unsafe_meta = user_data.get("unsafe_metadata") or {}
    role = unsafe_meta.get("role")
    return role if role in ALLOWED_SIGNUP_ROLES else "member"


@router.post("/clerk")
async def handle_clerk_webhook(request: Request, db=Depends(get_db)):
    if not CLERK_WEBHOOK_SECRET or not CLERK_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Server configuration missing secrets")

    payload = (await request.body()).decode("utf-8")

    try:
        Webhook(CLERK_WEBHOOK_SECRET).verify(payload, dict(request.headers))
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid webhook signature: {e}")

    event = json.loads(payload)
    event_type = event.get("type")

    # Only handle initial provisioning on creation
    if event_type != "user.created":
        return {"status": "ignored", "event": event_type}

    user_data = event.get("data", {})
    user_id = user_data.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user id in payload")

    role = resolve_role(user_data)

    # 1. Local DB save (ensure this is idempotent: ON CONFLICT DO NOTHING / UPDATE)
    create_profile(db, user_id, role=role)

    # 2. Async sync back to Clerk public_metadata
    try:
        await clerk.users.update_metadata_async(
            user_id=user_id,
            public_metadata={"role": role}
        )
    except Exception as clerk_err:
        logger.error(f"Failed to update Clerk metadata for user {user_id}: {clerk_err}")
        # Return 500 to let Svix retry, since DB operation is idempotent
        raise HTTPException(status_code=500, detail="Clerk metadata sync failed")

    return {"status": "success", "role": role}