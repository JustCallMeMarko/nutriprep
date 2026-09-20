from sqlalchemy import Column, DateTime, Integer, String, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# For now just use SQLite, but we can switch to MySQL later for the project requirements
engine = create_engine("sqlite:///nutriprep.db", echo=False)
Base = declarative_base()

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False, unique=True)
    role = Column(String, nullable=False, default="member")
    credits = Column(Integer, nullable=False, default=0)
    custom_meals = Column(Integer, nullable=False, default=3)
    last_updated = Column(String, nullable=False, default=datetime.now())


class Subscription(Base):
    __tablename__ = "subscriptions"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False, unique=True)
    tier_id = Column(String, nullable=False)
    tier_name = Column(String, nullable=False)
    credits = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="active")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class Favorite(Base):
    __tablename__ = "favorites"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False)
    meal_id = Column(Integer, nullable=False)
    quantity = Column(Integer, nullable=False, default=1)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True)
    user_id = Column(String, nullable=False)
    rider_id = Column(String, nullable=True)
    plan_id = Column(Integer, nullable=False)
    status = Column(String, nullable=False, default="pending")
    customer_name = Column(String, nullable=False, default="Customer")
    pickup_location = Column(String, nullable=False, default="NutriPrep Kitchen")
    pickup_details = Column(String, nullable=False, default="Meal plan order")
    dropoff_location = Column(String, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

Base.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()