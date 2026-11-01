-- ====================================================================
-- HOSPITAL PATIENT DATA ANALYSIS AND MANAGEMENT SYSTEM
-- Academic Deliverables: Sample Dataset Insertion Script (MySQL 8.0+)
-- ====================================================================

USE hospital_management_db;

-- 1. Insert Roles
INSERT INTO Roles (role_id, role_name, description) VALUES
(1, 'Admin', 'Super Administrator with complete system, audit, and credential approvals access.'),
(2, 'Doctor', 'Attending clinicians, diagnostic entry, admission orders, prescription and medical records.'),
(3, 'Nurse', 'Vital signs monitoring, triage assessment, bed allocation and status updates.'),
(4, 'Receptionist', 'Front desk registration, appointment scheduling, admissions intake and initial triage.'),
(5, 'Data Analyst', 'Healthcare biostatistician, predictive analytics, ML model evaluation and research reports.');

-- 2. Insert Departments
INSERT INTO Departments (department_id, department_name, head_of_department, contact_extension, floor_number, total_beds) VALUES
(1, 'General Medicine', 'Dr. Priya Nair', 'Ext-101', 1, 30),
(2, 'Cardiology', 'Dr. Sunita Sharma', 'Ext-201', 2, 25),
(3, 'Neurology', 'Dr. Anand Reddy', 'Ext-301', 3, 20),
(4, 'Orthopedics', 'Dr. Vikram Joshi', 'Ext-401', 4, 25),
(5, 'Pediatrics', 'Dr. Meera Iyer', 'Ext-501', 2, 20),
(6, 'Dermatology', 'Dr. Sanjay Pillai', 'Ext-601', 1, 15),
(7, 'Gynecology', 'Dr. Kavya Choudhury', 'Ext-701', 3, 25),
(8, 'Emergency', 'Dr. Manish Patel', 'Ext-911', 1, 35),
(9, 'Surgery', 'Dr. Suresh Kumar', 'Ext-801', 5, 20),
(10, 'Radiology', 'Dr. Deepak Verma', 'Ext-102', 1, 10);

-- 3. Insert Employees
INSERT INTO Hospital_Employees (employee_id, full_name, mobile_number, email, gender, age, address, qualification, department, designation, joining_date, status) VALUES
('EMP-001', 'Dr. Rajesh Varma', '9848022331', 'rajesh.varma@medpulse.org', 'Male', 52, 'Plot 14, Doctors Colony, Tirupati', 'MBBS, MD, MHA', 'Administration', 'Chief Medical Director', '2020-01-10', 'Active'),
('EMP-002', 'Dr. Sunita Sharma', '9848022332', 'sunita.sharma@medpulse.org', 'Female', 46, 'Apt 4B, Hillview Heights, Tirupati', 'MBBS, MD (Cardiology), DM', 'Cardiology', 'Senior Interventional Cardiologist', '2021-03-15', 'Active'),
('EMP-003', 'Dr. Anand Reddy', '9848022333', 'anand.reddy@medpulse.org', 'Male', 44, 'Villa 12, Golden Palms, Chandragiri Road', 'MBBS, DM (Neurology)', 'Neurology', 'Consultant Neurologist', '2021-06-01', 'Active'),
('EMP-004', 'Dr. Priya Nair', '9848022334', 'priya.nair@medpulse.org', 'Female', 39, 'Flat 202, Royal Residency, Tirupati', 'MBBS, MD (Internal Medicine)', 'General Medicine', 'General Physician Specialist', '2022-02-10', 'Active'),
('EMP-005', 'Dr. Vikram Joshi', '9848022335', 'vikram.joshi@medpulse.org', 'Male', 43, 'Plot 88, SV Nagar, Renigunta Road', 'MBBS, MS (Ortho)', 'Orthopedics', 'Orthopedic Surgeon', '2022-04-12', 'Active'),
('EMP-006', 'Dr. Meera Iyer', '9848022336', 'meera.iyer@medpulse.org', 'Female', 38, 'H-304, Green Meadows, Tirupati', 'MBBS, DCH, MD (Pediatrics)', 'Pediatrics', 'Pediatrician Consultant', '2022-08-20', 'Active'),
('EMP-007', 'Dr. Suresh Kumar', '9848022337', 'suresh.kumar@medpulse.org', 'Male', 49, 'Bungalow 7, Alipiri Enclave, Tirupati', 'MBBS, MS (Gen Surgery), FRCS', 'Surgery', 'Chief General Surgeon', '2020-11-15', 'Active'),
('EMP-008', 'Dr. Kavya Choudhury', '9848022338', 'kavya.c@medpulse.org', 'Female', 41, 'Plot 22, Postal Colony, Tirupati', 'MBBS, MS (OBG), DGO', 'Gynecology', 'Consultant Gynecologist', '2021-09-05', 'Active'),
('EMP-009', 'Dr. Manish Patel', '9848022339', 'manish.patel@medpulse.org', 'Male', 36, 'House 19, KT Road, Tirupati', 'MBBS, MEM (Emergency)', 'Emergency', 'Emergency Medical Officer', '2023-01-10', 'Active'),
('EMP-010', 'Nurse Divya Rao', '9848022340', 'divya.rao@medpulse.org', 'Female', 34, 'Flat 101, Annapurna Apts, Tirupati', 'B.Sc Nursing, Critical Care Cert.', 'ICU & Inpatient', 'Head Nursing Supervisor', '2022-05-18', 'Active'),
('EMP-011', 'Nurse Pooja Deshmukh', '9848022341', 'pooja.d@medpulse.org', 'Female', 29, 'Street 4, Padmavati Puram, Tirupati', 'GNM, B.Sc Nursing', 'Emergency', 'Triage Staff Nurse', '2023-03-01', 'Active'),
('EMP-012', 'Rohan Gupta', '9848022342', 'rohan.gupta@medpulse.org', 'Male', 28, 'Near RTC Complex, Tirupati', 'B.Com, Hospital PR Diploma', 'Front Desk', 'Senior Receptionist', '2023-04-15', 'Active'),
('EMP-013', 'Swati Mishra', '9848022343', 'swati.m@medpulse.org', 'Female', 26, 'Bhavani Nagar, Tirupati', 'BBA Healthcare Management', 'Front Desk', 'Admissions Executive', '2023-08-01', 'Active'),
('EMP-014', 'Aditya Singh', '9848022344', 'aditya.singh@medpulse.org', 'Male', 31, 'Tech Enclave, Karakambadi Road', 'B.Tech CS, M.Sc Data Science', 'Biostatistics & Quality', 'Lead Healthcare Data Scientist', '2022-10-10', 'Active'),
('EMP-015', 'Dr. Sanjay Pillai', '9848022345', 'sanjay.p@medpulse.org', 'Male', 42, 'Plot 55, MR Palli, Tirupati', 'MBBS, MD (DVL)', 'Dermatology', 'Consultant Dermatologist', '2021-12-01', 'Active');

-- 4. Insert Users (Password is hashed for 'Admin@123' / 'Staff@123')
INSERT INTO Users (employee_id, full_name, mobile_number, password_hash, role_id, is_approved, is_active) VALUES
('EMP-001', 'Dr. Rajesh Varma', '9848022331', '$2b$12$e6x8.QZ7bQZzXQ2rV9wX1eK8D4rX8lW0w7k8O3m0e2k3v5Y.a1b2c', 1, TRUE, TRUE),
('EMP-002', 'Dr. Sunita Sharma', '9848022332', '$2b$12$e6x8.QZ7bQZzXQ2rV9wX1eK8D4rX8lW0w7k8O3m0e2k3v5Y.a1b2c', 2, TRUE, TRUE),
('EMP-003', 'Dr. Anand Reddy', '9848022333', '$2b$12$e6x8.QZ7bQZzXQ2rV9wX1eK8D4rX8lW0w7k8O3m0e2k3v5Y.a1b2c', 2, TRUE, TRUE),
('EMP-004', 'Dr. Priya Nair', '9848022334', '$2b$12$e6x8.QZ7bQZzXQ2rV9wX1eK8D4rX8lW0w7k8O3m0e2k3v5Y.a1b2c', 2, TRUE, TRUE),
('EMP-010', 'Nurse Divya Rao', '9848022340', '$2b$12$e6x8.QZ7bQZzXQ2rV9wX1eK8D4rX8lW0w7k8O3m0e2k3v5Y.a1b2c', 3, TRUE, TRUE),
('EMP-012', 'Rohan Gupta', '9848022342', '$2b$12$e6x8.QZ7bQZzXQ2rV9wX1eK8D4rX8lW0w7k8O3m0e2k3v5Y.a1b2c', 4, TRUE, TRUE),
('EMP-014', 'Aditya Singh', '9848022344', '$2b$12$e6x8.QZ7bQZzXQ2rV9wX1eK8D4rX8lW0w7k8O3m0e2k3v5Y.a1b2c', 5, TRUE, TRUE);

-- 5. Insert Doctors
INSERT INTO Doctors (doctor_id, employee_id, doctor_name, specialization, department_id, mobile_number, email, qualification, experience_years, consultation_fee, availability_status) VALUES
('DOC-001', 'EMP-002', 'Dr. Sunita Sharma', 'Cardiology', 2, '9848022332', 'sunita.sharma@medpulse.org', 'MBBS, MD (Cardiology), DM', 18, 800.00, 'Available'),
('DOC-002', 'EMP-003', 'Dr. Anand Reddy', 'Neurology', 3, '9848022333', 'anand.reddy@medpulse.org', 'MBBS, DM (Neurology)', 15, 750.00, 'Available'),
('DOC-003', 'EMP-004', 'Dr. Priya Nair', 'General Medicine', 1, '9848022334', 'priya.nair@medpulse.org', 'MBBS, MD (Internal Med)', 12, 500.00, 'Available'),
('DOC-004', 'EMP-005', 'Dr. Vikram Joshi', 'Orthopedics', 4, '9848022335', 'vikram.joshi@medpulse.org', 'MBBS, MS (Ortho)', 14, 650.00, 'In Consultation'),
('DOC-005', 'EMP-006', 'Dr. Meera Iyer', 'Pediatrics', 5, '9848022336', 'meera.iyer@medpulse.org', 'MBBS, MD (Pediatrics)', 11, 550.00, 'Available'),
('DOC-006', 'EMP-007', 'Dr. Suresh Kumar', 'Surgery', 9, '9848022337', 'suresh.kumar@medpulse.org', 'MBBS, MS (Gen Surgery)', 22, 900.00, 'In Surgery'),
('DOC-007', 'EMP-008', 'Dr. Kavya Choudhury', 'Gynecology', 7, '9848022338', 'kavya.c@medpulse.org', 'MBBS, MS (OBG)', 13, 600.00, 'Available'),
('DOC-008', 'EMP-009', 'Dr. Manish Patel', 'Emergency Medicine', 8, '9848022339', 'manish.patel@medpulse.org', 'MBBS, MEM', 8, 700.00, 'Available'),
('DOC-009', 'EMP-015', 'Dr. Sanjay Pillai', 'Dermatology', 6, '9848022345', 'sanjay.p@medpulse.org', 'MBBS, MD (DVL)', 14, 500.00, 'Available');

-- 6. Insert Beds
INSERT INTO Beds (bed_id, bed_number, department_id, ward, bed_type, bed_status, daily_rate) VALUES
('BED-101', 'B-101', 1, 'General Medicine Ward', 'General Ward', 'Occupied', 800.00),
('BED-102', 'B-102', 1, 'General Medicine Ward', 'Semi-Private', 'Available', 1500.00),
('BED-103', 'B-103', 1, 'General Medicine Ward', 'Private Deluxe', 'Available', 3000.00),
('BED-201', 'B-201', 2, 'Cardiology CCU', 'ICU', 'Occupied', 5000.00),
('BED-202', 'B-202', 2, 'Cardiology Ward', 'Semi-Private', 'Available', 1800.00),
('BED-301', 'B-301', 3, 'Neurology Ward', 'General Ward', 'Occupied', 900.00),
('BED-401', 'B-401', 4, 'Orthopedic Ward', 'Semi-Private', 'Occupied', 1600.00),
('BED-501', 'B-501', 5, 'Pediatric Ward', 'Semi-Private', 'Available', 1400.00),
('BED-801', 'B-801', 8, 'Emergency Trauma Bay', 'Emergency Bed', 'Occupied', 2500.00),
('BED-802', 'B-802', 8, 'Emergency Triage', 'Emergency Bed', 'Available', 2500.00),
('BED-901', 'B-901', 9, 'Post-Op Surgical ICU', 'ICU', 'Maintenance', 5500.00);

-- 7. Insert Patients
INSERT INTO Patients (patient_id, full_name, age, dob, gender, mobile_number, address, blood_group, emergency_contact, registration_date, primary_diagnosis, medical_history, allergies, current_status, assigned_doctor_id) VALUES
('PAT-0001', 'Aarav Sharma', 45, '1981-04-12', 'Male', '919876543210', 'Plot 40, Tirupati Urban', 'B+', '919876543299', '2025-02-10', 'Viral Fever', 'Prior history of seasonal asthma.', 'Penicillin', 'Under Treatment', 'DOC-003'),
('PAT-0002', 'Sneha Reddy', 58, '1968-08-25', 'Female', '919876543211', 'Street 3, Chandragiri', 'O+', '919876543298', '2025-02-12', 'Coronary Artery Disease', 'Type 2 Diabetes, Dyslipidemia.', 'Sulfa Drugs', 'Admitted', 'DOC-001'),
('PAT-0003', 'Rohan Patel', 32, '1994-01-15', 'Male', '919876543212', 'House 12, Renigunta', 'A+', '919876543297', '2025-02-15', 'Bone Fracture', 'No prior surgical history.', 'None', 'Admitted', 'DOC-004'),
('PAT-0004', 'Kavya Verma', 28, '1998-11-04', 'Female', '919876543213', 'Main Road, Srikalahasti', 'AB+', '919876543296', '2025-02-18', 'Ischemic Stroke', 'Occasional migraine.', 'Aspirin', 'Emergency', 'DOC-002'),
('PAT-0005', 'Arjun Bose', 65, '1961-05-20', 'Male', '919876543214', 'Near Railway Station, Tirupati', 'O-', '919876543295', '2025-01-20', 'Pneumonia', 'Chronic smoker, hypertension.', 'None', 'Discharged', 'DOC-003'),
('PAT-0006', 'Divya Nair', 8, '2018-03-10', 'Female', '919876543215', 'Plot 18, Vidyavihar, MBU Area', 'B+', '919876543294', '2025-02-22', 'Acute Bronchitis', 'Healthy development profile.', 'None', 'Waiting for Consultation', 'DOC-005'),
('PAT-0007', 'Suresh Gupta', 52, '1974-09-30', 'Male', '919876543216', 'KT Road, Tirupati', 'A-', '919876543293', '2025-02-24', 'Hypertension', 'Hypertensive for 6 years.', 'Latex', 'Under Consultation', 'DOC-003'),
('PAT-0008', 'Pooja Singh', 34, '1992-07-19', 'Female', '919876543217', 'SV University Campus, Tirupati', 'AB-', '919876543292', '2025-02-25', 'Psoriasis', 'Skin flare ups during winter.', 'None', 'Registered', 'DOC-009');

-- 8. Insert Admissions
INSERT INTO Admissions (admission_id, patient_id, doctor_id, department_id, bed_id, admission_date, admission_reason, admission_status, discharge_date, discharge_summary) VALUES
('ADM-001', 'PAT-0002', 'DOC-001', 2, 'BED-201', '2025-02-12 14:30:00', 'Acute chest pain with ST segment elevation. Immediate angiography required.', 'Admitted', NULL, NULL),
('ADM-002', 'PAT-0003', 'DOC-004', 4, 'BED-401', '2025-02-15 11:00:00', 'Compound tibia-fibula fracture sustained in road accident. Open reduction fixation.', 'Admitted', NULL, NULL),
('ADM-003', 'PAT-0004', 'DOC-002', 8, 'BED-801', '2025-02-18 08:15:00', 'Sudden right-sided hemiparesis and speech dysarthria. Code stroke activated.', 'Admitted', NULL, NULL),
('ADM-004', 'PAT-0005', 'DOC-003', 1, 'BED-101', '2025-01-20 16:45:00', 'Bilateral lower lobe pneumonia with oxygen desaturation (SpO2 88%).', 'Discharged', '2025-01-28 12:00:00', 'Patient recovered well on IV Ceftriaxone & Azithromycin course. Stable vitals.');

-- 9. Insert Patient Status History
INSERT INTO Patient_Status_History (patient_id, previous_status, new_status, updated_by_employee_id, employee_name, remarks) VALUES
('PAT-0001', 'Registered', 'Waiting for Consultation', 'EMP-012', 'Rohan Gupta', 'Initial intake done, vitals checked.'),
('PAT-0001', 'Waiting for Consultation', 'Under Treatment', 'EMP-004', 'Dr. Priya Nair', 'Prescribed oral antipyretics and IV fluids.'),
('PAT-0002', 'Registered', 'Emergency', 'EMP-011', 'Nurse Pooja Deshmukh', 'Severe chest pain reported at triage.'),
('PAT-0002', 'Emergency', 'Admitted', 'EMP-002', 'Dr. Sunita Sharma', 'Transferred to CCU Bed B-201 for urgent observation.'),
('PAT-0003', 'Registered', 'Admitted', 'EMP-005', 'Dr. Vikram Joshi', 'Surgical repair scheduled. Bed B-401 allotted.'),
('PAT-0004', 'Registered', 'Emergency', 'EMP-009', 'Dr. Manish Patel', 'Acute neurological deficit, triage red flag.'),
('PAT-0005', 'Admitted', 'Discharged', 'EMP-004', 'Dr. Priya Nair', 'Discharged in stable condition with home medication instructions.');

-- 10. Insert Medical Records
INSERT INTO Medical_Records (record_id, patient_id, doctor_id, diagnosis, symptoms, treatment_notes, prescription_reference, test_results, record_date) VALUES
('REC-001', 'PAT-0001', 'DOC-003', 'Viral Fever with Dehydration', 'High grade fever (102 F), body ache, dry cough', 'Patient started on IV Paracetamol and Oral Rehydration Therapy.', 'Tab Paracetamol 650mg TDS, Tab Cetirizine 10mg OD', 'CBC: Mild Leukocytosis, Dengue NS1: Negative', '2025-02-10 10:15:00'),
('REC-002', 'PAT-0002', 'DOC-001', 'Acute Coronary Syndrome (NSTEMI)', 'Crushing retrosternal chest pain radiating to left arm, diaphoresis', 'Loaded with Aspirin 300mg + Clopidogrel 300mg. Planned for CAG.', 'Tab Atorvastatin 80mg, Inj Heparin 5000 IU IV', 'Troponin I: 4.8 ng/mL (Elevated), ECG: ST depression V4-V6', '2025-02-12 15:00:00'),
('REC-003', 'PAT-0003', 'DOC-004', 'Right Tibia Diaphyseal Fracture', 'Severe lower leg pain, deformity, inability to bear weight', 'Surgical reduction and intramedullary interlocking nail performed.', 'Inj Cefuroxime 1.5g IV BD, Tab Tramadol 50mg SOS', 'X-Ray Right Leg AP/Lat: Complete oblique displaced fracture', '2025-02-15 16:30:00');

-- 11. Insert Billing
INSERT INTO Billing (bill_id, patient_id, admission_id, consultation_charges, room_charges, medicine_charges, laboratory_charges, other_charges, payment_status, bill_date) VALUES
('BILL-001', 'PAT-0005', 'ADM-004', 3500.00, 6400.00, 4850.00, 3200.00, 1200.00, 'Paid', '2025-01-28 11:30:00'),
('BILL-002', 'PAT-0002', 'ADM-001', 5000.00, 15000.00, 8500.00, 6500.00, 2000.00, 'Partially Paid', '2025-02-16 18:00:00'),
('BILL-003', 'PAT-0001', NULL, 500.00, 0.00, 450.00, 800.00, 150.00, 'Paid', '2025-02-10 12:45:00');

-- 12. Insert Payments
INSERT INTO Payments (payment_id, bill_id, amount_paid, payment_mode, transaction_reference, payment_date, received_by_employee_id) VALUES
('PAY-001', 'BILL-001', 19150.00, 'Insurance', 'INS-TPA-9832104', '2025-01-28 11:45:00', 'EMP-012'),
('PAY-002', 'BILL-002', 20000.00, 'Credit Card', 'TXN-HDFC-9938210', '2025-02-16 18:30:00', 'EMP-013'),
('PAY-003', 'BILL-003', 1900.00, 'UPI', 'UPI/GPay/902837192', '2025-02-10 13:00:00', 'EMP-012');

-- 13. Insert Employee Attendance
INSERT INTO Employee_Attendance (employee_id, attendance_date, check_in_time, check_out_time, attendance_status, remarks) VALUES
('EMP-001', '2025-02-25', '08:45:00', '17:30:00', 'Present', 'On time'),
('EMP-002', '2025-02-25', '09:00:00', '18:15:00', 'Present', 'Attended emergency catheterization'),
('EMP-003', '2025-02-25', '09:10:00', '17:00:00', 'Present', 'Regular OPD and ward rounds'),
('EMP-004', '2025-02-25', '08:50:00', '17:10:00', 'Present', 'Full day clinical shift'),
('EMP-010', '2025-02-25', '07:00:00', '15:30:00', 'Present', 'Morning ICU duty shift'),
('EMP-012', '2025-02-25', '08:30:00', '16:30:00', 'Present', 'Front desk morning shift');
