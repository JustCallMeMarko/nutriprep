from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import func

from ..database.db import get_db, get_users
from ..database.models import Favorite, Order, Profile, Subscription
from ..utils import authenticate_and_get_user_details

router = APIRouter()

CATALOG_PLANS = [
    {"id": 1, "name": "Low Calorie", "tag": "Low calorie", "category": "regular", "description": "Balanced, everyday meals sized for steady, sustainable weight loss.", "credits_per_meal": 5, "macros": {"protein": "28%", "carbs": "45%", "fat": "27%"}},
    {"id": 2, "name": "Lean & Active", "tag": "Low carb - high protein", "category": "regular", "description": "Higher protein, lower carbs, built for weight management and keeping full longer.", "credits_per_meal": 7, "macros": {"protein": "35%", "carbs": "30%", "fat": "35%"}},
    {"id": 3, "name": "Performance", "tag": "Low carb - high protein", "category": "regular", "description": "Muscle recovery and energy for daily workouts and active routines.", "credits_per_meal": 8, "macros": {"protein": "38%", "carbs": "33%", "fat": "29%"}},
    {"id": 4, "name": "Keto", "tag": "Keto", "category": "regular", "description": "Very low carb, high healthy fat.", "credits_per_meal": 8, "macros": {"protein": "23%", "carbs": "7%", "fat": "70%"}},
    {"id": 5, "name": "High Fiber", "tag": "High Fiber", "category": "specialized", "description": "Supports digestion, satiety, and healthy cholesterol with fiber-rich meals.", "credits_per_meal": 7, "macros": {"protein": "20%", "carbs": "55%", "fat": "25%"}},
    {"id": 6, "name": "Diabetic", "tag": "Diabetic", "category": "specialized", "description": "Controlled carbohydrates and nutrient-dense foods for glycemic control.", "credits_per_meal": 8, "macros": {"protein": "25%", "carbs": "40%", "fat": "39%"}},
]

CATALOG_MEALS = [
    {"id": 1, "title": "Veggie Egg White Omelette", "description": "Egg whites, spinach, tomato and mushroom, served with wholegrain toast.", "calories": 310, "protein_g": 26, "carbs_g": 16, "carbs_fiber_g": 4, "fat_g": 9, "tags": ["Low calorie"], "credits": 4, "meal_time": "breakfast"},
    {"id": 2, "title": "Chia & Greek Yogurt Parfait", "description": "Chia seeds blended with Greek yogurt, berries, and honey, topped with crushed walnuts.", "calories": 290, "protein_g": 22, "carbs_g": 26, "carbs_fiber_g": 6, "fat_g": 10, "tags": ["Diabetic"], "credits": 5, "meal_time": "breakfast"},
    {"id": 3, "title": "Turkey & Cheese Frittata", "description": "Baked egg frittata with lean turkey, bell pepper, and light cheese.", "calories": 290, "protein_g": 32, "carbs_g": 10, "carbs_fiber_g": 2, "fat_g": 13, "tags": ["Low-Carb", "High-Protein"], "credits": 6, "meal_time": "breakfast"},
    {"id": 4, "title": "Steak & Whole Egg Power Skillet", "description": "Flank steak with eggs and sauteed bell peppers in olive oil.", "calories": 520, "protein_g": 48, "carbs_g": 10, "carbs_fiber_g": 3, "fat_g": 30, "tags": ["Performance"], "credits": 7, "meal_time": "breakfast"},
    {"id": 5, "title": "Grilled Chicken & Quinoa Bowl", "description": "Grilled chicken breast, quinoa, roasted vegetables, and lemon-herb dressing.", "calories": 430, "protein_g": 38, "carbs_g": 35, "carbs_fiber_g": 5, "fat_g": 13, "tags": ["Lean & Active"], "credits": 7, "meal_time": "lunch_dinner"},
]

SUBSCRIPTION_TIERS = {
    "bronze": {"name": "Bronze", "credits": 25},
    "silver": {"name": "Silver", "credits": 40},
    "gold": {"name": "Gold", "credits": 100},
}


def get_current_profile(db, current_user):
    profile = db.query(Profile).filter(Profile.user_id == current_user["user_id"]).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile is still being provisioned")
    return profile


def require_role(profile, role):
    if profile.role != role:
        raise HTTPException(status_code=403, detail=f"{role.title()} role required")


def serialize_order(order):
    plan = next((item for item in CATALOG_PLANS if item["id"] == order.plan_id), None)
    return {
        "id": order.id,
        "orderId": f"ORD-{order.id:04d}",
        "customerName": order.customer_name,
        "pickupLocation": order.pickup_location,
        "pickupDetails": order.pickup_details,
        "dropoffLocation": order.dropoff_location,
        "address": order.dropoff_location,
        "notes": order.notes,
        "planId": order.plan_id,
        "mealPlan": plan["name"] if plan else f"Plan {order.plan_id}",
        "status": order.status,
        "riderId": order.rider_id,
    }

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


@router.get("/me")
def get_my_profile(db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    profile = get_current_profile(db, current_user)
    return {"user_id": profile.user_id, "role": profile.role, "credits": profile.credits}


@router.get("/catalog")
def get_catalog(current_user=Depends(authenticate_and_get_user_details)):
    return {"plans": CATALOG_PLANS, "meals": CATALOG_MEALS}


@router.get("/favorites")
def get_favorites(db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    favorites = db.query(Favorite).filter(Favorite.user_id == current_user["user_id"]).all()
    meals = {meal["id"]: meal for meal in CATALOG_MEALS}
    return [{**meals[item.meal_id], "quantity": item.quantity} for item in favorites if item.meal_id in meals]


@router.post("/favorites")
def add_favorite(payload: dict, db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    meal_id = payload.get("meal_id")
    if meal_id not in {meal["id"] for meal in CATALOG_MEALS}:
        raise HTTPException(status_code=400, detail="Unknown meal")
    favorite = db.query(Favorite).filter(Favorite.user_id == current_user["user_id"], Favorite.meal_id == meal_id).first()
    if favorite:
        favorite.quantity = int(payload.get("quantity", favorite.quantity))
    else:
        favorite = Favorite(user_id=current_user["user_id"], meal_id=meal_id, quantity=int(payload.get("quantity", 1)))
        db.add(favorite)
    db.commit()
    return {"status": "saved"}


@router.delete("/favorites/{meal_id}")
def remove_favorite(meal_id: int, db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    favorite = db.query(Favorite).filter(Favorite.user_id == current_user["user_id"], Favorite.meal_id == meal_id).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Favorite not found")
    db.delete(favorite)
    db.commit()
    return {"status": "removed"}


@router.get("/subscriptions")
def get_subscription(db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    subscription = db.query(Subscription).filter(Subscription.user_id == current_user["user_id"], Subscription.status == "active").first()
    return None if not subscription else {"id": subscription.id, "tierId": subscription.tier_id, "tierName": subscription.tier_name, "credits": subscription.credits, "status": subscription.status}


@router.post("/subscriptions")
def create_subscription(payload: dict, db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    tier_id = payload.get("tier_id")
    tier = SUBSCRIPTION_TIERS.get(tier_id)
    if not tier:
        raise HTTPException(status_code=400, detail="Unknown subscription tier")
    profile = get_current_profile(db, current_user)
    subscription = db.query(Subscription).filter(Subscription.user_id == profile.user_id).first()
    if not subscription:
        subscription = Subscription(user_id=profile.user_id, tier_id=tier_id, tier_name=tier["name"], credits=tier["credits"])
        db.add(subscription)
    else:
        subscription.tier_id = tier_id
        subscription.tier_name = tier["name"]
        subscription.credits = tier["credits"]
        subscription.status = "active"
    profile.credits = tier["credits"]
    db.commit()
    return {"tierId": tier_id, "tierName": tier["name"], "credits": tier["credits"], "status": "active"}


@router.post("/orders")
def create_order(payload: dict, db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    plan_id = payload.get("plan_id")
    if plan_id not in {plan["id"] for plan in CATALOG_PLANS}:
        raise HTTPException(status_code=400, detail="Unknown meal plan")
    profile = get_current_profile(db, current_user)
    order = Order(user_id=profile.user_id, plan_id=plan_id, dropoff_location=payload.get("address", "Address pending"), notes=payload.get("notes"))
    db.add(order)
    db.commit()
    db.refresh(order)
    return serialize_order(order)


@router.get("/rider/deliveries")
def get_rider_deliveries(db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    profile = get_current_profile(db, current_user)
    require_role(profile, "rider")
    orders = db.query(Order).filter((Order.status == "pending") | (Order.rider_id == profile.user_id)).all()
    return [serialize_order(order) for order in orders]


@router.post("/rider/deliveries/{order_id}/accept")
def accept_delivery(order_id: int, db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    profile = get_current_profile(db, current_user)
    require_role(profile, "rider")
    order = db.query(Order).filter(
        Order.id == order_id,
        Order.status.in_(["pending", "ready"]),
        (Order.rider_id.is_(None) | (Order.rider_id == profile.user_id)),
    ).first()
    if not order:
        raise HTTPException(status_code=404, detail="Delivery is no longer available")
    order.rider_id = profile.user_id
    order.status = "in_transit"
    db.commit()
    return serialize_order(order)


@router.post("/rider/deliveries/{order_id}/complete")
def complete_delivery(order_id: int, db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    profile = get_current_profile(db, current_user)
    require_role(profile, "rider")
    order = db.query(Order).filter(Order.id == order_id, Order.rider_id == profile.user_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Active delivery not found")
    order.status = "delivered"
    db.commit()
    return serialize_order(order)


@router.get("/admin/dashboard")
def get_admin_dashboard(db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    profile = get_current_profile(db, current_user)
    require_role(profile, "admin")
    return {
        "totalOrders": db.query(func.count(Order.id)).scalar() or 0,
        "pendingOrders": db.query(func.count(Order.id)).filter(Order.status == "pending").scalar() or 0,
        "activeDeliveries": db.query(func.count(Order.id)).filter(Order.status == "in_transit").scalar() or 0,
        "recentOrders": [serialize_order(order) for order in db.query(Order).order_by(Order.created_at.desc()).limit(10).all()],
    }


@router.get("/admin/orders")
def get_admin_orders(db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    profile = get_current_profile(db, current_user)
    require_role(profile, "admin")
    return [serialize_order(order) for order in db.query(Order).order_by(Order.created_at.desc()).all()]


@router.get("/admin/riders")
def get_admin_riders(db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    profile = get_current_profile(db, current_user)
    require_role(profile, "admin")
    riders = db.query(Profile).filter(Profile.role == "rider").all()
    return [{
        "id": rider.user_id,
        "name": rider.user_id,
        "vehicle": "Vehicle not set",
        "rating": "-",
        "currentLoads": db.query(func.count(Order.id)).filter(Order.rider_id == rider.user_id, Order.status == "in_transit").scalar() or 0,
    } for rider in riders]


@router.post("/admin/orders/{order_id}/assign")
def assign_order(order_id: int, payload: dict, db=Depends(get_db), current_user=Depends(authenticate_and_get_user_details)):
    profile = get_current_profile(db, current_user)
    require_role(profile, "admin")
    rider_id = payload.get("rider_id")
    rider = db.query(Profile).filter(Profile.user_id == rider_id, Profile.role == "rider").first()
    order = db.query(Order).filter(Order.id == order_id).first()
    if not rider or not order:
        raise HTTPException(status_code=404, detail="Order or rider not found")
    order.rider_id = rider.user_id
    order.status = "ready"
    db.commit()
    return serialize_order(order)