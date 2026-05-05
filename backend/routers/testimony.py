from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil
from backend.dependencies import get_db
from backend.auth import get_current_user
from backend import schemas, crud, models

router = APIRouter(prefix="/testimony", tags=["testimony"])

@router.get("/")
def get_testimonies(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    testimonies = crud.get_testimonies(db, user_id=current_user.id)
    return testimonies

@router.post("/text")
def create_text(testimony: schemas.TestimonyCreate, current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    new_testimony = crud.create_testimony(db, testimony, user_id=current_user.id)
    return new_testimony

@router.post("/audio")
async def create_audio(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await save_media(file, "audio", current_user, db)

@router.post("/video")
async def create_video(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return await save_media(file, "video", current_user, db)

async def save_media(file: UploadFile, type: str, current_user: models.User, db: Session):
    ALLOWED_MIMES = {
        'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/x-wav', 'audio/webm',
        'video/mp4', 'video/webm', 'video/x-matroska'
    }
    if file.content_type not in ALLOWED_MIMES:
        raise HTTPException(400, f"Invalid file type: {file.content_type}")
    
    upload_dir = "backend/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{current_user.id}_{file.filename}")
    
    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)
    
    new_testimony = crud.create_testimony(
        db, 
        schemas.TestimonyCreate(type=type, content=None), 
        user_id=current_user.id, 
        file_path=file_path, 
        filename=file.filename, 
        mime_type=file.content_type, 
        size=file.size
    )
    return new_testimony

@router.get("/stats")
def get_stats(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    testimonies = crud.get_testimonies(db, user_id=current_user.id)
    events_count = 0
    for t in testimonies:
        events_count += len(t.timeline_events)
    
    return {
        "testimonies": len(testimonies),
        "events": events_count,
        "documents": 3,
        "privacy": "100%"
    }

@router.get("/recent")
def get_recent(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    testimonies = crud.get_testimonies(db, user_id=current_user.id, limit=3)
    recent = []
    for t in testimonies:
        recent.append({
            "type": t.type,
            "title": f"Testimony: {t.type.capitalize()}",
            "subtitle": (t.content[:30] + "...") if t.content else "Media file attached",
            "time": "Just now",
            "status": "complete"
        })
    return recent
