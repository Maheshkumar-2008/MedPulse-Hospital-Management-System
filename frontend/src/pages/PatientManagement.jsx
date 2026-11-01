import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';
import { 
  Users, Search, Filter, Edit3, Eye, FileText, 
  Calendar, Phone, MapPin, Droplet, Stethoscope, 
  History, Clock, AlertTriangle, ShieldCheck 
} from 'lucide-react';

export const PatientManagement = ({ onNavigate }) => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [genderFilter, setGenderFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Patient Profile Details Modal
  const [selectedPatientId, setSelectedPatientId] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  // Edit Modal
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editFormData, setEditFormData] = useState({});

  const [alert, setAlert] = useState(null);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      let q = '?';
      if (search) q += `search=${encodeURIComponent(search)}&`;
      if (deptFilter !== 'All') q += `department=${encodeURIComponent(deptFilter)}&`;
      if (genderFilter !== 'All') q += `gender=${encodeURIComponent(genderFilter)}&`;
      if (statusFilter !== 'All') q += `status_filter=${encodeURIComponent(statusFilter)}&`;
      
      const res = await api.getPatients(q);
      setPatients(res);
    } catch (e) {
      setAlert({ type: 'error', message: 'Failed to fetch patients: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, [deptFilter, genderFilter, statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchPatients();
  };

  const openProfile = async (patientId) => {
    setSelectedPatientId(patientId);
    setProfileModalOpen(true);
    setProfileLoading(true);
    try {
      const data = await api.getPatientProfile(patientId);
      setProfileData(data);
    } catch (e) {
      alert('Error fetching patient profile: ' + e.message);
    } finally {
      setProfileLoading(false);
    }
  };

  const openEdit = (p) => {
    setEditFormData({
      patient_id: p.patient_id,
      full_name: p.full_name,
      age: p.age,
      dob: p.dob,
      gender: p.gender,
      mobile_number: p.mobile_number,
      address: p.address,
      blood_group: p.blood_group,
      emergency_contact: p.emergency_contact,
      department: p.department,
      primary_diagnosis: p.primary_diagnosis,
      medical_history: p.medical_history,
      allergies: p.allergies
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.updatePatient(editFormData.patient_id, editFormData);
      setAlert({ type: 'success', message: `Patient ${editFormData.patient_id} updated successfully.` });
      setEditModalOpen(false);
      fetchPatients();
    } catch (err) {
      alert('Error updating patient: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Directory & Profiles"
        subtitle="Manage Medical Records, Admissions History, Clinical Timelines and Demographics"
        actionButton={
          <button
            onClick={() => onNavigate('patient_registration')}
            className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
          >
            + Register New Patient
          </button>
        }
      />

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient ID (e.g. PAT-0001), Full Name, Mobile, or Diagnosis..."
            className="w-full pl-10 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-hospital-500"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1 px-3 py-1 bg-hospital-600 hover:bg-hospital-700 text-white rounded-lg text-xs font-bold"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="All">All Statuses</option>
            <option value="Registered">Registered</option>
            <option value="Admitted">Admitted</option>
            <option value="Under Treatment">Under Treatment</option>
            <option value="Waiting for Consultation">Waiting Consultation</option>
            <option value="Under Observation">Under Observation</option>
            <option value="Emergency">Emergency</option>
            <option value="Discharged">Discharged</option>
          </select>

          <select
            value={genderFilter}
            onChange={(e) => setGenderFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold"
          >
            <option value="All">All Genders</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>
      </div>

      {/* Patient Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-hospital-600" />
            <h3 className="text-sm font-bold text-slate-900">Enrolled Patient Registry</h3>
            <span className="text-xs bg-hospital-50 text-hospital-700 font-bold px-2 py-0.5 rounded-full border border-hospital-200">
              {patients.length} Records
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Patient ID & Name</th>
                <th className="py-3 px-4">Age / Gender</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">Contact Phone</th>
                <th className="py-3 px-4">Department & Pathology</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.map((p) => (
                <tr key={p.patient_id} className="hover:bg-hospital-50/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.full_name}</div>
                    <div className="text-[11px] font-mono text-hospital-600 font-bold">{p.patient_id}</div>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {p.age} Y • {p.gender}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 bg-rose-50 border border-rose-200 text-rose-700 font-bold rounded text-[11px]">
                      {p.blood_group}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 font-mono text-[11px]">{p.mobile_number}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{p.department}</div>
                    <div className="text-[11px] text-slate-500">{p.primary_diagnosis}</div>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={p.current_status} />
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => openProfile(p.patient_id)}
                        className="px-2.5 py-1.5 bg-hospital-50 hover:bg-hospital-100 text-hospital-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Profile</span>
                      </button>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800"
                        title="Edit Details"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: COMPREHENSIVE PATIENT PROFILE DRAWER */}
      <Modal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        maxWidth="max-w-3xl"
        title={`Electronic Health Record (EHR): ${profileData?.patient?.full_name || ''}`}
      >
        {profileLoading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading complete clinical file...</div>
        ) : profileData?.patient ? (
          <div className="space-y-5 text-xs">
            {/* Header Profile Summary */}
            <div className="bg-hospital-50/70 p-4 rounded-xl border border-hospital-200 flex items-center justify-between">
              <div>
                <h4 className="text-base font-extrabold text-slate-900">{profileData.patient.full_name}</h4>
                <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                  <span className="font-mono font-bold text-hospital-700">{profileData.patient.patient_id}</span>
                  <span>•</span>
                  <span>{profileData.patient.age} Years</span>
                  <span>•</span>
                  <span>{profileData.patient.gender}</span>
                  <span>•</span>
                  <span>Blood: <strong className="text-rose-600">{profileData.patient.blood_group}</strong></span>
                </div>
              </div>
              <StatusBadge status={profileData.patient.current_status} />
            </div>

            {/* Demographics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Contact Phone</span>
                <p className="font-semibold text-slate-800">{profileData.patient.mobile_number}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Emergency Kin Contact</span>
                <p className="font-semibold text-slate-800">{profileData.patient.emergency_contact}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Registration Date</span>
                <p className="font-semibold text-slate-800">{profileData.patient.registration_date}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Department</span>
                <p className="font-semibold text-slate-800">{profileData.patient.department}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Known Drug Allergies</span>
                <p className="font-semibold text-rose-700">{profileData.patient.allergies || 'None'}</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-bold">Allocated Bed</span>
                <p className="font-semibold text-indigo-700">{profileData.patient.bed_id || 'None / OPD'}</p>
              </div>
            </div>

            {/* Medical History */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
              <span className="text-[10px] text-slate-400 uppercase font-bold">Medical History / Past Conditions</span>
              <p className="text-slate-700 mt-1">{profileData.patient.medical_history || 'No past chronic illness recorded.'}</p>
            </div>

            {/* Inpatient Admissions History */}
            <div>
              <h5 className="font-bold text-slate-900 mb-2">Hospital Inpatient Admissions ({profileData.admissions?.length || 0})</h5>
              {profileData.admissions?.length === 0 ? (
                <p className="text-slate-400 italic">No formal inpatient admissions recorded.</p>
              ) : (
                <div className="space-y-2">
                  {profileData.admissions.map(a => (
                    <div key={a.admission_id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-slate-800">{a.admission_id}</span> • {a.admission_reason}
                        <div className="text-[10px] text-slate-400">Admitted: {a.admission_date?.slice(0, 10)} • Bed: {a.bed_id || 'Ward'}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-100 text-indigo-800">
                        {a.admission_status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Medical Records / Doctor Diagnoses */}
            <div>
              <h5 className="font-bold text-slate-900 mb-2">Clinical Diagnostics & Prescriptions ({profileData.medical_records?.length || 0})</h5>
              {profileData.medical_records?.length === 0 ? (
                <p className="text-slate-400 italic">No clinical consultation notes logged yet.</p>
              ) : (
                <div className="space-y-2">
                  {profileData.medical_records.map(r => (
                    <div key={r.record_id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                      <div className="flex justify-between font-bold text-slate-800">
                        <span>{r.diagnosis}</span>
                        <span className="text-[10px] text-slate-400">{r.record_date?.slice(0, 10)}</span>
                      </div>
                      <p className="text-slate-600"><strong>Symptoms:</strong> {r.symptoms}</p>
                      <p className="text-slate-600"><strong>Treatment:</strong> {r.treatment_notes}</p>
                      <p className="text-hospital-700"><strong>Prescription:</strong> {r.prescription_reference}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </Modal>

      {/* MODAL: EDIT PATIENT DETAILS */}
      <Modal
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title={`Edit Patient: ${editFormData.patient_id}`}
      >
        <form onSubmit={handleEditSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={editFormData.full_name || ''}
                onChange={(e) => setEditFormData({...editFormData, full_name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Mobile Number</label>
              <input
                type="text"
                required
                value={editFormData.mobile_number || ''}
                onChange={(e) => setEditFormData({...editFormData, mobile_number: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700">Emergency Kin Phone</label>
              <input
                type="text"
                required
                value={editFormData.emergency_contact || ''}
                onChange={(e) => setEditFormData({...editFormData, emergency_contact: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Address</label>
              <input
                type="text"
                required
                value={editFormData.address || ''}
                onChange={(e) => setEditFormData({...editFormData, address: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700">Primary Complaint / Diagnosis</label>
            <input
              type="text"
              required
              value={editFormData.primary_diagnosis || ''}
              onChange={(e) => setEditFormData({...editFormData, primary_diagnosis: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700">Drug Allergies</label>
            <input
              type="text"
              value={editFormData.allergies || ''}
              onChange={(e) => setEditFormData({...editFormData, allergies: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setEditModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-bold shadow-xs"
            >
              Save Profile Changes
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
