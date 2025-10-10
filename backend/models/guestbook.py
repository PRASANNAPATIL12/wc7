"""
Guestbook data models
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid

class GuestbookMessage(BaseModel):
    """Guestbook message model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wedding_id: str
    name: str
    relationship: Optional[str] = ""
    message: str
    is_public: bool = True  # True for public landing page, False for private dashboard
    created_at: datetime = Field(default_factory=datetime.utcnow)