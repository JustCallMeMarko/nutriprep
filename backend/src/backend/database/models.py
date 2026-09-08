from sqlalchemy import Column, Integer, String, ForeignKey, Float, create_engine
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

Base.metadata.create_all(engine)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()