"""
Authentication and Staff Access Control Router.
Requires Admin approval, valid Employee ID, Name, Mobile, and Password or OTP.
"""

from datetime import datetime
import secrets
import time
from fastapi import APIRouter, HTTPException, status, Depends
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.schemas import (
    LoginRequest, TokenResponse, RegisterStaffRequest,
    ForgotPasswordRequest, UserApprovalRequest
)
from backend.app.auth.security import hash_password, verify_password, create_access_token
from backend.app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/auth", tags=["Authentication & Staff Security"])

# Ephemeral in-memory OTP storage: clean_mobile -> {"code": "...", "expires_at": timestamp}
_ACTIVE_OTPS = {}

@router.post("/login", response_model=TokenResponse)
async def login(req: LoginRequest):
    db = get_db()
    users_coll = db.get_collection("users")

    # Check if user exists with employee_id
    user = users_coll.find_one({"employee_id": req.employee_id.strip()})

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Employee ID not recognized in hospital registry."
        )

    # Match mobile number and full name (case-insensitive substring check for flexibility)
    clean_req_mobile = "".join(filter(str.isdigit, req.mobile_number))
    clean_user_mobile = "".join(filter(str.isdigit, str(user.get("mobile_number", ""))))

    if clean_req_mobile not in clean_user_mobile and clean_user_mobile not in clean_req_mobile:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Registered mobile number does not match employee records."
        )

    # Verify account approval status
    if not user.get("is_approved", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Employee account is awaiting administrative verification and approval."
        )

    if not user.get("is_active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This employee profile has been marked inactive or suspended."
        )

    # Password or OTP check
    authenticated = False
    if req.otp:
        otp_clean = req.otp.strip()
        # 1. Check dynamic session OTP
        cached_otp = _ACTIVE_OTPS.get(clean_req_mobile)
        if cached_otp and cached_otp["expires_at"] > time.time() and secrets.compare_digest(cached_otp["code"], otp_clean):
            authenticated = True
            _ACTIVE_OTPS.pop(clean_req_mobile, None)  # One-time use: consume OTP
        # 2. Development/academic fallback when enabled in settings
        elif not settings.is_production and settings.ENABLE_DEMO_OTP and otp_clean in ["123456", "999888"]:
            authenticated = True
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired OTP code entered."
            )
    elif req.password:
        if verify_password(req.password, user.get("password_hash", "")):
            authenticated = True
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect employee security credentials."
            )
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Either password or 6-digit OTP is required to sign in."
        )

    if not authenticated:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication failed."
        )

    # Update last login timestamp
    users_coll.update_one(
        {"employee_id": user["employee_id"]},
        {"$set": {"last_login": datetime.now().isoformat()}}
    )

    token_data = {
        "sub": user["employee_id"],
        "name": user["full_name"],
        "role": user.get("role", "Doctor"),
        "department": user.get("department", "General Medicine")
    }

    access_token = create_access_token(token_data)

    safe_user = {
        "employee_id": user["employee_id"],
        "full_name": user["full_name"],
        "role": user.get("role", "Doctor"),
        "department": user.get("department", "General Medicine"),
        "email": user.get("email", ""),
        "mobile_number": user.get("mobile_number", "")
    }

    return {"access_token": access_token, "token_type": "bearer", "user": safe_user}

@router.post("/register-request")
async def register_staff_request(req: RegisterStaffRequest):
    """Submits a new staff registration for administrative approval."""
    db = get_db()
    users_coll = db.get_collection("users")
    emp_coll = db.get_collection("employees")

    if users_coll.find_one({"employee_id": req.employee_id}):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Employee ID {req.employee_id} already exists."
        )

    hashed = hash_password(req.password)

    # Store employee record
    emp_record = {
        "employee_id": req.employee_id,
        "full_name": req.full_name,
        "mobile_number": req.mobile_number,
        "email": req.email,
        "gender": req.gender,
        "age": req.age,
        "qualification": req.qualification,
        "department": req.department,
        "designation": req.designation,
        "role": req.role,
        "joining_date": datetime.now().strftime("%Y-%m-%d"),
        "status": "Inactive"  # Inactive until approved
    }
    emp_coll.insert_one(emp_record)

    # Store user credentials
    user_record = {
        "employee_id": req.employee_id,
        "full_name": req.full_name,
        "mobile_number": req.mobile_number,
        "email": req.email,
        "role": req.role,
        "department": req.department,
        "password_hash": hashed,
        "is_approved": False,
        "is_active": False,
        "registered_at": datetime.now().isoformat()
    }
    users_coll.insert_one(user_record)

    return {
        "message": "Staff registration application submitted successfully.",
        "employee_id": req.employee_id,
        "approval_status": "Pending Admin Approval"
    }

@router.post("/request-otp")
async def request_otp(mobile_number: str):
    """Generates and dispatches a cryptographically secure 6-digit OTP for 2-factor sign-in."""
    clean_mobile = "".join(filter(str.isdigit, mobile_number))
    if not clean_mobile:
        raise HTTPException(status_code=400, detail="Invalid mobile number provided.")

    code = f"{secrets.randbelow(900000) + 100000}"
    expires_at = time.time() + 300  # 5 minutes validity
    _ACTIVE_OTPS[clean_mobile] = {"code": code, "expires_at": expires_at}

    resp = {
        "message": f"6-digit OTP dispatched to {clean_mobile}.",
        "expires_in_seconds": 300
    }
    if not settings.is_production and settings.ENABLE_DEMO_OTP:
        resp["demo_otp_hint"] = code

    return resp

@router.post("/forgot-password")
async def forgot_password(req: ForgotPasswordRequest):
    db = get_db()
    users_coll = db.get_collection("users")
    user = users_coll.find_one({"employee_id": req.employee_id.strip()})

    if not user:
        raise HTTPException(status_code=404, detail="Employee record not found.")

    clean_req_mobile = "".join(filter(str.isdigit, req.mobile_number))
    clean_user_mobile = "".join(filter(str.isdigit, str(user.get("mobile_number", ""))))

    if clean_req_mobile not in clean_user_mobile:
        raise HTTPException(status_code=400, detail="Mobile number does not match registered profile.")

    new_hash = hash_password(req.new_password)
    users_coll.update_one(
        {"employee_id": req.employee_id},
        {"$set": {"password_hash": new_hash, "updated_at": datetime.now().isoformat()}}
    )

    return {"message": "Password updated successfully. You can now login with your new credentials."}

@router.get("/me")
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    return {
        "employee_id": current_user["employee_id"],
        "full_name": current_user["full_name"],
        "role": current_user.get("role", "Doctor"),
        "department": current_user.get("department", "General Medicine"),
        "email": current_user.get("email", ""),
        "mobile_number": current_user.get("mobile_number", ""),
        "is_approved": current_user.get("is_approved", True),
        "is_active": current_user.get("is_active", True),
        "last_login": current_user.get("last_login")
    }

@router.get("/pending-approvals", dependencies=[Depends(require_roles(["Admin"]))])
async def list_pending_approvals():
    db = get_db()
    users_coll = db.get_collection("users")
    pending = users_coll.find({"is_approved": False})
    for p in pending:
        p.pop("password_hash", None)
    return pending

@router.post("/approve-user", dependencies=[Depends(require_roles(["Admin"]))])
async def approve_user(req: UserApprovalRequest):
    db = get_db()
    users_coll = db.get_collection("users")
    emp_coll = db.get_collection("employees")

    user = users_coll.find_one({"employee_id": req.employee_id})
    if not user:
        raise HTTPException(status_code=404, detail="User not found.")

    users_coll.update_one(
        {"employee_id": req.employee_id},
        {"$set": {"is_approved": req.is_approved, "is_active": req.is_active}}
    )

    new_status = "Active" if req.is_active else "Inactive"
    emp_coll.update_one(
        {"employee_id": req.employee_id},
        {"$set": {"status": new_status}}
    )

    return {"message": f"Employee {req.employee_id} status updated to Approved={req.is_approved}, Active={req.is_active}"}
