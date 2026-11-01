"""
Hospital Analytics and KPI Aggregation Router.
Powers the React Dashboard KPI Cards and 10 Analytics Charts.
"""

from fastapi import APIRouter, Depends
from backend.app.database import get_db
from backend.app.auth.dependencies import get_current_user

router = APIRouter(prefix="/analytics", tags=["Hospital Analytics & KPIs"])

@router.get("/dashboard-kpis")
async def get_dashboard_kpis(current_user: dict = Depends(get_current_user)):
    db = get_db()
    
    patients = db.get_collection("patients").find()
    employees = db.get_collection("employees").find()
    doctors = db.get_collection("doctors").find()
    admissions = db.get_collection("admissions").find()
    beds = db.get_collection("beds").find()
    
    total_patients = len(patients)
    total_employees = len(employees)
    active_employees = sum(1 for e in employees if e.get("status") == "Active")
    total_doctors = len(doctors)
    
    total_admissions = len(admissions)
    total_discharges = sum(1 for a in admissions if a.get("admission_status") == "Discharged")
    
    total_beds = len(beds)
    occupied_beds = sum(1 for b in beds if b.get("bed_status") == "Occupied")
    available_beds = sum(1 for b in beds if b.get("bed_status") == "Available")
    
    emergency_patients = sum(1 for p in patients if p.get("current_status") == "Emergency")
    admitted_patients = sum(1 for p in patients if p.get("current_status") == "Admitted")
    under_treatment = sum(1 for p in patients if p.get("current_status") == "Under Treatment")
    
    return {
        "total_patients": total_patients,
        "total_employees": total_employees,
        "active_employees": active_employees,
        "total_doctors": total_doctors,
        "total_admissions": total_admissions,
        "total_discharges": total_discharges,
        "total_beds": total_beds,
        "available_beds": available_beds,
        "occupied_beds": occupied_beds,
        "emergency_patients": emergency_patients,
        "admitted_patients": admitted_patients,
        "under_treatment": under_treatment
    }

@router.get("/charts-data")
async def get_charts_data(current_user: dict = Depends(get_current_user)):
    db = get_db()
    patients = db.get_collection("patients").find()
    admissions = db.get_collection("admissions").find()
    doctors = db.get_collection("doctors").find()
    beds = db.get_collection("beds").find()
    billing = db.get_collection("billing").find()
    
    # 1. Gender distribution
    gender_counts = {"Male": 0, "Female": 0, "Other": 0}
    # 2. Age distribution
    age_groups = {"Pediatric (0-17)": 0, "Young Adult (18-35)": 0, "Middle Aged (36-60)": 0, "Senior (61+)": 0}
    # 3. Disease distribution
    disease_counts = {}
    # 4. Department distribution
    dept_counts = {}
    # 9. Patient status distribution
    status_counts = {}
    
    for p in patients:
        g = p.get("gender", "Other")
        gender_counts[g] = gender_counts.get(g, 0) + 1
        
        age = p.get("age", 30)
        if age < 18:
            age_groups["Pediatric (0-17)"] += 1
        elif age <= 35:
            age_groups["Young Adult (18-35)"] += 1
        elif age <= 60:
            age_groups["Middle Aged (36-60)"] += 1
        else:
            age_groups["Senior (61+)"] += 1
            
        diag = p.get("primary_diagnosis", "Other")
        disease_counts[diag] = disease_counts.get(diag, 0) + 1
        
        dept = p.get("department", "General Medicine")
        dept_counts[dept] = dept_counts.get(dept, 0) + 1
        
        st = p.get("current_status", "Registered")
        status_counts[st] = status_counts.get(st, 0) + 1

    # 5 & 6. Monthly Admissions and Discharges
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    monthly_admissions = {m: 0 for m in months}
    monthly_discharges = {m: 0 for m in months}
    for a in admissions:
        dt_str = a.get("admission_date", "")
        if len(dt_str) >= 7:
            try:
                m_idx = int(dt_str[5:7]) - 1
                if 0 <= m_idx < 12:
                    monthly_admissions[months[m_idx]] += 1
            except ValueError:
                pass
        dis_str = a.get("discharge_date", "")
        if dis_str and len(dis_str) >= 7:
            try:
                m_idx = int(dis_str[5:7]) - 1
                if 0 <= m_idx < 12:
                    monthly_discharges[months[m_idx]] += 1
            except ValueError:
                pass

    # 7. Doctor-wise patient statistics
    doc_dict = {d["doctor_id"]: d.get("doctor_name") for d in doctors}
    doctor_patients = {d.get("doctor_name"): 0 for d in doctors}
    for p in patients:
        doc_id = p.get("assigned_doctor_id")
        if doc_id in doc_dict:
            doctor_patients[doc_dict[doc_id]] += 1

    # 8. Bed occupancy analysis
    bed_types = {}
    for b in beds:
        b_type = b.get("bed_type", "General")
        if b_type not in bed_types:
            bed_types[b_type] = {"total": 0, "occupied": 0}
        bed_types[b_type]["total"] += 1
        if b.get("bed_status") == "Occupied":
            bed_types[b_type]["occupied"] += 1

    # 10. Revenue distribution
    rev_categories = {
        "Consultation": sum(float(b.get("consultation_charges", 0)) for b in billing),
        "Room / Bed": sum(float(b.get("room_charges", 0)) for b in billing),
        "Pharmacy": sum(float(b.get("medicine_charges", 0)) for b in billing),
        "Diagnostics": sum(float(b.get("laboratory_charges", 0)) for b in billing),
        "Other Services": sum(float(b.get("other_charges", 0)) for b in billing),
    }

    return {
        "gender_distribution": [{"name": k, "value": v} for k, v in gender_counts.items()],
        "age_distribution": [{"age_group": k, "count": v} for k, v in age_groups.items()],
        "disease_statistics": sorted([{"disease": k, "count": v} for k, v in disease_counts.items()], key=lambda x: x["count"], reverse=True)[:8],
        "department_distribution": [{"department": k, "patients": v} for k, v in dept_counts.items()],
        "monthly_trends": [{"month": m, "admissions": monthly_admissions[m], "discharges": monthly_discharges[m]} for m in months],
        "doctor_statistics": [{"doctor": k, "patients": v} for k, v in doctor_patients.items() if v > 0][:8],
        "bed_occupancy": [{"type": k, "total": v["total"], "occupied": v["occupied"]} for k, v in bed_types.items()],
        "status_distribution": [{"status": k, "count": v} for k, v in status_counts.items()],
        "revenue_analysis": [{"category": k, "amount": round(v, 2)} for k, v in rev_categories.items()]
    }
