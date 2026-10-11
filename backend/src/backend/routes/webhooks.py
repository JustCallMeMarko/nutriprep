import os
import json
import logging
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from svix.webhooks import Webhook
from clerk_backend_api import Clerk

from ..database.db import create_user, delete_user, sync_role_from_metadata
from ..database import models
from ..database.models import get_db

logger = logging.getLogger(__name__)
load_dotenv()

router = APIRouter()

ALLOWED_SIGNUP_ROLES = {"user", "rider"}
CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")
CLERK_WEBHOOK_SECRET = os.getenv("CLERK_WEBHOOK_SECRET")

clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)

SUBSCRIPTION_CREDITS = {
    "bronze": 25,
    "silver": 40,
    "gold": 100,
}

# Clerk Billing fires subscription.created before payment completes (status
# incomplete/upcoming), then subscription.active once billing activates, plus
# subscriptionItem.active per item. Credits must be granted on the active
# events too or paid subscriptions never get credited.
SUBSCRIPTION_EVENT_TYPES = {
    "subscription.created",
    "subscription.updated",
    "subscription.active",
    "subscriptionItem.active",
    "subscriptionItem.updated",
}

def _subscription_user_id(data: dict) -> str | None:
    # Clerk Billing's payer/customer objects carry their own ids (cpayer_*,
    # cus_*) alongside the real Clerk user id — only accept user_* values so
    # we never look up profiles by a payer id.
    payer = data.get("payer") or {}
    customer = data.get("customer") or {}
    user = data.get("user") or {}
    candidates = [
        data.get("user_id"),
        data.get("subscriber_id"),
        user.get("user_id"),
        user.get("id"),
        payer.get("user_id"),
        customer.get("user_id"),
        data.get("payer_id") if str(data.get("payer_id") or "").startswith("user_") else None,
        payer.get("id") if str(payer.get("id") or "").startswith("user_") else None,
        customer.get("id") if str(customer.get("id") or "").startswith("user_") else None,
    ]
    for candidate in candidates:
        if candidate:
            return candidate
    return None

def _subscription_plan_name(data: dict) -> str | None:
    plan = data.get("plan") or {}
    if isinstance(plan, dict):
        raw_name = plan.get("name") or plan.get("slug")
    else:
        raw_name = plan
    raw_name = raw_name or data.get("plan_name") or data.get("plan_slug")
    candidates = [raw_name]
    items = data.get("items") or []
    if isinstance(items, dict):
        # Clerk wraps collections as {"object": "list", "data": [...]}
        nested = items.get("data")
        items = nested if isinstance(nested, list) else [items]
    if isinstance(items, list):
        for item in items:
            if not isinstance(item, dict):
                continue
            item_plan = item.get("plan") or {}
            if isinstance(item_plan, dict):
                candidates.extend((item_plan.get("name"), item_plan.get("slug")))
            else:
                candidates.append(item_plan)
            candidates.extend((item.get("plan_name"), item.get("plan_slug")))
            # Fall back to plan fields carried on the item itself — a present
            # but null/empty `plan` still lets the item's own name/slug match.
            candidates.extend((item.get("name"), item.get("slug")))

    for candidate in candidates:
        if not candidate:
            continue
        normalized = str(candidate).strip().lower().replace("_", "-")
        for plan_name in SUBSCRIPTION_CREDITS:
            if normalized == plan_name or normalized.startswith(f"{plan_name}-") or normalized.startswith(f"{plan_name} "):
                return plan_name
    return None

def _subscription_period_key(data: dict) -> str:
    period_start = data.get("period_start") or data.get("active_at") or data.get("created_at")
    return str(period_start or "initial")

def _grant_subscription_credits(db, event_id: str, data: dict) -> dict:
    user_id = _subscription_user_id(data)
    plan_name = _subscription_plan_name(data)
    subscription = data.get("subscription") or {}
    subscription_id = (
        data.get("id")
        or data.get("subscription_id")
        or (subscription.get("id") if isinstance(subscription, dict) else None)
    )

    # Non-active events carry no credits, so skip them before requiring
    # fields that early lifecycle events (e.g. subscription.created while
    # incomplete) legitimately omit.
    subscription_status = str(data.get("status") or "").lower()
    if subscription_status and subscription_status not in {"active", "trialing"}:
        return {"status": "ignored", "credits": 0}

    missing = []
    if not user_id:
        missing.append("user")
    if not plan_name:
        missing.append("plan")
    if not subscription_id:
        missing.append("subscription ID")
    if missing:
        logger.warning(
            "Rejected subscription webhook %s: missing %s; event keys=%s",
            event_id,
            ", ".join(missing),
            sorted(data.keys()),
        )
        raise HTTPException(
            status_code=422,
            detail=f"Subscription event is missing {', '.join(missing)}",
        )

    profile = db.query(models.CustomerProfile).filter(
        models.CustomerProfile.user_id == user_id
    ).with_for_update().first()
    if not profile:
        raise HTTPException(status_code=404, detail="Customer profile does not exist")

    period_key = _subscription_period_key(data)
    existing = db.query(models.SubscriptionCreditGrant).filter(
        (models.SubscriptionCreditGrant.event_id == event_id)
        | (
            (models.SubscriptionCreditGrant.subscription_id == str(subscription_id))
            & (models.SubscriptionCreditGrant.plan_name == plan_name)
            & (models.SubscriptionCreditGrant.period_key == period_key)
        )
        | (
            (models.SubscriptionCreditGrant.user_id == user_id)
            & (models.SubscriptionCreditGrant.plan_name == plan_name)
            & (models.SubscriptionCreditGrant.period_key == period_key)
        )
    ).first()
    if existing:
        return {"status": "already_granted", "credits": existing.credits}

    credits = SUBSCRIPTION_CREDITS[plan_name]
    profile.credits += credits
    db.add(models.SubscriptionCreditGrant(
        event_id=event_id,
        subscription_id=str(subscription_id),
        user_id=user_id,
        period_key=period_key,
        plan_name=plan_name,
        credits=credits,
    ))
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        return {"status": "already_granted", "credits": credits}

    return {"status": "credited", "credits": credits}

def _primary_email(user_data: dict) -> str | None:
    """Email matching Clerk's primary_email_address_id, else the first address."""
    addresses = user_data.get("email_addresses") or []
    primary_id = user_data.get("primary_email_address_id")
    if primary_id:
        for address in addresses:
            if address.get("id") == primary_id:
                return address.get("email_address")
    if addresses:
        return addresses[0].get("email_address")
    return None


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
    event_id = event.get("id") or request.headers.get("svix-id")

    if not user_id and event_type not in SUBSCRIPTION_EVENT_TYPES:
        return {"status": "ignored", "reason": "No user ID"}

    if event_type == "user.created":
        unsafe_meta = user_data.get("unsafe_metadata") or {}
        requested_role = unsafe_meta.get("role")
        
        role = requested_role if requested_role in ALLOWED_SIGNUP_ROLES else "user"
        full_name = (user_data.get("first_name") or "") + " " + (user_data.get("last_name") or "")
        email = _primary_email(user_data)

        try:
            create_user(db, user_id=user_id, role=role, full_name=full_name, email=email)
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
            if "resource_not_found" in str(clerk_err) or "not found" in str(clerk_err).lower():
                # The Clerk user was deleted before this webhook ran — don't
                # keep the DB row we just created (it would orphan and block
                # re-signup on the unique email constraint).
                logger.info("Clerk user %s already deleted; removing DB row", user_id)
                delete_user(db, user_id)
                return {"status": "deleted_concurrently"}
            logger.error(f"Failed to set Clerk public_metadata: {clerk_err}")

        return {"status": "created", "role": role}

    elif event_type == "user.updated":
        public_meta = user_data.get("public_metadata") or {}
        metadata_role = public_meta.get("role")
        full_name = (user_data.get("first_name") or "") + " " + (user_data.get("last_name") or "")
        email = _primary_email(user_data)

        # Sync profile fields for every user.updated event, not only when the
        # role metadata changes. Clerk may omit unchanged metadata from the
        # event payload when only the user's name or email is edited.
        updated_user = sync_role_from_metadata(
            db,
            user_id=user_id,
            full_name=full_name,
            email=email,
            new_role_str=metadata_role,
        )
        if updated_user:
            return {"status": "updated", "role": updated_user.role.value}

        return {"status": "no_role_change"}

    elif event_type == "user.deleted":
        # Fires for both self-deletes and deletes from the Clerk dashboard.
        deleted = delete_user(db, user_id)
        if not deleted:
            logger.info("user.deleted for unknown user %s; nothing to remove", user_id)
            return {"status": "no_user"}
        return {"status": "deleted"}

    elif event_type in SUBSCRIPTION_EVENT_TYPES:
        if not event_id:
            logger.warning(
                "Rejected subscription webhook without an event ID; event keys=%s",
                sorted(event.keys()),
            )
            raise HTTPException(status_code=422, detail="Subscription event is missing an event ID")
        result = _grant_subscription_credits(db, str(event_id), user_data)
        return {
            "status": result["status"],
            "credits": result["credits"],
            "plan": _subscription_plan_name(user_data),
        }

    return {"status": "ignored", "event": event_type}
