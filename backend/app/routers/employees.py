"""
Hospital Employee Management Router.
"""

from datetime import datetime
from typing import Optional, List
from fastapi import APIRouter, HTTPException, Depends, Query, status
from backend.app.database import get_db
from backend.app.models.schemas import EmployeeCreate, EmployeeUpdate
from backend.app.auth.dependencies import get_current_user, require_roles
from backend.app.auth.security import hash_password

router = APIRouter(prefix="/employees", tags=["Hospital Employees"])

@router.get("/")
async def get_all_employees(
    search: Optional[str] = None,
    department: Optional[str] = None,
    role: Optional[str] = None,
    status_filter: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    emp_coll = db.get_collection("employees")
    all_emps = emp_coll.find()
    
    results = []
    for emp in all_emps:
        if search:
            q = search.lower()
            name_match = q in emp.get("full_name", "").lower()
            id_match = q in emp.get("employee_id", "").lower()
            mobile_match = q in emp.get("mobile_number", "").lower()
            if not (name_match or id_match or mobile_match):
                continue
        if department and emp.get("department") != department:
            continue
        if role and emp.get("role") != role:
            continue
        if status_filter and emp.get("status") != status_filter:
            continue
        results.append(emp)
    return results

@router.get("/statistics")
async def get_employee_statistics(current_user: dict = Depends(get_current_user)):
    db = get_db()
    emp_coll = db.get_collection("employees")
    all_emps = emp_coll.find()
    
    total = len(all_emps)
    active = sum(1 for e in all_emps if e.get("status") == "Active")
    inactive = sum(1 for e in all_emps if e.get("status") != "Active")
    
    dept_counts = {}
    role_counts = {}
    for e in all_emps:
        dept = e.get("department", "Other")
        dept_counts[dept] = dept_counts.get(dept, 0) + 1
        
        r = e.get("role", "Doctor")
        role_counts[r] = role_counts.get(r, 0) + 1
        
    return {
        "total_employees": total,
        "active_employees": active,
        "inactive_employees": inactive,
        "department_distribution": dept_counts,
        "role_distribution": role_counts
    }

@router.get("/attendance")
async def get_employee_attendance(current_user: dict = Depends(get_current_user)):
    db = get_db()
    att_coll = db.get_collection("attendance")
    records = att_coll.find()
    return records

@router.post("/attendance/mark")
async def mark_attendance(
    attendance_status: str = "Present",
    remarks: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    att_coll = db.get_collection("attendance")
    today = datetime.now().strftime("%Y-%m-%d")
    now_time = datetime.now().strftime("%H:%M:%S")
    
    existing = att_coll.find_one({
        "employee_id": current_user["employee_id"],
        "attendance_date": today
    })
    
    if existing:
        att_coll.update_one(
            {"attendance_id": existing["attendance_id"]},
            {"$set": {"check_out_time": now_time, "attendance_status": attendance_status, "remarks": remarks}}
        )
        return {"message": "Attendance check-out recorded."}
    else:
        new_record = {
            "attendance_id": f"ATT-{int(datetime.now().timestamp())}",
            "employee_id": current_user["employee_id"],
            "employee_name": current_user.get("full_name", ""),
            "attendance_date": today,
            "check_in_time": now_time,
            "check_out_time": None,
            "attendance_status": attendance_status,
            "remarks": remarks or "Self logged"
        }
        att_coll.insert_one(new_record)
        return {"message": "Attendance check-in recorded successfully.", "record": new_record}

@router.get("/{employee_id}")
async def get_employee_profile(employee_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    emp = db.get_collection("employees").find_one({"employee_id": employee_id})
    if not emp:
        raise HTTPException(status_code=404, detail="Employee not found")
    return emp

@router.post("/", dependencies=[Depends(require_roles(["Admin"]))])
async def create_employee(emp: EmployeeCreate):
    db = get_db()
    emp_coll = db.get_collection("employees")
    users_coll = db.get_collection("users")
    
    if emp_coll.find_one({"employee_id": emp.employee_id}):
        raise HTTPException(status_code=400, detail="Employee ID already exists.")
        
    doc = emp.dict()
    doc["created_at"] = datetime.now().isoformat()
    emp_coll.insert_one(doc)
    
    # Also create approved user account
    default_pw_hash = hash_password("Staff@123")
    user_doc = {
        "employee_id": emp.employee_id,
        "full_name": emp.full_name,
        "mobile_number": emp.mobile_number,
        "email": emp.email,
        "role": emp.role,
        "department": emp.department,
        "password_hash": default_pw_hash,
        "is_approved": True,
        "is_active": (emp.status == "Active"),
        "created_at": datetime.now().isoformat()
    }
    users_coll.insert_one(user_doc)
    
    return {"message": "Employee created successfully with active credentials.", "employee": doc}

@router.put("/{employee_id}", dependencies=[Depends(require_roles(["Admin"]))])
async def update_employee(employee_id: str, updates: EmployeeUpdate):
    db = get_db()
    emp_coll = db.get_collection("employees")
    users_coll = db.get_collection("users")
    
    existing = emp_coll.find_one({"employee_id": employee_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Employee not found.")
        
    update_data = {k: v for k, v in updates.dict().items() if v is not None}
    if not update_data:
        return {"message": "No fields to update."}
        
    emp_coll.update_one({"employee_id": employee_id}, {"$set": update_data})
    
    # Sync with users collection
    user_updates = {}
    if "full_name" in update_data:
        user_updates["full_name"] = update_data["full_name"]
    if "role" in update_data:
        user_updates["role"] = update_data["role"]
    if "status" in update_data:
        user_updates["is_active"] = (update_data["status"] == "Active")
    if user_updates:
        users_coll.update_one({"employee_id": employee_id}, {"$set": user_updates})
        
    return {"message": f"Employee {employee_id} updated successfully."}

@router.delete("/{employee_id}", dependencies=[Depends(require_roles(["Admin"]))])
async def deactivate_employee(employee_id: str):
    db = get_db()
    emp_coll = db.get_collection("employees")
    users_coll = db.get_collection("users")
    
    emp_coll.update_one({"employee_id": employee_id}, {"$set": {"status": "Inactive"}})
    users_coll.update_one({"employee_id": employee_id}, {"$set": {"is_active": False}})
    
    return {"message": f"Employee {employee_id} has been deactivated from active hospital staff roster."}
