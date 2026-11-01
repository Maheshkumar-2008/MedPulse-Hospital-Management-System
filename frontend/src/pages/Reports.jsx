import React, { useState } from 'react';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { 
  Download, FileText, FileSpreadsheet, FileCode, 
  CheckCircle2, Printer, ShieldCheck 
} from 'lucide-react';

export const Reports = () => {
  const [downloading, setDownloading] = useState(null);

  const reportCategories = [
    { id: 'patients', title: 'Complete Patient Registry Report', desc: 'All demographic profiles, diagnoses, allergies, and current medical statuses.' },
    { id: 'status', title: 'Patient Status Tracking Audit Report', desc: 'Complete chronological history of status transitions across the 10 vital health stages.' },
    { id: 'emergency', title: 'Emergency Triage & Critical Care Report', desc: 'Patients currently categorized under Emergency status requiring prioritized care.' },
    { id: 'admissions', title: 'Inpatient Admissions Active Report', desc: 'Patients currently admitted to hospital beds with attending physicians and stay days.' },
    { id: 'discharges', title: 'Patient Discharges & Recovery Summary', desc: 'Discharged inpatients with complete clinical summaries and stay durations.' },
    { id: 'employees', title: 'Hospital Staff & Employee Directory', desc: 'All medical staff, qualifications, roles, designations, and account status.' },
    { id: 'doctors', title: 'Specialist Medical Faculty Report', desc: 'Doctors directory, specializations, consulting fees, and assigned patient volume.' },
    { id: 'departments', title: 'Department Performance & Bed Utilization', desc: 'Bed capacity, occupancy rates, and patient volume across 10 clinical units.' },
    { id: 'billing', title: 'Financial Billing & Revenue Ledger', desc: 'Itemized invoices, room charges, pharmacy, lab fees, and payment settlements.' },
    { id: 'ml', title: 'Machine Learning Models Evaluation Report', desc: 'Benchmark metrics, MAE, RMSE, confusion matrices, and feature importance.' },
  ];

  const handleDownload = (reportId, format) => {
    const url = api.getReportDownloadUrl(reportId, format);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Downloadable Hospital Reports & Archives"
        subtitle="Export Clinical Records, Audit Trails & Financial Ledgers in Official PDF, Excel (.xlsx) and CSV Formats"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reportCategories.map((rep) => (
          <div key={rep.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 mb-1.5">
                <FileText className="w-4 h-4 text-hospital-600" />
                <h4 className="font-extrabold text-sm text-slate-900">{rep.title}</h4>
              </div>
              <p className="text-xs text-slate-500">{rep.desc}</p>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Export Format:</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownload(rep.id, 'pdf')}
                  className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-xs border border-rose-200 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Download className="w-3 h-3" />
                  <span>PDF Document</span>
                </button>
                <button
                  onClick={() => handleDownload(rep.id, 'xlsx')}
                  className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold rounded-lg text-xs border border-emerald-200 transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <FileSpreadsheet className="w-3 h-3" />
                  <span>Excel (.xlsx)</span>
                </button>
                <button
                  onClick={() => handleDownload(rep.id, 'csv')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-lg text-xs border border-slate-200 transition-colors"
                >
                  <span>CSV</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
