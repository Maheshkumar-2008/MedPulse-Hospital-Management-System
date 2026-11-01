"""
Database abstraction layer for Hospital Management System.
Supports real MongoDB (pymongo) and an atomic file-backed JSON document store fallback.
Ensures zero-friction startup for testing, demonstration, and live MongoDB deployments.
"""

import os
import json
import uuid
import copy
from typing import Dict, Any, List, Optional
from datetime import datetime
from backend.app.config import settings
from backend.app.db.mongodb import mongo_client_manager

class JSONCollection:
    def __init__(self, name: str, filepath: str):
        self.name = name
        self.filepath = filepath
        self._data: List[Dict[str, Any]] = []
        self._load()

    def _load(self):
        if os.path.exists(self.filepath):
            try:
                with open(self.filepath, "r", encoding="utf-8") as f:
                    self._data = json.load(f)
            except Exception:
                self._data = []
        else:
            self._data = []
            self._save()

    def _save(self):
        temp_path = self.filepath + ".tmp"
        with open(temp_path, "w", encoding="utf-8") as f:
            json.dump(self._data, f, indent=2, default=str)
        if os.path.exists(self.filepath):
            os.remove(self.filepath)
        os.rename(temp_path, self.filepath)

    def _matches(self, doc: Dict[str, Any], query: Dict[str, Any]) -> bool:
        for k, v in query.items():
            if k == "$or":
                sub_matches = any(self._matches(doc, q) for q in v)
                if not sub_matches:
                    return False
            elif isinstance(v, dict):
                # Simple operators like $regex, $in, $gte, $lte
                doc_val = doc.get(k)
                if "$regex" in v:
                    import re
                    pattern = v["$regex"]
                    flags = re.IGNORECASE if v.get("$options") == "i" else 0
                    if not re.search(pattern, str(doc_val or ""), flags):
                        return False
                elif "$in" in v:
                    if doc_val not in v["$in"]:
                        return False
                elif "$gte" in v:
                    if doc_val is None or doc_val < v["$gte"]:
                        return False
                elif "$lte" in v:
                    if doc_val is None or doc_val > v["$lte"]:
                        return False
            else:
                if doc.get(k) != v:
                    return False
        return True

    def find(self, query: Optional[Dict[str, Any]] = None, sort_by: Optional[str] = None, reverse: bool = False) -> List[Dict[str, Any]]:
        query = query or {}
        results = [copy.deepcopy(doc) for doc in self._data if self._matches(doc, query)]
        if sort_by:
            results.sort(key=lambda x: str(x.get(sort_by, "")), reverse=reverse)
        return results

    def find_one(self, query: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        for doc in self._data:
            if self._matches(doc, query):
                return copy.deepcopy(doc)
        return None

    def insert_one(self, doc: Dict[str, Any]) -> str:
        doc = copy.deepcopy(doc)
        if "_id" not in doc:
            doc["_id"] = str(uuid.uuid4())
        self._data.append(doc)
        self._save()
        return doc["_id"]

    def insert_many(self, docs: List[Dict[str, Any]]) -> List[str]:
        ids = []
        for d in docs:
            ids.append(self.insert_one(d))
        return ids

    def update_one(self, query: Dict[str, Any], update: Dict[str, Any]) -> bool:
        for doc in self._data:
            if self._matches(doc, query):
                if "$set" in update:
                    for k, v in update["$set"].items():
                        doc[k] = v
                else:
                    for k, v in update.items():
                        doc[k] = v
                doc["updated_at"] = datetime.now().isoformat()
                self._save()
                return True
        return False

    def delete_one(self, query: Dict[str, Any]) -> bool:
        for idx, doc in enumerate(self._data):
            if self._matches(doc, query):
                del self._data[idx]
                self._save()
                return True
        return False

    def count_documents(self, query: Optional[Dict[str, Any]] = None) -> int:
        if not query:
            return len(self._data)
        return len(self.find(query))


class DatabaseManager:
    def __init__(self):
        self.use_mongo = False
        self.mongo_client = None
        self.mongo_db = None
        self.json_collections: Dict[str, JSONCollection] = {}
        self._init_db()

    def _init_db(self):
        storage_mode = (os.getenv("STORAGE_MODE") or settings.STORAGE_MODE or "auto").strip().lower()
        is_prod = settings.is_production

        # Requirement 3: In STORAGE_MODE=json, permit JSON storage only in development.
        if storage_mode == "json":
            if is_prod:
                raise RuntimeError(
                    "Production Database Safety: STORAGE_MODE='json' is strictly forbidden in production. "
                    "A live MongoDB connection is required."
                )
            self.use_mongo = False
            self.mongo_client = None
            self.mongo_db = None
            return

        # Attempt MongoDB connection for 'mongo' and 'auto' modes
        connected = mongo_client_manager.connect()

        # Requirement 1: In STORAGE_MODE=mongo, if MongoDB connection fails, raise RuntimeError and prevent application startup.
        if storage_mode == "mongo":
            if not connected:
                raise RuntimeError(
                    "Production Database Safety: Failed to connect to MongoDB with STORAGE_MODE='mongo'. "
                    "Application startup aborted."
                )
            self.use_mongo = True
            self.mongo_client = mongo_client_manager.client
            self.mongo_db = mongo_client_manager.db
            return

        # Requirement 2 & 4: In STORAGE_MODE=auto
        if storage_mode == "auto":
            if connected:
                self.use_mongo = True
                self.mongo_client = mongo_client_manager.client
                self.mongo_db = mongo_client_manager.db
            else:
                # Requirement 2: In ENVIRONMENT=production, never allow JSON fallback, including when STORAGE_MODE=auto.
                if is_prod:
                    raise RuntimeError(
                        "Production Database Safety: MongoDB connection failed in production environment. "
                        "JSON fallback is strictly disabled in production. Application startup aborted."
                    )
                # Requirement 4: In STORAGE_MODE=auto, permit JSON fallback only in development.
                self.use_mongo = False
                self.mongo_client = None
                self.mongo_db = None
            return

        # Unrecognized storage mode
        if is_prod:
            raise RuntimeError(
                f"Production Database Safety: Unrecognized STORAGE_MODE='{storage_mode}' in production."
            )
        else:
            self.use_mongo = False
            self.mongo_client = None
            self.mongo_db = None

    def get_collection(self, name: str):
        """
        Retrieves a database collection.
        Requirement 5: In production, strictly prohibits returning JSONCollection.
        """
        if self.use_mongo and self.mongo_db is not None:
            return self.mongo_db[name]

        # Enforce production safety: production environment MUST NOT access JSONCollection
        if settings.is_production:
            raise RuntimeError(
                f"Production Database Safety: Cannot return JSONCollection for '{name}' in production environment. "
                "MongoDB connection is required."
            )

        # Requirement 7: Preserve existing MongoDB and JSON collection behaviour where permitted (development).
        if name not in self.json_collections:
            file_path = os.path.join(settings.DATA_DIR, f"{name}.json")
            self.json_collections[name] = JSONCollection(name, file_path)
        return self.json_collections[name]

    def get_health(self) -> Dict[str, Any]:
        """
        Requirement 6: Returns minimal health information without database names,
        endpoints, connection pool details, or internal errors.
        """
        storage_mode = (os.getenv("STORAGE_MODE") or settings.STORAGE_MODE or "auto").strip().lower()
        if self.use_mongo and self.mongo_db is not None:
            status = "healthy"
            database_state = "active"
            connected = True
            engine = "mongodb"
        elif not settings.is_production and storage_mode in ["auto", "json"]:
            status = "healthy"
            database_state = "fallback"
            connected = False
            engine = "persistent_json_store"
        else:
            status = "unhealthy"
            database_state = "offline"
            connected = False
            engine = "unavailable"

        return {
            "status": status,
            "database": database_state,
            "connected": connected,
            "engine": engine
        }

db_manager = DatabaseManager()

def get_db():
    return db_manager
