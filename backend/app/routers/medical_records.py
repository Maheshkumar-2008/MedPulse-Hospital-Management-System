"""
Medical Record Management Router.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.app.database import get_db
from backend.app.models.schemas import MedicalRecordCreate
from backend.app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/medical-records", tags=["Medical Records"])

def generate_record_id(rec_coll) -> str:
    all_recs = rec_coll.find()
    max_num = 0
    for r in all_recs:
        rid = str(r.get("record_id", ""))
        if rid.startswith("REC-"):
            try:
                num = int(rid.split("-")[1])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    return f"REC-{max_num + 1:04d}"

@router.get("/", dependencies=[Depends(require_roles(["Admin", "Doctor", "Nurse"]))])
async def get_all_records(
    patient_id: Optional[str] = None,
    doctor_id: Optional[str] = None,
    search: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    rec_coll = db.get_collection("medical_records")
    pat_coll = db.get_collection("patients")
    doc_coll = db.get_collection("doctors")
    
    records = rec_coll.find()
    patients = {p["patient_id"]: p.get("full_name") for p in pat_coll.find()}
    doctors = {d["doctor_id"]: d.get("doctor_name") for d in doc_coll.find()}
    
    results = []
    for r in records:
        if patient_id and r.get("patient_id") != patient_id:
            continue
        if doctor_id and r.get("doctor_id") != doctor_id:
            continue
        if search:
            q = search.lower()
            diag_match = q in r.get("diagnosis", "").lower()
            symp_match = q in r.get("symptoms", "").lower()
            pid_match = q in r.get("patient_id", "").lower()
            if not (diag_match or symp_match or pid_match):
                continue
                
        r_copy = dict(r)
        r_copy["patient_name"] = patients.get(r.get("patient_id"), "Unknown Patient")
        r_copy["doctor_name"] = doctors.get(r.get("doctor_id"), "Attending Doctor")
        results.append(r_copy)
        
    return results

@router.post("/", dependencies=[Depends(require_roles(["Admin", "Doctor"]))])
async def create_medical_record(rec: MedicalRecordCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    rec_coll = db.get_collection("medical_records")
    pat_coll = db.get_collection("patients")
    
    pat = pat_coll.find_one({"patient_id": rec.patient_id})
    if not pat:
        raise HTTPException(status_code=404, detail="Patient not found.")
        
    rid = generate_record_id(rec_coll)
    now_ts = datetime.now().isoformat()
    
    doc = rec.dict()
    doc["record_id"] = rid
    doc["record_date"] = now_ts
    doc["created_by_employee_id"] = current_user["employee_id"]
    rec_coll.insert_one(doc)
    
    # Also update patient primary diagnosis if provided
    if rec.diagnosis:
        pat_coll.update_one(
            {"patient_id": rec.patient_id},
            {"$set": {"primary_diagnosis": rec.diagnosis, "updated_at": now_ts}}
        )
        
    return {"message": "Medical record saved successfully.", "record_id": rid, "record": doc}
