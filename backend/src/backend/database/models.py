from dotenv import load_dotenv
import os
import enum
from urllib.parse import quote_plus
from sqlalchemy import Date, Enum, UniqueConstraint, create_engine, String, ForeignKey, Text, func
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped, relationship, sessionmaker
from datetime import date, datetime
load_dotenv()

MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")

if not all([MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD]):
    raise ValueError("Missing required database environment variables in .env file.")

encoded_user = quote_plus(MYSQL_USER)
encoded_password = quote_plus(MYSQL_PASSWORD)

DB_URL = f"mysql+pymysql://{encoded_user}:{encoded_password}@localhost:3306/{MYSQL_DATABASE}"
engine = create_engine(DB_URL, echo=True, pool_pre_ping=True)

# Enums
class Goals(str, enum.Enum):
    LOSE_WEIGHT = "lose_weight"
    MAINTAIN_WEIGHT = "maintain_weight"
    GAIN_WEIGHT = "gain_weight"

class Roles(str, enum.Enum):
    ADMIN = "admin"
    USER = "user"
    RIDER = "rider"

class MealStatus(str, enum.Enum):
    ACTIVE = "active"
    ARCHIVED = "archived"
    USER_OWNED = "user_owned"

class PlanSlot(str, enum.Enum):
    BREAKFAST = "breakfast"
    LUNCH = "lunch"
    DINNER = "dinner"

class OrderStatus(str, enum.Enum):
    PENDING = "pending"
    PREPARING = "preparing"
    OUT_FOR_DELIVERY = "out_for_delivery"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

# Base class
class Base(DeclarativeBase):
    pass

# Models
class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(255), primary_key=True)
    full_name: Mapped[str] = mapped_column(String(150), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    role: Mapped[Roles] = mapped_column(Enum(Roles, native_enum=False), nullable=False, default=Roles.USER, index=True)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    customer_profile: Mapped["CustomerProfile | None"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan", passive_deletes=True)
    rider_profile: Mapped["RiderProfile | None"] = relationship(back_populates="user", uselist=False, cascade="all, delete-orphan", passive_deletes=True)

    meals: Mapped[list["Meal"]] = relationship(back_populates="creator", cascade="all, delete-orphan")
    favorites: Mapped[list["FavoriteMeal"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    broadcasts: Mapped[list["Broadcast"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    meal_logs: Mapped[list["MealLog"]] = relationship(back_populates="user", cascade="all, delete-orphan")
    orders: Mapped[list["Order"]] = relationship(back_populates="user", cascade="all, delete-orphan")

class CustomerProfile(Base):
    __tablename__ = "customer_profiles"

    user_id: Mapped[str] = mapped_column(
        String(255), 
        ForeignKey("users.id", ondelete="CASCADE"), 
        primary_key=True
    )
    phone_number: Mapped[str] = mapped_column(String(13), nullable=False)
    credits: Mapped[int] = mapped_column(nullable=False, default=0)
    height: Mapped[float] = mapped_column(nullable=False)
    weight: Mapped[float] = mapped_column(nullable=False)
    target_weight: Mapped[float] = mapped_column(nullable=False)
    goal: Mapped[Goals] = mapped_column(Enum(Goals, native_enum=False), nullable=False)
    delivery_address: Mapped[str] = mapped_column(String(255), nullable=False)
    delivery_lat: Mapped[float | None] = mapped_column(default=None)
    delivery_long: Mapped[float | None] = mapped_column(default=None)

    user: Mapped["User"] = relationship(back_populates="customer_profile")

class SubscriptionCreditGrant(Base):
    __tablename__ = "subscription_credit_grants"
    __table_args__ = (
        UniqueConstraint("subscription_id", "period_key", name="uq_subscription_credit_period"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    event_id: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    subscription_id: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    period_key: Mapped[str] = mapped_column(String(100), nullable=False)
    plan_name: Mapped[str] = mapped_column(String(50), nullable=False)
    credits: Mapped[int] = mapped_column(nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

class RiderProfile(Base):
    __tablename__ = "rider_profiles"

    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    plate_number: Mapped[str | None] = mapped_column(String(50), default=None)
    is_available: Mapped[bool] = mapped_column(nullable=False, default=False, index=True)

    user: Mapped["User"] = relationship(back_populates="rider_profile")
    deliveries: Mapped[list["Delivery"]] = relationship(back_populates="rider")

class Meal(Base):
    __tablename__ = "meals"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    image_url: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[MealStatus] = mapped_column(Enum(MealStatus, native_enum=False), nullable=False, default=MealStatus.ACTIVE)
    calories: Mapped[int] = mapped_column(nullable=False)
    protein: Mapped[float] = mapped_column(nullable=False)
    carb: Mapped[float] = mapped_column(nullable=False)
    fat: Mapped[float] = mapped_column(nullable=False)
    credits: Mapped[int] = mapped_column(nullable=False)
    stocks: Mapped[int] = mapped_column(nullable=True, default=0)

    creator: Mapped["User"] = relationship(back_populates="meals")
    favorited_by: Mapped[list["FavoriteMeal"]] = relationship(back_populates="meal", cascade="all, delete-orphan")
    meal_logs: Mapped[list["MealLog"]] = relationship(back_populates="meal", cascade="all, delete-orphan")
    order_items: Mapped[list["OrderItem"]] = relationship(back_populates="meal")

class MealLog(Base):
    __tablename__ = "meal_logs"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    meal_id: Mapped[int] = mapped_column(ForeignKey("meals.id", ondelete="CASCADE"), nullable=False)
    consumed_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship(back_populates="meal_logs")
    meal: Mapped["Meal"] = relationship(back_populates="meal_logs")

class PlanEntry(Base):
    __tablename__ = "plan_entries"
    __table_args__ = (
        UniqueConstraint("user_id", "plan_date", "slot", name="uq_user_plan_date_slot"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    plan_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    slot: Mapped[PlanSlot] = mapped_column(Enum(PlanSlot, native_enum=False), nullable=False)
    meal_id: Mapped[int | None] = mapped_column(ForeignKey("meals.id", ondelete="SET NULL"), nullable=True)
    custom_name: Mapped[str | None] = mapped_column(String(100), nullable=True)
    kcal: Mapped[int] = mapped_column(nullable=False, default=0)

    meal: Mapped["Meal | None"] = relationship()

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

class Order(Base):
    __tablename__ = "orders"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    total_credits: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[OrderStatus] = mapped_column(Enum(OrderStatus, native_enum=False), nullable=False, default=OrderStatus.PENDING)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship(back_populates="orders")
    items: Mapped[list["OrderItem"]] = relationship(back_populates="order", cascade="all, delete-orphan")
    delivery: Mapped["Delivery | None"] = relationship(back_populates="order", uselist=False)

class OrderItem(Base):
    __tablename__ = "order_items"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    meal_id: Mapped[int] = mapped_column(ForeignKey("meals.id", ondelete="CASCADE"), nullable=False)
    quantity: Mapped[int] = mapped_column(nullable=False)

    order: Mapped["Order"] = relationship(back_populates="items")
    meal: Mapped["Meal"] = relationship(back_populates="order_items")

class Delivery(Base):
    __tablename__ = "deliveries"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(ForeignKey("orders.id", ondelete="CASCADE"), nullable=False)
    rider_id: Mapped[str | None] = mapped_column(String(255), ForeignKey("rider_profiles.user_id", ondelete="SET NULL"), nullable=True)
    delivered_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    order: Mapped["Order"] = relationship(back_populates="delivery")
    rider: Mapped["RiderProfile"] = relationship(back_populates="deliveries")

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

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()