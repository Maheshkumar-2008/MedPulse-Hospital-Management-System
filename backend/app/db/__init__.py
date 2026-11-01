"""
Database Module for MedPulse Hospital Management System.
Provides reusable connection pooling for MongoDB Atlas and local fallback storage.
"""

from backend.app.db.mongodb import (
    mongo_client_manager,
    get_mongo_client,
    get_mongo_db,
    mask_mongodb_uri
)

__all__ = [
    "mongo_client_manager",
    "get_mongo_client",
    "get_mongo_db",
    "mask_mongodb_uri"
]
