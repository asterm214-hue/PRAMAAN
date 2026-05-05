from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .database import Base
import enum

class TestimonyType(str, enum.Enum):
    text = "text"
    audio = "audio"
    video = "video"

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    # Keep DB column name as `hashed_password` for compatibility with existing sqlite files.
    password_hash = Column("hashed_password", String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    is_active = Column(Boolean, default=True)
    
    testimonies = relationship("Testimony", back_populates="owner")

class Testimony(Base):
    __tablename__ = "testimonies"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    type = Column(SQLEnum(TestimonyType), nullable=False)
    content = Column(Text)  # base64 or text for text
    file_path = Column(String)  # for media
    filename = Column(String)
    mime_type = Column(String)
    size_bytes = Column(Integer)
    processed = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    owner = relationship("User", back_populates="testimonies")
    timeline_events = relationship("TimelineEvent", back_populates="testimony")

class TimelineEvent(Base):
    __tablename__ = "timeline_events"
    
    id = Column(Integer, primary_key=True, index=True)
    testimony_id = Column(Integer, ForeignKey("testimonies.id"))
    date = Column(String)  # YYYY-MM-DD
    time = Column(String)
    title = Column(String, nullable=False)
    description = Column(Text)
    location = Column(String)
    witnesses = Column(Text)  # json list
    is_key_fact = Column(Boolean, default=False)
    
    testimony = relationship("Testimony", back_populates="timeline_events")

class Recording(Base):
    __tablename__ = "recordings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    testimony_id = Column(Integer, ForeignKey("testimonies.id"))
    file_path = Column(String, nullable=False)
    mime_type = Column(String, nullable=False)
    size_bytes = Column(Integer)
    status = Column(String, default="draft")  # draft/completed/shared
    
    user = relationship("User")

class LegalDoc(Base):
    __tablename__ = "legal_docs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    testimony_id = Column(Integer, ForeignKey("testimonies.id"))
    doc_type = Column(String, nullable=False)  # VictimStatement etc.
    content = Column(Text)
    pdf_path = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
