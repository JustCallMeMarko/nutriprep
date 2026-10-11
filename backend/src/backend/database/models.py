from dotenv import load_dotenv
import os
import enum
import json
from urllib.parse import quote_plus
from sqlalchemy import Date, Enum, JSON, UniqueConstraint, create_engine, String, ForeignKey, Text, func, inspect, text
from sqlalchemy.orm import DeclarativeBase, mapped_column, Mapped, relationship, sessionmaker
from datetime import date, datetime
load_dotenv()

MYSQL_DATABASE = os.getenv("MYSQL_DATABASE")
MYSQL_USER = os.getenv("MYSQL_USER")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD")
DATABASE_URL = os.getenv("DATABASE_URL")

if not all([MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD]):
    raise ValueError("Missing required database environment variables in .env file.")

if not DATABASE_URL:
    encoded_user = quote_plus(MYSQL_USER)
    encoded_password = quote_plus(MYSQL_PASSWORD)
    DATABASE_URL = f"mysql+pymysql://{encoded_user}:{encoded_password}@localhost:3306/{MYSQL_DATABASE}"

DB_URL = DATABASE_URL
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
    email: Mapped[str | None] = mapped_column(String(255), nullable=True, unique=True, index=True)
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
    phone_number: Mapped[str | None] = mapped_column(String(25), default=None)
    is_available: Mapped[bool] = mapped_column(nullable=False, default=False, index=True)
    current_lat: Mapped[float | None] = mapped_column(default=None)
    current_long: Mapped[float | None] = mapped_column(default=None)
    location_updated_at: Mapped[datetime | None] = mapped_column(nullable=True)

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
    order_id: Mapped[int | None] = mapped_column(ForeignKey("orders.id", ondelete="SET NULL"), nullable=True)

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
    paid_out_at: Mapped[datetime | None] = mapped_column(nullable=True, default=None)

    order: Mapped["Order"] = relationship(back_populates="delivery")
    rider: Mapped["RiderProfile"] = relationship(back_populates="deliveries")

class Broadcast(Base):
    __tablename__ = "broadcasts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[str] = mapped_column(String(255), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    audience: Mapped[str] = mapped_column(String(20), nullable=False)
    priority: Mapped[str] = mapped_column(String(20), nullable=False, default="normal")
    recipient_ids: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    read_by: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    dismissed_by: Mapped[list[str]] = mapped_column(JSON, nullable=False, default=list)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)

    user: Mapped["User"] = relationship(back_populates="broadcasts")

class AppSetting(Base):
    __tablename__ = "app_settings"

    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[str] = mapped_column(String(255), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(server_default=func.now(), onupdate=func.now(), nullable=False)

class RiderPayout(Base):
    __tablename__ = "rider_payouts"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    rider_id: Mapped[str] = mapped_column(String(255), ForeignKey("rider_profiles.user_id", ondelete="CASCADE"), nullable=False, index=True)
    amount: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending")
    pin: Mapped[str] = mapped_column(String(6), nullable=False)
    created_at: Mapped[datetime] = mapped_column(server_default=func.now(), nullable=False)
    confirmed_at: Mapped[datetime | None] = mapped_column(nullable=True, default=None)

PAYOUT_RATE_KEY = "credits_to_peso"
DEFAULT_PAYOUT_RATE = 30

def get_payout_rate(db) -> int:
    setting = db.get(AppSetting, PAYOUT_RATE_KEY)
    if setting is None:
        return DEFAULT_PAYOUT_RATE
    try:
        return int(setting.value)
    except ValueError:
        return DEFAULT_PAYOUT_RATE

def set_payout_rate(db, rate: int) -> AppSetting:
    setting = db.get(AppSetting, PAYOUT_RATE_KEY)
    if setting is None:
        setting = AppSetting(key=PAYOUT_RATE_KEY, value=str(rate))
        db.add(setting)
    else:
        setting.value = str(rate)
        setting.updated_at = datetime.now()
    return setting

Base.metadata.create_all(engine)

_broadcast_tables = set(inspect(engine).get_table_names())
if "broadcasts" in _broadcast_tables:
    _broadcast_columns = {
        column["name"] for column in inspect(engine).get_columns("broadcasts")
    }
    _broadcast_column_definitions = {
        "priority": "VARCHAR(20) NOT NULL DEFAULT 'normal'",
        "recipient_ids": "JSON NULL",
        "read_by": "JSON NULL",
        "dismissed_by": "JSON NULL",
    }
    with engine.begin() as connection:
        for column_name, column_type in _broadcast_column_definitions.items():
            if column_name not in _broadcast_columns:
                connection.execute(
                    text(
                        f"ALTER TABLE broadcasts ADD COLUMN "
                        f"{column_name} {column_type}"
                    )
                )
        connection.execute(
            text(
                "UPDATE broadcasts SET recipient_ids = JSON_ARRAY(), "
                "read_by = JSON_ARRAY(), dismissed_by = JSON_ARRAY() "
                "WHERE recipient_ids IS NULL OR read_by IS NULL OR dismissed_by IS NULL"
            )
        )

        if {
            "broadcast_priorities",
            "broadcast_audiences",
            "broadcast_recipients",
        }.intersection(_broadcast_tables):
            broadcast_rows = connection.execute(
                text("SELECT id FROM broadcasts")
            ).all()
            for (broadcast_id,) in broadcast_rows:
                audience = "users"
                if "broadcast_audiences" in _broadcast_tables:
                    audience = connection.execute(
                        text(
                            "SELECT value FROM broadcast_audiences "
                            "WHERE broadcast_id = :broadcast_id"
                        ),
                        {"broadcast_id": broadcast_id},
                    ).scalar() or audience
                priority = "normal"
                if "broadcast_priorities" in _broadcast_tables:
                    priority = connection.execute(
                        text(
                            "SELECT value FROM broadcast_priorities "
                            "WHERE broadcast_id = :broadcast_id"
                        ),
                        {"broadcast_id": broadcast_id},
                    ).scalar() or priority
                recipient_ids = []
                if "broadcast_recipients" in _broadcast_tables:
                    recipient_ids = [
                        row[0]
                        for row in connection.execute(
                            text(
                                "SELECT user_id FROM broadcast_recipients "
                                "WHERE broadcast_id = :broadcast_id"
                            ),
                            {"broadcast_id": broadcast_id},
                        ).all()
                    ]
                connection.execute(
                    text(
                        "UPDATE broadcasts SET audience = :audience, "
                        "priority = :priority, recipient_ids = :recipient_ids, "
                        "read_by = '[]', dismissed_by = '[]' "
                        "WHERE id = :broadcast_id"
                    ),
                    {
                        "audience": audience,
                        "priority": priority,
                        "recipient_ids": json.dumps(recipient_ids),
                        "broadcast_id": broadcast_id,
                    },
                )

            for table_name in (
                "broadcast_recipients",
                "broadcast_audiences",
                "broadcast_priorities",
            ):
                if table_name in _broadcast_tables:
                    connection.execute(text(f"DROP TABLE {table_name}"))

# Keep deployments that predate rider location tracking compatible with the
# declarative model. This is intentionally additive and safe to run repeatedly.
_rider_columns = {column["name"] for column in inspect(engine).get_columns("rider_profiles")}
_rider_column_definitions = {
    "current_lat": "DOUBLE",
    "current_long": "DOUBLE",
    "location_updated_at": "DATETIME",
    "phone_number": "VARCHAR(25)",
}
with engine.begin() as connection:
    for column_name, column_type in _rider_column_definitions.items():
        if column_name not in _rider_columns:
            connection.execute(text(f"ALTER TABLE rider_profiles ADD COLUMN {column_name} {column_type}"))

# Same additive migration for plan entries that predate ordering.
_plan_columns = {column["name"] for column in inspect(engine).get_columns("plan_entries")}
if "order_id" not in _plan_columns:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE plan_entries ADD COLUMN order_id INTEGER"))

# Deliveries that predate rider payouts are treated as unpaid.
_delivery_columns = {column["name"] for column in inspect(engine).get_columns("deliveries")}
if "paid_out_at" not in _delivery_columns:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE deliveries ADD COLUMN paid_out_at DATETIME"))

# Email is nullable so Clerk accounts without an email address don't collide
# on a shared '' placeholder (the column is unique). MySQL-only ALTER; fresh
# schemas and SQLite already create it nullable from the model above.
_user_columns = {column["name"]: column for column in inspect(engine).get_columns("users")}
if (
    engine.dialect.name == "mysql"
    and _user_columns.get("email")
    and not _user_columns["email"]["nullable"]
):
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE users MODIFY email VARCHAR(255) NULL"))

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()