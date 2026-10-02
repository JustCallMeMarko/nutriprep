from dotenv import load_dotenv
import os
import enum
from urllib.parse import quote_plus
from sqlalchemy import Enum, UniqueConstraint, create_engine, String, ForeignKey, Text, func
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped, relationship
from datetime import datetime 
load_dotenv()

MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")

if not all([MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD]):
    raise ValueError("Missing required database environment variables in .env file.")

encoded_user = quote_plus(MYSQL_USER)
encoded_password = quote_plus(MYSQL_PASSWORD)

DB_URL = f"mysql+pymysql://{encoded_user}:{encoded_password}@localhost:3306/{MYSQL_DATABASE}"
engine = create_engine(DB_URL, echo=True)

# Enums
class Goals(str, enum.Enum):
    LOSE_WEIGHT = "lose_weight"
    MAINTAIN_WEIGHT = "maintain_weight"
    GAIN_WEIGHT = "gain_weight"

class Roles(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"
    RIDER = "rider"

# Base class
class Base(DeclarativeBase):
    pass

# Models
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    credits: Mapped[int] = mapped_column(nullable=False, default=0)
    height: Mapped[float] = mapped_column(nullable=False)
    weight: Mapped[float] = mapped_column(nullable=False)
    target_weight: Mapped[float] = mapped_column(nullable=False)
    goal: Mapped[Goals] = mapped_column(Enum(Goals, native_enum=False), nullable=False)
    address_long: Mapped[float] = mapped_column(nullable=False)
    address_lat: Mapped[float] = mapped_column(nullable=False)

    meals: Mapped[list["Meal"]] = relationship(back_populates="creator", cascade="all, delete-orphan")
    favorites: Mapped[list["FavoriteMeal"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    broadcasts: Mapped[list["Broadcast"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    calories: Mapped[float] = mapped_column(nullable=False)
    protein: Mapped[float] = mapped_column(nullable=False)
    carb: Mapped[float] = mapped_column(nullable=False)
    fat: Mapped[float] = mapped_column(nullable=False)
    credits: Mapped[int] = mapped_column(nullable=False)
    stocks: Mapped[int | None] = mapped_column(nullable=True, default=None)

    creator: Mapped["User"] = relationship(back_populates="meals")
    favorited_by: Mapped[list["FavoriteMeal"]] = relationship(back_populates="meal", cascade="all, delete-orphan")
    tags: Mapped[list["Tag"]] = relationship(secondary="meal_tags", back_populates="meals")

class FavoriteMeal(Base):
    __tablename__ = "favorite_meals"
    __table_args__ = (
        UniqueConstraint("user_id", "meal_id", name="uq_user_meal_favorite"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    meal_id: Mapped[int] = mapped_column(ForeignKey("meals.id", ondelete="CASCADE"), nullable=False)

    user: Mapped["User"] = relationship(back_populates="favorites")
    meal: Mapped["Meal"] = relationship(back_populates="favorited_by")

class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)

    meals: Mapped[list["Meal"]] = relationship(secondary="meal_tags", back_populates="tags")

class MealTag(Base):
    __tablename__ = "meal_tags"
    __table_args__ = (
        UniqueConstraint("meal_id", "tag_id", name="uq_meal_tag"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    meal_id: Mapped[int] = mapped_column(ForeignKey("meals.id", ondelete="CASCADE"), nullable=False)
    tag_id: Mapped[int] = mapped_column(ForeignKey("tags.id", ondelete="CASCADE"), nullable=False)

class Broadcast(Base):
    __tablename__ = "broadcasts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    audience: Mapped[Roles] = mapped_column(Enum(Roles, native_enum=False), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship(back_populates="broadcasts")

Base.metadata.create_all(engine)