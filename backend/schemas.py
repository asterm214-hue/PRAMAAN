from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class TestimonyType(str, Enum):
    text = "text"
    audio = "audio"
    video = "video"

class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    name: Optional[str] = None
    password: str = Field(..., min_length=6)

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class ForgotPasswordRequest(BaseModel):
    email: EmailStr

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    email: Optional[str] = None

class TestimonyCreate(BaseModel):
    type: TestimonyType
    content: Optional[str] = None  # for text/base64

class TestimonyResponse(BaseModel):
    id: int
    type: TestimonyType
    content: Optional[str] = None
    filename: Optional[str] = None
    file_path: Optional[str] = None
    mime_type: Optional[str] = None
    size: Optional[int] = None
    processed: bool
    created_at: datetime

    @validator("size", pre=True, always=True)
    def coerce_size(cls, v):
        # DB column is size_bytes; we alias it here
        return v

    class Config:
        from_attributes = True

class TimelineEventCreate(BaseModel):
    date: str
    time: str
    title: str
    description: str
    location: Optional[str] = None
    witnesses: Optional[List[str]] = None
    is_key_fact: bool = False

class TimelineEventResponse(BaseModel):
    id: int
    date: str
    time: Optional[str] = None
    title: str
    description: Optional[str] = None
    location: Optional[str] = None
    witnesses: Optional[str] = None  # stored as JSON string in DB
    is_key_fact: bool
    class Config:
        from_attributes = True

class RecordingResponse(BaseModel):
    id: int
    status: str
    file_path: str
    size_bytes: int
    class Config:
        from_attributes = True

class LegalDocType(str, Enum):
    VICTIM_STATEMENT = "Primary Victim Statement"
    TRANSCRIPT = "Transcript"
    EXHIBIT_LIST = "Exhibit List"
    AFFIDAVIT = "Affidavit"
    SECTION_65B = "Section 65B Certificate"

class LegalGenerate(BaseModel):
    testimony_id: int
    doc_type: LegalDocType

class LegalResponse(BaseModel):
    id: int
    doc_type: LegalDocType
    pdf_path: str
    class Config:
        from_attributes = True
