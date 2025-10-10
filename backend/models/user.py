"""
User-related data models
"""
from pydantic import BaseModel, Field
from datetime import datetime
import uuid

class UserRegister(BaseModel):
    """User registration request"""
    username: str
    password: str

class UserLogin(BaseModel):
    """User login request"""
    username: str
    password: str

class User(BaseModel):
    """User model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password: str  # Simple plain text password
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AuthResponse(BaseModel):
    """Authentication response"""
    session_id: str
    user_id: str
    username: str
    success: bool