"""
Patient Status Tracking Module (Flagship Healthcare Feature).
Tracks the 10 vital patient statuses, audit history, doctor/bed updates, and emergency triage.
"""

from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, status
from backend.app.database import get_db
from backend.app.models.schemas import StatusUpdateRequest
from backend.app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/status-tracking", tags=["Patient Status Tracking"])

VALID_STATUSES = [
    "Registered",
    "Waiting for Consultation",
    "Under Consultation",
    "Under Treatment",
    "Admitted",
    "Under Observation",
    "Emergency",
    "Discharged",
    "Referred to Another Hospital",
    "Deceased"
]

STATUS_COLORS = {
    "Registered": "#64748b",                  # Grey
    "Waiting for Consultation": "#f59e0b",    # Orange
    "Under Consultation": "#0284c7",          # Sky Blue
    "Under Treatment": "#2563eb",             # Blue
    "Admitted": "#1e3a8a",                    # Dark Blue
    "Under Observation": "#9333ea",           # Purple
    "Emergency": "#dc2626",                   # Red
    "Discharged": "#16a34a",                  # Green
    "Referred to Another Hospital": "#0d9488",# Teal
    "Deceased": "#1f2937"                     # Charcoal
}

@router.get("/dashboard-metrics")
async def get_status_dashboard_metrics(current_user: dict = Depends(get_current_user)):
    db = get_db()
    pat_coll = db.get_collection("patients")
    patients = pat_coll.find()
    
    counts = {s: 0 for s in VALID_STATUSES}
    for p in patients:
        st = p.get("current_status", "Registered")
        if st in counts:
            counts[st] += 1
        else:
            counts["Registered"] += 1
            
    return {
        "total_registered_patients": len(patients),
        "currently_admitted": counts["Admitted"],
        "under_treatment": counts["Under Treatment"],
        "waiting_for_consultation": counts["Waiting for Consultation"],
        "under_observation": counts["Under Observation"],
        "emergency_patients": counts["Emergency"],
        "discharged_patients": counts["Discharged"],
        "under_consultation": counts["Under Consultation"],
        "referred": counts["Referred to Another Hospital"],
        "deceased": counts["Deceased"],
        "status_breakdown": counts,
        "status_colors": STATUS_COLORS
    }

@router.get("/list")
async def get_status_patient_list(
    search: Optional[str] = None,
    status_filter: Optional[str] = None,
    department: Optional[str] = None,
    is_emergency: Optional[bool] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    pat_coll = db.get_collection("patients")
    doc_coll = db.get_collection("doctors")
    adm_coll = db.get_collection("admissions")
    
    patients = pat_coll.find()
    doctors = {d["doctor_id"]: d.get("doctor_name", "") for d in doc_coll.find()}
    
    results = []
    for p in patients:
        curr_status = p.get("current_status", "Registered")
        
        if is_emergency is True and curr_status != "Emergency":
            continue
        if status_filter and curr_status != status_filter:
            continue
        if department and p.get("department") != department:
            continue
            
        if search:
            q = search.lower().strip()
            name_match = q in p.get("full_name", "").lower()
            id_match = q in p.get("patient_id", "").lower()
            phone_match = q in p.get("mobile_number", "").lower()
            if not (name_match or id_match or phone_match):
                continue
                
        # Resolve doctor name
        doc_name = doctors.get(p.get("assigned_doctor_id"), "Unassigned")
        
        # Check active admission
        active_adm = adm_coll.find_one({"patient_id": p["patient_id"], "admission_status": "Admitted"})
        admission_date = active_adm.get("admission_date") if active_adm else None
        bed_no = active_adm.get("bed_id") if active_adm else p.get("bed_id", "None")
        
        results.append({
            "patient_id": p["patient_id"],
            "full_name": p["full_name"],
            "age": p["age"],
            "gender": p["gender"],
            "department": p.get("department", "General Medicine"),
            "primary_diagnosis": p.get("primary_diagnosis", "Under assessment"),
            "assigned_doctor_id": p.get("assigned_doctor_id"),
            "assigned_doctor_name": doc_name,
            "admission_date": admission_date,
            "bed_number": bed_no,
            "current_status": curr_status,
            "status_color": STATUS_COLORS.get(curr_status, "#64748b"),
            "last_updated": p.get("updated_at") or p.get("created_at") or p.get("registration_date")
        })
        
    return results

@router.get("/history/{patient_id}")
async def get_patient_status_history(patient_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    history = db.get_collection("status_history").find({"patient_id": patient_id}, sort_by="timestamp", reverse=True)
    return history

@router.post("/update", dependencies=[Depends(require_roles(["Admin", "Doctor", "Nurse", "Receptionist"]))])
async def update_patient_status(req: StatusUpdateRequest, current_user: dict = Depends(get_current_user)):
    if req.new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid status '{req.new_status}'. Allowed statuses: {', '.join(VALID_STATUSES)}"
        )

    # Restriction: Deceased status can only be registered by Doctors or Admins
    if req.new_status == "Deceased":
        user_role = current_user.get("role", "")
        if user_role not in ["Admin", "Doctor"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Security Rule: Deceased status can strictly be certified and recorded only by licensed Medical Doctors or Hospital Admins."
            )

    db = get_db()
    pat_coll = db.get_collection("patients")
    hist_coll = db.get_collection("status_history")
    beds_coll = db.get_collection("beds")
    
    patient = pat_coll.find_one({"patient_id": req.patient_id})
    if not patient:
        raise HTTPException(status_code=404, detail="Patient not found.")
        
    old_status = patient.get("current_status", "Registered")
    now_ts = datetime.now().isoformat()
    
    # Updates to patient document
    updates = {
        "current_status": req.new_status,
        "updated_at": now_ts
    }
    if req.assigned_doctor_id:
        updates["assigned_doctor_id"] = req.assigned_doctor_id
    if req.bed_number:
        updates["bed_id"] = req.bed_number
    if req.department:
        updates["department"] = req.department
        
    pat_coll.update_one({"patient_id": req.patient_id}, {"$set": updates})
    
    # If discharged or deceased, release bed if assigned
    if req.new_status in ["Discharged", "Deceased", "Referred to Another Hospital"]:
        bed_id = patient.get("bed_id")
        if bed_id:
            beds_coll.update_one({"bed_id": bed_id}, {"$set": {"bed_status": "Available"}})
            
    # Insert audit record in history
    history_entry = {
        "patient_id": req.patient_id,
        "patient_name": patient.get("full_name", ""),
        "previous_status": old_status,
        "new_status": req.new_status,
        "updated_by_employee_id": current_user["employee_id"],
        "employee_name": current_user.get("full_name", "Clinical Staff"),
        "employee_role": current_user.get("role", ""),
        "remarks": req.remarks or f"Status changed from {old_status} to {req.new_status}",
        "timestamp": now_ts
    }
    hist_coll.insert_one(history_entry)
    
    return {
        "message": f"Patient status updated from '{old_status}' to '{req.new_status}'.",
        "patient_id": req.patient_id,
        "new_status": req.new_status,
        "history_record": history_entry
    }
