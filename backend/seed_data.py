"""
Initial Data Seeder for Hospital Patient Data Analysis and Management System.
Automatically populates database collections on first startup with realistic healthcare data.
"""

import os
import sys

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from datetime import datetime
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.auth.security import hash_password
from machine_learning.dataset_generator import generate_patients, generate_employees, generate_beds, generate_all

def seed_database():
    if settings.is_production:
        print("[Seeder] Production environment detected. Automatic seeding is disabled to protect existing patient records.")
        return

    print("[Seeder] Initializing Hospital Database Seed...")
    db = get_db()
    
    # 1. Departments
    dept_coll = db.get_collection("departments")
    if dept_coll.count_documents() == 0:
        departments_data = [
            {"department_id": 1, "department_name": "General Medicine", "head_of_department": "Dr. Priya Nair", "contact_extension": "Ext-101", "floor_number": 1, "total_beds": 30},
            {"department_id": 2, "department_name": "Cardiology", "head_of_department": "Dr. Sunita Sharma", "contact_extension": "Ext-201", "floor_number": 2, "total_beds": 25},
            {"department_id": 3, "department_name": "Neurology", "head_of_department": "Dr. Anand Reddy", "contact_extension": "Ext-301", "floor_number": 3, "total_beds": 20},
            {"department_id": 4, "department_name": "Orthopedics", "head_of_department": "Dr. Vikram Joshi", "contact_extension": "Ext-401", "floor_number": 4, "total_beds": 25},
            {"department_id": 5, "department_name": "Pediatrics", "head_of_department": "Dr. Meera Iyer", "contact_extension": "Ext-501", "floor_number": 2, "total_beds": 20},
            {"department_id": 6, "department_name": "Dermatology", "head_of_department": "Dr. Sanjay Pillai", "contact_extension": "Ext-601", "floor_number": 1, "total_beds": 15},
            {"department_id": 7, "department_name": "Gynecology", "head_of_department": "Dr. Kavya Choudhury", "contact_extension": "Ext-701", "floor_number": 3, "total_beds": 25},
            {"department_id": 8, "department_name": "Emergency", "head_of_department": "Dr. Manish Patel", "contact_extension": "Ext-911", "floor_number": 1, "total_beds": 35},
            {"department_id": 9, "department_name": "Surgery", "head_of_department": "Dr. Suresh Kumar", "contact_extension": "Ext-801", "floor_number": 5, "total_beds": 20},
            {"department_id": 10, "department_name": "Radiology", "head_of_department": "Dr. Deepak Verma", "contact_extension": "Ext-102", "floor_number": 1, "total_beds": 10}
        ]
        dept_coll.insert_many(departments_data)
        print(f"[Seeder] Inserted {len(departments_data)} hospital departments.")

    # 2. Employees & Users
    emp_coll = db.get_collection("employees")
    users_coll = db.get_collection("users")
    if emp_coll.count_documents() == 0:
        raw_employees = generate_employees()
        emp_coll.insert_many(raw_employees)
        
        # Create users
        for emp in raw_employees:
            pw = "Admin@123" if emp["role"] == "Admin" else "Staff@123"
            users_coll.insert_one({
                "employee_id": emp["employee_id"],
                "full_name": emp["full_name"],
                "mobile_number": emp["mobile_number"],
                "email": emp["email"],
                "role": emp["role"],
                "department": emp["department"],
                "password_hash": hash_password(pw),
                "is_approved": True,
                "is_active": True,
                "created_at": datetime.now().isoformat()
            })
        print(f"[Seeder] Seeded {len(raw_employees)} employees and corresponding approved user accounts.")

    # 3. Doctors
    doc_coll = db.get_collection("doctors")
    if doc_coll.count_documents() == 0:
        doctors_data = [
            {"doctor_id": "DOC-001", "employee_id": "EMP-002", "doctor_name": "Dr. Sunita Sharma", "specialization": "Cardiology", "department": "Cardiology", "mobile_number": "+91 9848022332", "email": "sunita.sharma@medpulse.org", "qualification": "MBBS, MD (Cardiology), DM", "experience_years": 18, "consultation_fee": 800.0, "availability_status": "Available"},
            {"doctor_id": "DOC-002", "employee_id": "EMP-003", "doctor_name": "Dr. Anand Reddy", "specialization": "Neurology", "department": "Neurology", "mobile_number": "+91 9848022333", "email": "anand.reddy@medpulse.org", "qualification": "MBBS, DM (Neurology)", "experience_years": 15, "consultation_fee": 750.0, "availability_status": "Available"},
            {"doctor_id": "DOC-003", "employee_id": "EMP-004", "doctor_name": "Dr. Priya Nair", "specialization": "General Medicine", "department": "General Medicine", "mobile_number": "+91 9848022334", "email": "priya.nair@medpulse.org", "qualification": "MBBS, MD (Internal Med)", "experience_years": 12, "consultation_fee": 500.0, "availability_status": "Available"},
            {"doctor_id": "DOC-004", "employee_id": "EMP-005", "doctor_name": "Dr. Vikram Joshi", "specialization": "Orthopedics", "department": "Orthopedics", "mobile_number": "+91 9848022335", "email": "vikram.joshi@medpulse.org", "qualification": "MBBS, MS (Ortho)", "experience_years": 14, "consultation_fee": 650.0, "availability_status": "In Consultation"},
            {"doctor_id": "DOC-005", "employee_id": "EMP-006", "doctor_name": "Dr. Meera Iyer", "specialization": "Pediatrics", "department": "Pediatrics", "mobile_number": "+91 9848022336", "email": "meera.iyer@medpulse.org", "qualification": "MBBS, MD (Pediatrics)", "experience_years": 11, "consultation_fee": 550.0, "availability_status": "Available"},
            {"doctor_id": "DOC-006", "employee_id": "EMP-007", "doctor_name": "Dr. Suresh Kumar", "specialization": "Surgery", "department": "Surgery", "mobile_number": "+91 9848022337", "email": "suresh.kumar@medpulse.org", "qualification": "MBBS, MS (Gen Surgery)", "experience_years": 22, "consultation_fee": 900.0, "availability_status": "In Surgery"},
            {"doctor_id": "DOC-007", "employee_id": "EMP-008", "doctor_name": "Dr. Kavya Choudhury", "specialization": "Gynecology", "department": "Gynecology", "mobile_number": "+91 9848022338", "email": "kavya.c@medpulse.org", "qualification": "MBBS, MS (OBG)", "experience_years": 13, "consultation_fee": 600.0, "availability_status": "Available"},
            {"doctor_id": "DOC-008", "employee_id": "EMP-009", "doctor_name": "Dr. Manish Patel", "specialization": "Emergency Medicine", "department": "Emergency", "mobile_number": "+91 9848022339", "email": "manish.patel@medpulse.org", "qualification": "MBBS, MEM", "experience_years": 8, "consultation_fee": 700.0, "availability_status": "Available"},
            {"doctor_id": "DOC-009", "employee_id": "EMP-015", "doctor_name": "Dr. Sanjay Pillai", "specialization": "Dermatology", "department": "Dermatology", "mobile_number": "+91 9848022345", "email": "sanjay.p@medpulse.org", "qualification": "MBBS, MD (DVL)", "experience_years": 14, "consultation_fee": 500.0, "availability_status": "Available"},
        ]
        doc_coll.insert_many(doctors_data)
        print(f"[Seeder] Inserted {len(doctors_data)} specialized doctors.")

    # 4. Beds
    beds_coll = db.get_collection("beds")
    if beds_coll.count_documents() == 0:
        raw_beds = generate_beds()
        beds_coll.insert_many(raw_beds)
        print(f"[Seeder] Inserted {len(raw_beds)} hospital beds.")

    # 5. Patients
    pat_coll = db.get_collection("patients")
    hist_coll = db.get_collection("status_history")
    if pat_coll.count_documents() == 0:
        raw_patients = generate_patients(120)
        
        # Assign doctors to patients
        doc_ids = ["DOC-001", "DOC-002", "DOC-003", "DOC-004", "DOC-005", "DOC-006", "DOC-007", "DOC-008", "DOC-009"]
        for idx, p in enumerate(raw_patients):
            p["assigned_doctor_id"] = doc_ids[idx % len(doc_ids)]
            p["created_at"] = p["registration_date"]
            if p["current_status"] in ["Admitted", "Under Observation", "Emergency"]:
                p["bed_id"] = f"BED-{101 + (idx % 30)}"
            else:
                p["bed_id"] = None

        pat_coll.insert_many(raw_patients)
        
        # Populate initial status history records
        for p in raw_patients[:35]:
            hist_coll.insert_one({
                "patient_id": p["patient_id"],
                "patient_name": p["full_name"],
                "previous_status": "Registered",
                "new_status": p["current_status"],
                "updated_by_employee_id": "EMP-001",
                "employee_name": "Dr. Rajesh Varma",
                "remarks": f"Clinical status determined during intake assessment for {p['primary_diagnosis']}.",
                "timestamp": p["registration_date"] + "T10:30:00"
            })
        print(f"[Seeder] Seeded {len(raw_patients)} patients with status tracking histories.")

    # 6. Admissions
    adm_coll = db.get_collection("admissions")
    if adm_coll.count_documents() == 0:
        admissions_sample = [
            {"admission_id": "ADM-001", "patient_id": "PAT-0002", "doctor_id": "DOC-001", "department": "Cardiology", "bed_id": "BED-102", "admission_date": "2025-02-12T14:30:00", "admission_reason": "Acute coronary chest pain requiring continuous monitoring", "admission_status": "Admitted", "discharge_date": None, "discharge_summary": None},
            {"admission_id": "ADM-002", "patient_id": "PAT-0003", "doctor_id": "DOC-004", "department": "Orthopedics", "bed_id": "BED-103", "admission_date": "2025-02-15T11:00:00", "admission_reason": "Compound tibia fracture surgical fixation", "admission_status": "Admitted", "discharge_date": None, "discharge_summary": None},
            {"admission_id": "ADM-003", "patient_id": "PAT-0004", "doctor_id": "DOC-002", "department": "Emergency", "bed_id": "BED-105", "admission_date": "2025-02-18T08:15:00", "admission_reason": "Acute ischemic stroke triage and thrombolytic assessment", "admission_status": "Admitted", "discharge_date": None, "discharge_summary": None},
            {"admission_id": "ADM-004", "patient_id": "PAT-0005", "doctor_id": "DOC-003", "department": "General Medicine", "bed_id": "BED-101", "admission_date": "2025-01-20T16:45:00", "admission_reason": "Severe pneumonia with hypoxemia", "admission_status": "Discharged", "discharge_date": "2025-01-28T12:00:00", "discharge_summary": "Full recovery with IV antibiotics course; SpO2 stable at 98% room air."}
        ]
        adm_coll.insert_many(admissions_sample)
        print(f"[Seeder] Seeded {len(admissions_sample)} admissions.")

    # 7. Medical Records
    rec_coll = db.get_collection("medical_records")
    if rec_coll.count_documents() == 0:
        med_records_sample = [
            {"record_id": "REC-0001", "patient_id": "PAT-0001", "doctor_id": "DOC-003", "diagnosis": "Viral Pyrexia with Myalgia", "symptoms": "High fever, chills, body ache for 3 days", "treatment_notes": "Hydration therapy and antipyretics administered. Patient responding well.", "prescription_reference": "Tab Paracetamol 650mg TDS, ORS sachet 1 daily", "test_results": "Dengue NS1 Antigen: Negative. Platelets: 210,000/mcL", "record_date": "2025-02-10T10:15:00"},
            {"record_id": "REC-0002", "patient_id": "PAT-0002", "doctor_id": "DOC-001", "diagnosis": "Acute Coronary Syndrome (NSTEMI)", "symptoms": "Retrosternal chest tightness radiating to neck", "treatment_notes": "Dual antiplatelet loaded, scheduled for coronary angiography.", "prescription_reference": "Tab Atorvastatin 80mg OD, Tab Clopidogrel 75mg OD", "test_results": "Troponin I: 3.4 ng/mL, ECG shows ST depression in V4-V6", "record_date": "2025-02-12T15:00:00"},
            {"record_id": "REC-0003", "patient_id": "PAT-0003", "doctor_id": "DOC-004", "diagnosis": "Right Tibia Diaphyseal Fracture", "symptoms": "Severe pain, swelling, inability to bear weight", "treatment_notes": "Closed reduction and internal interlocking nail fixation executed.", "prescription_reference": "Inj Cefuroxime 1.5g IV BD, Tab Tramadol 50mg SOS", "test_results": "X-Ray: Complete oblique fracture middle third of right tibia", "record_date": "2025-02-15T16:30:00"}
        ]
        rec_coll.insert_many(med_records_sample)
        print(f"[Seeder] Seeded {len(med_records_sample)} medical records.")

    # 8. Billing
    bill_coll = db.get_collection("billing")
    if bill_coll.count_documents() == 0:
        bills_sample = [
            {"bill_id": "BILL-0001", "patient_id": "PAT-0005", "admission_id": "ADM-004", "consultation_charges": 3500.0, "room_charges": 6400.0, "medicine_charges": 4850.0, "laboratory_charges": 3200.0, "other_charges": 1200.0, "total_amount": 19150.0, "payment_status": "Paid", "bill_date": "2025-01-28T11:30:00"},
            {"bill_id": "BILL-0002", "patient_id": "PAT-0002", "admission_id": "ADM-001", "consultation_charges": 5000.0, "room_charges": 15000.0, "medicine_charges": 8500.0, "laboratory_charges": 6500.0, "other_charges": 2000.0, "total_amount": 37000.0, "payment_status": "Partially Paid", "bill_date": "2025-02-16T18:00:00"},
            {"bill_id": "BILL-0003", "patient_id": "PAT-0001", "admission_id": None, "consultation_charges": 500.0, "room_charges": 0.0, "medicine_charges": 450.0, "laboratory_charges": 800.0, "other_charges": 150.0, "total_amount": 1900.0, "payment_status": "Paid", "bill_date": "2025-02-10T12:45:00"},
            {"bill_id": "BILL-0004", "patient_id": "PAT-0003", "admission_id": "ADM-002", "consultation_charges": 4500.0, "room_charges": 12000.0, "medicine_charges": 6000.0, "laboratory_charges": 4500.0, "other_charges": 1500.0, "total_amount": 28500.0, "payment_status": "Pending", "bill_date": "2025-02-17T10:00:00"}
        ]
        bill_coll.insert_many(bills_sample)
        print(f"[Seeder] Seeded {len(bills_sample)} hospital billing records.")

    # 9. Attendance
    att_coll = db.get_collection("attendance")
    if att_coll.count_documents() == 0:
        att_sample = [
            {"attendance_id": "ATT-001", "employee_id": "EMP-001", "employee_name": "Dr. Rajesh Varma", "attendance_date": "2025-02-25", "check_in_time": "08:45:00", "check_out_time": "17:30:00", "attendance_status": "Present", "remarks": "On time"},
            {"attendance_id": "ATT-002", "employee_id": "EMP-002", "employee_name": "Dr. Sunita Sharma", "attendance_date": "2025-02-25", "check_in_time": "09:00:00", "check_out_time": "18:15:00", "attendance_status": "Present", "remarks": "Attended catheterization lab"},
            {"attendance_id": "ATT-003", "employee_id": "EMP-004", "employee_name": "Dr. Priya Nair", "attendance_date": "2025-02-25", "check_in_time": "08:50:00", "check_out_time": "17:10:00", "attendance_status": "Present", "remarks": "Full OPD duty"}
        ]
        att_coll.insert_many(att_sample)
        print(f"[Seeder] Seeded employee attendance records.")

    print("[Seeder] Database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
