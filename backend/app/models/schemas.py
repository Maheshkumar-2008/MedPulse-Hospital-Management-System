"""
Pydantic Schemas for Hospital Data Analysis & Management API.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field
from datetime import date, datetime

# Authentication Schemas
class LoginRequest(BaseModel):
    full_name: str
    mobile_number: str
    employee_id: str
    password: Optional[str] = None
    otp: Optional[str] = None

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class RegisterStaffRequest(BaseModel):
    employee_id: str
    full_name: str
    mobile_number: str
    email: str
    gender: str
    age: int
    qualification: str
    department: str
    designation: str
    password: str
    role: str = "Doctor"

class ForgotPasswordRequest(BaseModel):
    employee_id: str
    mobile_number: str
    new_password: str

class UserApprovalRequest(BaseModel):
    employee_id: str
    is_approved: bool
    is_active: bool

# Employee Schemas
class EmployeeBase(BaseModel):
    employee_id: str
    full_name: str
    mobile_number: str
    email: str
    gender: str
    age: int
    address: str
    qualification: str
    department: str
    designation: str
    role: str
    joining_date: str
    status: str = "Active"

class EmployeeCreate(EmployeeBase):
    pass

class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = None
    mobile_number: Optional[str] = None
    email: Optional[str] = None
    gender: Optional[str] = None
    age: Optional[int] = None
    address: Optional[str] = None
    qualification: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    role: Optional[str] = None
    status: Optional[str] = None

# Patient Schemas
class PatientBase(BaseModel):
    patient_id: Optional[str] = None
    full_name: str
    age: int
    dob: str
    gender: str
    mobile_number: str
    address: str
    blood_group: str
    emergency_contact: str
    registration_date: Optional[str] = None
    department: Optional[str] = "General Medicine"
    primary_diagnosis: Optional[str] = None
    medical_history: Optional[str] = "None reported"
    allergies: Optional[str] = "None"
    current_status: Optional[str] = "Registered"
    assigned_doctor_id: Optional[str] = None
    bed_id: Optional[str] = None

class PatientCreate(PatientBase):
    pass

class PatientUpdate(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None
    dob: Optional[str] = None
    gender: Optional[str] = None
    mobile_number: Optional[str] = None
    address: Optional[str] = None
    blood_group: Optional[str] = None
    emergency_contact: Optional[str] = None
    department: Optional[str] = None
    primary_diagnosis: Optional[str] = None
    medical_history: Optional[str] = None
    allergies: Optional[str] = None
    assigned_doctor_id: Optional[str] = None
    bed_id: Optional[str] = None

# Patient Status Tracking
class StatusUpdateRequest(BaseModel):
    patient_id: str
    new_status: str
    remarks: Optional[str] = "Status updated"
    assigned_doctor_id: Optional[str] = None
    bed_number: Optional[str] = None
    department: Optional[str] = None

class StatusHistoryRecord(BaseModel):
    patient_id: str
    previous_status: str
    new_status: str
    updated_by_employee_id: str
    employee_name: str
    remarks: Optional[str] = None
    timestamp: str

# Doctor Schemas
class DoctorBase(BaseModel):
    doctor_id: str
    employee_id: str
    doctor_name: str
    specialization: str
    department: str
    mobile_number: str
    email: str
    qualification: str
    experience_years: int
    consultation_fee: float = 500.0
    availability_status: str = "Available"

class DoctorCreate(DoctorBase):
    pass

class DoctorUpdate(BaseModel):
    doctor_name: Optional[str] = None
    specialization: Optional[str] = None
    department: Optional[str] = None
    mobile_number: Optional[str] = None
    email: Optional[str] = None
    qualification: Optional[str] = None
    experience_years: Optional[int] = None
    consultation_fee: Optional[float] = None
    availability_status: Optional[str] = None

# Department Schemas
class DepartmentBase(BaseModel):
    department_id: Optional[int] = None
    department_name: str
    head_of_department: str
    contact_extension: str
    floor_number: int = 1
    total_beds: int = 20

# Admission Schemas
class AdmissionCreate(BaseModel):
    patient_id: str
    doctor_id: str
    department: str
    bed_id: Optional[str] = None
    admission_reason: str
    admission_date: Optional[str] = None

class DischargeCreate(BaseModel):
    admission_id: str
    discharge_summary: str
    follow_up_advice: Optional[str] = "Rest and medication adherence"

# Bed Schemas
class BedBase(BaseModel):
    bed_id: str
    bed_number: str
    department: str
    ward: str
    bed_type: str
    bed_status: str = "Available"
    daily_rate: float = 1000.0

class BedUpdate(BaseModel):
    department: Optional[str] = None
    ward: Optional[str] = None
    bed_type: Optional[str] = None
    bed_status: Optional[str] = None
    daily_rate: Optional[float] = None

# Medical Records Schemas
class MedicalRecordCreate(BaseModel):
    patient_id: str
    doctor_id: str
    diagnosis: str
    symptoms: str
    treatment_notes: str
    prescription_reference: Optional[str] = None
    test_results: Optional[str] = None

# Billing Schemas
class BillingCreate(BaseModel):
    patient_id: str
    admission_id: Optional[str] = None
    consultation_charges: float = 0.0
    room_charges: float = 0.0
    medicine_charges: float = 0.0
    laboratory_charges: float = 0.0
    other_charges: float = 0.0

class PaymentRecord(BaseModel):
    bill_id: str
    amount_paid: float
    payment_mode: str
    transaction_reference: Optional[str] = None

# Machine Learning Prediction Schemas
class LOSPredictionRequest(BaseModel):
    age: int
    comorbidity_score: int
    prior_admissions_count: int
    systolic_bp: int
    glucose_level: int
    department: str = "General Medicine"

class ReadmissionPredictionRequest(BaseModel):
    age: int
    comorbidity_score: int
    prior_admissions_count: int
    length_of_stay_days: float
    systolic_bp: int
    glucose_level: int
    bmi: float

class TriagePredictionRequest(BaseModel):
    age: int
    systolic_bp: int
    glucose_level: int
    symptom_severity: int = 3  # 1 to 5 scale
    is_emergency_onset: bool = False
