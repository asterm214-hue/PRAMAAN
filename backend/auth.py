from datetime import datetime, timedelta, timezone
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os
import logging

from .schemas import UserLogin, Token
from .database import get_db
from . import crud, models
from sqlalchemy.orm import Session

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-me")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Passlib 1.7.4 logs a noisy warning with bcrypt>=4.1; hashing still works.
logging.getLogger("passlib.handlers.bcrypt").setLevel(logging.ERROR)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

security = HTTPBearer()

class TokenData(BaseModel):
    email: Optional[str] = None

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        token_data = TokenData(email=email)
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")
    
    user = crud.get_user_by_email(db, email=token_data.email)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

