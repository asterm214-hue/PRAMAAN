from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from backend.dependencies import get_db
from backend.auth import get_current_user
from backend.schemas import RecordingResponse
from backend import crud, models

router = APIRouter(prefix="/recordings", tags=["recordings"])

@router.get("/", response_model=List[RecordingResponse])
def get_recordings(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    recordings = crud.get_recordings(db, user_id=current_user.id)
    return recordings

@router.put("/{id}")
def update_recording(id: int, status: str, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    # Verify ownership
    recording = db.query(models.Recording).filter(models.Recording.id == id, models.Recording.user_id == current_user.id).first()
    if not recording:
        raise HTTPException(404, "Recording not found")
    recording.status = status
    db.commit()
    return {"id": id, "status": status}

@router.delete("/{id}")
def delete_recording(id: int, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    recording = db.query(models.Recording).filter(models.Recording.id == id, models.Recording.user_id == current_user.id).first()
    if not recording:
        raise HTTPException(404, "Recording not found")
    db.delete(recording)
    db.commit()
    return {"msg": "Deleted"}

