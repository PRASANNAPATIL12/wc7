"""
Configuration settings for Wedding Card Application
Loads environment variables and provides centralized configuration
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
ROOT_DIR = Path(__file__).parent.parent
load_dotenv(ROOT_DIR / '.env')

class Settings:
    """Application settings"""
    
    # MongoDB Configuration
    MONGO_URL = os.getenv("MONGO_URL")
    DB_NAME = os.getenv("DB_NAME", "weddingcard")
    
    # Stripe Configuration
    STRIPE_PUBLISHABLE_KEY = os.getenv("STRIPE_PUBLISHABLE_KEY")
    STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY")
    
    # CORS Configuration
    CORS_ORIGINS = os.getenv("CORS_ORIGINS", "*").split(",")
    
    # JWT/Session Configuration
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-super-secret-jwt-key-change-in-production-123456789")
    
    # File Paths
    ROOT_DIR = ROOT_DIR
    DATA_DIR = ROOT_DIR / 'data'
    USERS_FILE = DATA_DIR / 'users.json'
    WEDDINGS_FILE = DATA_DIR / 'weddings.json'
    
    # Frontend Build Path
    FRONTEND_BUILD_PATH = ROOT_DIR.parent / "frontend" / "build"

# Create settings instance
settings = Settings()
