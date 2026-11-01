"""
Reusable MongoDB Atlas and Local MongoDB Connection Module.
Provides connection pooling, latency probing, timeout management,
safe URI masking, and zero-leakage diagnostics for MedPulse Hospital System.
"""

import os
import re
import time
import logging
from typing import Optional, Dict, Any

from backend.app.config import settings

logger = logging.getLogger("medpulse.db")

def mask_mongodb_uri(uri: str) -> str:
    """
    Sanitizes a MongoDB connection URI to mask credentials in logs, diagnostics, and reports.
    Example: mongodb+srv://admin:secret@cluster0.abc.mongodb.net/ -> mongodb+srv://admin:******@cluster0.abc.mongodb.net/
    """
    if not uri:
        return ""
    try:
        return re.sub(r"://([^:]+):([^@]+)@", r"://\1:******@", uri)
    except Exception:
        return "mongodb://<credentials-masked>@<cluster>"

class MongoClientManager:
    """
    Singleton connection manager for MongoDB Atlas / MongoDB Server.
    Manages client connection pooling, timeouts, TLS validation, and health checks.
    """
    _instance: Optional["MongoClientManager"] = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(MongoClientManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance

    def __init__(self):
        if getattr(self, "_initialized", False):
            return
            
        self.client = None
        self.db = None
        self.is_connected = False
        self.is_atlas = False
        self.last_latency_ms: Optional[float] = None
        self.last_error: Optional[str] = None
        self.masked_uri: str = mask_mongodb_uri(settings.MONGODB_URI)
        self._initialized = True

    def connect(self) -> bool:
        """
        Initializes connection to MongoDB Atlas with connection pooling and timeouts.
        Returns True if connected successfully, False otherwise.
        """
        # If user explicitly configured storage mode as json-only, bypass MongoDB
        if settings.STORAGE_MODE.lower() == "json":
            self.is_connected = False
            self.last_error = "Storage mode explicitly configured as 'json'"
            return False

        try:
            import pymongo
            try:
                import certifi
                ca_file = certifi.where()
            except ImportError:
                ca_file = None

            raw_uri = settings.MONGODB_URI.strip()
            self.is_atlas = raw_uri.startswith("mongodb+srv://") or "mongodb.net" in raw_uri
            self.masked_uri = mask_mongodb_uri(raw_uri)

            # Build client options with connection pooling & timeouts
            client_options: Dict[str, Any] = {
                "maxPoolSize": settings.MONGODB_MAX_POOL_SIZE,
                "minPoolSize": settings.MONGODB_MIN_POOL_SIZE,
                "maxIdleTimeMS": settings.MONGODB_MAX_IDLE_TIME_MS,
                "connectTimeoutMS": settings.MONGODB_CONNECT_TIMEOUT_MS,
                "serverSelectionTimeoutMS": settings.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
                "socketTimeoutMS": settings.MONGODB_SOCKET_TIMEOUT_MS,
                "retryWrites": settings.MONGODB_RETRY_WRITES,
                "retryReads": settings.MONGODB_RETRY_READS,
                "appName": "MedPulseHospitalAPI"
            }

            # If using Atlas or TLS, specify CA bundle to ensure valid cloud handshake
            if (self.is_atlas or "tls=true" in raw_uri.lower() or "ssl=true" in raw_uri.lower()) and ca_file:
                client_options["tlsCAFile"] = ca_file

            start_t = time.perf_counter()
            client = pymongo.MongoClient(raw_uri, **client_options)
            
            # Ping database cluster to verify reachability
            client.admin.command("ping")
            latency_ms = round((time.perf_counter() - start_t) * 1000, 2)
            
            self.client = client
            self.db = client[settings.MONGODB_DATABASE]
            self.is_connected = True
            self.last_latency_ms = latency_ms
            self.last_error = None

            cluster_type = "MongoDB Atlas" if self.is_atlas else "MongoDB Server"
            print(f"[Database] Successfully connected to live {cluster_type} at {self.masked_uri} (ping: {latency_ms}ms)")
            return True

        except Exception as e:
            self.client = None
            self.db = None
            self.is_connected = False
            self.last_latency_ms = None
            
            # Sanitize error message to prevent any credentials leaking in logs
            sanitized_err = mask_mongodb_uri(str(e))
            self.last_error = sanitized_err
            print(f"[Database] MongoDB not reachable ({sanitized_err}). Gracefully falling back to Persistent JSON Store.")
            return False

    def close(self):
        """Closes all pooled connections to MongoDB."""
        if self.client:
            try:
                self.client.close()
                print("[Database] MongoDB connection pool closed cleanly.")
            except Exception as e:
                print(f"[Database] Warning closing MongoDB connection: {e}")
            finally:
                self.client = None
                self.db = None
                self.is_connected = False

    def ping(self) -> Dict[str, Any]:
        """Probes live connection health on demand."""
        if not self.is_connected or not self.client:
            return {"connected": False, "error": self.last_error or "Not connected"}

        try:
            start_t = time.perf_counter()
            self.client.admin.command("ping")
            latency = round((time.perf_counter() - start_t) * 1000, 2)
            self.last_latency_ms = latency
            return {"connected": True, "latency_ms": latency}
        except Exception as e:
            self.is_connected = False
            err = mask_mongodb_uri(str(e))
            self.last_error = err
            return {"connected": False, "error": err}

    def get_health_status(self) -> Dict[str, Any]:
        """Returns structured diagnostic status for the health-check endpoint."""
        ping_res = self.ping() if self.is_connected else {"connected": False, "error": self.last_error}
        
        status_label = "healthy" if ping_res.get("connected") else ("fallback_mode" if settings.STORAGE_MODE == "auto" else "unhealthy")

        return {
            "status": status_label,
            "connected": ping_res.get("connected", False),
            "engine": "mongodb_atlas" if (self.is_connected and self.is_atlas) else ("mongodb_local" if self.is_connected else "persistent_json_store"),
            "database_name": settings.MONGODB_DATABASE,
            "endpoint": self.masked_uri,
            "is_atlas": self.is_atlas,
            "latency_ms": ping_res.get("latency_ms"),
            "connection_pool": {
                "max_pool_size": settings.MONGODB_MAX_POOL_SIZE,
                "min_pool_size": settings.MONGODB_MIN_POOL_SIZE,
                "max_idle_time_ms": settings.MONGODB_MAX_IDLE_TIME_MS,
                "connect_timeout_ms": settings.MONGODB_CONNECT_TIMEOUT_MS,
                "server_selection_timeout_ms": settings.MONGODB_SERVER_SELECTION_TIMEOUT_MS,
                "socket_timeout_ms": settings.MONGODB_SOCKET_TIMEOUT_MS,
                "retry_writes": settings.MONGODB_RETRY_WRITES,
                "retry_reads": settings.MONGODB_RETRY_READS
            },
            "last_error": None if ping_res.get("connected") else self.last_error
        }

# Global reusable instance
mongo_client_manager = MongoClientManager()

def get_mongo_client():
    """Returns the MongoClient instance or None."""
    return mongo_client_manager.client

def get_mongo_db():
    """Returns the MongoDB database instance or None."""
    return mongo_client_manager.db
