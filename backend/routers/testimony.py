from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional
import os
import shutil
from backend.dependencies import get_db
from backend.auth import get_current_user
from backend import schemas, crud, models

router = APIRouter(prefix="/testimony", tags=["testimony"])


def _serialize(t: models.Testimony) -> dict:
    """Serialize a Testimony ORM object to dict matching TestimonyResponse."""
    return {
        "id": t.id,
        "type": t.type,
        "content": t.content,
        "filename": t.filename,
        "file_path": t.file_path,
        "mime_type": t.mime_type,
        "size": t.size_bytes,
        "processed": t.processed,
        "created_at": t.created_at,
    }


# ── List & Stats (must be before /{id} routes) ────────────────────────────────

@router.get("/", response_model=list[schemas.TestimonyResponse])
def get_testimonies(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    testimonies = crud.get_testimonies(db, user_id=current_user.id)
    return [_serialize(t) for t in testimonies]


@router.get("/stats")
def get_stats(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    testimonies = crud.get_testimonies(db, user_id=current_user.id)
    events_count = sum(len(t.timeline_events) for t in testimonies)
    return {
        "testimonies": len(testimonies),
        "events": events_count,
        "documents": 3,
        "privacy": "100%",
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
            "status": "complete",
        })
    return recent


# ── Create ────────────────────────────────────────────────────────────────────

@router.post("/text", response_model=schemas.TestimonyResponse)
def create_text(
    testimony: schemas.TestimonyCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = crud.create_testimony(db, testimony, user_id=current_user.id)
    return _serialize(t)


@router.post("/audio")
async def create_audio(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await save_media(file, "audio", current_user, db)


@router.post("/video")
async def create_video(
    file: UploadFile = File(...),
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return await save_media(file, "video", current_user, db)


async def save_media(file: UploadFile, type: str, current_user: models.User, db: Session):
    ALLOWED_MIMES = {
        "audio/mpeg", "audio/mp3", "audio/wav", "audio/x-wav", "audio/webm",
        "video/mp4", "video/webm", "video/x-matroska",
    }
    if file.content_type not in ALLOWED_MIMES:
        raise HTTPException(400, f"Invalid file type: {file.content_type}")

    upload_dir = "backend/uploads"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, f"{current_user.id}_{file.filename}")

    with open(file_path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    t = crud.create_testimony(
        db,
        schemas.TestimonyCreate(type=type, content=None),
        user_id=current_user.id,
        file_path=file_path,
        filename=file.filename,
        mime_type=file.content_type,
        size=file.size,
    )
    return _serialize(t)


# ── Single testimony & media stream (must be after named sub-paths) ──────────

@router.get("/{testimony_id}", response_model=schemas.TestimonyResponse)
def get_testimony(
    testimony_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(models.Testimony).filter(
        models.Testimony.id == testimony_id,
        models.Testimony.user_id == current_user.id,
    ).first()
    if not t:
        raise HTTPException(404, "Testimony not found")
    return _serialize(t)


@router.get("/{testimony_id}/media")
def stream_testimony_media(
    testimony_id: int,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    t = db.query(models.Testimony).filter(
        models.Testimony.id == testimony_id,
        models.Testimony.user_id == current_user.id,
    ).first()
    if not t or not t.file_path:
        raise HTTPException(404, "Media not found")
    if not os.path.exists(t.file_path):
        raise HTTPException(404, f"File not found on disk: {t.file_path}")
    return FileResponse(
        path=t.file_path,
        media_type=t.mime_type or "application/octet-stream",
        filename=t.filename or "testimony",
    )
