"""
Report Generation Router.
Generates downloadable reports across all hospital modules in PDF, Excel (.xlsx), and CSV formats.
"""

import os
import csv
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import FileResponse
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.auth.dependencies import get_current_user

router = APIRouter(prefix="/reports", tags=["Report Generation"])

def export_to_csv(data: list, filename: str) -> str:
    path = os.path.join(settings.REPORTS_DIR, filename)
    if not data:
        with open(path, "w", encoding="utf-8") as f:
            f.write("No data available\n")
        return path
    keys = list(data[0].keys())
    with open(path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(data)
    return path

def export_to_excel(data: list, sheet_title: str, filename: str) -> str:
    path = os.path.join(settings.REPORTS_DIR, filename)
    try:
        from openpyxl import Workbook
        from openpyxl.styles import Font, PatternFill, Alignment
        wb = Workbook()
        ws = wb.active
        ws.title = sheet_title[:30]
        
        if data:
            headers = list(data[0].keys())
            ws.append([h.replace("_", " ").title() for h in headers])
            for col_num in range(1, len(headers) + 1):
                cell = ws.cell(row=1, column=col_num)
                cell.font = Font(bold=True, color="FFFFFF")
                cell.fill = PatternFill(start_color="0284C7", end_color="0284C7", fill_type="solid")
                cell.alignment = Alignment(horizontal="center")
                
            for row in data:
                ws.append([str(row.get(h, "")) for h in headers])
        else:
            ws.append(["No records available"])
        wb.save(path)
        return path
    except Exception:
        # Fallback to CSV if openpyxl fails
        return export_to_csv(data, filename.replace(".xlsx", ".csv"))

def export_to_pdf(data: list, title: str, filename: str) -> str:
    path = os.path.join(settings.REPORTS_DIR, filename)
    try:
        from reportlab.lib.pagesizes import letter, landscape
        from reportlab.pdfgen import canvas
        from reportlab.lib import colors
        
        c = canvas.Canvas(path, pagesize=landscape(letter))
        c.setFont("Helvetica-Bold", 16)
        c.setFillColor(colors.HexColor("#0284c7"))
        c.drawString(40, 560, "MEDPULSE HOSPITAL & RESEARCH INSTITUTE")
        
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(colors.HexColor("#1e293b"))
        c.drawString(40, 540, f"OFFICIAL REPORT: {title.upper()}")
        
        c.setFont("Helvetica", 9)
        c.drawString(600, 560, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')}")
        c.drawString(600, 545, "Mohan Babu University - B.Tech Project")
        
        c.setStrokeColor(colors.HexColor("#0284c7"))
        c.line(40, 532, 750, 532)
        
        y = 510
        if data:
            keys = list(data[0].keys())[:7]  # Show up to 7 primary columns
            col_x = [40, 130, 240, 340, 440, 540, 640]
            
            c.setFont("Helvetica-Bold", 9)
            c.setFillColor(colors.HexColor("#0f172a"))
            for idx, k in enumerate(keys):
                c.drawString(col_x[idx], y, k.replace("_", " ").title()[:14])
            y -= 15
            c.setStrokeColor(colors.lightgrey)
            c.line(40, y + 5, 750, y + 5)
            
            c.setFont("Helvetica", 8)
            for row in data[:22]:  # Fit top 22 rows per page
                for idx, k in enumerate(keys):
                    val = str(row.get(k, ""))[:18]
                    c.drawString(col_x[idx], y, val)
                y -= 18
                if y < 40:
                    break
        else:
            c.setFont("Helvetica", 10)
            c.drawString(40, y, "No records to display.")
            
        c.save()
        return path
    except Exception as e:
        return export_to_csv(data, filename.replace(".pdf", ".csv"))

@router.get("/download")
async def download_report(
    report_type: str = Query(..., description="patients, employees, doctors, admissions, discharges, status, emergency, departments, billing, ml"),
    format: str = Query("pdf", description="pdf, xlsx, csv"),
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    data = []
    title = report_type.title()
    
    if report_type == "patients":
        data = db.get_collection("patients").find()
    elif report_type == "employees":
        data = db.get_collection("employees").find()
    elif report_type == "doctors":
        data = db.get_collection("doctors").find()
    elif report_type == "admissions":
        data = db.get_collection("admissions").find({"admission_status": "Admitted"})
    elif report_type == "discharges":
        data = db.get_collection("admissions").find({"admission_status": "Discharged"})
    elif report_type == "status":
        data = db.get_collection("status_history").find()
    elif report_type == "emergency":
        data = db.get_collection("patients").find({"current_status": "Emergency"})
    elif report_type == "departments":
        data = db.get_collection("departments").find()
    elif report_type == "billing":
        data = db.get_collection("billing").find()
    elif report_type == "ml":
        from machine_learning.model_evaluator import ml_engine
        data = ml_engine.get_comparison_summary()["comparison_matrix"]
    else:
        raise HTTPException(status_code=400, detail="Invalid report_type requested.")

    # Remove internal _id if present
    for d in data:
        if isinstance(d, dict):
            d.pop("_id", None)

    ts = datetime.now().strftime("%Y%m%d_%H%M")
    base_name = f"{report_type}_report_{ts}"
    
    if format.lower() == "csv":
        filename = f"{base_name}.csv"
        file_path = export_to_csv(data, filename)
        media_type = "text/csv"
    elif format.lower() in ["xlsx", "excel"]:
        filename = f"{base_name}.xlsx"
        file_path = export_to_excel(data, title, filename)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    else:
        filename = f"{base_name}.pdf"
        file_path = export_to_pdf(data, title, filename)
        media_type = "application/pdf"
        
    return FileResponse(file_path, filename=filename, media_type=media_type)
