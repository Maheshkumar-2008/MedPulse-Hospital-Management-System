import os
import secrets
from typing import List
from pydantic import BaseModel

try:
    from dotenv import load_dotenv
    # Load .env from project root
    env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env")
    load_dotenv(env_path)
except Exception:
    pass

# Ephemeral fallback secret generated at runtime for local development only.
# Never used in production.
_DEV_SECRET_FALLBACK: str = secrets.token_hex(32)

class Settings(BaseModel):
    APP_NAME: str = "Hospital Patient Data Analysis and Management System"
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")

    @property
    def is_production(self) -> bool:
        """Determines if the application is running in production mode."""
        if self.ENVIRONMENT and self.ENVIRONMENT.strip().lower() in ["production", "prod"]:
            return True
        env_val = os.getenv("ENVIRONMENT", "")
        return env_val.strip().lower() in ["production", "prod"]

    # JWT Security Configuration (Loaded securely from environment)
    SECRET_KEY: str = ""
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))  # Default 24 hours

    def __init__(self, **data):
        super().__init__(**data)
        raw_secret = (self.SECRET_KEY or os.getenv("SECRET_KEY", "")).strip()
        if raw_secret:
            self.SECRET_KEY = raw_secret
        elif not self.is_production:
            # Ephemeral development fallback to keep local development working without exposing secrets
            self.SECRET_KEY = _DEV_SECRET_FALLBACK
        else:
            self.SECRET_KEY = ""
        self.validate_production_secrets()

    def validate_production_secrets(self):
        """
        Validates JWT SECRET_KEY for production safety.
        In production, raises a clear RuntimeError during application startup
        if SECRET_KEY is missing, empty, or a placeholder.
        Never prints or logs the actual secret key.
        """
        if not self.is_production:
            return

        secret = (self.SECRET_KEY or os.getenv("SECRET_KEY", "")).strip()

        if not secret:
            raise RuntimeError(
                "Production Security Violation: SECRET_KEY environment variable is missing or empty in production. "
                "A cryptographically secure secret key is required. Application startup aborted."
            )

        insecure_placeholders = {
            "super-secret-hospital-jwt-key-btech-2026-mbu",
            "replace-with-your-strong-production-random-secret-key",
            "your-secret-key",
            "your-secret-key-here",
            "changeme",
            "secret",
            "secretkey",
            "secret-key",
            "admin",
            "password",
            "default",
        }

        lower_val = secret.lower()
        if (
            secret in insecure_placeholders
            or "replace" in lower_val
            or "placeholder" in lower_val
            or "changeme" in lower_val
            or "your-secret" in lower_val
            or "your_secret" in lower_val
            or len(secret) < 32
        ):
            raise RuntimeError(
                "Production Security Violation: Insecure or placeholder SECRET_KEY detected in production. "
                "You must configure a strong, random secret key (at least 32 characters, e.g. via secrets.token_hex(32)). "
                "Application startup aborted."
            )

    # Server Binding for Production (Render / Cloud)
    HOST: str = os.getenv("HOST", "0.0.0.0")
    PORT: int = int(os.getenv("PORT", "8000"))

    # CORS Allowed Origins
    @property
    def cors_origins(self) -> List[str]:
        raw = os.getenv("CORS_ORIGINS", "")
        frontend_url = os.getenv("FRONTEND_URL", "").strip()

        if self.is_production:
            # In production, allow ONLY the deployed frontend domain(s) configured in environment
            origins = []
            if raw:
                for o in raw.split(","):
                    clean = o.strip()
                    if clean and clean not in origins:
                        origins.append(clean)
            if frontend_url and frontend_url not in origins:
                origins.append(frontend_url)
            return origins if origins else ([frontend_url] if frontend_url else [])

        # Local development origins
        origins = [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "http://localhost:8501",
            "http://127.0.0.1:8501"
        ]
        if raw:
            for o in raw.split(","):
                clean = o.strip()
                if clean and clean not in origins:
                    origins.append(clean)
        if frontend_url and frontend_url not in origins:
            origins.append(frontend_url)
        return origins

    # Authentication & OTP Settings
    ENABLE_DEMO_OTP: bool = os.getenv("ENABLE_DEMO_OTP", "true").lower() in ["true", "1", "yes"]

    # MongoDB configuration (Supports MongoDB Atlas & Local Instances)
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
    MONGODB_DATABASE: str = os.getenv("MONGODB_DATABASE") or os.getenv("DATABASE_NAME", "hospital_management_db")
    DATABASE_NAME: str = os.getenv("MONGODB_DATABASE") or os.getenv("DATABASE_NAME", "hospital_management_db")

    # MongoDB Connection Pooling & Resilience Timeouts
    MONGODB_MAX_POOL_SIZE: int = int(os.getenv("MONGODB_MAX_POOL_SIZE", "50"))
    MONGODB_MIN_POOL_SIZE: int = int(os.getenv("MONGODB_MIN_POOL_SIZE", "5"))
    MONGODB_MAX_IDLE_TIME_MS: int = int(os.getenv("MONGODB_MAX_IDLE_TIME_MS", "45000"))
    MONGODB_CONNECT_TIMEOUT_MS: int = int(os.getenv("MONGODB_CONNECT_TIMEOUT_MS", "5000"))
    MONGODB_SERVER_SELECTION_TIMEOUT_MS: int = int(os.getenv("MONGODB_SERVER_SELECTION_TIMEOUT_MS", "3000"))
    MONGODB_SOCKET_TIMEOUT_MS: int = int(os.getenv("MONGODB_SOCKET_TIMEOUT_MS", "10000"))
    MONGODB_RETRY_WRITES: bool = os.getenv("MONGODB_RETRY_WRITES", "true").lower() in ["true", "1", "yes"]
    MONGODB_RETRY_READS: bool = os.getenv("MONGODB_RETRY_READS", "true").lower() in ["true", "1", "yes"]

    # Storage Mode: "mongo", "auto", or "json".
    # Note: In production (ENVIRONMENT=production), MongoDB is required and JSON fallback is strictly disabled.
    # JSON storage and fallback are permitted only in development.
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
