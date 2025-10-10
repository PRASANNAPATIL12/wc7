"""
Wedding data models
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import List, Optional
import uuid

class WeddingData(BaseModel):
    """Complete wedding data model"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str
    couple_name_1: str
    couple_name_2: str
    wedding_date: str
    venue_name: str
    venue_location: str
    their_story: str
    story_timeline: List[dict] = []
    schedule_events: List[dict] = []
    gallery_photos: List[dict] = []
    bridal_party: List[dict] = []
    groom_party: List[dict] = []
    special_roles: List[dict] = []
    registry_items: List[dict] = []
    honeymoon_fund: dict = {}
    faqs: List[dict] = []
    theme: str = "classic"
    rsvp_responses: List[dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WeddingDataCreate(BaseModel):
    """Wedding data creation request"""
    couple_name_1: str
    couple_name_2: str
    wedding_date: str
    venue_name: str
    venue_location: str
    their_story: str
    story_timeline: List[dict] = []
    schedule_events: List[dict] = []
    gallery_photos: List[dict] = []
    bridal_party: List[dict] = []
    groom_party: List[dict] = []
    special_roles: List[dict] = []
    registry_items: List[dict] = []
    honeymoon_fund: dict = {}
    faqs: List[dict] = []
    theme: str = "classic"