from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    database_url: Optional[str] = "sqlite:///pramaan.db"
    
    class Config:
        env_file = ".env"

settings = Settings()

engine = create_engine(
    settings.database_url, 
    connect_args={"check_same_thread": False} if "sqlite" in settings.database_url else {}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def ensure_sqlite_schema() -> None:
    """
    Lightweight, non-destructive schema upgrades for local SQLite.

    This project doesn't currently run Alembic migrations automatically, so we
    apply minimal ALTER TABLE changes at startup to keep dev installs working.
    """
    if engine.dialect.name != "sqlite":
        return

    with engine.begin() as conn:
        exists = conn.execute(
            text("SELECT 1 FROM sqlite_master WHERE type='table' AND name='users' LIMIT 1")
        ).scalar()
        if not exists:
            return

        cols = {row[1] for row in conn.execute(text("PRAGMA table_info(users)")).all()}

        if "name" not in cols:
            conn.execute(text("ALTER TABLE users ADD COLUMN name VARCHAR"))

        # Password hashes are stored in the legacy `hashed_password` column.

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

