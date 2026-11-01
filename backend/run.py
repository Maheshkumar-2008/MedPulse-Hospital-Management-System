"""
Run script for FastAPI Hospital Backend.
"""

import uvicorn
import os
import sys

# Ensure backend and project root are in python path
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

if __name__ == "__main__":
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8000))
    print(f"Starting MedPulse Hospital Backend Server on http://{host}:{port}...")
    uvicorn.run("backend.app.main:app", host=host, port=port, reload=False)
