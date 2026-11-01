import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';
import { 
  LogOut, CheckCircle2, UserCheck, Calendar, 
  FileText, ArrowRight, ShieldCheck, BedDouble 
} from 'lucide-react';

export const DischargeManagement = () => {
  const [admissions, setAdmissions] = useState([]);
  const [dischargedList, setDischargedList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Discharge Modal
  const [dischargeModalOpen, setDischargeModalOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState(null);
  const [dischargeSummary, setDischargeSummary] = useState('');
  const [followUpAdvice, setFollowUpAdvice] = useState('Continue oral medications; review in 7 days.');

  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [activeRes, disRes] = await Promise.all([
        api.getAdmissions('?status_filter=Admitted'),
        api.getAdmissions('?status_filter=Discharged')
      ]);
      setAdmissions(activeRes);
      setDischargedList(disRes);
    } catch (e) {
      setAlert({ type: 'error', message: 'Error: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openDischarge = (adm) => {
    setSelectedAdmission(adm);
    setDischargeSummary(`Patient has clinically stabilized. Vitals normalized. Discharged in satisfactory condition.`);
    setFollowUpAdvice('Rest for 5 days. Complete prescribed antibiotic course.');
    setDischargeModalOpen(true);
  };

  const handleDischargeSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAdmission) return;
    try {
      const res = await api.dischargePatient({
        admission_id: selectedAdmission.admission_id,
        discharge_summary: dischargeSummary,
        follow_up_advice: followUpAdvice
      });
      setAlert({ type: 'success', message: res.message });
      setDischargeModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Discharge error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Discharge Management"
        subtitle="Clinical Clearance, Bed Turnover Automation, Discharge Summaries & Recovery Tracking"
      />

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Active Inpatients Eligible for Discharge */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Inpatients Pending Discharge Evaluation</h3>
            <p className="text-xs text-slate-500">Select patient to record discharge summary and free hospital bed</p>
          </div>
          <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
            {admissions.length} Currently Inpatient
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Patient Name & ID</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Department & Bed</th>
                <th className="py-3 px-4">Admission Reason</th>
                <th className="py-3 px-4">Current Stay</th>
                <th className="py-3 px-4 text-right">Clearance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admissions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No active inpatients waiting for discharge.
                  </td>
                </tr>
              ) : (
                admissions.map(a => (
                  <tr key={a.admission_id} className="hover:bg-hospital-50/40">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{a.patient_name}</div>
                      <div className="text-[11px] font-mono text-hospital-600">{a.patient_id}</div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-800">{a.doctor_name}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-700">{a.department}</span>
                      <div className="text-[11px] font-mono font-bold text-indigo-700">{a.bed_id}</div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">{a.admission_reason}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-700">{a.stay_duration_days} Days</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => openDischarge(a)}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs shadow-xs"
                      >
                        Authorize Discharge
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Historic Discharged Roster */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Recent Discharged Inpatients</h3>
          <span className="text-xs text-slate-400">Historic recoveries archive</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Admission ID & Patient</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Discharge Date</th>
                <th className="py-3 px-4">Total Stay Length</th>
                <th className="py-3 px-4">Discharge Summary</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dischargedList.map(d => (
                <tr key={d.admission_id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-800">
                    <div>{d.patient_name}</div>
                    <div className="text-[10px] font-mono text-slate-400">{d.admission_id}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700">{d.department}</td>
                  <td className="py-3 px-4 font-mono text-slate-600">{d.discharge_date?.slice(0, 10)}</td>
                  <td className="py-3 px-4 font-bold text-emerald-700">{d.stay_duration_days} Days</td>
                  <td className="py-3 px-4 text-slate-600 max-w-sm truncate">{d.discharge_summary}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Discharged
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISCHARGE AUTHORIZATION MODAL */}
      <Modal
        isOpen={dischargeModalOpen}
        onClose={() => setDischargeModalOpen(false)}
        title={`Discharge Clearance: ${selectedAdmission?.patient_name} (${selectedAdmission?.patient_id})`}
      >
        <form onSubmit={handleDischargeSubmit} className="space-y-4 text-xs">
          <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-900">Bed Release Automation Notice</p>
              <p className="text-emerald-700 text-[11px]">
                Confirming this discharge will automatically release allocated bed <strong className="font-mono">{selectedAdmission?.bed_id}</strong> back to Available status.
              </p>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Physician Discharge Clinical Summary *
            </label>
            <textarea
              rows={3}
              required
              value={dischargeSummary}
              onChange={(e) => setDischargeSummary(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Follow-Up & Post-Discharge Prescription Advice
            </label>
            <textarea
              rows={2}
              value={followUpAdvice}
              onChange={(e) => setFollowUpAdvice(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setDischargeModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-xs"
            >
              Confirm Discharge & Release Bed
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
