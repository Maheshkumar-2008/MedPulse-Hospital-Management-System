import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "Hospital Patient Data Analysis and Management System"
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "super-secret-hospital-jwt-key-btech-2026-mbu")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 24 hours
    
    # MongoDB configuration
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    DATABASE_NAME: str = "hospital_management_db"
    
    # Storage Mode: "mongo" or "auto" (attempts mongo, falls back to JSON persistence)
    STORAGE_MODE: str = os.getenv("STORAGE_MODE", "auto")
    
    # Synthetic / Data Directories
    BASE_DIR: str = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    PROJECT_ROOT: str = os.path.dirname(BASE_DIR)
    DATA_DIR: str = os.path.join(BASE_DIR, "data")
    DATASETS_DIR: str = os.path.join(PROJECT_ROOT, "datasets")
    REPORTS_DIR: str = os.path.join(PROJECT_ROOT, "reports")

settings = Settings()
os.makedirs(settings.DATA_DIR, exist_ok=True)
os.makedirs(settings.REPORTS_DIR, exist_ok=True)
