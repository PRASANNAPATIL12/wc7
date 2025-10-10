"""
Session management utilities
"""
import uuid
from datetime import datetime
from fastapi import HTTPException, status
from config.database import get_collections, database
from models.user import User

# Simple session storage (in production, use Redis or similar)
active_sessions = {}

async def create_simple_session(user_id: str) -> str:
    """Create a new session for user"""
    session_id = str(uuid.uuid4())
    session_data = {
        "session_id": session_id,
        "user_id": user_id,
        "created_at": datetime.utcnow()
    }
    
    # Store in memory for fast access
    active_sessions[session_id] = session_data
    
    # Also store in MongoDB for persistence across server restarts
    users_coll, weddings_coll, _, _ = await get_collections()
    if users_coll is not None:
        try:
            sessions_collection = database.sessions
            await sessions_collection.insert_one(session_data)
            print(f"✅ Session {session_id} stored in MongoDB")
        except Exception as e:
            print(f"⚠️ Failed to store session in MongoDB: {e}")
    
    return session_id

async def get_current_user_simple(session_id: str = None):
    """Get current user from session"""
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
            users_coll, weddings_coll, _, _ = await get_collections()
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
    
    users_coll, weddings_coll, _, _ = await get_collections()
    user_data = await users_coll.find_one({"id": session["user_id"]})
    
    if not user_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return User(**user_data)

def clear_all_sessions():
    """Clear all active sessions"""
    active_sessions.clear()