from sqlalchemy.orm import Session
from sqlalchemy import or_
from . import models, schemas
from .auth import get_password_hash, verify_password

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(name=user.name, email=user.email, password_hash=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user or not verify_password(password, user.password_hash):
        return False
    return user

def create_testimony(db: Session, testimony: schemas.TestimonyCreate, user_id: int, file_path: str = None, filename: str = None, mime_type: str = None, size: int = None):
    db_testimony = models.Testimony(
        user_id=user_id, type=testimony.type, content=testimony.content,
        file_path=file_path, filename=filename, mime_type=mime_type, size_bytes=size
    )
    db.add(db_testimony)
    db.commit()
    db.refresh(db_testimony)
    return db_testimony

# Add more CRUD...
def get_testimonies(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Testimony).filter(models.Testimony.user_id == user_id).offset(skip).limit(limit).all()

def create_timeline_event(db: Session, event: schemas.TimelineEventCreate, testimony_id: int):
    db_event = models.TimelineEvent(**event.dict(), testimony_id=testimony_id)
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def get_recordings(db: Session, user_id: int):
    return db.query(models.Recording).filter(models.Recording.user_id == user_id).all()

# etc.

