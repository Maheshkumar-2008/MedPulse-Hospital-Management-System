"""
Synthetic Dataset Generator for Hospital Patient Data Analysis and Management System.
Generates realistic healthcare datasets for research, machine learning, and academic simulation.
"""

import os
import random
import csv
from datetime import datetime, timedelta

DATASETS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "datasets")
os.makedirs(DATASETS_DIR, exist_ok=True)

# Seed for reproducible academic demonstration
random.seed(42)

DEPARTMENTS = [
    "General Medicine", "Cardiology", "Neurology", "Orthopedics",
    "Pediatrics", "Dermatology", "Gynecology", "Emergency",
    "Surgery", "Radiology"
]

DISEASES = {
    "General Medicine": ["Viral Fever", "Type 2 Diabetes", "Hypertension", "Dengue Fever", "Pneumonia"],
    "Cardiology": ["Coronary Artery Disease", "Myocardial Infarction", "Heart Failure", "Arrhythmia"],
    "Neurology": ["Ischemic Stroke", "Migraine", "Epilepsy", "Parkinson Disease"],
    "Orthopedics": ["Bone Fracture", "Osteoarthritis", "Lumbar Spondylosis", "ACL Tear"],
    "Pediatrics": ["Acute Bronchitis", "Neonatal Jaundice", "Asthma", "Gastroenteritis"],
    "Dermatology": ["Psoriasis", "Eczema", "Contact Dermatitis", "Urticaria"],
    "Gynecology": ["Pre-eclampsia", "Ovarian Cyst", "Normal Delivery", "Pelvic Inflammatory Disease"],
    "Emergency": ["Acute Trauma", "Septic Shock", "Severe Respiratory Distress", "Cardiac Arrest"],
    "Surgery": ["Appendicitis", "Cholecystitis", "Inguinal Hernia", "Intestinal Obstruction"],
    "Radiology": ["CT Scan Workup", "MRI Brain Evaluation", "Ultrasound Abdomen Followup"]
}

FIRST_NAMES_MALE = ["Aarav", "Rohan", "Vikram", "Rahul", "Aditya", "Suresh", "Kiran", "Amit", "Manish", "Rajesh", "Deepak", "Vivek", "Naveen", "Anand", "Sanjay", "Mahesh", "Pranav", "Gautam", "Harish", "Arjun"]
FIRST_NAMES_FEMALE = ["Priya", "Ananya", "Sneha", "Kavya", "Divya", "Pooja", "Sunita", "Swati", "Neha", "Meera", "Lakshmi", "Anjali", "Bhavya", "Sangeeta", "Deepa", "Rekha", "Shreya", "Nandini", "Anita", "Ritu"]
LAST_NAMES = ["Sharma", "Verma", "Reddy", "Patel", "Rao", "Nair", "Gupta", "Kumar", "Singh", "Choudhury", "Iyer", "Joshi", "Bose", "Mehta", "Mishra", "Deshmukh", "Pillai", "Kulkarni", "Das", "Yadav"]

BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"]

STATUSES = [
    "Registered", "Waiting for Consultation", "Under Consultation",
    "Under Treatment", "Admitted", "Under Observation",
    "Emergency", "Discharged", "Referred to Another Hospital", "Deceased"
]

BED_TYPES = ["General Ward", "Semi-Private", "Private Deluxe", "ICU", "Emergency Bed"]

def generate_patients(count=250):
    patients = []
    base_date = datetime(2025, 1, 1)

    for i in range(1, count + 1):
        pid = f"PAT-{i:04d}"
        gender = random.choice(["Male", "Female"])
        first_name = random.choice(FIRST_NAMES_MALE if gender == "Male" else FIRST_NAMES_FEMALE)
        last_name = random.choice(LAST_NAMES)
        name = f"{first_name} {last_name}"
        
        age = random.choices(
            population=[random.randint(1, 17), random.randint(18, 35), random.randint(36, 60), random.randint(61, 88)],
            weights=[15, 30, 35, 20]
        )[0]
        
        dob_year = 2026 - age
        dob = f"{dob_year}-{random.randint(1,12):02d}-{random.randint(1,28):02d}"
        phone = f"+91 {random.choice([9, 8, 7, 6])}{random.randint(100000000, 999999999)}"
        address = f"House #{random.randint(10, 499)}, Street {random.randint(1, 15)}, Tirupati / Chittoor, AP"
        blood_group = random.choice(BLOOD_GROUPS)
        emergency_contact = f"+91 {random.choice([9, 8, 7, 6])}{random.randint(100000000, 999999999)}"
        
        reg_days = random.randint(0, 300)
        reg_date = (base_date + timedelta(days=reg_days)).strftime("%Y-%m-%d")

        allergies_list = ["Penicillin", "Sulfa Drugs", "Aspirin", "Peanuts", "Latex", "None", "None", "None"]
        allergies = random.choice(allergies_list)

        dept = random.choice(DEPARTMENTS)
        disease = random.choice(DISEASES[dept])
        
        status_weights = [10, 15, 12, 18, 20, 10, 5, 8, 1, 1]
        status = random.choices(STATUSES, weights=status_weights)[0]
        
        patients.append({
            "patient_id": pid,
            "full_name": name,
            "age": age,
            "dob": dob,
            "gender": gender,
            "mobile_number": phone,
            "address": address,
            "blood_group": blood_group,
            "emergency_contact": emergency_contact,
            "registration_date": reg_date,
            "department": dept,
            "primary_diagnosis": disease,
            "medical_history": f"Prior history of {random.choice(['mild hypertension', 'occasional asthma', 'seasonal allergies', 'none', 'healthy profile'])}.",
            "allergies": allergies,
            "current_status": status
        })
    return patients

def generate_employees():
    employees = [
        {"employee_id": "EMP-001", "full_name": "Dr. Rajesh Varma", "role": "Admin", "department": "Administration", "designation": "Chief Medical Director", "gender": "Male", "age": 52, "mobile_number": "+91 9848022331", "email": "rajesh.varma@medpulse.org", "qualification": "MBBS, MD, MHA", "joining_date": "2020-01-10", "status": "Active"},
        {"employee_id": "EMP-002", "full_name": "Dr. Sunita Sharma", "role": "Doctor", "department": "Cardiology", "designation": "Senior Interventional Cardiologist", "gender": "Female", "age": 46, "mobile_number": "+91 9848022332", "email": "sunita.sharma@medpulse.org", "qualification": "MBBS, MD (Cardiology), DM", "joining_date": "2021-03-15", "status": "Active"},
        {"employee_id": "EMP-003", "full_name": "Dr. Anand Reddy", "role": "Doctor", "department": "Neurology", "designation": "Consultant Neurologist", "gender": "Male", "age": 44, "mobile_number": "+91 9848022333", "email": "anand.reddy@medpulse.org", "qualification": "MBBS, DM (Neurology)", "joining_date": "2021-06-01", "status": "Active"},
        {"employee_id": "EMP-004", "full_name": "Dr. Priya Nair", "role": "Doctor", "department": "General Medicine", "designation": "General Physician Specialist", "gender": "Female", "age": 39, "mobile_number": "+91 9848022334", "email": "priya.nair@medpulse.org", "qualification": "MBBS, MD (Internal Medicine)", "joining_date": "2022-02-10", "status": "Active"},
        {"employee_id": "EMP-005", "full_name": "Dr. Vikram Joshi", "role": "Doctor", "department": "Orthopedics", "designation": "Orthopedic Surgeon", "gender": "Male", "age": 43, "mobile_number": "+91 9848022335", "email": "vikram.joshi@medpulse.org", "qualification": "MBBS, MS (Ortho)", "joining_date": "2022-04-12", "status": "Active"},
        {"employee_id": "EMP-006", "full_name": "Dr. Meera Iyer", "role": "Doctor", "department": "Pediatrics", "designation": "Pediatrician Consultant", "gender": "Female", "age": 38, "mobile_number": "+91 9848022336", "email": "meera.iyer@medpulse.org", "qualification": "MBBS, DCH, MD (Pediatrics)", "joining_date": "2022-08-20", "status": "Active"},
        {"employee_id": "EMP-007", "full_name": "Dr. Suresh Kumar", "role": "Doctor", "department": "Surgery", "designation": "Chief General Surgeon", "gender": "Male", "age": 49, "mobile_number": "+91 9848022337", "email": "suresh.kumar@medpulse.org", "qualification": "MBBS, MS (Gen Surgery), FRCS", "joining_date": "2020-11-15", "status": "Active"},
        {"employee_id": "EMP-008", "full_name": "Dr. Kavya Choudhury", "role": "Doctor", "department": "Gynecology", "designation": "Consultant Obstetrician & Gynecologist", "gender": "Female", "age": 41, "mobile_number": "+91 9848022338", "email": "kavya.c@medpulse.org", "qualification": "MBBS, MS (OBG), DGO", "joining_date": "2021-09-05", "status": "Active"},
        {"employee_id": "EMP-009", "full_name": "Dr. Manish Patel", "role": "Doctor", "department": "Emergency", "designation": "Emergency Medical Officer", "gender": "Male", "age": 36, "mobile_number": "+91 9848022339", "email": "manish.patel@medpulse.org", "qualification": "MBBS, MEM (Emergency Medicine)", "joining_date": "2023-01-10", "status": "Active"},
        {"employee_id": "EMP-010", "full_name": "Nurse Divya Rao", "role": "Nurse", "department": "ICU & Inpatient", "designation": "Head Nursing Supervisor", "gender": "Female", "age": 34, "mobile_number": "+91 9848022340", "email": "divya.rao@medpulse.org", "qualification": "B.Sc Nursing, Critical Care Cert.", "joining_date": "2022-05-18", "status": "Active"},
        {"employee_id": "EMP-011", "full_name": "Nurse Pooja Deshmukh", "role": "Nurse", "department": "Emergency", "designation": "Triage Staff Nurse", "gender": "Female", "age": 29, "mobile_number": "+91 9848022341", "email": "pooja.d@medpulse.org", "qualification": "GNM, B.Sc Nursing", "joining_date": "2023-03-01", "status": "Active"},
        {"employee_id": "EMP-012", "full_name": "Rohan Gupta", "role": "Receptionist", "department": "Front Desk", "designation": "Senior Patient Relations Officer", "gender": "Male", "age": 28, "mobile_number": "+91 9848022342", "email": "rohan.gupta@medpulse.org", "qualification": "B.Com, Hospital PR Diploma", "joining_date": "2023-04-15", "status": "Active"},
        {"employee_id": "EMP-013", "full_name": "Swati Mishra", "role": "Receptionist", "department": "Front Desk", "designation": "Front Desk Admissions Executive", "gender": "Female", "age": 26, "mobile_number": "+91 9848022343", "email": "swati.m@medpulse.org", "qualification": "BBA Healthcare Management", "joining_date": "2023-08-01", "status": "Active"},
        {"employee_id": "EMP-014", "full_name": "Aditya Singh", "role": "Data Analyst", "department": "Biostatistics & Quality", "designation": "Lead Healthcare Data Scientist", "gender": "Male", "age": 31, "mobile_number": "+91 9848022344", "email": "aditya.singh@medpulse.org", "qualification": "B.Tech CS, M.Sc Data Science", "joining_date": "2022-10-10", "status": "Active"},
        {"employee_id": "EMP-015", "full_name": "Sanjay Pillai", "role": "Doctor", "department": "Dermatology", "designation": "Consultant Dermatologist", "gender": "Male", "age": 42, "mobile_number": "+91 9848022345", "email": "sanjay.p@medpulse.org", "qualification": "MBBS, MD (DVL)", "joining_date": "2021-12-01", "status": "Active"},
    ]
    return employees

def generate_beds():
    beds = []
    bed_num = 101
    for dept in DEPARTMENTS[:8]:
        for b in range(1, 6):
            b_id = f"BED-{bed_num}"
            b_type = random.choice(BED_TYPES)
            status = random.choice(["Available", "Occupied", "Available", "Occupied", "Maintenance"])
            beds.append({
                "bed_id": b_id,
                "bed_number": f"B-{bed_num}",
                "department": dept,
                "ward": f"{dept} Ward - Level {random.randint(1, 4)}",
                "bed_type": b_type,
                "bed_status": status
            })
            bed_num += 1
    return beds

def save_to_csv(data, filename):
    if not data:
        return
    path = os.path.join(DATASETS_DIR, filename)
    keys = data[0].keys()
    with open(path, mode="w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(data)
    print(f"Generated {filename} with {len(data)} records at {path}")

def generate_all():
    print("Generating comprehensive synthetic hospital datasets...")
    patients = generate_patients(300)
    employees = generate_employees()
    beds = generate_beds()
    
    save_to_csv(patients, "synthetic_patients.csv")
    save_to_csv(employees, "synthetic_employees.csv")
    save_to_csv(beds, "synthetic_beds.csv")
    
    # Generate ML specific dataset
    ml_data = []
    for p in patients:
        # Age, BMI, Blood Pressure Systolic, Glucose, Prior Admissions, Length of Stay, Readmitted 30d
        bmi = round(random.uniform(18.5, 38.0), 1)
        bp_systolic = random.randint(95, 175)
        glucose = random.randint(70, 260)
        charlson_index = random.randint(0, 5)
        prior_admissions = random.randint(0, 4)
        
        # Length of stay is correlated with age, charlson_index, prior_admissions
        los_base = 2.0 + (p["age"] * 0.05) + (charlson_index * 1.5) + (prior_admissions * 0.8) + (1.5 if bp_systolic > 140 else 0)
        los = max(1, round(los_base + random.gauss(0, 1.2), 1))
        
        # Readmission probability increases with age, charlson_index, los, and prior admissions
        risk_score = 0.05 + (p["age"] * 0.004) + (charlson_index * 0.08) + (prior_admissions * 0.12) + (los * 0.02)
        readmitted_30d = 1 if (random.random() < min(0.85, risk_score)) else 0
        
        # Triage severity category (1: Low, 2: Medium, 3: High, 4: Critical)
        if p["current_status"] == "Emergency":
            triage_level = "Critical"
        elif p["current_status"] in ["Admitted", "Under Observation"]:
            triage_level = random.choice(["Medium", "High"])
        else:
            triage_level = random.choice(["Low", "Medium"])

        ml_data.append({
            "patient_id": p["patient_id"],
            "age": p["age"],
            "gender": p["gender"],
            "department": p["department"],
            "primary_diagnosis": p["primary_diagnosis"],
            "bmi": bmi,
            "systolic_bp": bp_systolic,
            "glucose_level": glucose,
            "comorbidity_score": charlson_index,
            "prior_admissions_count": prior_admissions,
            "length_of_stay_days": los,
            "readmitted_30_days": readmitted_30d,
            "triage_urgency_level": triage_level,
            "current_status": p["current_status"]
        })
    
    save_to_csv(ml_data, "synthetic_ml_patient_data.csv")
    print("All datasets successfully generated!")

def generate_synthetic_dataset(n_samples=250):
    """Generates synthetic patient dataset as a pandas DataFrame."""
    import pandas as pd
    pts = generate_patients(n_samples)
    return pd.DataFrame(pts)

if __name__ == "__main__":
    generate_all()
