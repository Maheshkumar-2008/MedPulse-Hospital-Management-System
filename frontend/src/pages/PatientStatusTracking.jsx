import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';
import {
  ActivitySquare, Search, Filter, RefreshCw, AlertTriangle,
  Clock, User, Stethoscope, BedDouble, Calendar, FileText,
  CheckCircle2, ArrowRight, ShieldAlert, History
} from 'lucide-react';

const STATUS_OPTIONS = [
  "Registered",
  "Waiting for Consultation",
  "Under Consultation",
  "Under Treatment",
  "Admitted",
  "Under Observation",
  "Emergency",
  "Discharged",
  "Referred to Another Hospital",
  "Deceased"
];

export const PatientStatusTracking = () => {
  const { user, hasRole } = useAuth();
  const [metrics, setMetrics] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [emergencyOnly, setEmergencyOnly] = useState(false);

  // Status Update Modal State
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusRemarks, setStatusRemarks] = useState('');
  const [newDoctorId, setNewDoctorId] = useState('');
  const [newBedNumber, setNewBedNumber] = useState('');
  const [newDepartment, setNewDepartment] = useState('');
  const [doctorsList, setDoctorsList] = useState([]);
  const [departmentsList, setDepartmentsList] = useState([]);
  const [bedsList, setBedsList] = useState([]);

  // Patient History Drawer
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [statusHistory, setStatusHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Alerts
  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let query = `?`;
      if (search) query += `search=${encodeURIComponent(search)}&`;
      if (statusFilter !== 'All') query += `status_filter=${encodeURIComponent(statusFilter)}&`;
      if (departmentFilter !== 'All') query += `department=${encodeURIComponent(departmentFilter)}&`;
      if (emergencyOnly) query += `is_emergency=true&`;

      const [metricsRes, listRes, docsRes, deptsRes, bedsRes] = await Promise.all([
        api.getStatusDashboard(),
        api.getStatusList(query),
        api.getDoctors(),
        api.getDepartments(),
        api.getBeds('?status_filter=Available')
      ]);

      setMetrics(metricsRes);
      setPatients(listRes);
      setDoctorsList(docsRes);
      setDepartmentsList(deptsRes);
      setBedsList(bedsRes);
    } catch (e) {
      setAlert({ type: 'error', message: 'Failed to load tracking data: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [statusFilter, departmentFilter, emergencyOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchData();
  };

  const openUpdateModal = (patient) => {
    setSelectedPatient(patient);
    setNewStatus(patient.current_status);
    setStatusRemarks('');
    setNewDoctorId(patient.assigned_doctor_id || '');
    setNewBedNumber(patient.bed_number === 'None' ? '' : patient.bed_number);
    setNewDepartment(patient.department || 'General Medicine');
    setUpdateModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (!selectedPatient) return;

    if (newStatus === 'Deceased' && !hasRole(['Admin', 'Doctor'])) {
      alert('Security policy: Only licensed Medical Doctors or Admins can record Deceased status.');
      return;
    }

    try {
      const payload = {
        patient_id: selectedPatient.patient_id,
        new_status: newStatus,
        remarks: statusRemarks.trim() || `Status updated to ${newStatus}`,
        assigned_doctor_id: newDoctorId || undefined,
        bed_number: newBedNumber || undefined,
        department: newDepartment || undefined
      };

      const res = await api.updateStatus(payload);
      setAlert({ type: 'success', message: res.message });
      setUpdateModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error updating patient status: ' + err.message);
    }
  };

  const openHistoryModal = async (patient) => {
    setSelectedPatient(patient);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const res = await api.getStatusHistory(patient.patient_id);
      setStatusHistory(res);
    } catch (e) {
      alert('Error fetching status history: ' + e.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Patient Status Tracking System"
        subtitle="Flagship Healthcare Module: Real-Time Patient Journey Tracking Across 10 Clinical Statuses"
        actionButton={
          <div className="flex items-center gap-2">
            <button
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                emergencyOnly
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20'
                  : 'bg-white border border-rose-300 text-rose-700 hover:bg-rose-50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Emergency Patients ({metrics?.emergency_patients ?? 0})</span>
            </button>
            <button
              onClick={fetchData}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Status</span>
            </button>
          </div>
        }
      />

      {alert && (
        <AlertMessage
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Flagship KPI Dashboard for the 10 Statuses (Section 6 Requirement) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Registered</div>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{metrics?.total_registered_patients ?? '--'}</div>
          <div className="text-[10px] text-slate-400 mt-0.5">All patient files</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-indigo-700 uppercase tracking-wider">Admitted</div>
          <div className="text-xl font-extrabold text-indigo-900 mt-1">{metrics?.currently_admitted ?? '--'}</div>
          <div className="text-[10px] text-indigo-500 mt-0.5">In inpatient wards</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">Under Treatment</div>
          <div className="text-xl font-extrabold text-blue-900 mt-1">{metrics?.under_treatment ?? '--'}</div>
          <div className="text-[10px] text-blue-500 mt-0.5">Active therapy course</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">Waiting Consult</div>
          <div className="text-xl font-extrabold text-amber-900 mt-1">{metrics?.waiting_for_consultation ?? '--'}</div>
          <div className="text-[10px] text-amber-500 mt-0.5">OPD queue intake</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-purple-200 bg-purple-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">Observation</div>
          <div className="text-xl font-extrabold text-purple-900 mt-1">{metrics?.under_observation ?? '--'}</div>
          <div className="text-[10px] text-purple-500 mt-0.5">Telemetry / monitoring</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-rose-300 bg-rose-50/30 shadow-2xs">
          <div className="text-[11px] font-bold text-rose-700 uppercase tracking-wider">Emergency Red</div>
          <div className="text-xl font-extrabold text-rose-600 mt-1 animate-pulse">{metrics?.emergency_patients ?? '--'}</div>
          <div className="text-[10px] text-rose-500 mt-0.5">Immediate triage</div>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">Discharged</div>
          <div className="text-xl font-extrabold text-emerald-800 mt-1">{metrics?.discharged_patients ?? '--'}</div>
          <div className="text-[10px] text-emerald-600 mt-0.5">Recovered home</div>
        </div>
      </div>

      {/* Filter & Search Bar (Section 6 Requirement: Patient ID, Patient Name, Mobile Number, Admission ID) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <form onSubmit={handleSearchSubmit} className="flex-1 w-full relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Patient ID (PAT-0001), Full Name, Mobile Number, or Diagnosis..."
            className="w-full pl-10 pr-24 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1 px-3 py-1 bg-hospital-600 hover:bg-hospital-700 text-white rounded-lg text-xs font-bold transition-colors"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All 10 Statuses</option>
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* Department Filter */}
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none"
          >
            <option value="All">All Departments</option>
            {departmentsList.map(d => (
              <option key={d.department_id} value={d.department_name}>{d.department_name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Patient Status Live Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ActivitySquare className="w-4 h-4 text-hospital-600" />
            <h3 className="text-sm font-bold text-slate-900">Live Hospital Status Roster</h3>
            <span className="text-xs bg-hospital-50 text-hospital-700 font-bold px-2 py-0.5 rounded-full border border-hospital-200">
              {patients.length} Matching Records
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Click 'Update Status' to record clinician progress</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Patient ID & Name</th>
                <th className="py-3 px-4">Demographics</th>
                <th className="py-3 px-4">Department & Doctor</th>
                <th className="py-3 px-4">Bed / Ward</th>
                <th className="py-3 px-4">Primary Pathology</th>
                <th className="py-3 px-4">Current Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patients.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No patient records matching your filter parameters.
                  </td>
                </tr>
              ) : (
                patients.map((p) => (
                  <tr key={p.patient_id} className="hover:bg-hospital-50/40 transition-colors">
                    {/* Patient ID & Name */}
                    <td className="py-3.5 px-4 font-semibold text-slate-900">
                      <div className="font-bold text-slate-900">{p.full_name}</div>
                      <div className="text-[11px] font-mono text-hospital-600">{p.patient_id}</div>
                    </td>

                    {/* Demographics */}
                    <td className="py-3.5 px-4 text-slate-600">
                      <div>{p.age} Y • {p.gender}</div>
                    </td>

                    {/* Department & Doctor */}
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800">{p.department}</div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1">
                        <Stethoscope className="w-3 h-3 text-hospital-600" />
                        <span>{p.assigned_doctor_name}</span>
                      </div>
                    </td>

                    {/* Bed / Ward */}
                    <td className="py-3.5 px-4">
                      {p.bed_number && p.bed_number !== 'None' ? (
                        <span className="inline-flex items-center gap-1 font-mono font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded text-[11px]">
                          <BedDouble className="w-3 h-3" />
                          {p.bed_number}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">OPD / None</span>
                      )}
                    </td>

                    {/* Diagnosis */}
                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {p.primary_diagnosis}
                    </td>

                    {/* Current Status Badge */}
                    <td className="py-3.5 px-4">
                      <StatusBadge status={p.current_status} />
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openHistoryModal(p)}
                          title="View Complete Status Audit History"
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <History className="w-3 h-3" />
                          <span>Audit</span>
                        </button>
                        <button
                          onClick={() => openUpdateModal(p)}
                          className="px-3 py-1.5 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-lg shadow-sm transition-all"
                        >
                          Update Status
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: UPDATE PATIENT STATUS (Records previous, new status, employee ID, remarks, doctor, bed) */}
      <Modal
        isOpen={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        title={`Update Status: ${selectedPatient?.full_name} (${selectedPatient?.patient_id})`}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Current Active Status:</span>
              <StatusBadge status={selectedPatient?.current_status} />
            </div>
            <div className="flex justify-between mt-1 text-[11px] text-slate-400">
              <span>Updating Employee:</span>
              <span className="font-semibold text-slate-700">{user?.full_name} ({user?.employee_id})</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Select New Patient Status *
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              required
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-hospital-500"
            >
              {STATUS_OPTIONS.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {newStatus === 'Deceased' && (
            <div className="p-3 bg-rose-50 border border-rose-300 rounded-xl text-xs text-rose-800 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>
                Clinical Caution: Deceased status can strictly be recorded and certified only by authorized Medical Doctors.
              </span>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Attending Doctor
              </label>
              <select
                value={newDoctorId}
                onChange={(e) => setNewDoctorId(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="">Unassigned</option>
                {doctorsList.map(doc => (
                  <option key={doc.doctor_id} value={doc.doctor_id}>
                    {doc.doctor_name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <select
                value={newDepartment}
                onChange={(e) => setNewDepartment(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                {departmentsList.map(d => (
                  <option key={d.department_id} value={d.department_name}>{d.department_name}</option>
                ))}
              </select>
            </div>
          </div>

          {['Admitted', 'Under Observation', 'Emergency'].includes(newStatus) && (
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Allocate Hospital Bed / Ward
              </label>
              <select
                value={newBedNumber}
                onChange={(e) => setNewBedNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              >
                <option value="">Keep current bed or OPD</option>
                {bedsList.map(b => (
                  <option key={b.bed_id} value={b.bed_id}>
                    {b.bed_number} - {b.department} ({b.bed_type})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Clinical Remarks & Observations
            </label>
            <textarea
              rows={3}
              value={statusRemarks}
              onChange={(e) => setStatusRemarks(e.target.value)}
              placeholder="Enter clinical notes, doctor recommendations, or reason for status update..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-hospital-500"
            ></textarea>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUpdateModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl text-xs font-bold shadow-md shadow-hospital-600/20"
            >
              Commit Status Update
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: COMPLETE PATIENT STATUS HISTORY (Section 6 Requirement) */}
      <Modal
        isOpen={historyModalOpen}
        onClose={() => setHistoryModalOpen(false)}
        title={`Status Audit Trail: ${selectedPatient?.full_name} (${selectedPatient?.patient_id})`}
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-500">
            Complete chronological audit log of all clinical status updates, attending personnel, timestamps, and remarks.
          </p>

          {historyLoading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading audit history...</div>
          ) : statusHistory.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">No historical status modifications recorded yet.</div>
          ) : (
            <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {statusHistory.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-hospital-600 ring-4 ring-hospital-100"></div>
                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-semibold">{item.previous_status}</span>
                        <ArrowRight className="w-3 h-3 text-slate-400" />
                        <StatusBadge status={item.new_status} />
                      </div>
                      <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {item.timestamp ? item.timestamp.replace('T', ' ').slice(0, 19) : ''}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 font-medium">
                      "{item.remarks || 'No additional remarks.'}"
                    </p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-1 pt-1 border-t border-slate-200/60">
                      <User className="w-3 h-3 text-hospital-600" />
                      <span>Updated by: <strong className="text-slate-800">{item.employee_name}</strong> ({item.updated_by_employee_id})</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
};
