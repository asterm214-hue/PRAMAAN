from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.dependencies import get_db
from backend.auth import get_current_user
from backend import schemas, crud, models
from datetime import timezone

router = APIRouter(prefix="/timeline", tags=["timeline"])


@router.get("/", response_model=List[schemas.TimelineEventResponse])
def get_timeline(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all timeline events for the current user's testimonies, sorted by date desc."""
    testimonies = crud.get_testimonies(db, user_id=current_user.id)
    all_events = []
    for t in testimonies:
        all_events.extend(t.timeline_events)
    # Sort newest first
    all_events.sort(key=lambda e: (e.date or "", e.time or ""), reverse=True)
    return all_events


@router.post("/backfill")
def backfill_timeline_events(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """
    Create a timeline event for every existing testimony that has none yet.
    Call once after the auto-create fix is deployed.
    """
    testimonies = crud.get_testimonies(db, user_id=current_user.id)
    created = 0
    for t in testimonies:
        if len(t.timeline_events) == 0:
            type_labels = {"text": "Text", "audio": "Audio", "video": "Video"}
            type_label = type_labels.get(t.type.value if hasattr(t.type, "value") else str(t.type), "Testimony")

            if t.content:
                preview = t.content[:120] + ("…" if len(t.content) > 120 else "")
                description = f"Written testimony: {preview}"
            elif t.filename:
                description = f"{type_label} recording: {t.filename}"
            else:
                description = f"{type_label} testimony recorded and securely stored."

            # Use created_at from the testimony if available
            if t.created_at:
                aware = t.created_at.replace(tzinfo=timezone.utc) if t.created_at.tzinfo is None else t.created_at
                date_str = aware.strftime("%Y-%m-%d")
                time_str = aware.strftime("%H:%M")
            else:
                from datetime import datetime
                now = datetime.now(timezone.utc)
                date_str = now.strftime("%Y-%m-%d")
                time_str = now.strftime("%H:%M")

            db_event = models.TimelineEvent(
                testimony_id=t.id,
                date=date_str,
                time=time_str,
                title=f"{type_label} Testimony Recorded",
                description=description,
                location=None,
                witnesses=None,
                is_key_fact=False,
            )
            db.add(db_event)
            created += 1

    db.commit()
    return {"backfilled": created, "message": f"Created {created} timeline event(s) for existing testimonies."}


@router.post("/", response_model=schemas.TimelineEventResponse)
def create_timeline_event(
    event: schemas.TimelineEventCreate,
    testimony_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    testimony = db.query(models.Testimony).filter(
        models.Testimony.id == testimony_id,
        models.Testimony.user_id == current_user.id,
    ).first()
    if not testimony:
        raise HTTPException(404, "Testimony not found")
    new_event = crud.create_timeline_event(db, event, testimony_id=testimony_id)
    return new_event


@router.get("/{id}", response_model=schemas.TimelineEventResponse)
def get_event(
    id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    event = db.query(models.TimelineEvent).join(models.Testimony).filter(
        models.TimelineEvent.id == id,
        models.Testimony.user_id == current_user.id,
    ).first()
    if not event:
        raise HTTPException(404, "Event not found")
    return event
