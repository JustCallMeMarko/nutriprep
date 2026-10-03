from typing import Optional
from pydantic import BaseModel


class CreateMealRequest(BaseModel):
    user_id: str
    title: str
    description: str
    calories: int
    protein: float
    carb: float
    fat: float
    credits: int
    stocks: int
