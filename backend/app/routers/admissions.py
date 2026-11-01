"""
Admissions and Discharges Management Router.
"""

from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from backend.app.database import get_db
from backend.app.models.schemas import AdmissionCreate, DischargeCreate
from backend.app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/admissions", tags=["Admissions & Discharges"])

def generate_admission_id(adm_coll) -> str:
    adms = adm_coll.find()
    max_num = 0
    for a in adms:
        aid = str(a.get("admission_id", ""))
        if aid.startswith("ADM-"):
            try:
                num = int(aid.split("-")[1])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    return f"ADM-{max_num + 1:03d}"

@router.get("/")
async def get_admissions(
    status_filter: Optional[str] = None,
    department: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    adm_coll = db.get_collection("admissions")
    pat_coll = db.get_collection("patients")
    doc_coll = db.get_collection("doctors")
    
    admissions = adm_coll.find()
    patients = {p["patient_id"]: p.get("full_name") for p in pat_coll.find()}
    doctors = {d["doctor_id"]: d.get("doctor_name") for d in doc_coll.find()}
    
    results = []
    for a in admissions:
        if status_filter and a.get("admission_status") != status_filter:
            continue
        if department and a.get("department") != department:
            continue
            
        a_copy = dict(a)
        a_copy["patient_name"] = patients.get(a.get("patient_id"), "Unknown")
        a_copy["doctor_name"] = doctors.get(a.get("doctor_id"), "Unknown")
        
        # Calculate stay days
        adm_dt = datetime.fromisoformat(a["admission_date"]) if "T" in a.get("admission_date", "") else datetime.strptime(a["admission_date"][:10], "%Y-%m-%d")
        if a.get("discharge_date"):
            dis_dt = datetime.fromisoformat(a["discharge_date"]) if "T" in a.get("discharge_date", "") else datetime.strptime(a["discharge_date"][:10], "%Y-%m-%d")
            stay_days = max(1, (dis_dt - adm_dt).days)
        else:
            stay_days = max(1, (datetime.now() - adm_dt).days)
        a_copy["stay_duration_days"] = stay_days
        results.append(a_copy)
        
    return results

@router.post("/admit", dependencies=[Depends(require_roles(["Admin", "Doctor", "Nurse", "Receptionist"]))])
async def admit_patient(adm: AdmissionCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    adm_coll = db.get_collection("admissions")
    pat_coll = db.get_collection("patients")
    beds_coll = db.get_collection("beds")
    hist_coll = db.get_collection("status_history")
    
    patient = pat_coll.find_one({"patient_id": adm.patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
        
    aid = generate_admission_id(adm_coll)
    adm_time = adm.admission_date or datetime.now().isoformat()
    
    doc = adm.dict()
    doc["admission_id"] = aid
    doc["admission_date"] = adm_time
    doc["admission_status"] = "Admitted"
    doc["discharge_date"] = None
    doc["discharge_summary"] = None
    adm_coll.insert_one(doc)
    
    # Update Bed status if bed provided
    if adm.bed_id:
        beds_coll.update_one({"bed_id": adm.bed_id}, {"$set": {"bed_status": "Occupied"}})
        
    # Update Patient Status & Bed
    pat_coll.update_one(
        {"patient_id": adm.patient_id},
        {"$set": {
            "current_status": "Admitted",
            "assigned_doctor_id": adm.doctor_id,
            "department": adm.department,
            "bed_id": adm.bed_id,
            "updated_at": adm_time
        }}
    )
    
    # Add to status history
    hist_coll.insert_one({
        "patient_id": adm.patient_id,
        "previous_status": patient.get("current_status", "Registered"),
        "new_status": "Admitted",
        "updated_by_employee_id": current_user["employee_id"],
        "employee_name": current_user.get("full_name", "Clinical Staff"),
        "remarks": f"Admission reason: {adm.admission_reason}. Bed: {adm.bed_id or 'General'}",
        "timestamp": adm_time
    })
    
    return {"message": "Patient admitted successfully.", "admission_id": aid, "admission": doc}

@router.post("/discharge", dependencies=[Depends(require_roles(["Admin", "Doctor", "Nurse"]))])
async def discharge_patient(disc: DischargeCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    adm_coll = db.get_collection("admissions")
    pat_coll = db.get_collection("patients")
    beds_coll = db.get_collection("beds")
    hist_coll = db.get_collection("status_history")
    
    adm = adm_coll.find_one({"admission_id": disc.admission_id})
    if not adm:
        raise HTTPException(status_code=404, detail="Admission record not found.")
        
    now_ts = datetime.now().isoformat()
    adm_coll.update_one(
        {"admission_id": disc.admission_id},
        {"$set": {
            "admission_status": "Discharged",
            "discharge_date": now_ts,
            "discharge_summary": disc.discharge_summary
        }}
    )
    
    # Free allocated bed
    bed_id = adm.get("bed_id")
    if bed_id:
        beds_coll.update_one({"bed_id": bed_id}, {"$set": {"bed_status": "Available"}})
        
    # Update Patient status
    pat = pat_coll.find_one({"patient_id": adm["patient_id"]})
    old_status = pat.get("current_status", "Admitted") if pat else "Admitted"
    
    pat_coll.update_one(
        {"patient_id": adm["patient_id"]},
        {"$set": {"current_status": "Discharged", "bed_id": None, "updated_at": now_ts}}
    )
    
    # Record history
    hist_coll.insert_one({
        "patient_id": adm["patient_id"],
        "previous_status": old_status,
        "new_status": "Discharged",
        "updated_by_employee_id": current_user["employee_id"],
        "employee_name": current_user.get("full_name", "Clinical Staff"),
        "remarks": f"Discharge summary: {disc.discharge_summary}. Follow-up: {disc.follow_up_advice}",
        "timestamp": now_ts
    })
    
    return {"message": f"Patient {adm['patient_id']} has been successfully discharged.", "discharge_date": now_ts}
