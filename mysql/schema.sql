-- ====================================================================
-- HOSPITAL PATIENT DATA ANALYSIS AND MANAGEMENT SYSTEM
-- B.Tech CS-IT Academic Project - Mohan Babu University (MBU)
-- Database Architecture: MySQL Relational Schema
-- Includes: 13 Tables, Foreign Keys, Triggers, Views & Stored Procedures
-- ====================================================================

DROP DATABASE IF EXISTS hospital_management_db;
CREATE DATABASE hospital_management_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hospital_management_db;

-- --------------------------------------------------------------------
-- TABLE 1: Roles (Role-Based Access Control)
-- --------------------------------------------------------------------
CREATE TABLE Roles (
    role_id INT AUTO_INCREMENT PRIMARY KEY,
    role_name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- TABLE 2: Departments
-- --------------------------------------------------------------------
CREATE TABLE Departments (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE,
    head_of_department VARCHAR(100),
    contact_extension VARCHAR(20),
    floor_number INT DEFAULT 1,
    total_beds INT DEFAULT 20,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- TABLE 3: Hospital_Employees
-- --------------------------------------------------------------------
CREATE TABLE Hospital_Employees (
    employee_id VARCHAR(30) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    age INT NOT NULL CHECK (age >= 18 AND age <= 80),
    address TEXT NOT NULL,
    qualification VARCHAR(150) NOT NULL,
    department VARCHAR(100) NOT NULL,
    designation VARCHAR(100) NOT NULL,
    joining_date DATE NOT NULL,
    status ENUM('Active', 'Inactive', 'Suspended') DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- TABLE 4: Users (Authentication & Authorization)
-- --------------------------------------------------------------------
CREATE TABLE Users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL UNIQUE,
    full_name VARCHAR(100) NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id INT NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES Hospital_Employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- TABLE 5: Doctors
-- --------------------------------------------------------------------
CREATE TABLE Doctors (
    doctor_id VARCHAR(30) PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL UNIQUE,
    doctor_name VARCHAR(100) NOT NULL,
    specialization VARCHAR(100) NOT NULL,
    department_id INT NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    qualification VARCHAR(150) NOT NULL,
    experience_years INT NOT NULL CHECK (experience_years >= 0),
    consultation_fee DECIMAL(10, 2) DEFAULT 500.00,
    availability_status ENUM('Available', 'In Consultation', 'In Surgery', 'On Leave') DEFAULT 'Available',
    FOREIGN KEY (employee_id) REFERENCES Hospital_Employees(employee_id) ON DELETE CASCADE,
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- TABLE 6: Beds
-- --------------------------------------------------------------------
CREATE TABLE Beds (
    bed_id VARCHAR(30) PRIMARY KEY,
    bed_number VARCHAR(20) NOT NULL UNIQUE,
    department_id INT NOT NULL,
    ward VARCHAR(100) NOT NULL,
    bed_type ENUM('General Ward', 'Semi-Private', 'Private Deluxe', 'ICU', 'Emergency Bed') NOT NULL,
    bed_status ENUM('Available', 'Occupied', 'Maintenance') DEFAULT 'Available',
    daily_rate DECIMAL(10, 2) NOT NULL DEFAULT 1000.00,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (department_id) REFERENCES Departments(department_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- TABLE 7: Patients
-- --------------------------------------------------------------------
CREATE TABLE Patients (
    patient_id VARCHAR(30) PRIMARY KEY,
    full_name VARCHAR(100) NOT NULL,
    age INT NOT NULL CHECK (age >= 0 AND age <= 125),
    dob DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other') NOT NULL,
    mobile_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    blood_group ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-') NOT NULL,
    emergency_contact VARCHAR(20) NOT NULL,
    registration_date DATE NOT NULL,
    primary_diagnosis VARCHAR(150),
    medical_history TEXT,
    allergies VARCHAR(255) DEFAULT 'None',
    current_status ENUM(
        'Registered',
        'Waiting for Consultation',
        'Under Consultation',
        'Under Treatment',
        'Admitted',
        'Under Observation',
        'Emergency',
        'Discharged',
        'Referred to Another Hospital',
        'Deceased'
    ) DEFAULT 'Registered',
    assigned_doctor_id VARCHAR(30) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (assigned_doctor_id) REFERENCES Doctors(doctor_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- TABLE 8: Admissions
-- --------------------------------------------------------------------
CREATE TABLE Admissions (
    admission_id VARCHAR(30) PRIMARY KEY,
    patient_id VARCHAR(30) NOT NULL,
    doctor_id VARCHAR(30) NOT NULL,
    department_id INT NOT NULL,
    bed_id VARCHAR(30) NULL,
    admission_date DATETIME NOT NULL,
    admission_reason TEXT NOT NULL,
    admission_status ENUM('Admitted', 'Observation', 'Discharged', 'Transferred') DEFAULT 'Admitted',
    discharge_date DATETIME NULL,
    discharge_summary TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id),
    FOREIGN KEY (department_id) REFERENCES Departments(department_id),
    FOREIGN KEY (bed_id) REFERENCES Beds(bed_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- TABLE 9: Patient_Status_History
-- --------------------------------------------------------------------
CREATE TABLE Patient_Status_History (
    history_id INT AUTO_INCREMENT PRIMARY KEY,
    patient_id VARCHAR(30) NOT NULL,
    previous_status VARCHAR(50),
    new_status VARCHAR(50) NOT NULL,
    updated_by_employee_id VARCHAR(30) NOT NULL,
    employee_name VARCHAR(100) NOT NULL,
    remarks TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (updated_by_employee_id) REFERENCES Hospital_Employees(employee_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- TABLE 10: Medical_Records
-- --------------------------------------------------------------------
CREATE TABLE Medical_Records (
    record_id VARCHAR(30) PRIMARY KEY,
    patient_id VARCHAR(30) NOT NULL,
    doctor_id VARCHAR(30) NOT NULL,
    diagnosis VARCHAR(200) NOT NULL,
    symptoms TEXT NOT NULL,
    treatment_notes TEXT NOT NULL,
    prescription_reference TEXT,
    test_results TEXT,
    record_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (doctor_id) REFERENCES Doctors(doctor_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- TABLE 11: Billing
-- --------------------------------------------------------------------
CREATE TABLE Billing (
    bill_id VARCHAR(30) PRIMARY KEY,
    patient_id VARCHAR(30) NOT NULL,
    admission_id VARCHAR(30) NULL,
    consultation_charges DECIMAL(10, 2) DEFAULT 0.00,
    room_charges DECIMAL(10, 2) DEFAULT 0.00,
    medicine_charges DECIMAL(10, 2) DEFAULT 0.00,
    laboratory_charges DECIMAL(10, 2) DEFAULT 0.00,
    other_charges DECIMAL(10, 2) DEFAULT 0.00,
    total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (
        consultation_charges + room_charges + medicine_charges + laboratory_charges + other_charges
    ) STORED,
    payment_status ENUM('Pending', 'Partially Paid', 'Paid', 'Cancelled') DEFAULT 'Pending',
    bill_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES Patients(patient_id) ON DELETE CASCADE,
    FOREIGN KEY (admission_id) REFERENCES Admissions(admission_id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- TABLE 12: Payments
-- --------------------------------------------------------------------
CREATE TABLE Payments (
    payment_id VARCHAR(30) PRIMARY KEY,
    bill_id VARCHAR(30) NOT NULL,
    amount_paid DECIMAL(10, 2) NOT NULL,
    payment_mode ENUM('Cash', 'Credit Card', 'Debit Card', 'UPI', 'Net Banking', 'Insurance') NOT NULL,
    transaction_reference VARCHAR(100),
    payment_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    received_by_employee_id VARCHAR(30) NOT NULL,
    FOREIGN KEY (bill_id) REFERENCES Billing(bill_id) ON DELETE CASCADE,
    FOREIGN KEY (received_by_employee_id) REFERENCES Hospital_Employees(employee_id)
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- TABLE 13: Employee_Attendance
-- --------------------------------------------------------------------
CREATE TABLE Employee_Attendance (
    attendance_id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id VARCHAR(30) NOT NULL,
    attendance_date DATE NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    attendance_status ENUM('Present', 'Absent', 'On Leave', 'Late', 'Half Day') DEFAULT 'Present',
    remarks VARCHAR(255),
    UNIQUE KEY uq_emp_date (employee_id, attendance_date),
    FOREIGN KEY (employee_id) REFERENCES Hospital_Employees(employee_id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ====================================================================
-- VIEWS FOR ACADEMIC REPORTING & ANALYTICS
-- ====================================================================

-- 1. View for Active Inpatient Roster with Bed and Doctor Info
CREATE OR REPLACE VIEW View_Active_Inpatients AS
SELECT 
    p.patient_id,
    p.full_name AS patient_name,
    p.age,
    p.gender,
    p.current_status,
    a.admission_id,
    a.admission_date,
    d.department_name,
    doc.doctor_name,
    b.bed_number,
    b.bed_type,
    DATEDIFF(NOW(), a.admission_date) AS length_of_stay_days
FROM Patients p
JOIN Admissions a ON p.patient_id = a.patient_id
JOIN Departments d ON a.department_id = d.department_id
JOIN Doctors doc ON a.doctor_id = doc.doctor_id
LEFT JOIN Beds b ON a.bed_id = b.bed_id
WHERE a.admission_status IN ('Admitted', 'Observation');

-- 2. View for Department Bed Occupancy
CREATE OR REPLACE VIEW View_Department_Bed_Occupancy AS
SELECT 
    d.department_name,
    COUNT(b.bed_id) AS total_beds,
    SUM(CASE WHEN b.bed_status = 'Occupied' THEN 1 ELSE 0 END) AS occupied_beds,
    SUM(CASE WHEN b.bed_status = 'Available' THEN 1 ELSE 0 END) AS available_beds,
    SUM(CASE WHEN b.bed_status = 'Maintenance' THEN 1 ELSE 0 END) AS maintenance_beds,
    ROUND((SUM(CASE WHEN b.bed_status = 'Occupied' THEN 1 ELSE 0 END) / COUNT(b.bed_id)) * 100, 2) AS occupancy_percentage
FROM Departments d
LEFT JOIN Beds b ON d.department_id = b.department_id
GROUP BY d.department_id, d.department_name;

-- ====================================================================
-- STORED PROCEDURES
-- ====================================================================

DELIMITER $$

-- Procedure to Admit a Patient & Automatically Mark Bed as Occupied
CREATE PROCEDURE sp_AdmitPatient(
    IN p_admission_id VARCHAR(30),
    IN p_patient_id VARCHAR(30),
    IN p_doctor_id VARCHAR(30),
    IN p_dept_id INT,
    IN p_bed_id VARCHAR(30),
    IN p_reason TEXT,
    IN p_employee_id VARCHAR(30),
    IN p_employee_name VARCHAR(100)
)
BEGIN
    DECLARE old_status VARCHAR(50);
    
    SELECT current_status INTO old_status FROM Patients WHERE patient_id = p_patient_id;
    
    -- Insert Admission
    INSERT INTO Admissions (admission_id, patient_id, doctor_id, department_id, bed_id, admission_date, admission_reason, admission_status)
    VALUES (p_admission_id, p_patient_id, p_doctor_id, p_dept_id, p_bed_id, NOW(), p_reason, 'Admitted');
    
    -- Update Patient Status
    UPDATE Patients 
    SET current_status = 'Admitted', assigned_doctor_id = p_doctor_id, updated_at = NOW()
    WHERE patient_id = p_patient_id;
    
    -- Update Bed Status
    IF p_bed_id IS NOT NULL THEN
        UPDATE Beds SET bed_status = 'Occupied' WHERE bed_id = p_bed_id;
    END IF;
    
    -- Record Status History
    INSERT INTO Patient_Status_History (patient_id, previous_status, new_status, updated_by_employee_id, employee_name, remarks)
    VALUES (p_patient_id, old_status, 'Admitted', p_employee_id, p_employee_name, CONCAT('Patient admitted. Bed assigned: ', IFNULL(p_bed_id, 'None')));
END$$

-- Procedure to Discharge Patient & Free Assigned Bed
CREATE PROCEDURE sp_DischargePatient(
    IN p_admission_id VARCHAR(30),
    IN p_discharge_summary TEXT,
    IN p_employee_id VARCHAR(30),
    IN p_employee_name VARCHAR(100)
)
BEGIN
    DECLARE v_pat_id VARCHAR(30);
    DECLARE v_bed_id VARCHAR(30);
    DECLARE old_status VARCHAR(50);
    
    SELECT patient_id, bed_id INTO v_pat_id, v_bed_id 
    FROM Admissions WHERE admission_id = p_admission_id;
    
    SELECT current_status INTO old_status FROM Patients WHERE patient_id = v_pat_id;
    
    -- Update Admission Record
    UPDATE Admissions 
    SET admission_status = 'Discharged', discharge_date = NOW(), discharge_summary = p_discharge_summary 
    WHERE admission_id = p_admission_id;
    
    -- Free the Bed
    IF v_bed_id IS NOT NULL THEN
        UPDATE Beds SET bed_status = 'Available' WHERE bed_id = v_bed_id;
    END IF;
    
    -- Update Patient Status
    UPDATE Patients 
    SET current_status = 'Discharged', updated_at = NOW() 
    WHERE patient_id = v_pat_id;
    
    -- Record Status History
    INSERT INTO Patient_Status_History (patient_id, previous_status, new_status, updated_by_employee_id, employee_name, remarks)
    VALUES (v_pat_id, old_status, 'Discharged', p_employee_id, p_employee_name, p_discharge_summary);
END$$

DELIMITER ;

-- ====================================================================
-- TRIGGERS
-- ====================================================================

DELIMITER $$

-- Trigger to track status changes automatically if updated directly on Patients table
CREATE TRIGGER trg_Patient_Status_Audit
AFTER UPDATE ON Patients
FOR EACH ROW
BEGIN
    IF OLD.current_status != NEW.current_status THEN
        INSERT INTO Patient_Status_History (
            patient_id, previous_status, new_status, updated_by_employee_id, employee_name, remarks
        ) VALUES (
            NEW.patient_id,
            OLD.current_status,
            NEW.current_status,
            'SYS-AUTO',
            'System Automated Trigger',
            'Status updated via clinical record or direct patient table update'
        );
    END IF;
END$$

DELIMITER ;
