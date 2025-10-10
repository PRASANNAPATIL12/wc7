"""
RSVP data models
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid

class RSVPResponse(BaseModel):
    """RSVP response model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wedding_id: str
    guest_name: str
    guest_email: str
    guest_phone: Optional[str] = ""
    attendance: str  # "yes" or "no"
    guest_count: int = 1
    dietary_restrictions: Optional[str] = ""
    special_message: Optional[str] = ""
    submitted_at: datetime = Field(default_factory=datetime.utcnow)