"""
Hospital Patient Data Analysis and Management System - Main FastAPI Backend.
B.Tech CS-IT Academic Capstone Project - Mohan Babu University.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from backend.app.config import settings
from backend.seed_data import seed_database
from machine_learning.model_evaluator import ml_engine

# Import Routers
from backend.app.routers import (
    auth, employees, patients, patient_status,
    doctors, departments, admissions, beds,
    medical_records, billing, analytics, ml, reports
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed database and warm-up ML models
    try:
        seed_database()
    except Exception as e:
        print(f"[Startup Warning] Seeder encountered: {e}")
        
    try:
        ml_engine.ensure_trained()
    except Exception as e:
        print(f"[Startup Warning] ML Engine warm-up: {e}")
        
    yield
    # Shutdown logic if required
    print("[Shutdown] MedPulse Hospital Management API shutting down cleanly.")

app = FastAPI(
    title="Hospital Patient Data Analysis & Management System API",
    description="Full-Stack Healthcare Administration & Machine Learning Backend for Academic Research and Hospital Operations.",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Middleware (Enable seamless communication with React frontend and Streamlit)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount all feature routers under /api/v1
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(employees.router, prefix=settings.API_V1_STR)
app.include_router(patients.router, prefix=settings.API_V1_STR)
app.include_router(patient_status.router, prefix=settings.API_V1_STR)
app.include_router(doctors.router, prefix=settings.API_V1_STR)
app.include_router(departments.router, prefix=settings.API_V1_STR)
app.include_router(admissions.router, prefix=settings.API_V1_STR)
app.include_router(beds.router, prefix=settings.API_V1_STR)
app.include_router(medical_records.router, prefix=settings.API_V1_STR)
app.include_router(billing.router, prefix=settings.API_V1_STR)
app.include_router(analytics.router, prefix=settings.API_V1_STR)
app.include_router(ml.router, prefix=settings.API_V1_STR)
app.include_router(reports.router, prefix=settings.API_V1_STR)

@app.get("/")
async def root():
    return {
        "system": settings.APP_NAME,
        "status": "Operational",
        "api_docs": "/docs",
        "version": "1.0.0",
        "academic_institution": "Mohan Babu University (MBU)",
        "modules": [
            "Staff Authentication & RBAC",
            "Employee Management",
            "Patient Registration",
            "Patient Status Tracking",
            "Doctor & Department Management",
            "Admission & Discharge Management",
            "Bed Allocation System",
            "Electronic Medical Records",
            "Billing & Payment Management",
            "Hospital KPI Analytics",
            "5 Scikit-Learn Machine Learning Models",
            "Downloadable PDF/Excel/CSV Reports"
        ]
    }

@app.get("/api/v1/health")
async def health_check():
    return {"status": "healthy", "database": "active", "ml_engine": "ready"}


