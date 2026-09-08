import os
import json

from fastapi import APIRouter, Request, HTTPException, Depends
from dotenv import load_dotenv
from svix.webhooks import Webhook
from clerk_backend_api import Clerk, UpdateUserMetadataRequestBody

from ..database.db import create_profile
from ..database.models import get_db

load_dotenv()

router = APIRouter()

ALLOWED_SIGNUP_ROLES = {"member", "rider"}

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")

clerk_client = Clerk(bearer_auth=CLERK_SECRET_KEY)


def resolve_role(user_data: dict) -> str:
    """Pick the role requested at signup.

    The React app captures the signup URL (e.g. /signup?rider=true) and passes it to
    Clerk as unsafe_metadata/public_metadata during signUp.create(). That value then
    arrives here in the user.created payload. Anything absent or unknown defaults to
    "member". Admin can never be self-assigned.
    """
    metadata = user_data.get("public_metadata") or {}
    unsafe_metadata = user_data.get("unsafe_metadata") or {}

    raw_role = (
        metadata.get("role")
        or unsafe_metadata.get("role")
        or "member"
    )

    return raw_role if raw_role in ALLOWED_SIGNUP_ROLES else "member"


@router.post("/clerk")
async def handle_user_created(request: Request, db=Depends(get_db)):
    if not CLERK_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="CLERK_WEBHOOK_SECRET not set")

    if not CLERK_SECRET_KEY:
        raise HTTPException(status_code=500, detail="CLERK_SECRET_KEY not set")

    body = await request.body()
    payload = body.decode("utf-8")

    try:
        Webhook(CLERK_WEBHOOK_SECRET).verify(payload, dict(request.headers))
    except Exception as e:
        raise HTTPException(status_code=401, detail=f"Invalid webhook signature: {e}")

    data = json.loads(payload)
    event_type = data.get("type")

    if event_type not in ("user.created", "user.updated"):
        return {"status": "ignored"}

    user_data = data.get("data", {})
    user_id = user_data.get("id")
    if not user_id:
        raise HTTPException(status_code=400, detail="Missing user id in payload")

    role = resolve_role(user_data)

    create_profile(db, user_id, role=role)

    try:
        clerk_client.users.update_metadata(
            user_id=user_id,
            request_body=UpdateUserMetadataRequestBody(
                public_metadata={
                    "role": role
                }
            ),
        )
    except Exception as clerk_err:
        print(f"Failed to update Clerk metadata for user {user_id}: {clerk_err}")
        raise HTTPException(status_code=500, detail="Profile created, but Clerk metadata sync failed")

    return {"status": "success", "role": role}
