"""
Doctor Management Router.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, status
from backend.app.database import get_db
from backend.app.models.schemas import DoctorCreate, DoctorUpdate
from backend.app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/doctors", tags=["Doctor Management"])

@router.get("/")
async def get_all_doctors(
    department: Optional[str] = None,
    specialization: Optional[str] = None,
    availability: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    doc_coll = db.get_collection("doctors")
    pat_coll = db.get_collection("patients")
    
    doctors = doc_coll.find()
    patients = pat_coll.find()
    
    # Calculate patient load for each doctor
    doctor_load = {}
    for p in patients:
        doc_id = p.get("assigned_doctor_id")
        if doc_id:
            doctor_load[doc_id] = doctor_load.get(doc_id, 0) + 1
            
    results = []
    for d in doctors:
        if department and d.get("department") != department:
            continue
        if specialization and d.get("specialization") != specialization:
            continue
        if availability and d.get("availability_status") != availability:
            continue
        
        doc_copy = dict(d)
        doc_copy["assigned_patients_count"] = doctor_load.get(d["doctor_id"], 0)
        results.append(doc_copy)
        
    return results

@router.get("/{doctor_id}")
async def get_doctor_profile(doctor_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    doc = db.get_collection("doctors").find_one({"doctor_id": doctor_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found.")
        
    # Get active patients under this doctor
    assigned_patients = db.get_collection("patients").find({"assigned_doctor_id": doctor_id})
    return {"doctor": doc, "patients": assigned_patients, "total_patients": len(assigned_patients)}

@router.post("/", dependencies=[Depends(require_roles(["Admin"]))])
async def create_doctor(doctor: DoctorCreate):
    db = get_db()
    doc_coll = db.get_collection("doctors")
    if doc_coll.find_one({"doctor_id": doctor.doctor_id}):
        raise HTTPException(status_code=400, detail="Doctor ID already exists.")
        
    doc = doctor.dict()
    doc["created_at"] = datetime.now().isoformat()
    doc_coll.insert_one(doc)
    return {"message": "Doctor registered successfully", "doctor": doc}

@router.put("/{doctor_id}")
async def update_doctor(doctor_id: str, updates: DoctorUpdate, current_user: dict = Depends(get_current_user)):
    # Doctors can update their own availability; Admin can update everything
    if current_user.get("role") != "Admin" and current_user.get("employee_id") != doctor_id:
        # Check if fields are only availability
        update_keys = set(updates.dict(exclude_none=True).keys())
        if update_keys - {"availability_status"}:
            raise HTTPException(status_code=403, detail="Only Admins can modify full clinical doctor profiles.")
            
    db = get_db()
    doc_coll = db.get_collection("doctors")
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_data:
        return {"message": "No changes specified."}
        
    doc_coll.update_one({"doctor_id": doctor_id}, {"$set": update_data})
    return {"message": f"Doctor {doctor_id} updated successfully."}

@router.post("/assign-patient")
async def assign_doctor_to_patient(
    patient_id: str,
    doctor_id: str,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    pat_coll = db.get_collection("patients")
    doc_coll = db.get_collection("doctors")
    
    pat = pat_coll.find_one({"patient_id": patient_id})
    if not pat:
        raise HTTPException(status_code=404, detail="Patient not found.")
        
    doc = doc_coll.find_one({"doctor_id": doctor_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Doctor not found.")
        
    pat_coll.update_one(
        {"patient_id": patient_id},
        {"$set": {"assigned_doctor_id": doctor_id, "department": doc.get("department", pat.get("department"))}}
    )
    
    return {
        "message": f"Doctor {doc.get('doctor_name')} assigned to patient {pat.get('full_name')}.",
        "patient_id": patient_id,
        "doctor_id": doctor_id
    }
