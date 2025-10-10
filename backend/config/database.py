"""
MongoDB database connection and management
"""
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from .settings import settings

logger = logging.getLogger(__name__)

# Global database client and database
mongodb_client = None
database = None

# Collections
users_collection = None
weddings_collection = None
rsvp_collection = None
guestbook_collection = None

async def connect_to_mongo():
    """Connect to MongoDB database"""
    global mongodb_client, database
    try:
        print(f"🔄 Attempting to connect to MongoDB: {settings.MONGO_URL}")
        mongodb_client = AsyncIOMotorClient(settings.MONGO_URL)
        database = mongodb_client[settings.DB_NAME]
        # Test the connection
        await database.command("ping")
        print(f"✅ Connected to MongoDB database: {settings.DB_NAME}")
        logger.info(f"✅ Connected to MongoDB database: {settings.DB_NAME}")
    except Exception as e:
        print(f"❌ Error connecting to MongoDB: {e}")
        logger.error(f"❌ Error connecting to MongoDB: {e}")
        # Don't raise the error, just continue with JSON files
        pass

async def close_mongo_connection():
    """Close MongoDB connection"""
    global mongodb_client
    if mongodb_client:
        mongodb_client.close()

async def get_collections():
    """Get MongoDB collections"""
    global users_collection, weddings_collection, rsvp_collection, guestbook_collection
    
    if users_collection is None:
        users_collection = database.users
    if weddings_collection is None:
        weddings_collection = database.weddings
    if rsvp_collection is None:
        rsvp_collection = database.rsvp_responses
    if guestbook_collection is None:
        guestbook_collection = database.guestbook
        
    return users_collection, weddings_collection, rsvp_collection, guestbook_collection
