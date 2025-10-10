"""
Payment and registry data models
"""
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional
import uuid

class HoneymoonFundConfig(BaseModel):
    """Honeymoon fund configuration"""
    upi_id: Optional[str] = ""
    phone_number: Optional[str] = ""
    destination: str = "Tokyo & Kyoto, Japan"
    description: str = "Help us create unforgettable memories on our honeymoon to Japan. Every contribution, big or small, means the world to us!"
    image_url: str = "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=400&fit=crop"
    is_active: bool = True

class PaymentContribution(BaseModel):
    """Payment contribution record"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wedding_id: str
    contributor_name: str
    contributor_email: Optional[str] = ""
    contributor_phone: Optional[str] = ""
    amount: float  # Amount in currency units (e.g., rupees, dollars)
    currency: str = "inr"  # Currency code
    stripe_payment_intent_id: str
    stripe_session_id: Optional[str] = ""
    payment_status: str = "pending"  # pending, completed, failed
    message: Optional[str] = ""
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PaymentRequest(BaseModel):
    """Payment request"""
    wedding_id: str
    contributor_name: str
    contributor_email: Optional[str] = ""
    contributor_phone: Optional[str] = ""
    amount: float
    currency: str = "inr"
    message: Optional[str] = ""