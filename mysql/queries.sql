-- ====================================================================
-- HOSPITAL PATIENT DATA ANALYSIS AND MANAGEMENT SYSTEM
-- Academic SQL Queries Deliverable (Joins, Aggregates, CTEs, Window Functions)
-- Mohan Babu University - B.Tech Project Evaluation
-- ====================================================================

USE hospital_management_db;

-- --------------------------------------------------------------------
-- QUERY 1: Multi-Table JOIN: Complete Inpatient Clinical Summary
-- Retrieves patient, attending doctor, department, allocated bed, and days admitted
-- --------------------------------------------------------------------
SELECT 
    p.patient_id,
    p.full_name AS patient_name,
    p.age,
    p.gender,
    p.blood_group,
    p.current_status,
    d.department_name,
    doc.doctor_name,
    b.bed_number,
    b.bed_type,
    a.admission_date,
    DATEDIFF(NOW(), a.admission_date) AS current_stay_days
FROM Patients p
INNER JOIN Admissions a ON p.patient_id = a.patient_id
INNER JOIN Doctors doc ON a.doctor_id = doc.doctor_id
INNER JOIN Departments d ON a.department_id = d.department_id
LEFT JOIN Beds b ON a.bed_id = b.bed_id
WHERE a.admission_status = 'Admitted'
ORDER BY a.admission_date ASC;

-- --------------------------------------------------------------------
-- QUERY 2: Department-wise Patient Count and Occupancy Rate
-- --------------------------------------------------------------------
SELECT 
    d.department_name,
    d.head_of_department,
    COUNT(DISTINCT p.patient_id) AS total_patients_managed,
    SUM(CASE WHEN b.bed_status = 'Occupied' THEN 1 ELSE 0 END) AS occupied_beds,
    COUNT(DISTINCT b.bed_id) AS total_department_beds,
    ROUND((SUM(CASE WHEN b.bed_status = 'Occupied' THEN 1 ELSE 0 END) / NULLIF(COUNT(DISTINCT b.bed_id), 0)) * 100, 2) AS occupancy_percentage
FROM Departments d
LEFT JOIN Beds b ON d.department_id = b.department_id
LEFT JOIN Admissions a ON d.department_id = a.department_id
LEFT JOIN Patients p ON a.patient_id = p.patient_id
GROUP BY d.department_id, d.department_name, d.head_of_department
ORDER BY occupied_beds DESC;

-- --------------------------------------------------------------------
-- QUERY 3: Patient Status Distribution with Percentage of Total
-- --------------------------------------------------------------------
SELECT 
    current_status,
    COUNT(*) AS patient_count,
    ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM Patients)), 2) AS status_percentage
FROM Patients
GROUP BY current_status
ORDER BY patient_count DESC;

-- --------------------------------------------------------------------
-- QUERY 4: Doctor Workload and Patient Consultation Volume
-- --------------------------------------------------------------------
SELECT 
    doc.doctor_id,
    doc.doctor_name,
    doc.specialization,
    d.department_name,
    doc.availability_status,
    COUNT(DISTINCT p.patient_id) AS total_active_patients,
    COUNT(DISTINCT a.admission_id) AS total_admissions_supervised
FROM Doctors doc
INNER JOIN Departments d ON doc.department_id = d.department_id
LEFT JOIN Patients p ON doc.doctor_id = p.assigned_doctor_id
LEFT JOIN Admissions a ON doc.doctor_id = a.doctor_id
GROUP BY doc.doctor_id, doc.doctor_name, doc.specialization, d.department_name, doc.availability_status
ORDER BY total_active_patients DESC;

-- --------------------------------------------------------------------
-- QUERY 5: Financial Revenue Analysis by Department and Payment Status
-- --------------------------------------------------------------------
SELECT 
    COALESCE(d.department_name, 'Outpatient OPD') AS department,
    b.payment_status,
    COUNT(b.bill_id) AS total_invoices,
    SUM(b.consultation_charges) AS sum_consultations,
    SUM(b.room_charges) AS sum_room_charges,
    SUM(b.medicine_charges) AS sum_pharmacy,
    SUM(b.laboratory_charges) AS sum_diagnostics,
    SUM(b.total_amount) AS total_billed_revenue
FROM Billing b
LEFT JOIN Admissions a ON b.admission_id = a.admission_id
LEFT JOIN Departments d ON a.department_id = d.department_id
GROUP BY d.department_name, b.payment_status
ORDER BY total_billed_revenue DESC;

-- --------------------------------------------------------------------
-- QUERY 6: Patient Status Audit Trail (History Inspection)
-- --------------------------------------------------------------------
SELECT 
    h.history_id,
    h.patient_id,
    p.full_name AS patient_name,
    h.previous_status,
    h.new_status,
    h.employee_name AS updated_by_staff,
    h.updated_at,
    h.remarks
FROM Patient_Status_History h
INNER JOIN Patients p ON h.patient_id = p.patient_id
ORDER BY h.updated_at DESC;

-- --------------------------------------------------------------------
-- QUERY 7: Common Pathologies & Disease Distribution by Age Demographics
-- --------------------------------------------------------------------
SELECT 
    CASE 
        WHEN age < 18 THEN 'Pediatric (0-17)'
        WHEN age BETWEEN 18 AND 35 THEN 'Young Adult (18-35)'
        WHEN age BETWEEN 36 AND 60 THEN 'Middle Aged (36-60)'
        ELSE 'Senior Citizen (61+)'
    END AS age_group,
    primary_diagnosis,
    COUNT(*) AS diagnosis_count
FROM Patients
WHERE primary_diagnosis IS NOT NULL
GROUP BY age_group, primary_diagnosis
ORDER BY age_group, diagnosis_count DESC;

-- --------------------------------------------------------------------
-- QUERY 8: Average Length of Stay (ALOS) for Discharged Patients
-- --------------------------------------------------------------------
SELECT 
    d.department_name,
    COUNT(a.admission_id) AS discharged_patient_count,
    ROUND(AVG(TIMESTAMPDIFF(HOUR, a.admission_date, a.discharge_date) / 24.0), 2) AS avg_length_of_stay_days,
    MIN(TIMESTAMPDIFF(HOUR, a.admission_date, a.discharge_date) / 24.0) AS min_stay_days,
    MAX(TIMESTAMPDIFF(HOUR, a.admission_date, a.discharge_date) / 24.0) AS max_stay_days
FROM Admissions a
INNER JOIN Departments d ON a.department_id = d.department_id
WHERE a.admission_status = 'Discharged' AND a.discharge_date IS NOT NULL
GROUP BY d.department_id, d.department_name;
