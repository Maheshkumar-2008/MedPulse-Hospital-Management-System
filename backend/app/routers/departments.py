"""
Department Management Router.
"""

from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.app.database import get_db
from backend.app.models.schemas import DepartmentBase
from backend.app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/departments", tags=["Department Management"])

@router.get("/")
async def get_departments(current_user: dict = Depends(get_current_user)):
    db = get_db()
    dept_coll = db.get_collection("departments")
    pat_coll = db.get_collection("patients")
    doc_coll = db.get_collection("doctors")
    beds_coll = db.get_collection("beds")
    
    depts = dept_coll.find()
    patients = pat_coll.find()
    doctors = doc_coll.find()
    beds = beds_coll.find()
    
    # Calculate statistics
    enriched = []
    for d in depts:
        d_name = d.get("department_name")
        pat_count = sum(1 for p in patients if p.get("department") == d_name)
        doc_count = sum(1 for doc in doctors if doc.get("department") == d_name)
        dept_beds = [b for b in beds if b.get("department") == d_name]
        total_beds = len(dept_beds) or d.get("total_beds", 20)
        occupied_beds = sum(1 for b in dept_beds if b.get("bed_status") == "Occupied")
        available_beds = sum(1 for b in dept_beds if b.get("bed_status") == "Available")
        
        item = dict(d)
        item["patient_count"] = pat_count
        item["doctor_count"] = doc_count
        item["total_beds"] = total_beds
        item["occupied_beds"] = occupied_beds
        item["available_beds"] = available_beds
        item["occupancy_rate"] = round((occupied_beds / total_beds * 100), 1) if total_beds > 0 else 0
        enriched.append(item)
        
    return enriched

@router.post("/", dependencies=[Depends(require_roles(["Admin"]))])
async def add_department(dept: DepartmentBase):
    db = get_db()
    dept_coll = db.get_collection("departments")
    
    existing = dept_coll.find_one({"department_name": dept.department_name})
    if existing:
        raise HTTPException(status_code=400, detail="Department already exists.")
        
    all_depts = dept_coll.find()
    next_id = max([d.get("department_id", 0) for d in all_depts] or [0]) + 1
    
    doc = dept.dict()
    doc["department_id"] = next_id
    dept_coll.insert_one(doc)
    return {"message": "Department created successfully.", "department": doc}

@router.put("/{department_id}", dependencies=[Depends(require_roles(["Admin"]))])
async def update_department(department_id: int, dept: DepartmentBase):
    db = get_db()
    dept_coll = db.get_collection("departments")
    
    update_data = {k: v for k, v in dept.dict().items() if v is not None and k != "department_id"}
    dept_coll.update_one({"department_id": department_id}, {"$set": update_data})
    return {"message": f"Department {department_id} updated successfully."}
