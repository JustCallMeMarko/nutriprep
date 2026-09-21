import os

from sqlalchemy import Column, Integer, String, ForeignKey, Float, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///nutriprep.db")
engine = create_engine(DATABASE_URL, echo=False, pool_pre_ping=True)
Base = declarative_base()

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(Integer, primary_key=True)
    user_id = Column(String(255), nullable=False, unique=True)
    role = Column(String(32), nullable=False, default="member")
    credits = Column(Integer, nullable=False, default=0)
    custom_meals = Column(Integer, nullable=False, default=3)
    last_updated = Column(String(32), nullable=False, default=datetime.now())

Base.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()