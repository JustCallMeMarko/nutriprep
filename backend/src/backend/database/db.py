from sqlalchemy.orm import Session
from datetime import datetime
from . import models

def create_profile(db: Session, user_id: str, role: str = "member"):
    existing = db.query(models.Profile).filter(models.Profile.user_id == user_id).first()
    if existing:
        return existing
    db_profile = models.Profile(user_id=user_id, role=role)
    db.add(db_profile)
    db.commit()
    db.refresh(db_profile)
    return db_profile