import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';
import { 
  Building2, Users, BedDouble, Plus, Edit3, 
  Phone, Layers, Activity 
} from 'lucide-react';

export const DepartmentManagement = () => {
  const { hasRole } = useAuth();
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    department_name: '',
    head_of_department: '',
    contact_extension: 'Ext-',
    floor_number: 1,
    total_beds: 20
  });
  const [alert, setAlert] = useState(null);

  const fetchDepts = async () => {
    setLoading(true);
    try {
      const res = await api.getDepartments();
      setDepartments(res);
    } catch (e) {
      setAlert({ type: 'error', message: 'Error loading departments: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.addDepartment(formData);
      setAlert({ type: 'success', message: `Department ${formData.department_name} added successfully.` });
      setModalOpen(false);
      fetchDepts();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Department Directory"
        subtitle="10 Clinical Specialty Units, Wards, Floor Allocations, Bed Capacities & Caseload Metrics"
        actionButton={
          hasRole(['Admin']) && (
            <button
              onClick={() => {
                setFormData({ department_name: '', head_of_department: 'Dr. ', contact_extension: 'Ext-', floor_number: 1, total_beds: 20 });
                setModalOpen(true);
              }}
              className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Department</span>
            </button>
          )
        }
      />

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {departments.map((d) => (
          <div key={d.department_id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-hospital-50 text-hospital-700 border border-hospital-200 flex items-center justify-center font-bold text-sm">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">{d.department_name}</h4>
                    <p className="text-xs text-slate-500">Floor {d.floor_number} • {d.contact_extension}</p>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  #{d.department_id}
                </span>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span className="text-slate-400">Head of Department:</span>
                  <span className="font-semibold text-slate-800">{d.head_of_department}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Consultant Doctors:</span>
                  <span className="font-bold text-hospital-700">{d.doctor_count || 0} Faculty</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Active Patients:</span>
                  <span className="font-bold text-slate-800">{d.patient_count || 0} Patients</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Bed Occupancy:</span>
                  <span className="font-bold text-slate-800">{d.occupied_beds || 0} / {d.total_beds || 20} Beds</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3">
                <div className="flex justify-between text-[11px] font-semibold mb-1">
                  <span className="text-slate-400">Occupancy Rate</span>
                  <span className="text-hospital-700">{d.occupancy_rate || 0}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-hospital-600 h-full rounded-full transition-all"
                    style={{ width: `${d.occupancy_rate || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Vacant Beds: <strong className="text-emerald-700">{d.available_beds || (d.total_beds - (d.occupied_beds||0))}</strong></span>
              <span className="text-hospital-600 font-semibold">{d.total_beds} Total Beds</span>
            </div>
          </div>
        ))}
      </div>

      {/* ADD DEPARTMENT MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add New Clinical Department"
      >
        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Department Name *</label>
            <input
              type="text"
              required
              value={formData.department_name}
              onChange={(e) => setFormData({...formData, department_name: e.target.value})}
              placeholder="e.g. Oncology, Pulmonology"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 block mb-1">Head of Department (HOD) *</label>
            <input
              type="text"
              required
              value={formData.head_of_department}
              onChange={(e) => setFormData({...formData, head_of_department: e.target.value})}
              placeholder="Dr. Full Name"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Floor Number</label>
              <input
                type="number"
                min={1}
                max={10}
                value={formData.floor_number}
                onChange={(e) => setFormData({...formData, floor_number: parseInt(e.target.value) || 1})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Contact Extension</label>
              <input
                type="text"
                value={formData.contact_extension}
                onChange={(e) => setFormData({...formData, contact_extension: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Total Beds</label>
              <input
                type="number"
                min={5}
                max={100}
                value={formData.total_beds}
                onChange={(e) => setFormData({...formData, total_beds: parseInt(e.target.value) || 20})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
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
              Save Department
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
