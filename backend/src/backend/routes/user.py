import os
import logging
from backend.utils import authenticate_and_get_user_details
import boto3
from botocore.config import Config
from fastapi import APIRouter, Request, HTTPException, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from dotenv import load_dotenv
from ..database import models
from ..database.db import favorite_meal, unfavorite_meal
from ..schemas import user
from ..database.models import get_db
from clerk_backend_api import Clerk

load_dotenv()

CLERK_SECRET_KEY = os.getenv("CLERK_SECRET_KEY")

if not CLERK_SECRET_KEY:
    raise ValueError("CLERK_SECRET_KEY is not set in the environment variables.")

logger = logging.getLogger(__name__)
router = APIRouter()
clerk = Clerk(bearer_auth=CLERK_SECRET_KEY)

@router.post("/profile", status_code=status.HTTP_201_CREATED)
def create_profile(
    request: Request,
    payload: user.ProfileCreate,
    db: Session = Depends(get_db),
):
    """Creates a customer profile in the database and sets onboarded metadata in Clerk."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User does not exist"
        )

    profile = models.CustomerProfile(
        user_id=user_id,
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

    try:
        db.commit()
        db.refresh(profile)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Profile already exists for this user",
        )

    try:
        clerk.users.update_metadata(
            user_id=user_id,
            public_metadata={
                "onboarded": True,
            },
        )
    except Exception as clerk_err:
        logger.error(f"Failed to update Clerk metadata for user {user_id}: {clerk_err}")

    return profile

@router.get("/profile", status_code=status.HTTP_200_OK)
async def get_profile(
    request: Request,
    db: Session = Depends(get_db),
):
    """Retrieves the customer profile from the database."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    profile = (
        db.query(models.CustomerProfile)
        .filter(models.CustomerProfile.user_id == user_id)
        .first()
    )
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Profile does not exist"
        )

    return profile

@router.get("/meals", status_code=status.HTTP_200_OK)
async def get_meals(
    db: Session = Depends(get_db),
):
    """Retrieves all meals from the database."""
    return db.query(models.Meal).all()

@router.post("/fav-meal", status_code=status.HTTP_201_CREATED)
def add_favorite_meal(
    request: Request,
    meal_id: int,
    db: Session = Depends(get_db),
):
    """Adds a meal to the user's favorites."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    # Check if the meal exists
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Meal does not exist"
        )

    # Add to favorites
    favorite = favorite_meal(db, user_id, meal_id)
    return favorite

@router.delete("/fav-meal", status_code=status.HTTP_200_OK)
def remove_favorite_meal(
    request: Request,
    meal_id: int,
    db: Session = Depends(get_db),
):
    """Removes a meal from the user's favorites."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    # Check if the meal exists
    meal = db.query(models.Meal).filter(models.Meal.id == meal_id).first()
    if not meal:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Meal does not exist"
        )

    # Remove from favorites
    success = unfavorite_meal(db, user_id, meal_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Favorite meal entry does not exist"
        )

    return {"detail": "Meal removed from favorites"}

@router.get("/fav-meal", status_code=status.HTTP_200_OK)
def get_favorite_meals(
    request: Request,
    db: Session = Depends(get_db),
):
    """Retrieves the user's favorite meals."""
    user_details = authenticate_and_get_user_details(request)
    user_id = user_details.get("user_id")

    favorites = (
        db.query(models.FavoriteMeal)
        .filter(models.FavoriteMeal.user_id == user_id)
        .all()
    )
    return favorites
# @router.put("/meal-logs", status_code=status.HTTP_200_OK)
# async def log_meal(
#     request: Request,
#     meal_log: user.MealLogCreate,
#     db: Session = Depends(get_db),
# ):
#     """Logs a meal for the authenticated user."""
#     user_details = authenticate_and_get_user_details(request)
#     user_id = user_details.get("user_id")

#     # Check if the meal exists
#     meal = db.query(models.Meal).filter(models.Meal.id == meal_log.meal_id).first()
#     if not meal:
#         raise HTTPException(
#             status_code=status.HTTP_404_NOT_FOUND, 
#             detail="Meal does not exist"
#         )

#     # Create a new MealLog entry
#     new_meal_log = models.MealLog(
#         user_id=user_id,
#         meal_id=meal_log.meal_id,
#         quantity=meal_log.quantity,
#         logged_at=meal_log.logged_at
#     )

#     db.add(new_meal_log)
#     db.commit()
#     db.refresh(new_meal_log)

#     return new_meal_log

