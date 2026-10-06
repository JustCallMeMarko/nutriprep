from pydantic import BaseModel
from datetime import date
from typing import Optional
from ..database.models import Goals

class ProfileCreate(BaseModel):
    phone_number: str
    height: float
    weight: float
    target_weight: float
    goal: Goals  # Automatically validates against your Goals enum ("lose_weight", "maintain_weight", "gain_weight")
    delivery_address: str
    delivery_lat: Optional[float] = None
    delivery_long: Optional[float] = None

class MealLogCreate(BaseModel):
    meal_id: int

class PlanEntryUpsert(BaseModel):
    plan_date: date
    slot: str
    meal_id: Optional[int] = None
    custom_name: Optional[str] = None
    kcal: int = 0