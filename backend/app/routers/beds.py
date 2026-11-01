"""
Bed Management Router.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.app.database import get_db
from backend.app.models.schemas import BedBase, BedUpdate
from backend.app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/beds", tags=["Bed Management"])

@router.get("/")
async def get_beds(
    department: Optional[str] = None,
    status_filter: Optional[str] = None,
    bed_type: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    beds_coll = db.get_collection("beds")
    all_beds = beds_coll.find()
    
    results = []
    for b in all_beds:
        if department and b.get("department") != department:
            continue
        if status_filter and b.get("bed_status") != status_filter:
            continue
        if bed_type and b.get("bed_type") != bed_type:
            continue
        results.append(b)
    return results

@router.get("/summary")
async def get_bed_summary(current_user: dict = Depends(get_current_user)):
    db = get_db()
    all_beds = db.get_collection("beds").find()
    
    total = len(all_beds)
    available = sum(1 for b in all_beds if b.get("bed_status") == "Available")
    occupied = sum(1 for b in all_beds if b.get("bed_status") == "Occupied")
    maintenance = sum(1 for b in all_beds if b.get("bed_status") == "Maintenance")
    
    dept_stats = {}
    for b in all_beds:
        dept = b.get("department", "General")
        if dept not in dept_stats:
            dept_stats[dept] = {"total": 0, "available": 0, "occupied": 0, "maintenance": 0}
        dept_stats[dept]["total"] += 1
        st = b.get("bed_status", "Available").lower()
        if st == "available":
            dept_stats[dept]["available"] += 1
        elif st == "occupied":
            dept_stats[dept]["occupied"] += 1
        else:
            dept_stats[dept]["maintenance"] += 1
            
    return {
        "total_beds": total,
        "available_beds": available,
        "occupied_beds": occupied,
        "maintenance_beds": maintenance,
        "occupancy_rate": round((occupied / total * 100), 1) if total > 0 else 0,
        "department_breakdown": dept_stats
    }

@router.post("/", dependencies=[Depends(require_roles(["Admin"]))])
async def add_bed(bed: BedBase):
    db = get_db()
    beds_coll = db.get_collection("beds")
    
    if beds_coll.find_one({"bed_id": bed.bed_id}) or beds_coll.find_one({"bed_number": bed.bed_number}):
        raise HTTPException(status_code=400, detail="Bed ID or Bed Number already exists.")
        
    doc = bed.dict()
    beds_coll.insert_one(doc)
    return {"message": "Bed added successfully.", "bed": doc}

@router.put("/{bed_id}", dependencies=[Depends(require_roles(["Admin", "Doctor", "Nurse", "Receptionist"]))])
async def update_bed(bed_id: str, updates: BedUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    beds_coll = db.get_collection("beds")
    
    existing = beds_coll.find_one({"bed_id": bed_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Bed not found.")
        
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    beds_coll.update_one({"bed_id": bed_id}, {"$set": update_data})
    return {"message": f"Bed {bed_id} updated successfully."}
