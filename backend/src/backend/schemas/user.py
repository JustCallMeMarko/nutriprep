import re

from pydantic import BaseModel, Field, field_validator
from datetime import date
from typing import Optional
from ..database.models import Goals

PH_MOBILE_RE = re.compile(r"^(\+?63|0)?9\d{9}$")


def normalize_ph_mobile(value: str) -> str:
    digits = re.sub(r"\D", "", value or "")
    if not PH_MOBILE_RE.match(digits):
        raise ValueError("Enter a valid PH mobile number, e.g. +63 917 123 4567.")
    if digits.startswith("63"):
        digits = digits[2:]
    elif digits.startswith("0"):
        digits = digits[1:]
    return f"+63{digits}"


class ProfileCreate(BaseModel):
    phone_number: str = Field(min_length=10, max_length=25)
    height: float = Field(ge=50, le=300)
    weight: float = Field(ge=20, le=500)
    target_weight: float = Field(ge=20, le=500)
    goal: Goals  # Automatically validates against your Goals enum ("lose_weight", "maintain_weight", "gain_weight")
    delivery_address: str = Field(min_length=10, max_length=255)
    delivery_lat: Optional[float] = Field(default=None, ge=-90, le=90)
    delivery_long: Optional[float] = Field(default=None, ge=-180, le=180)

    @field_validator("phone_number")
    @classmethod
    def _phone(cls, value: str) -> str:
        return normalize_ph_mobile(value)

    @field_validator("delivery_address")
    @classmethod
    def _address(cls, value: str) -> str:
        value = value.strip()
        if len(value) < 10:
            raise ValueError("Enter a more complete delivery address.")
        return value

class MealLogCreate(BaseModel):
    meal_id: int | None = Field(default=None, gt=0)
    custom_name: str | None = Field(default=None, max_length=100)
    calories: int | None = Field(default=None, ge=0, le=10_000)
    protein: float | None = Field(default=None, ge=0, le=5_000)
    carb: float | None = Field(default=None, ge=0, le=5_000)
    fat: float | None = Field(default=None, ge=0, le=5_000)

class PlanEntryUpsert(BaseModel):
    plan_date: date
    slot: str = Field(pattern=r"^(breakfast|lunch|dinner)$")
    meal_id: Optional[int] = Field(default=None, gt=0)
    custom_name: Optional[str] = Field(default=None, max_length=100)
    kcal: int = Field(default=0, ge=0, le=10_000)

class OrderCreate(BaseModel):
    plan_dates: list[date] = Field(min_length=1, max_length=31)