"""
Billing and Payment Management Router.
"""

import os
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import FileResponse
from backend.app.database import get_db
from backend.app.config import settings
from backend.app.models.schemas import BillingCreate, PaymentRecord
from backend.app.auth.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/billing", tags=["Billing & Payments"])

def generate_bill_id(bill_coll) -> str:
    bills = bill_coll.find()
    max_num = 0
    for b in bills:
        bid = str(b.get("bill_id", ""))
        if bid.startswith("BILL-"):
            try:
                num = int(bid.split("-")[1])
                if num > max_num:
                    max_num = num
            except ValueError:
                pass
    return f"BILL-{max_num + 1:04d}"

@router.get("/")
async def get_all_bills(
    status_filter: Optional[str] = None,
    patient_id: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    bill_coll = db.get_collection("billing")
    pat_coll = db.get_collection("patients")
    
    bills = bill_coll.find()
    patients = {p["patient_id"]: p.get("full_name") for p in pat_coll.find()}
    
    results = []
    for b in bills:
        if status_filter and b.get("payment_status") != status_filter:
            continue
        if patient_id and b.get("patient_id") != patient_id:
            continue
            
        b_copy = dict(b)
        b_copy["patient_name"] = patients.get(b.get("patient_id"), "Unknown Patient")
        results.append(b_copy)
    return results

@router.get("/revenue-summary")
async def get_revenue_summary(current_user: dict = Depends(get_current_user)):
    db = get_db()
    bills = db.get_collection("billing").find()
    
    total_billed = sum(float(b.get("total_amount", 0)) for b in bills)
    paid_revenue = sum(float(b.get("total_amount", 0)) for b in bills if b.get("payment_status") == "Paid")
    pending_revenue = sum(float(b.get("total_amount", 0)) for b in bills if b.get("payment_status") == "Pending")
    partial_revenue = sum(float(b.get("total_amount", 0)) for b in bills if b.get("payment_status") == "Partially Paid")
    
    return {
        "total_billed_amount": round(total_billed, 2),
        "total_collected_revenue": round(paid_revenue, 2),
        "pending_amount": round(pending_revenue, 2),
        "partially_paid_amount": round(partial_revenue, 2),
        "total_invoices_issued": len(bills),
        "paid_invoices_count": sum(1 for b in bills if b.get("payment_status") == "Paid"),
        "pending_invoices_count": sum(1 for b in bills if b.get("payment_status") == "Pending")
    }

@router.post("/generate", dependencies=[Depends(require_roles(["Admin", "Receptionist"]))])
async def generate_bill(bill_in: BillingCreate, current_user: dict = Depends(get_current_user)):
    db = get_db()
    bill_coll = db.get_collection("billing")
    pat_coll = db.get_collection("patients")
    
    pat = pat_coll.find_one({"patient_id": bill_in.patient_id})
    if not pat:
        raise HTTPException(status_code=404, detail="Patient not found.")
        
    bid = generate_bill_id(bill_coll)
    total = (
        bill_in.consultation_charges + 
        bill_in.room_charges + 
        bill_in.medicine_charges + 
        bill_in.laboratory_charges + 
        bill_in.other_charges
    )
    
    doc = bill_in.dict()
    doc["bill_id"] = bid
    doc["total_amount"] = round(total, 2)
    doc["payment_status"] = "Pending"
    doc["bill_date"] = datetime.now().isoformat()
    doc["generated_by_employee_id"] = current_user["employee_id"]
    
    bill_coll.insert_one(doc)
    return {"message": "Invoice generated successfully.", "bill": doc}

@router.post("/pay", dependencies=[Depends(require_roles(["Admin", "Receptionist"]))])
async def record_payment(payment: PaymentRecord, current_user: dict = Depends(get_current_user)):
    db = get_db()
    bill_coll = db.get_collection("billing")
    pay_coll = db.get_collection("payments")
    
    bill = bill_coll.find_one({"bill_id": payment.bill_id})
    if not bill:
        raise HTTPException(status_code=404, detail="Bill invoice not found.")
        
    now_ts = datetime.now().isoformat()
    pay_id = f"PAY-{int(datetime.now().timestamp())}"
    
    pay_doc = {
        "payment_id": pay_id,
        "bill_id": payment.bill_id,
        "amount_paid": payment.amount_paid,
        "payment_mode": payment.payment_mode,
        "transaction_reference": payment.transaction_reference or f"TXN-{int(datetime.now().timestamp())}",
        "payment_date": now_ts,
        "received_by_employee_id": current_user["employee_id"]
    }
    pay_coll.insert_one(pay_doc)
    
    total = float(bill.get("total_amount", 0))
    if payment.amount_paid >= total:
        new_status = "Paid"
    else:
        new_status = "Partially Paid"
        
    bill_coll.update_one(
        {"bill_id": payment.bill_id},
        {"$set": {"payment_status": new_status, "updated_at": now_ts}}
    )
    
    return {
        "message": f"Payment of INR {payment.amount_paid} recorded. Bill status: {new_status}.",
        "payment_id": pay_id,
        "status": new_status
    }

@router.get("/receipt/{bill_id}")
async def download_pdf_receipt(bill_id: str, current_user: dict = Depends(get_current_user)):
    db = get_db()
    bill = db.get_collection("billing").find_one({"bill_id": bill_id})
    if not bill:
        raise HTTPException(status_code=404, detail="Bill not found.")
    
    patient = db.get_collection("patients").find_one({"patient_id": bill["patient_id"]}) or {}
    
    receipt_filename = f"Receipt_{bill_id}.pdf"
    file_path = os.path.join(settings.REPORTS_DIR, receipt_filename)
    
    try:
        from reportlab.lib.pagesizes import letter
        from reportlab.pdfgen import canvas
        from reportlab.lib import colors
        
        c = canvas.Canvas(file_path, pagesize=letter)
        c.setFont("Helvetica-Bold", 18)
        c.setFillColor(colors.HexColor("#0284c7"))
        c.drawString(50, 750, "MEDPULSE HOSPITAL & RESEARCH INSTITUTE")
        
        c.setFont("Helvetica", 10)
        c.setFillColor(colors.HexColor("#334155"))
        c.drawString(50, 735, "Accredited Clinical Care & Academic Medical Centre | Tirupati, AP")
        c.drawString(50, 722, "Official Patient Billing Receipt & Discharge Clearance")
        c.setStrokeColor(colors.HexColor("#0284c7"))
        c.line(50, 715, 550, 715)
        
        c.setFont("Helvetica-Bold", 12)
        c.drawString(50, 690, f"INVOICE NO: {bill_id}")
        c.setFont("Helvetica", 10)
        c.drawString(350, 690, f"Date: {bill.get('bill_date', '')[:10]}")
        c.drawString(50, 670, f"Patient ID: {bill.get('patient_id')}")
        c.drawString(350, 670, f"Patient Name: {patient.get('full_name', 'N/A')}")
        c.drawString(50, 650, f"Age / Gender: {patient.get('age', 'N/A')} Y / {patient.get('gender', 'N/A')}")
        c.drawString(350, 650, f"Payment Status: {bill.get('payment_status', 'Pending')}")
        
        c.setStrokeColor(colors.lightgrey)
        c.line(50, 635, 550, 635)
        
        c.setFont("Helvetica-Bold", 11)
        c.drawString(50, 615, "Description")
        c.drawString(450, 615, "Amount (INR)")
        
        items = [
            ("Consultation Charges", bill.get("consultation_charges", 0)),
            ("Hospital Stay & Room Charges", bill.get("room_charges", 0)),
            ("Pharmacy & Medicine Supplies", bill.get("medicine_charges", 0)),
            ("Diagnostic & Laboratory Tests", bill.get("laboratory_charges", 0)),
            ("Nursing & Other Administrative Services", bill.get("other_charges", 0)),
        ]
        
        y = 590
        c.setFont("Helvetica", 10)
        for name, amt in items:
            c.drawString(50, y, name)
            c.drawString(450, y, f"Rs. {float(amt):,.2f}")
            y -= 25
            
        c.line(50, y + 10, 550, y + 10)
        c.setFont("Helvetica-Bold", 12)
        c.setFillColor(colors.HexColor("#0f172a"))
        c.drawString(50, y - 10, "Total Amount Due:")
        c.drawString(450, y - 10, f"Rs. {float(bill.get('total_amount', 0)):,.2f}")
        
        c.setFont("Helvetica-Oblique", 9)
        c.setFillColor(colors.gray)
        c.drawString(50, 100, "This is a computer-generated billing receipt for Mohan Babu University Academic Project Demonstration.")
        c.save()
        
        return FileResponse(file_path, filename=receipt_filename, media_type="application/pdf")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation error: {e}")
