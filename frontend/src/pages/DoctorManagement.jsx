import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';
import { 
  Stethoscope, UserPlus, Search, Phone, Mail, 
  Award, Clock, CheckCircle2, UserCheck, ShieldAlert 
} from 'lucide-react';

export const DoctorManagement = () => {
  const { user, hasRole } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [formData, setFormData] = useState({
    doctor_id: '',
    employee_id: '',
    doctor_name: '',
    specialization: '',
    department: 'Cardiology',
    mobile_number: '',
    email: '',
    qualification: 'MBBS, MD',
    experience_years: 10,
    consultation_fee: 600,
    availability_status: 'Available'
  });

  // Assign Doctor Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [selectedPatientId, setSelectedPatientId] = useState('');

  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [docRes, deptRes, patRes] = await Promise.all([
        api.getDoctors(),
        api.getDepartments(),
        api.getPatients()
      ]);
      setDoctors(docRes);
      setDepartments(deptRes);
      setPatients(patRes);
    } catch (e) {
      setAlert({ type: 'error', message: 'Failed to fetch doctor data: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingDoc(null);
    setFormData({
      doctor_id: `DOC-${String(doctors.length + 1).padStart(3, '0')}`,
      employee_id: `EMP-${String(doctors.length + 1).padStart(3, '0')}`,
      doctor_name: 'Dr. ',
      specialization: 'Cardiology',
      department: 'Cardiology',
      mobile_number: '+91 98480XXXXX',
      email: 'doctor@medpulse.org',
      qualification: 'MBBS, MD',
      experience_years: 10,
      consultation_fee: 600,
      availability_status: 'Available'
    });
    setModalOpen(true);
  };

  const openEditModal = (d) => {
    setEditingDoc(d);
    setFormData(d);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingDoc) {
        await api.updateDoctor(editingDoc.doctor_id, formData);
        setAlert({ type: 'success', message: `Doctor ${formData.doctor_name} updated successfully.` });
      } else {
        await api.createDoctor(formData);
        setAlert({ type: 'success', message: `Doctor ${formData.doctor_name} registered successfully.` });
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error saving doctor: ' + err.message);
    }
  };

  const handleToggleAvailability = async (doc) => {
    const nextStatus = doc.availability_status === 'Available' ? 'In Consultation' : 'Available';
    try {
      await api.updateDoctor(doc.doctor_id, { availability_status: nextStatus });
      setAlert({ type: 'info', message: `${doc.doctor_name} is now marked ${nextStatus}.` });
      fetchData();
    } catch (e) {
      alert('Error updating status: ' + e.message);
    }
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatientId || !selectedDoctorId) return;
    try {
      const res = await api.assignDoctor(selectedPatientId, selectedDoctorId);
      setAlert({ type: 'success', message: res.message });
      setAssignModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Assignment error: ' + err.message);
    }
  };

  const filteredDoctors = doctors.filter(d => {
    const q = search.toLowerCase();
    const nameMatch = (d.doctor_name || '').toLowerCase().includes(q);
    const specMatch = (d.specialization || '').toLowerCase().includes(q);
    if (search && !(nameMatch || specMatch)) return false;
    if (deptFilter !== 'All' && d.department !== deptFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Attending Doctors Management"
        subtitle="Clinical Faculty Directory, Specialty Rosters, Patient Caseloads & Real-Time Availability"
        actionButton={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setAssignModalOpen(true)}
              className="px-3.5 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Assign Doctor to Patient
            </button>
            {hasRole(['Admin']) && (
              <button
                onClick={openAddModal}
                className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-md transition-all"
              >
                + Add Doctor
              </button>
            )}
          </div>
        }
      />

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Search & Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
        <div className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Doctor Name or Specialty (e.g. Cardiology, Neurology)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
        >
          <option value="All">All Departments</option>
          {departments.map(d => (
            <option key={d.department_id} value={d.department_name}>{d.department_name}</option>
          ))}
        </select>
      </div>

      {/* Doctors Grid Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDoctors.map(doc => {
          const isAvail = doc.availability_status === 'Available';
          return (
            <div key={doc.doctor_id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-hospital-50 border border-hospital-200 text-hospital-700 flex items-center justify-center font-bold text-sm">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-slate-900">{doc.doctor_name}</h4>
                      <p className="text-xs text-hospital-600 font-semibold">{doc.specialization}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleAvailability(doc)}
                    title="Click to toggle availability"
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-colors ${
                      isAvail ? 'bg-emerald-50 text-emerald-700 border-emerald-300' : 'bg-amber-50 text-amber-700 border-amber-300'
                    }`}
                  >
                    {doc.availability_status}
                  </button>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Department:</span>
                    <span className="font-semibold text-slate-800">{doc.department}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Experience:</span>
                    <span className="font-semibold text-slate-800">{doc.experience_years} Years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Consultation Fee:</span>
                    <span className="font-semibold text-emerald-700 font-mono">INR ₹{doc.consultation_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Assigned Inpatients:</span>
                    <span className="font-bold text-hospital-700 font-mono">{doc.assigned_patients_count || 0} Patients</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-mono text-[10px] text-slate-400">{doc.doctor_id}</span>
                {hasRole(['Admin']) && (
                  <button
                    onClick={() => openEditModal(doc)}
                    className="text-hospital-600 hover:text-hospital-800 font-bold"
                  >
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ASSIGN DOCTOR MODAL */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title="Assign Attending Doctor to Patient"
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Select Patient *
            </label>
            <select
              required
              value={selectedPatientId}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Choose patient...</option>
              {patients.map(p => (
                <option key={p.patient_id} value={p.patient_id}>
                  {p.full_name} ({p.patient_id}) - {p.department}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase tracking-wider block mb-1">
              Select Specialist Doctor *
            </label>
            <select
              required
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              <option value="">Choose doctor...</option>
              {doctors.map(d => (
                <option key={d.doctor_id} value={d.doctor_id}>
                  {d.doctor_name} ({d.specialization}) - Status: {d.availability_status}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-bold shadow-xs"
            >
              Confirm Doctor Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* ADD / EDIT DOCTOR MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingDoc ? `Edit Doctor: ${editingDoc.doctor_id}` : 'Add New Doctor to Faculty'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700">Doctor ID</label>
              <input
                type="text"
                required
                disabled={!!editingDoc}
                value={formData.doctor_id}
                onChange={(e) => setFormData({...formData, doctor_id: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Doctor Full Name</label>
              <input
                type="text"
                required
                value={formData.doctor_name}
                onChange={(e) => setFormData({...formData, doctor_name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700">Specialization</label>
              <input
                type="text"
                required
                value={formData.specialization}
                onChange={(e) => setFormData({...formData, specialization: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Department</label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                {departments.map(d => (
                  <option key={d.department_id} value={d.department_name}>{d.department_name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700">Experience (Y)</label>
              <input
                type="number"
                value={formData.experience_years}
                onChange={(e) => setFormData({...formData, experience_years: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Consultation Fee</label>
              <input
                type="number"
                value={formData.consultation_fee}
                onChange={(e) => setFormData({...formData, consultation_fee: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Availability</label>
              <select
                value={formData.availability_status}
                onChange={(e) => setFormData({...formData, availability_status: e.target.value})}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold"
              >
                <option value="Available">Available</option>
                <option value="In Consultation">In Consultation</option>
                <option value="In Surgery">In Surgery</option>
                <option value="On Leave">On Leave</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-bold"
            >
              Save Doctor Information
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
