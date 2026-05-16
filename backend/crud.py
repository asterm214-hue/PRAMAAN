from sqlalchemy.orm import Session
from . import models, schemas
from .auth import get_password_hash, verify_password
from datetime import datetime, timezone
import json


# ── Users ─────────────────────────────────────────────────────────────────────

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


# ── Testimonies ───────────────────────────────────────────────────────────────

def create_testimony(
    db: Session,
    testimony: schemas.TestimonyCreate,
    user_id: int,
    file_path: str = None,
    filename: str = None,
    mime_type: str = None,
    size: int = None,
):
    db_testimony = models.Testimony(
        user_id=user_id,
        type=testimony.type,
        content=testimony.content,
        file_path=file_path,
        filename=filename,
        mime_type=mime_type,
        size_bytes=size,
    )
    db.add(db_testimony)
    db.commit()
    db.refresh(db_testimony)

    # ── Auto-create a Timeline Event for every new testimony ──────────────────
    now = datetime.now(timezone.utc)
    type_labels = {"text": "Text", "audio": "Audio", "video": "Video"}
    type_label = type_labels.get(testimony.type.value if hasattr(testimony.type, "value") else str(testimony.type), "Testimony")

    if testimony.content:
        preview = testimony.content[:120] + ("…" if len(testimony.content) > 120 else "")
        description = f"Written testimony: {preview}"
    elif filename:
        description = f"{type_label} recording saved: {filename}"
    else:
        description = f"{type_label} testimony recorded and securely stored."

    db_event = models.TimelineEvent(
        testimony_id=db_testimony.id,
        date=now.strftime("%Y-%m-%d"),
        time=now.strftime("%H:%M"),
        title=f"{type_label} Testimony Recorded",
        description=description,
        location=None,
        witnesses=None,
        is_key_fact=False,
    )
    db.add(db_event)
    db.commit()
    # ─────────────────────────────────────────────────────────────────────────

    return db_testimony


def get_testimonies(db: Session, user_id: int, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Testimony)
        .filter(models.Testimony.user_id == user_id)
        .order_by(models.Testimony.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )


# ── Timeline Events ───────────────────────────────────────────────────────────

def create_timeline_event(db: Session, event: schemas.TimelineEventCreate, testimony_id: int):
    # Serialize witnesses list to JSON string for storage
    witnesses_str = json.dumps(event.witnesses) if event.witnesses else None
    db_event = models.TimelineEvent(
        testimony_id=testimony_id,
        date=event.date,
        time=event.time,
        title=event.title,
        description=event.description,
        location=event.location,
        witnesses=witnesses_str,
        is_key_fact=event.is_key_fact,
    )
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event


# ── Recordings ────────────────────────────────────────────────────────────────

def get_recordings(db: Session, user_id: int):
    return db.query(models.Recording).filter(models.Recording.user_id == user_id).all()
