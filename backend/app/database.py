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
        if settings.STORAGE_MODE in ["mongo", "auto"]:
            try:
                import pymongo
                client = pymongo.MongoClient(settings.MONGODB_URI, serverSelectionTimeoutMS=1500)
                client.server_info()  # Trigger connection check
                self.mongo_client = client
                self.mongo_db = client[settings.DATABASE_NAME]
                self.use_mongo = True
                print(f"[Database] Connected to live MongoDB at {settings.MONGODB_URI}")
            except Exception as e:
                self.use_mongo = False
                print(f"[Database] MongoDB not reachable ({e}). Gracefully falling back to Persistent JSON Store.")

    def get_collection(self, name: str):
        if self.use_mongo and self.mongo_db is not None:
            return self.mongo_db[name]
        
        if name not in self.json_collections:
            file_path = os.path.join(settings.DATA_DIR, f"{name}.json")
            self.json_collections[name] = JSONCollection(name, file_path)
        return self.json_collections[name]


db_manager = DatabaseManager()

def get_db():
    return db_manager
