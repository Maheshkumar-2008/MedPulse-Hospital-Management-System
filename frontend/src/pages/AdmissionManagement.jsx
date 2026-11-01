import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';
import { 
  HeartPulse, UserPlus, Search, BedDouble, 
  Stethoscope, Calendar, Clock, CheckCircle2 
} from 'lucide-react';

export const AdmissionManagement = ({ onNavigate }) => {
  const [admissions, setAdmissions] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [availableBeds, setAvailableBeds] = useState([]);
  const [loading, setLoading] = useState(true);

  // Admit Modal
  const [admitModalOpen, setAdmitModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    department: 'General Medicine',
    bed_id: '',
    admission_reason: ''
  });

  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [admRes, patRes, docRes, deptRes, bedRes] = await Promise.all([
        api.getAdmissions('?status_filter=Admitted'),
        api.getPatients(),
        api.getDoctors(),
        api.getDepartments(),
        api.getBeds('?status_filter=Available')
      ]);
      setAdmissions(admRes);
      setPatients(patRes);
      setDoctors(docRes);
      setDepartments(deptRes);
      setAvailableBeds(bedRes);
      if (patRes.length > 0) setFormData(prev => ({ ...prev, patient_id: patRes[0].patient_id }));
      if (docRes.length > 0) setFormData(prev => ({ ...prev, doctor_id: docRes[0].doctor_id }));
      if (bedRes.length > 0) setFormData(prev => ({ ...prev, bed_id: bedRes[0].bed_id }));
    } catch (e) {
      setAlert({ type: 'error', message: 'Error loading admissions: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAdmitSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await api.admitPatient(formData);
      setAlert({ type: 'success', message: res.message });
      setAdmitModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Admission error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Inpatient Admissions Management"
        subtitle="Clinical Intake, Inpatient Triage Orders, Ward Bed Allocations & Stay Duration Tracking"
        actionButton={
          <div className="flex items-center gap-2">
            <button
              onClick={() => onNavigate('discharge_management')}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Discharge Inpatient &rarr;
            </button>
            <button
              onClick={() => setAdmitModalOpen(true)}
              className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <HeartPulse className="w-4 h-4" />
              <span>Admit Patient</span>
            </button>
          </div>
        }
      />

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Admissions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HeartPulse className="w-4 h-4 text-hospital-600" />
            <h3 className="text-sm font-bold text-slate-900">Active Inpatient Roster</h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 font-bold px-2 py-0.5 rounded-full border border-indigo-200">
              {admissions.length} Admitted Patients
            </span>
          </div>
          <span className="text-xs text-slate-400">Length of stay calculated from intake date</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Admission ID & Patient</th>
                <th className="py-3 px-4">Attending Doctor</th>
                <th className="py-3 px-4">Department & Bed</th>
                <th className="py-3 px-4">Intake Reason</th>
                <th className="py-3 px-4">Admission Date</th>
                <th className="py-3 px-4">Stay Duration</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {admissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No patients currently admitted in inpatient wards.
                  </td>
                </tr>
              ) : (
                admissions.map(a => (
                  <tr key={a.admission_id} className="hover:bg-hospital-50/40">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{a.patient_name}</div>
                      <div className="text-[11px] font-mono text-hospital-600 font-semibold">{a.admission_id} ({a.patient_id})</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-800">{a.doctor_name}</div>
                      <div className="text-[10px] text-slate-400">{a.doctor_id}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-700">{a.department}</div>
                      <span className="inline-flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-1.5 py-0.2 rounded text-[10px]">
                        <BedDouble className="w-3 h-3" />
                        {a.bed_id || 'Ward Bed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium max-w-xs truncate">
                      {a.admission_reason}
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">
                      {a.admission_date?.slice(0, 16).replace('T', ' ')}
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                        {a.stay_duration_days} Day(s)
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate('discharge_management')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                      >
                        Process Discharge
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADMIT PATIENT MODAL */}
      <Modal
        isOpen={admitModalOpen}
        onClose={() => setAdmitModalOpen(false)}
        title="Admit Patient into Hospital Ward"
      >
        <form onSubmit={handleAdmitSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Select Patient *
            </label>
            <select
              required
              value={formData.patient_id}
              onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {patients.map(p => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.full_name} ({p.patient_id}) - Status: {p.current_status}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Attending Doctor *
              </label>
              <select
                required
                value={formData.doctor_id}
                onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {doctors.map(d => (
                  <option key={d.doctor_id} value={d.doctor_id}>
                    {d.doctor_name} ({d.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
                Department *
              </label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {departments.map(d => (
                  <option key={d.department_id} value={d.department_name}>{d.department_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Select Available Bed *
            </label>
            <select
              required
              value={formData.bed_id}
              onChange={(e) => setFormData({...formData, bed_id: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            >
              {availableBeds.length === 0 ? (
                <option value="">No beds currently marked Available</option>
              ) : (
                availableBeds.map(b => (
                  <option key={b.bed_id} value={b.bed_id}>
                    {b.bed_number} - {b.department} ({b.bed_type})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Admission Reason & Clinical Order *
            </label>
            <textarea
              rows={3}
              required
              value={formData.admission_reason}
              onChange={(e) => setFormData({...formData, admission_reason: e.target.value})}
              placeholder="e.g. Acute myocardial infarction, post-surgery telemetry monitoring..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAdmitModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-bold shadow-xs"
            >
              Confirm Admission
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
