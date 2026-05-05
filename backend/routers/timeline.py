from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.dependencies import get_db
from backend.auth import get_current_user
from backend import schemas, crud, models

router = APIRouter(prefix="/timeline", tags=["timeline"])

@router.get("/", response_model=List[schemas.TimelineEventResponse])
def get_timeline(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # In a real app, we'd fetch events linked to the user's testimonies
    # For this demo, we'll return events for testimonies owned by the user
    testimonies = crud.get_testimonies(db, user_id=current_user.id)
    all_events = []
    for t in testimonies:
        all_events.extend(t.timeline_events)
    return all_events

@router.post("/", response_model=schemas.TimelineEventResponse)
def create_timeline_event(event: schemas.TimelineEventCreate, testimony_id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify ownership
    testimony = db.query(models.Testimony).filter(models.Testimony.id == testimony_id, models.Testimony.user_id == current_user.id).first()
    if not testimony:
        raise HTTPException(404, "Testimony not found")
        
    new_event = crud.create_timeline_event(db, event, testimony_id=testimony_id)
    return new_event

@router.get("/{id}", response_model=schemas.TimelineEventResponse)
def get_event(id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    event = db.query(models.TimelineEvent).join(models.Testimony).filter(
        models.TimelineEvent.id == id, 
        models.Testimony.user_id == current_user.id
    ).first()
    if not event:
        raise HTTPException(404, "Event not found")
    return event

