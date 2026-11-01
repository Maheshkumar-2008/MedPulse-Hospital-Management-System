# Entity Relationship (ER) Diagram & Relational Schema Specification
## Hospital Patient Data Analysis and Management System
**Mohan Babu University (MBU) - B.Tech CS-IT Project**

### 1. Conceptual and Logical Database Architecture
The database follows Boyce-Codd Normal Form (BCNF) / 3NF to eliminate redundancy, avoid update anomalies, and enforce clinical referential integrity.

```mermaid
erDiagram
    ROLES ||--o{ USERS : "assigned to"
    HOSPITAL_EMPLOYEES ||--|| USERS : "authenticates as"
    HOSPITAL_EMPLOYEES ||--o| DOCTORS : "specializes as"
    HOSPITAL_EMPLOYEES ||--o{ EMPLOYEE_ATTENDANCE : "logs"
    HOSPITAL_EMPLOYEES ||--o{ PATIENT_STATUS_HISTORY : "updates"
    HOSPITAL_EMPLOYEES ||--o{ PAYMENTS : "receipts"
    
    DEPARTMENTS ||--o{ DOCTORS : "employs"
    DEPARTMENTS ||--o{ BEDS : "allocates"
    DEPARTMENTS ||--o{ ADMISSIONS : "admits into"
    
    PATIENTS ||--o{ PATIENT_STATUS_HISTORY : "tracks"
    PATIENTS ||--o{ ADMISSIONS : "receives"
    PATIENTS ||--o{ MEDICAL_RECORDS : "maintains"
    PATIENTS ||--o{ BILLING : "invoiced for"
    
    DOCTORS ||--o{ PATIENTS : "primary attending"
    DOCTORS ||--o{ ADMISSIONS : "admits"
    DOCTORS ||--o{ MEDICAL_RECORDS : "authors"
    
    BEDS ||--o| ADMISSIONS : "hosts"
    ADMISSIONS ||--o| BILLING : "generates"
    BILLING ||--o{ PAYMENTS : "settled by"

    ROLES {
        int role_id PK
        string role_name
        string description
    }

    HOSPITAL_EMPLOYEES {
        string employee_id PK
        string full_name
        string mobile_number UK
        string email UK
        string gender
        int age
        string qualification
        string department
        string designation
        date joining_date
        string status
    }

    USERS {
        int user_id PK
        string employee_id FK,UK
        string full_name
        string mobile_number
        string password_hash
        int role_id FK
        boolean is_approved
        boolean is_active
    }

    DOCTORS {
        string doctor_id PK
        string employee_id FK,UK
        string doctor_name
        string specialization
        int department_id FK
        string qualification
        int experience_years
        decimal consultation_fee
        string availability_status
    }

    DEPARTMENTS {
        int department_id PK
        string department_name UK
        string head_of_department
        string contact_extension
        int floor_number
        int total_beds
    }

    BEDS {
        string bed_id PK
        string bed_number UK
        int department_id FK
        string ward
        string bed_type
        string bed_status
        decimal daily_rate
    }

    PATIENTS {
        string patient_id PK
        string full_name
        int age
        date dob
        string gender
        string mobile_number
        string blood_group
        string emergency_contact
        date registration_date
        string primary_diagnosis
        string current_status
        string assigned_doctor_id FK
    }

    ADMISSIONS {
        string admission_id PK
        string patient_id FK
        string doctor_id FK
        int department_id FK
        string bed_id FK
        datetime admission_date
        string admission_reason
        string admission_status
        datetime discharge_date
    }

    PATIENT_STATUS_HISTORY {
        int history_id PK
        string patient_id FK
        string previous_status
        string new_status
        string updated_by_employee_id FK
        string employee_name
        string remarks
        timestamp updated_at
    }

    MEDICAL_RECORDS {
        string record_id PK
        string patient_id FK
        string doctor_id FK
        string diagnosis
        string symptoms
        string treatment_notes
        string prescription_reference
        datetime record_date
    }

    BILLING {
        string bill_id PK
        string patient_id FK
        string admission_id FK
        decimal consultation_charges
        decimal room_charges
        decimal medicine_charges
        decimal laboratory_charges
        decimal other_charges
        decimal total_amount
        string payment_status
        datetime bill_date
    }

    PAYMENTS {
        string payment_id PK
        string bill_id FK
        decimal amount_paid
        string payment_mode
        string transaction_reference
        datetime payment_date
        string received_by_employee_id FK
    }

    EMPLOYEE_ATTENDANCE {
        int attendance_id PK
        string employee_id FK
        date attendance_date
        time check_in_time
        time check_out_time
        string attendance_status
    }
```

### 2. Entity Constraints and Cardinalities
- **Role to User**: 1-to-Many (`Roles.role_id` $\rightarrow$ `Users.role_id`).
- **Employee to User**: 1-to-1 (`Hospital_Employees.employee_id` $\rightarrow$ `Users.employee_id`).
- **Employee to Doctor**: 1-to-1 (`Hospital_Employees.employee_id` $\rightarrow$ `Doctors.employee_id`).
- **Patient to Status History**: 1-to-Many (`Patients.patient_id` $\rightarrow$ `Patient_Status_History.patient_id`).
- **Patient to Admissions**: 1-to-Many (`Patients.patient_id` $\rightarrow$ `Admissions.patient_id`).
- **Department to Beds**: 1-to-Many (`Departments.department_id` $\rightarrow$ `Beds.department_id`).
- **Admission to Bed**: 1-to-1 optional relationship for in-patient bed allocation.
- **Billing to Payments**: 1-to-Many (`Billing.bill_id` $\rightarrow$ `Payments.bill_id`).
