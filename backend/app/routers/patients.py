"""
Patient Registration and Management Router.
"""

from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Query, status
from backend.app.database import get_db
from backend.app.models.schemas import PatientCreate, PatientUpdate
from backend.app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/patients", tags=["Patients Management"])

def generate_next_patient_id(pat_coll) -> str:
    all_patients = pat_coll.find()
    max_num = 0
    for p in all_patients:
        pid = str(p.get("patient_id", ""))
        if pid.startswith("PAT-"):
            try:
                num = int(pid.split("-")[1])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    return f"PAT-{max_num + 1:04d}"

@router.get("/")
async def get_patients(
    search: Optional[str] = None,
    department: Optional[str] = None,
    status_filter: Optional[str] = None,
    gender: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    pat_coll = db.get_collection("patients")
    patients = pat_coll.find()
    
    results = []
    for p in patients:
        if search:
            q = search.lower().strip()
            name_match = q in p.get("full_name", "").lower()
            id_match = q in p.get("patient_id", "").lower()
            mobile_match = q in p.get("mobile_number", "").lower()
            if not (name_match or id_match or mobile_match):
                continue
        if department and p.get("department") != department:
            continue
        if status_filter and p.get("current_status") != status_filter:
            continue
        if gender and p.get("gender") != gender:
            continue
        results.append(p)
    return results

@router.get("/{patient_id}")
async def get_patient_profile(patient_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    pat = db.get_collection("patients").find_one({"patient_id": patient_id})
    if not pat:
        raise HTTPException(status_code=404, detail="Patient not found.")
    
    # Fetch historical admissions
    admissions = db.get_collection("admissions").find({"patient_id": patient_id})
    # Fetch status history
    status_history = db.get_collection("status_history").find({"patient_id": patient_id}, sort_by="timestamp", reverse=True)
    # Fetch medical records
    medical_records = db.get_collection("medical_records").find({"patient_id": patient_id})
    # Fetch billing
    bills = db.get_collection("billing").find({"patient_id": patient_id})
    
    return {
        "patient": pat,
        "admissions": admissions,
        "status_history": status_history,
        "medical_records": medical_records,
        "billing": bills
    }

@router.post("/", dependencies=[Depends(require_roles(["Admin", "Receptionist", "Nurse", "Doctor"]))])
async def register_patient(patient: PatientCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    pat_coll = db.get_collection("patients")
    history_coll = db.get_collection("status_history")
    
    pid = patient.patient_id or generate_next_patient_id(pat_coll)
    if pat_coll.find_one({"patient_id": pid}):
        pid = generate_next_patient_id(pat_coll)
        
    doc = patient.dict()
    doc["patient_id"] = pid
    if not doc.get("registration_date"):
        doc["registration_date"] = datetime.now().strftime("%Y-%m-%d")
    if not doc.get("current_status"):
        doc["current_status"] = "Registered"
    doc["created_at"] = datetime.now().isoformat()
    
    pat_coll.insert_one(doc)
    
    # Record initial status in history
    history_coll.insert_one({
        "patient_id": pid,
        "previous_status": "None",
        "new_status": doc["current_status"],
        "updated_by_employee_id": current_user["employee_id"],
        "employee_name": current_user.get("full_name", "Staff Member"),
        "remarks": "Patient registered initially into system.",
        "timestamp": datetime.now().isoformat()
    })
    
    return {"message": "Patient registered successfully", "patient": doc}

@router.put("/{patient_id}", dependencies=[Depends(require_roles(["Admin", "Receptionist", "Doctor", "Nurse"]))])
async def update_patient(patient_id: str, updates: PatientUpdate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    pat_coll = db.get_collection("patients")
    
    pat = pat_coll.find_one({"patient_id": patient_id})
    if not pat:
        raise HTTPException(status_code=404, detail="Patient not found.")
        
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_data:
        return {"message": "No updates supplied."}
        
    pat_coll.update_one({"patient_id": patient_id}, {"$set": update_data})
    return {"message": f"Patient {patient_id} updated successfully."}

@router.delete("/{patient_id}", dependencies=[Depends(require_roles(["Admin"]))])
async def delete_patient(patient_id: str):
    db = get_db()
    pat_coll = db.get_collection("patients")
    deleted = pat_coll.delete_one({"patient_id": patient_id})
    if not deleted:
        raise HTTPException(status_code=404, detail="Patient not found")
    return {"message": f"Patient {patient_id} record removed."}
