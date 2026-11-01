import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';
import { 
  FileSpreadsheet, Plus, Search, FileText, 
  Stethoscope, Calendar, Clock, Pill, FlaskConical 
} from 'lucide-react';

export const MedicalRecords = () => {
  const { user, hasRole } = useAuth();
  const [records, setRecords] = useState([]);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Add Record Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    patient_id: '',
    doctor_id: '',
    diagnosis: '',
    symptoms: '',
    treatment_notes: '',
    prescription_reference: '',
    test_results: ''
  });

  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [recsRes, patRes, docRes] = await Promise.all([
        api.getMedicalRecords(search ? `?search=${encodeURIComponent(search)}` : ''),
        api.getPatients(),
        api.getDoctors()
      ]);
      setRecords(recsRes);
      setPatients(patRes);
      setDoctors(docRes);
      if (patRes.length > 0) setFormData(prev => ({ ...prev, patient_id: patRes[0].patient_id }));
      if (docRes.length > 0) setFormData(prev => ({ ...prev, doctor_id: docRes[0].doctor_id }));
    } catch (e) {
      setAlert({ type: 'error', message: 'Failed to load medical records: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const res = await api.createMedicalRecord(formData);
      setAlert({ type: 'success', message: res.message });
      setAddModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error creating record: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Electronic Medical Records (EMR / EHR)"
        subtitle="Clinical Diagnoses, Attending Doctor Notes, Pharmacotherapy Prescriptions & Diagnostic Lab Reports"
        actionButton={
          hasRole(['Admin', 'Doctor']) && (
            <button
              onClick={() => setAddModalOpen(true)}
              className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>New Clinical Consultation Record</span>
            </button>
          )
        }
      />

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records by Diagnosis, Symptoms, or Patient ID..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <span className="text-xs text-slate-400 font-semibold">{records.length} Consultation Records</span>
      </div>

      {/* Records Cards */}
      <div className="space-y-4">
        {records.map(r => (
          <div key={r.record_id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-extrabold text-slate-900">{r.diagnosis}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-hospital-100 text-hospital-800 border border-hospital-200">
                    {r.record_id}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient: <strong className="text-slate-800">{r.patient_name}</strong> ({r.patient_id})
                </p>
              </div>

              <div className="text-right text-xs">
                <div className="font-semibold text-slate-700 flex items-center sm:justify-end gap-1">
                  <Stethoscope className="w-3.5 h-3.5 text-hospital-600" />
                  <span>{r.doctor_name}</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  {r.record_date?.slice(0, 16).replace('T', ' ')}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-700">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Symptoms Reported</span>
                <p className="mt-1 font-medium">{r.symptoms}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Treatment / Clinical Orders</span>
                <p className="mt-1 font-medium">{r.treatment_notes}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="bg-hospital-50/50 p-3 rounded-xl border border-hospital-200/60">
                <div className="flex items-center gap-1.5 text-hospital-800 font-bold mb-1">
                  <Pill className="w-3.5 h-3.5 text-hospital-600" />
                  <span>Prescription Reference</span>
                </div>
                <p className="text-slate-700">{r.prescription_reference || 'Standard protocol'}</p>
              </div>

              <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-200/60">
                <div className="flex items-center gap-1.5 text-indigo-900 font-bold mb-1">
                  <FlaskConical className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Diagnostic & Lab Results</span>
                </div>
                <p className="text-slate-700">{r.test_results || 'Routine diagnostics'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ADD MEDICAL RECORD MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Patient Electronic Medical Record"
      >
        <form onSubmit={handleCreate} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Select Patient *</label>
              <select
                required
                value={formData.patient_id}
                onChange={(e) => setFormData({...formData, patient_id: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {patients.map(p => (
                  <option key={p.patient_id} value={p.patient_id}>{p.full_name} ({p.patient_id})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Attending Physician *</label>
              <select
                required
                value={formData.doctor_id}
                onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {doctors.map(d => (
                  <option key={d.doctor_id} value={d.doctor_id}>{d.doctor_name} ({d.specialization})</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Primary Clinical Diagnosis *</label>
            <input
              type="text"
              required
              value={formData.diagnosis}
              onChange={(e) => setFormData({...formData, diagnosis: e.target.value})}
              placeholder="e.g. Acute Appendicitis, Hypertension Stage 2"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Reported Symptoms *</label>
            <input
              type="text"
              required
              value={formData.symptoms}
              onChange={(e) => setFormData({...formData, symptoms: e.target.value})}
              placeholder="e.g. Right lower quadrant abdominal pain, nausea, low grade fever"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Treatment Plan & Clinical Notes *</label>
            <textarea
              rows={2}
              required
              value={formData.treatment_notes}
              onChange={(e) => setFormData({...formData, treatment_notes: e.target.value})}
              placeholder="Treatment regimen, surgery notes, IV medications..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl"
            ></textarea>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Prescription Medication Reference</label>
              <input
                type="text"
                value={formData.prescription_reference}
                onChange={(e) => setFormData({...formData, prescription_reference: e.target.value})}
                placeholder="e.g. Tab Ciprofloxacin 500mg BD"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Diagnostic Test Results</label>
              <input
                type="text"
                value={formData.test_results}
                onChange={(e) => setFormData({...formData, test_results: e.target.value})}
                placeholder="e.g. Ultrasound Abdomen: Inflamed appendix"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-bold shadow-xs"
            >
              Save Medical Record
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
