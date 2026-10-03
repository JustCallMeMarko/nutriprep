import os
import json
import logging
from fastapi import APIRouter, Request, HTTPException, Depends
from dotenv import load_dotenv
from svix.webhooks import Webhook
from clerk_backend_api import Clerk

from ..database.db import create_user_with_profile, sync_role_from_metadata
from ..database.models import get_db

logger = logging.getLogger(__name__)
load_dotenv()

router = APIRouter(prefix="/webhooks", tags=["webhooks"])

ALLOWED_SIGNUP_ROLES = {"user", "rider"}
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")

clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)

@router.post("/clerk")
async def handle_clerk_webhook(request: Request, db=Depends(get_db)):
    if not CLERK_WEBHOOK_SECRET or not CLERK_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Server missing webhook configuration")

    payload = (await request.body()).decode("utf-8")

    try:
        Webhook(CLERK_WEBHOOK_SECRET).verify(payload, dict(request.headers))
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid webhook signature: {e}")

    event = json.loads(payload)
    event_type = event.get("type")
    user_data = event.get("data", {})
    user_id = user_data.get("id")

    if not user_id:
        return {"status": "ignored", "reason": "No user ID"}

    if event_type == "user.created":
        unsafe_meta = user_data.get("unsafe_metadata") or {}
        requested_role = unsafe_meta.get("role")
        
        role = requested_role if requested_role in ALLOWED_SIGNUP_ROLES else "user"

        try:
            create_user_with_profile(db, user_id=user_id, role=role)
        except Exception as err:
            logger.error(f"Error provisioning user {user_id}: {err}")
            db.rollback()
            raise HTTPException(status_code=500, detail="Database provisioning failed")

        try:
            await clerk.users.update_metadata_async(
                user_id=user_id,
                public_metadata={"role": role}
            )
        except Exception as clerk_err:
            logger.error(f"Failed to set Clerk public_metadata: {clerk_err}")

        return {"status": "created", "role": role}

    elif event_type == "user.updated":
        public_meta = user_data.get("public_metadata") or {}
        metadata_role = public_meta.get("role")

        if metadata_role:
            updated_user = sync_role_from_metadata(db, user_id=user_id, new_role_str=metadata_role)
            if updated_user:
                return {"status": "updated", "role": updated_user.role.value}

        return {"status": "no_role_change"}

    return {"status": "ignored", "event": event_type}