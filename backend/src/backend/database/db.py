from sqlalchemy.orm import Session
from datetime import datetime
from . import models

def create_user_with_profile(db: Session, user_id: str, role: str) -> models.User:
    existing = db.query(models.User).filter(models.User.id == user_id).first()
    if existing:
        return existing

    assigned_role = models.Roles.RIDER if role == "rider" else models.Roles.USER

    db_user = models.User(id=user_id, role=assigned_role)
    db.add(db_user)

    if assigned_role == models.Roles.USER:
        db.add(models.CustomerProfile(
            user_id=user_id,
            credits=0,
            height=0.0,
            weight=0.0,
            target_weight=0.0,
            goal=models.Goals.MAINTAIN_WEIGHT
        ))
    elif assigned_role == models.Roles.RIDER:
        db.add(models.RiderProfile(
            user_id=user_id,
            is_available=False
        ))

    db.commit()
    db.refresh(db_user)
    return db_user

def sync_role_from_metadata(db: Session, user_id: str, new_role_str: str) -> models.User | None:
    """Syncs manual role promotions (e.g. promoting to admin in Clerk dashboard)."""
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if not user:
        return None

    role_map = {
        "admin": models.Roles.ADMIN,
        "rider": models.Roles.RIDER,
        "user": models.Roles.USER
    }
    target_role = role_map.get(new_role_str.lower())
    if not target_role or user.role == target_role:
        return user

    user.role = target_role
    db.commit()
    db.refresh(user)
    return user

def create_meal(
        db: Session, 
        user_id: str, 
        title: str, 
        description: str, 
        img_url: str, 
        calories: float,
        protein: float,
        carb: float,
        fat: float,
        credits: int,
        stocks: int
    ) -> models.Meal:
    new_meal = models.Meal(
        user_id=user_id,
        title=title,
        description=description,
        img_url=img_url,
        calories=calories,
        protein=protein,
        carb=carb,
        fat=fat,
        credits=credits,
        stocks=stocks
    )
    db.add(new_meal)
    db.commit()
    db.refresh(new_meal)
    return new_meal

def create_tag(db: Session, name: str) -> models.Tag:
    existing = db.query(models.Tag).filter(models.Tag.name == name).first()
    if existing:
        return existing

    new_tag = models.Tag(name=name)
    db.add(new_tag)
    db.commit()
    db.refresh(new_tag)
    return new_tag

def add_tag_to_meal(db: Session, meal_id: int, tag_id: int) -> models.MealTag:
    existing = db.query(models.MealTag).filter(
        models.MealTag.meal_id == meal_id,
        models.MealTag.tag_id == tag_id
    ).first()
    if existing:
        return existing

    new_meal_tag = models.MealTag(meal_id=meal_id, tag_id=tag_id)
    db.add(new_meal_tag)
    db.commit()
    db.refresh(new_meal_tag)
    return new_meal_tag

def remove_tag_from_meal(db: Session, meal_id: int, tag_id: int) -> bool:
    meal_tag = db.query(models.MealTag).filter(
        models.MealTag.meal_id == meal_id,
        models.MealTag.tag_id == tag_id
    ).first()
    if not meal_tag:
        return False

    db.delete(meal_tag)
    db.commit()
    return True

def favorite_meal(db: Session, user_id: str, meal_id: int) -> models.FavoriteMeal:
    existing = db.query(models.FavoriteMeal).filter(
        models.FavoriteMeal.user_id == user_id,
        models.FavoriteMeal.meal_id == meal_id
    ).first()
    if existing:
        return existing

    new_favorite = models.FavoriteMeal(user_id=user_id, meal_id=meal_id)
    db.add(new_favorite)
    db.commit()
    db.refresh(new_favorite)
    return new_favorite

def unfavorite_meal(db: Session, user_id: str, meal_id: int) -> bool:
    favorite = db.query(models.FavoriteMeal).filter(
        models.FavoriteMeal.user_id == user_id,
        models.FavoriteMeal.meal_id == meal_id
    ).first()
    if not favorite:
        return False

    db.delete(favorite)
    db.commit()
    return True

def get_all_favorite_meals(db: Session, user_id: str) -> list[models.FavoriteMeal]:
    return db.query(models.FavoriteMeal).filter(models.FavoriteMeal.user_id == user_id).all()