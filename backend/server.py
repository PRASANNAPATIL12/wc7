from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
import uuid
from datetime import datetime
import json
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import stripe

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
MONGO_URL = os.getenv("MONGO_URL")
DB_NAME = os.getenv("DB_NAME", "weddingcard")

# Stripe configuration
STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
stripe.api_key = STRIPE_SECRET_KEY

# MongoDB client and database
mongodb_client = None
database = None

async def connect_to_mongo():
    global mongodb_client, database
    try:
        print(f"🔄 Attempting to connect to MongoDB: {MONGO_URL}")
        mongodb_client = AsyncIOMotorClient(MONGO_URL)
        database = mongodb_client[DB_NAME]
        # Test the connection
        await database.command("ping")
        print(f"✅ Connected to MongoDB database: {DB_NAME}")
        logger.info(f"✅ Connected to MongoDB database: {DB_NAME}")
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        logger.error(f"❌ Error connecting to MongoDB: {e}")
        # Don't raise the error, just continue with JSON files
        pass

async def close_mongo_connection():
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()

# JSON file for simple user storage (backup)
USERS_FILE = ROOT_DIR / 'users.json'
WEDDINGS_FILE = ROOT_DIR / 'weddings.json'

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# MongoDB collections
users_collection = None
weddings_collection = None

async def get_collections():
    global users_collection, weddings_collection
    if users_collection is None:
        users_collection = database.users
    if weddings_collection is None:
        weddings_collection = database.weddings
    return users_collection, weddings_collection

# Simple session storage (in production, use Redis or similar)
active_sessions = {}

# Models
class UserRegister(BaseModel):
    username: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    password: str  # Simple plain text password
    created_at: datetime = Field(default_factory=datetime.utcnow)

class RSVPResponse(BaseModel):
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

class WeddingData(BaseModel):
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
    important_info: List[dict] = []  # Added important information field
    gallery_photos: List[dict] = []
    bridal_party: List[dict] = []
    groom_party: List[dict] = []
    special_roles: List[dict] = []  # Added special roles field
    registry_items: List[dict] = []
    honeymoon_fund: dict = {}
    faqs: List[dict] = []
    theme: str = "classic"
    rsvp_responses: List[dict] = []  # Store RSVP responses
    guestbook_messages: List[dict] = []  # Store guestbook messages in owner's document
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class WeddingDataCreate(BaseModel):
    couple_name_1: str
    couple_name_2: str
    wedding_date: str
    venue_name: str
    venue_location: str
    their_story: str
    story_timeline: List[dict] = []
    schedule_events: List[dict] = []
    important_info: List[dict] = []  # Added important information field
    gallery_photos: List[dict] = []
    bridal_party: List[dict] = []
    groom_party: List[dict] = []
    special_roles: List[dict] = []  # Added special roles field
    registry_items: List[dict] = []
    honeymoon_fund: dict = {}
    faqs: List[dict] = []
    theme: str = "classic"
    guestbook_messages: List[dict] = []  # Store guestbook messages in owner's document

class AuthResponse(BaseModel):
    session_id: str
    user_id: str
    username: str
    success: bool

# Registry/Payment Models
class HoneymoonFundConfig(BaseModel):
    upi_id: Optional[str] = ""
    phone_number: Optional[str] = ""
    destination: str = "Tokyo & Kyoto, Japan"
    description: str = "Help us create unforgettable memories on our honeymoon to Japan. Every contribution, big or small, means the world to us!"
    image_url: str = "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=800&h=400&fit=crop"
    is_active: bool = True

class PaymentContribution(BaseModel):
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
    wedding_id: str
    contributor_name: str
    contributor_email: Optional[str] = ""
    contributor_phone: Optional[str] = ""
    amount: float
    currency: str = "inr"
    message: Optional[str] = ""

# Simple file operations
def load_json_file(filename):
    if not filename.exists():
        return {}
    try:
        with open(filename, 'r') as f:
            return json.load(f)
    except:
        return {}

def save_json_file(filename, data):
    with open(filename, 'w') as f:
        json.dump(data, f, indent=2, default=str)

# MongoDB-based authentication helper functions
async def create_simple_session(user_id: str) -> str:
    session_id = str(uuid.uuid4())
    session_data = {
        "session_id": session_id,
        "user_id": user_id,
        "created_at": datetime.utcnow()
    }
    
    # Store in memory for fast access
    active_sessions[session_id] = session_data
    
    # Also store in MongoDB for persistence across server restarts
    users_coll, weddings_coll = await get_collections()
    if users_coll is not None:
        try:
            sessions_collection = database.sessions
            await sessions_collection.insert_one(session_data)
            print(f"✅ Session {session_id} stored in MongoDB")
        except Exception as e:
            print(f"⚠️ Failed to store session in MongoDB: {e}")
    
    return session_id

async def get_current_user_simple(session_id: str = None):
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session ID required"
        )
    
    # First check in-memory sessions
    session = active_sessions.get(session_id)
    
    # If not in memory, check MongoDB
    if not session:
        try:
            users_coll, weddings_coll = await get_collections()
            if users_coll is not None:
                sessions_collection = database.sessions
                session_data = await sessions_collection.find_one({"session_id": session_id})
                if session_data:
                    # Restore to memory cache
                    active_sessions[session_id] = session_data
                    session = session_data
                    print(f"✅ Session {session_id} restored from MongoDB")
        except Exception as e:
            print(f"⚠️ Failed to restore session from MongoDB: {e}")
    
    if not session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session"
        )
    
    users_coll, weddings_coll = await get_collections()
    user_data = await users_coll.find_one({"id": session["user_id"]})
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return User(**user_data)

# Auth Routes - MongoDB-based
@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserRegister):
    users_coll, weddings_coll = await get_collections()
    
    # Check if user already exists
    existing_user = await users_coll.find_one({"username": user_data.username})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Create new user with plain text password
    user = User(
        username=user_data.username,
        password=user_data.password  # Store plain text password (simple approach)
    )
    
    # Save to MongoDB
    user_dict = user.dict()
    await users_coll.insert_one(user_dict)
    
    # Also save to JSON as backup
    users = load_json_file(USERS_FILE)
    users[user.id] = user_dict
    save_json_file(USERS_FILE, users)
    
    # Create default wedding data for new user with auto-generated shareable ID
    shareable_id = str(uuid.uuid4())[:8]  # Short 8-character shareable ID
    
    default_wedding_data = WeddingData(
        user_id=user.id,
        couple_name_1="Sarah",
        couple_name_2="Michael",
        wedding_date="2025-06-15",
        venue_name="Sunset Garden Estate",
        venue_location="Sunset Garden Estate • Napa Valley, California",
        their_story="We can't wait to celebrate our love story with the people who matter most to us. Join us for an unforgettable evening of joy, laughter, and new beginnings.",
        story_timeline=[
            {
                "year": "2019",
                "title": "First Meeting",
                "description": "We met at a coffee shop in downtown San Francisco on a rainy Tuesday morning.",
                "image": "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&h=400&fit=crop"
            }
        ],
        schedule_events=[
            {
                "time": "2:00 PM",
                "title": "Guests Arrival & Welcome",
                "description": "Please arrive by 2:00 PM for welcome drinks and mingling.",
                "location": "Sunset Garden Estate - Main Entrance",
                "duration": "30 minutes",
                "highlight": False
            }
        ],
        gallery_photos=[],
        bridal_party=[],
        groom_party=[],
        special_roles=[],
        registry_items=[],
        honeymoon_fund={},
        faqs=[],
        theme="classic"
    )
    
    # Save wedding data to MongoDB
    wedding_dict = default_wedding_data.dict()
    wedding_dict["shareable_id"] = shareable_id  # Add shareable ID
    wedding_dict["created_at"] = wedding_dict["created_at"].isoformat()
    wedding_dict["updated_at"] = wedding_dict["updated_at"].isoformat()
    
    await weddings_coll.insert_one(wedding_dict)
    
    # Also save to JSON as backup
    weddings = load_json_file(WEDDINGS_FILE)
    weddings[default_wedding_data.id] = wedding_dict
    save_json_file(WEDDINGS_FILE, weddings)
    
    # Create simple session
    session_id = await create_simple_session(user.id)
    
    return AuthResponse(
        session_id=session_id,
        user_id=user.id,
        username=user.username,
        success=True
    )

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(user_data: UserLogin):
    users_coll, weddings_coll = await get_collections()
    
    # Simple string comparison authentication
    user_found = await users_coll.find_one({
        "username": user_data.username,
        "password": user_data.password
    })
    
    if not user_found:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )
    
    # Create simple session
    session_id = await create_simple_session(user_found["id"])
    
    return AuthResponse(
        session_id=session_id,
        user_id=user_found["id"],
        username=user_found["username"],
        success=True
    )

# MongoDB-based Wedding Data Routes
@api_router.post("/wedding")
async def create_wedding_data(request_data: dict):
    session_id = request_data.get('session_id')
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session ID required"
        )
    
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    # Check if user already has wedding data
    existing_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    if existing_wedding:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User already has a wedding card. Use update endpoint instead."
        )
    
    # Remove session_id from the data before creating wedding
    wedding_create_data = {k: v for k, v in request_data.items() if k != 'session_id'}
    
    # Generate shareable link ID automatically (shorter and user-friendly)
    shareable_id = str(uuid.uuid4())[:8]  # Short 8-character ID
    
    wedding = WeddingData(
        user_id=current_user.id,
        **wedding_create_data
    )
    
    # Convert to dict and handle ObjectId
    wedding_dict = wedding.dict()
    wedding_dict["shareable_id"] = shareable_id  # Add shareable ID
    wedding_dict["created_at"] = wedding_dict["created_at"].isoformat()
    wedding_dict["updated_at"] = wedding_dict["updated_at"].isoformat()
    
    # Save to MongoDB
    result = await weddings_coll.insert_one(wedding_dict)
    wedding_dict["_id"] = str(result.inserted_id)
    
    # Also save to JSON as backup
    weddings = load_json_file(WEDDINGS_FILE)
    weddings[wedding.id] = wedding_dict
    save_json_file(WEDDINGS_FILE, weddings)
    
    # Remove _id from response
    response_data = {k: v for k, v in wedding_dict.items() if k != "_id"}
    return response_data

@api_router.put("/wedding")
async def update_wedding_data(request_data: dict):
    session_id = request_data.get('session_id')
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session ID required"
        )
    
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    # Find existing wedding
    existing_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    if not existing_wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding data not found"
        )
    
    # Remove session_id from the data before updating
    update_fields = {k: v for k, v in request_data.items() if k != 'session_id'}
    update_fields["updated_at"] = datetime.utcnow().isoformat()
    
    # Update ONLY the fields sent, using MongoDB $set to preserve other fields
    await weddings_coll.update_one(
        {"user_id": current_user.id},
        {"$set": update_fields}
    )
    
    # Get the COMPLETE updated wedding data from MongoDB
    updated_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    
    # Also update JSON backup with COMPLETE data
    weddings = load_json_file(WEDDINGS_FILE)
    complete_data = {k: v for k, v in updated_wedding.items() if k != "_id"}
    weddings[updated_wedding["id"]] = complete_data
    save_json_file(WEDDINGS_FILE, weddings)
    
    # Return the COMPLETE wedding data (not just updated fields)
    return complete_data

@api_router.get("/wedding")
async def get_wedding_data(session_id: str):
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    wedding_data = await weddings_coll.find_one({"user_id": current_user.id})
    if not wedding_data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding data not found"
        )
    
    # Remove _id from response
    response_data = {k: v for k, v in wedding_data.items() if k != "_id"}
    return response_data

@api_router.get("/wedding/public/{wedding_id}")
async def get_public_wedding_data(wedding_id: str):
    users_coll, weddings_coll = await get_collections()
    
    # Try MongoDB first
    wedding = await weddings_coll.find_one({"id": wedding_id})
    
    if not wedding:
        # Fallback to JSON file
        weddings = load_json_file(WEDDINGS_FILE)
        if wedding_id not in weddings:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wedding not found"
            )
        wedding = weddings[wedding_id]
    
    # Remove sensitive data for public access
    public_data = {k: v for k, v in wedding.items() if k not in ["user_id", "_id"]}
    return public_data

# Add shareable link endpoint 
@api_router.get("/wedding/share/{shareable_id}")
async def get_wedding_by_shareable_id(shareable_id: str):
    users_coll, weddings_coll = await get_collections()
    
    # Search for wedding by shareable_id ONLY (8-character system)
    wedding = await weddings_coll.find_one({"shareable_id": shareable_id})
    
    if wedding:
        # Remove sensitive data for public access
        public_data = {k: v for k, v in wedding.items() if k not in ["user_id", "_id"]}
        return public_data
    
    # Fallback to JSON file for shareable_id ONLY
    weddings = load_json_file(WEDDINGS_FILE)
    for wedding_id, wedding_data in weddings.items():
        # Check ONLY shareable_id (no more custom_url support)
        if wedding_data.get("shareable_id") == shareable_id:
            # Remove sensitive data for public access
            public_data = {k: v for k, v in wedding_data.items() if k not in ["user_id"]}
            return public_data

# Username-based routing endpoints
@api_router.get("/wedding/user/{username}")
async def get_wedding_by_username(username: str):
    """Get wedding data by username for personalized URLs"""
    users_coll, weddings_coll = await get_collections()
    
    # Find user by username
    user = await users_coll.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's wedding data
    wedding = await weddings_coll.find_one({"user_id": user["id"]})
    if not wedding:
        # Return default wedding data if user hasn't customized yet
        return get_default_wedding_data()
    
    # Remove sensitive data for public access
    public_data = {k: v for k, v in wedding.items() if k not in ["user_id", "_id"]}
    return public_data

@api_router.get("/wedding/user/{username}/{section}")
async def get_wedding_section_by_username(username: str, section: str):
    """Get specific section data by username for section-based URLs"""
    users_coll, weddings_coll = await get_collections()
    
    # Find user by username
    user = await users_coll.find_one({"username": username})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Get user's wedding data
    wedding = await weddings_coll.find_one({"user_id": user["id"]})
    if not wedding:
        # Return default wedding data if user hasn't customized yet
        wedding = get_default_wedding_data()
    
    # Remove sensitive data
    public_data = {k: v for k, v in wedding.items() if k not in ["user_id", "_id"]}
    
    # Add section metadata
    public_data["current_section"] = section
    public_data["username"] = username
    
    return public_data

def get_default_wedding_data():
    """Return default wedding card data"""
    return {
        "id": "default",
        "couple_name_1": "Sarah",
        "couple_name_2": "Michael",
        "wedding_date": "2025-06-15",
        "venue_name": "Sunset Garden Estate",
        "venue_location": "Napa Valley, California",
        "their_story": "Our beautiful love story began when we met at a coffee shop in downtown San Francisco...",
        "story_timeline": [
            {
                "year": "2019",
                "title": "First Meeting",
                "description": "We met at Blue Bottle Coffee on a rainy Tuesday morning. Sarah was reading a book about sustainable architecture, and Michael couldn't help but strike up a conversation.",
                "image": "https://images.unsplash.com/photo-1511988617509-a57c8a288659?w=400"
            },
            {
                "year": "2020",
                "title": "First Date",
                "description": "Our first official date was a hiking trip to Mount Tamalpais. We spent hours talking about our dreams and aspirations while watching the sunset over the Bay Area.",
                "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400"
            },
            {
                "year": "2022",
                "title": "Moving In Together",
                "description": "We decided to take the next step and move in together in a cozy apartment in Mission District. Our first shared space became our little sanctuary.",
                "image": "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400"
            },
            {
                "year": "2024",
                "title": "The Proposal",
                "description": "Michael proposed during a weekend getaway to Big Sur. He had planned the perfect moment during a sunset walk along the cliffs overlooking the Pacific Ocean.",
                "image": "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=400"
            }
        ],
        "schedule_events": [
            {
                "time": "2:00 PM",
                "title": "Ceremony",
                "description": "Join us for our wedding ceremony in the beautiful garden pavilion",
                "location": "Garden Pavilion",
                "duration": "45 minutes",
                "highlight": True
            },
            {
                "time": "3:00 PM",
                "title": "Cocktail Hour",
                "description": "Celebrate with drinks and appetizers on the terrace",
                "location": "Sunset Terrace",
                "duration": "60 minutes",
                "highlight": False
            },
            {
                "time": "4:30 PM",
                "title": "Reception",
                "description": "Dinner, dancing, and celebration in the grand ballroom",
                "location": "Grand Ballroom",
                "duration": "5 hours",
                "highlight": True
            }
        ],
        "gallery_photos": {
            "engagement": [
                "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=500",
                "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=500",
                "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=500"
            ],
            "travel": [
                "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=500",
                "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500",
                "https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=500"
            ],
            "family": [
                "https://images.unsplash.com/photo-1511895426328-dc8714191300?w=500",
                "https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?w=500",
                "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500"
            ]
        },
        "bridal_party": [
            {
                "name": "Emma Johnson",
                "designation": "Maid of Honor",
                "description": "Sarah's best friend since college and her constant source of laughter and support.",
                "photo": "https://images.unsplash.com/photo-1494790108755-2616b612b789?w=300"
            },
            {
                "name": "Rachel Davis",
                "designation": "Bridesmaid",
                "description": "Sarah's sister and adventure buddy who shares her love for hiking and travel.",
                "photo": "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300"
            },
            {
                "name": "Lisa Chen",
                "designation": "Bridesmaid",
                "description": "College roommate turned lifelong friend, always there with wise advice and hugs.",
                "photo": "https://images.unsplash.com/photo-1489424731084-a5d8b219a5bb?w=300"
            }
        ],
        "groom_party": [
            {
                "name": "David Wilson",
                "designation": "Best Man",
                "description": "Michael's brother and partner in crime since childhood adventures.",
                "photo": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300"
            },
            {
                "name": "James Miller",
                "designation": "Groomsman",
                "description": "College best friend and Michael's go-to person for both serious talks and fun times.",
                "photo": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300"
            },
            {
                "name": "Alex Rodriguez",
                "designation": "Groomsman",
                "description": "Work colleague turned close friend who shares Michael's passion for technology and good coffee.",
                "photo": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300"
            }
        ],
        "special_roles": [
            {
                "name": "Grace Thompson",
                "designation": "Flower Girl",
                "description": "Sarah's adorable 6-year-old niece who will sprinkle flower petals down the aisle.",
                "photo": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300"
            },
            {
                "name": "Oliver Wilson",
                "designation": "Ring Bearer",
                "description": "Michael's nephew who will proudly carry the rings with the biggest smile.",
                "photo": "https://images.unsplash.com/photo-1519340333755-56e9c1d3611d?w=300"
            }
        ],
        "registry_items": [
            {
                "name": "Professional Stand Mixer",
                "description": "For all our future baking adventures together",
                "price": "$299.99",
                "store": "Williams Sonoma",
                "purchased": False,
                "image": "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=300"
            },
            {
                "name": "Luxury Bedding Set",
                "description": "Soft organic cotton sheets for cozy nights",
                "price": "$199.99",
                "store": "West Elm",
                "purchased": False,
                "image": "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=300"
            },
            {
                "name": "Honeymoon Fund",
                "description": "Help us create memories on our dream honeymoon to Italy",
                "price": "Any Amount",
                "store": "Honeymoon Fund",
                "purchased": False,
                "image": "https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=300"
            }
        ],
        "honeymoon_fund": {
            "enabled": True,
            "goal": 5000,
            "current": 0,
            "description": "Help us create unforgettable memories on our honeymoon to Italy!"
        },
        "faqs": [
            {
                "question": "What should I wear?",
                "answer": "We're having a garden ceremony, so we recommend cocktail attire. Ladies, consider comfortable shoes for outdoor surfaces."
            },
            {
                "question": "Will there be parking available?",
                "answer": "Yes, there is complimentary valet parking available at the venue entrance."
            },
            {
                "question": "Can I bring a guest?",
                "answer": "Please check your invitation for guest details. If you have any questions, feel free to reach out to us directly."
            },
            {
                "question": "Is the venue accessible?",
                "answer": "Yes, Sunset Garden Estate is fully wheelchair accessible with ramps and accessible restroom facilities."
            }
        ],
        "theme": "classic",
        "rsvp_responses": [],
        "created_at": "2024-01-01T00:00:00",
        "updated_at": "2024-01-01T00:00:00"
    }

# Get user profile - MongoDB version
@api_router.get("/profile")
async def get_profile(session_id: str):
    current_user = await get_current_user_simple(session_id)
    return {
        "id": current_user.id,
        "username": current_user.username,
        "created_at": current_user.created_at
    }

# RSVP Endpoints
@api_router.post("/rsvp")
async def submit_rsvp(rsvp_data: dict):
    users_coll, weddings_coll = await get_collections()
    
    # Create RSVP response
    rsvp_response = RSVPResponse(
        wedding_id=rsvp_data.get('wedding_id', ''),
        guest_name=rsvp_data.get('guest_name', ''),
        guest_email=rsvp_data.get('guest_email', ''),
        guest_phone=rsvp_data.get('guest_phone', ''),
        attendance=rsvp_data.get('attendance', ''),
        guest_count=int(rsvp_data.get('guest_count', 1)),
        dietary_restrictions=rsvp_data.get('dietary_restrictions', ''),
        special_message=rsvp_data.get('special_message', '')
    )
    
    # Convert to dict
    rsvp_dict = rsvp_response.dict()
    rsvp_dict["submitted_at"] = rsvp_dict["submitted_at"].isoformat()
    
    # Store RSVP in separate collection
    rsvps_collection = database.rsvps
    await rsvps_collection.insert_one(rsvp_dict)
    
    return {"success": True, "message": "RSVP submitted successfully", "rsvp_id": rsvp_response.id}

@api_router.get("/rsvp/{wedding_id}")
async def get_wedding_rsvps(wedding_id: str):
    """Get all RSVPs for a specific wedding (for admin/couple view)"""
    users_coll, weddings_coll = await get_collections()
    
    # Get RSVPs for this wedding
    rsvps_collection = database.rsvps
    rsvps = await rsvps_collection.find({"wedding_id": wedding_id}).to_list(length=None)
    
    # Remove _id from response and format dates
    response_data = []
    for rsvp in rsvps:
        clean_rsvp = {k: v for k, v in rsvp.items() if k != "_id"}
        response_data.append(clean_rsvp)
    
    return {"success": True, "rsvps": response_data, "total_count": len(response_data)}

@api_router.get("/rsvp/shareable/{shareable_id}")  
async def get_rsvps_by_shareable_id(shareable_id: str):
    """Get RSVPs using shareable ID (for dashboard admin view)"""
    users_coll, weddings_coll = await get_collections()
    
    # First find the wedding by shareable_id
    wedding = await weddings_coll.find_one({"shareable_id": shareable_id})
    
    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding not found"
        )
    
    # Get RSVPs for this wedding
    rsvps_collection = database.rsvps
    rsvps = await rsvps_collection.find({"wedding_id": wedding["id"]}).to_list(length=None)
    
    # Remove _id from response
    response_data = []
    for rsvp in rsvps:
        clean_rsvp = {k: v for k, v in rsvp.items() if k != "_id"}
        response_data.append(clean_rsvp)
    
    return {"success": True, "rsvps": response_data, "total_count": len(response_data)}

# Guestbook Models
class GuestbookMessage(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wedding_id: str
    name: str
    relationship: Optional[str] = ""
    message: str
    is_public: bool = True  # True for public landing page, False for private dashboard
    created_at: datetime = Field(default_factory=datetime.utcnow)

# Guestbook Endpoints
@api_router.post("/guestbook")
async def create_guestbook_message(message_data: dict):
    """Create a new guestbook message - stores in owner's wedding document"""
    users_coll, weddings_coll = await get_collections()
    
    wedding_id = message_data.get('wedding_id')
    if not wedding_id or wedding_id in ['public', 'default', '']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Valid wedding_id required to post guestbook message"
        )
    
    # Find the wedding document
    wedding = await weddings_coll.find_one({"id": wedding_id})
    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding not found"
        )
    
    # Create guestbook message
    guestbook_message = {
        "id": str(uuid.uuid4()),
        "name": message_data.get('name', ''),
        "relationship": message_data.get('relationship', ''),
        "message": message_data.get('message', ''),
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Add message to wedding's guestbook_messages array
    await weddings_coll.update_one(
        {"id": wedding_id},
        {
            "$push": {"guestbook_messages": guestbook_message},
            "$set": {"updated_at": datetime.utcnow().isoformat()}
        }
    )
    
    # Also update JSON backup
    weddings = load_json_file(WEDDINGS_FILE)
    if wedding_id in weddings:
        if 'guestbook_messages' not in weddings[wedding_id]:
            weddings[wedding_id]['guestbook_messages'] = []
        weddings[wedding_id]['guestbook_messages'].append(guestbook_message)
        weddings[wedding_id]['updated_at'] = datetime.utcnow().isoformat()
        save_json_file(WEDDINGS_FILE, weddings)
    
    return {"success": True, "message": "Guestbook message added successfully", "message_id": guestbook_message["id"]}

@api_router.post("/guestbook/private")
async def create_private_guestbook_message(message_data: dict):
    """Create a private guestbook message for authenticated user's wedding"""
    session_id = message_data.get('session_id')
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session ID required for private guestbook"
        )
    
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    # Find user's wedding
    user_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    if not user_wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User wedding not found"
        )
    
    # Create guestbook message
    guestbook_message = {
        "id": str(uuid.uuid4()),
        "name": message_data.get('name', ''),
        "relationship": message_data.get('relationship', ''),
        "message": message_data.get('message', ''),
        "created_at": datetime.utcnow().isoformat()
    }
    
    # Add message to wedding's guestbook_messages array
    await weddings_coll.update_one(
        {"id": user_wedding["id"]},
        {
            "$push": {"guestbook_messages": guestbook_message},
            "$set": {"updated_at": datetime.utcnow().isoformat()}
        }
    )
    
    # Also update JSON backup
    weddings = load_json_file(WEDDINGS_FILE)
    wedding_id = user_wedding["id"]
    if wedding_id in weddings:
        if 'guestbook_messages' not in weddings[wedding_id]:
            weddings[wedding_id]['guestbook_messages'] = []
        weddings[wedding_id]['guestbook_messages'].append(guestbook_message)
        weddings[wedding_id]['updated_at'] = datetime.utcnow().isoformat()
        save_json_file(WEDDINGS_FILE, weddings)
    
    return {"success": True, "message": "Private guestbook message added successfully", "message_id": guestbook_message["id"]}

@api_router.get("/guestbook/{wedding_id}")
async def get_guestbook_messages(wedding_id: str):
    """Get all guestbook messages for a specific wedding from wedding document"""
    users_coll, weddings_coll = await get_collections()
    
    # Get wedding document
    wedding = await weddings_coll.find_one({"id": wedding_id})
    if not wedding:
        return {"success": True, "messages": [], "total_count": 0}
    
    # Get guestbook messages from wedding document
    messages = wedding.get('guestbook_messages', [])
    
    # Sort by created_at descending (newest first)
    sorted_messages = sorted(messages, key=lambda x: x.get('created_at', ''), reverse=True)
    
    return {"success": True, "messages": sorted_messages, "total_count": len(sorted_messages)}

@api_router.get("/guestbook/private/{wedding_id}")
async def get_private_guestbook_messages(wedding_id: str):
    """Get guestbook messages for authenticated user's wedding (alias for /guestbook/{wedding_id})"""
    return await get_guestbook_messages(wedding_id)

@api_router.get("/guestbook/public/messages")
async def get_public_guestbook_messages():
    """Get demo/default guestbook messages (for landing page without wedding_id)"""
    # Return empty or demo messages for public landing page
    demo_messages = [
        {
            "id": "demo-1",
            "name": "Sarah & John",
            "relationship": "Friends",
            "message": "Wishing you a lifetime of love and happiness! 💕",
            "created_at": datetime.utcnow().isoformat()
        },
        {
            "id": "demo-2",
            "name": "Emily Chen",
            "relationship": "Colleague",
            "message": "So happy for you both! Can't wait to celebrate! 🎉",
            "created_at": datetime.utcnow().isoformat()
        }
    ]
    
    return {"success": True, "messages": demo_messages, "total_count": len(demo_messages)}

@api_router.get("/guestbook/private/{user_wedding_id}")
async def get_private_guestbook_messages(user_wedding_id: str):
    """Get private guestbook messages for a specific user's wedding (dashboard)"""
    users_coll, weddings_coll = await get_collections()
    
    # Get private messages for this specific wedding
    guestbook_collection = database.guestbook
    messages = await guestbook_collection.find({
        "wedding_id": user_wedding_id, 
        "is_public": False
    }).sort("created_at", -1).to_list(length=None)
    
    # Remove _id from response
    response_data = []
    for msg in messages:
        clean_msg = {k: v for k, v in msg.items() if k != "_id"}
        response_data.append(clean_msg)
    
    return {"success": True, "messages": response_data, "total_count": len(response_data)}

@api_router.get("/guestbook/shareable/{shareable_id}")  
async def get_guestbook_by_shareable_id(shareable_id: str):
    """Get guestbook messages using shareable ID"""
    users_coll, weddings_coll = await get_collections()
    
    # First find the wedding by shareable_id
    wedding = await weddings_coll.find_one({"shareable_id": shareable_id})
    
    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding not found"
        )
    
    # Get guestbook messages for this wedding
    guestbook_collection = database.guestbook
    messages = await guestbook_collection.find({"wedding_id": wedding["id"]}).sort("created_at", -1).to_list(length=None)
    
    # Remove _id from response
    response_data = []
    for msg in messages:
        clean_msg = {k: v for k, v in msg.items() if k != "_id"}
        response_data.append(clean_msg)
    
    return {"success": True, "messages": response_data, "total_count": len(response_data)}

# Wedding Party Management Endpoints
@api_router.put("/wedding/party")
async def update_wedding_party(request_data: dict):
    """Update wedding party data (bridal_party, groom_party, special_roles)"""
    session_id = request_data.get('session_id')
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session ID required"
        )
    
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    # Find existing wedding
    existing_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    if not existing_wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding data not found"
        )
    
    # Prepare update data with only wedding party fields
    update_fields = {}
    if 'bridal_party' in request_data:
        update_fields['bridal_party'] = request_data['bridal_party']
    if 'groom_party' in request_data:
        update_fields['groom_party'] = request_data['groom_party']
    if 'special_roles' in request_data:
        update_fields['special_roles'] = request_data['special_roles']
    
    update_fields["updated_at"] = datetime.utcnow().isoformat()
    
    # Update in MongoDB
    await weddings_coll.update_one(
        {"user_id": current_user.id},
        {"$set": update_fields}
    )
    
    # Get updated wedding data
    updated_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    
    # Also update JSON backup
    weddings = load_json_file(WEDDINGS_FILE)
    if updated_wedding["id"] in weddings:
        weddings[updated_wedding["id"]].update(update_fields)
        save_json_file(WEDDINGS_FILE, weddings)
    
    # Remove _id from response
    response_data = {k: v for k, v in updated_wedding.items() if k != "_id"}
    return {"success": True, "wedding_data": response_data}

# FAQ Management Endpoints
@api_router.put("/wedding/faq")
async def update_wedding_faq(request_data: dict):
    """Update FAQ data for a wedding"""
    session_id = request_data.get('session_id')
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session ID required"
        )
    
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    # Find existing wedding
    existing_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    if not existing_wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding data not found"
        )
    
    # Prepare update data with FAQ fields
    update_fields = {}
    if 'faqs' in request_data:
        update_fields['faqs'] = request_data['faqs']
    
    update_fields["updated_at"] = datetime.utcnow().isoformat()
    
    # Update in MongoDB
    await weddings_coll.update_one(
        {"user_id": current_user.id},
        {"$set": update_fields}
    )
    
    # Get updated wedding data
    updated_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    
    # Also update JSON backup
    weddings = load_json_file(WEDDINGS_FILE)
    if updated_wedding["id"] in weddings:
        weddings[updated_wedding["id"]].update(update_fields)
        save_json_file(WEDDINGS_FILE, weddings)
    
    # Remove _id from response
    response_data = {k: v for k, v in updated_wedding.items() if k != "_id"}
    return {"success": True, "wedding_data": response_data}

# Theme Management Endpoints
@api_router.put("/wedding/theme")
async def update_wedding_theme(request_data: dict):
    """Update theme for a wedding"""
    session_id = request_data.get('session_id')
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Session ID required"
        )
    
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    # Find existing wedding
    existing_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    if not existing_wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding data not found"
        )
    
    # Prepare update data with theme field
    update_fields = {}
    if 'theme' in request_data:
        # Validate theme values
        valid_themes = ['classic', 'modern', 'boho']
        if request_data['theme'] in valid_themes:
            update_fields['theme'] = request_data['theme']
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid theme. Must be one of: classic, modern, boho"
            )
    
    update_fields["updated_at"] = datetime.utcnow().isoformat()
    
    # Update in MongoDB
    await weddings_coll.update_one(
        {"user_id": current_user.id},
        {"$set": update_fields}
    )
    
    # Get updated wedding data
    updated_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    
    # Also update JSON backup
    weddings = load_json_file(WEDDINGS_FILE)
    if updated_wedding["id"] in weddings:
        weddings[updated_wedding["id"]].update(update_fields)
        save_json_file(WEDDINGS_FILE, weddings)
    
    # Remove _id from response
    response_data = {k: v for k, v in updated_wedding.items() if k != "_id"}
    return {"success": True, "wedding_data": response_data}

# Registry/Payment Endpoints

@api_router.put("/wedding/registry")
async def update_honeymoon_fund(
    honeymoon_config: HoneymoonFundConfig,
    session_id: str = None
):
    """Update honeymoon fund configuration for the wedding owner"""
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session ID required"
        )
    
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    # Find existing wedding
    existing_wedding = await weddings_coll.find_one({"user_id": current_user.id})
    if not existing_wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding data not found"
        )
    
    # Update honeymoon fund configuration
    update_data = {
        "honeymoon_fund": honeymoon_config.dict(),
        "updated_at": datetime.utcnow().isoformat()
    }
    
    await weddings_coll.update_one(
        {"user_id": current_user.id},
        {"$set": update_data}
    )
    
    return {"success": True, "message": "Honeymoon fund configuration updated successfully"}

@api_router.get("/wedding/registry/{wedding_id}")
async def get_honeymoon_fund_config(wedding_id: str):
    """Get honeymoon fund configuration for public viewing"""
    users_coll, weddings_coll = await get_collections()
    
    wedding = await weddings_coll.find_one({"id": wedding_id})
    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding not found"
        )
    
    honeymoon_fund = wedding.get("honeymoon_fund", {})
    return {"honeymoon_fund": honeymoon_fund}

@api_router.get("/wedding/registry/share/{shareable_id}")
async def get_honeymoon_fund_by_shareable_id(shareable_id: str):
    """Get honeymoon fund configuration by shareable ID"""
    users_coll, weddings_coll = await get_collections()
    
    wedding = await weddings_coll.find_one({"shareable_id": shareable_id})
    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding not found"
        )
    
    honeymoon_fund = wedding.get("honeymoon_fund", {})
    return {"honeymoon_fund": honeymoon_fund}

@api_router.post("/payment/create-intent")
async def create_payment_intent(payment_request: PaymentRequest):
    """Create Stripe payment intent for honeymoon fund contribution"""
    try:
        # Verify wedding exists
        users_coll, weddings_coll = await get_collections()
        wedding = await weddings_coll.find_one({"id": payment_request.wedding_id})
        if not wedding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wedding not found"
            )
        
        # Create Stripe payment intent
        intent = stripe.PaymentIntent.create(
            amount=int(payment_request.amount * 100),  # Convert to cents/paisa
            currency=payment_request.currency,
            metadata={
                "wedding_id": payment_request.wedding_id,
                "contributor_name": payment_request.contributor_name,
                "contributor_email": payment_request.contributor_email,
                "contributor_phone": payment_request.contributor_phone,
                "message": payment_request.message or ""
            }
        )
        
        # Store payment record in database
        contribution = PaymentContribution(
            wedding_id=payment_request.wedding_id,
            contributor_name=payment_request.contributor_name,
            contributor_email=payment_request.contributor_email,
            contributor_phone=payment_request.contributor_phone,
            amount=payment_request.amount,
            currency=payment_request.currency,
            stripe_payment_intent_id=intent.id,
            payment_status="pending",
            message=payment_request.message
        )
        
        # Store in MongoDB
        contributions_collection = database.contributions
        await contributions_collection.insert_one(contribution.dict())
        
        return {
            "client_secret": intent.client_secret,
            "payment_intent_id": intent.id,
            "contribution_id": contribution.id
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Payment processing error: {str(e)}"
        )

@api_router.post("/payment/confirm")
async def confirm_payment(payment_intent_id: str):
    """Confirm payment and update contribution status"""
    try:
        # Retrieve payment intent from Stripe
        intent = stripe.PaymentIntent.retrieve(payment_intent_id)
        
        # Update contribution status in database
        contributions_collection = database.contributions
        update_result = await contributions_collection.update_one(
            {"stripe_payment_intent_id": payment_intent_id},
            {
                "$set": {
                    "payment_status": "completed" if intent.status == "succeeded" else "failed",
                    "updated_at": datetime.utcnow()
                }
            }
        )
        
        if update_result.modified_count == 0:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Payment contribution not found"
            )
        
        return {
            "success": True,
            "payment_status": intent.status,
            "amount_received": intent.amount_received / 100  # Convert back from cents
        }
        
    except stripe.error.StripeError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Stripe error: {str(e)}"
        )

@api_router.post("/payment/upi-contribution")
async def create_upi_contribution(request_data: dict):
    """Create UPI contribution record (non-Stripe payment)"""
    try:
        # Verify wedding exists
        users_coll, weddings_coll = await get_collections()
        wedding = await weddings_coll.find_one({"id": request_data.get("wedding_id")})
        if not wedding:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wedding not found"
            )
        
        # Create contribution record
        contribution = PaymentContribution(
            wedding_id=request_data.get("wedding_id"),
            contributor_name=request_data.get("contributor_name"),
            contributor_email=request_data.get("contributor_email", ""),
            contributor_phone=request_data.get("contributor_phone", ""),
            amount=float(request_data.get("amount")),
            currency=request_data.get("currency", "inr"),
            stripe_payment_intent_id=request_data.get("upi_reference", ""),  # Store UPI reference
            payment_status="completed",  # UPI contributions are marked as completed
            message=request_data.get("message", "")
        )
        
        # Store in MongoDB
        contributions_collection = database.contributions
        contribution_dict = contribution.dict()
        contribution_dict["created_at"] = contribution_dict["created_at"].isoformat()
        contribution_dict["payment_method"] = "upi"
        contribution_dict["upi_reference"] = request_data.get("upi_reference", "")
        
        await contributions_collection.insert_one(contribution_dict)
        
        return {
            "success": True,
            "contribution_id": contribution.id,
            "message": "UPI contribution recorded successfully"
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"UPI contribution processing error: {str(e)}"
        )

@api_router.get("/payment/contributions/{wedding_id}")
async def get_contributions(wedding_id: str, session_id: str = None):
    """Get all contributions for a wedding (admin only)"""
    if not session_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session ID required"
        )
    
    current_user = await get_current_user_simple(session_id)
    users_coll, weddings_coll = await get_collections()
    
    # Verify user owns this wedding
    wedding = await weddings_coll.find_one({"id": wedding_id, "user_id": current_user.id})
    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view these contributions"
        )
    
    # Get all completed contributions
    contributions_collection = database.contributions
    contributions = await contributions_collection.find({
        "wedding_id": wedding_id,
        "payment_status": "completed"
    }).to_list(length=None)
    
    # Calculate total amount
    total_amount = sum(contrib.get("amount", 0) for contrib in contributions)
    
    return {
        "contributions": contributions,
        "total_amount": total_amount,
        "currency": contributions[0].get("currency", "inr") if contributions else "inr",
        "count": len(contributions)
    }

@api_router.get("/payment/total/{wedding_id}")
async def get_contributions_total(wedding_id: str):
    """Get total contributions for a wedding (public endpoint)"""
    users_coll, weddings_coll = await get_collections()
    
    # Verify wedding exists
    wedding = await weddings_coll.find_one({"id": wedding_id})
    if not wedding:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Wedding not found"
        )
    
    # Get total from completed contributions
    contributions_collection = database.contributions
    contributions = await contributions_collection.find({
        "wedding_id": wedding_id,
        "payment_status": "completed"
    }).to_list(length=None)
    
    total_amount = sum(contrib.get("amount", 0) for contrib in contributions)
    
    return {
        "total_amount": total_amount,
        "currency": contributions[0].get("currency", "inr") if contributions else "inr",
        "count": len(contributions)
    }

# Test endpoint to verify connectivity
@api_router.get("/test")
async def test_endpoint():
    return {"status": "ok", "message": "Backend is working", "timestamp": datetime.utcnow()}

# Serve React static files (production setup)
FRONTEND_BUILD_PATH = ROOT_DIR.parent / "frontend" / "build"

# Include the API router first (higher priority)
app.include_router(api_router)

# Add CORS middleware - Allow all origins for deployed environment
# Using allow_origin_regex to match all Emergent preview domains and localhost
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https?://(.*\.emergentagent\.com|localhost|127\.0\.0\.1)(:[0-9]+)?",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["*"],
)

# Serve static files and React app
if FRONTEND_BUILD_PATH.exists():
    print(f"✅ Frontend build found at: {FRONTEND_BUILD_PATH}")
    app.mount("/static", StaticFiles(directory=str(FRONTEND_BUILD_PATH / "static")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_react_app(full_path: str):
        """Serve React app for all non-API routes"""
        print(f"🌐 Serving route: {full_path}")
        
        # Skip API routes (they are handled by api_router)
        if full_path.startswith("api"):
            print(f"❌ API route not found: {full_path}")
            raise HTTPException(status_code=404, detail="API endpoint not found")
        
        # Check if it's a direct file request
        if full_path and not full_path.startswith("api"):
            static_file_path = FRONTEND_BUILD_PATH / full_path
            if static_file_path.exists() and static_file_path.is_file():
                print(f"📁 Serving static file: {static_file_path}")
                return FileResponse(static_file_path)
        
        # For all other routes (including custom wedding URLs), serve React index.html
        index_path = FRONTEND_BUILD_PATH / "index.html"
        print(f"⚛️ Serving React app: {index_path}")
        return FileResponse(index_path)
else:
    print(f"❌ Frontend build not found at: {FRONTEND_BUILD_PATH}")
    print("React static file serving disabled")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Startup and shutdown events for MongoDB
@app.on_event("startup")
async def startup_event():
    await connect_to_mongo()
    logger.info("✅ Wedding Card API started successfully")

@app.on_event("shutdown")
async def shutdown_event():
    await close_mongo_connection()
    active_sessions.clear()
    # Note: Sessions are persisted in MongoDB and will be restored on restart
    logger.info("👋 Wedding Card API shutdown complete")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "server:app",
        host="0.0.0.0",
        port=8001,
        reload=False,
        log_level="info"
    )