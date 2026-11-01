import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';
import { 
  BedDouble, Plus, Search, Filter, Wrench, 
  CheckCircle2, XCircle, AlertTriangle 
} from 'lucide-react';

export const BedManagement = () => {
  const { hasRole } = useAuth();
  const [beds, setBeds] = useState([]);
  const [summary, setSummary] = useState(null);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');

  // Add Bed Modal
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    bed_id: '',
    bed_number: '',
    department: 'General Medicine',
    ward: 'General Medicine Ward',
    bed_type: 'General Ward',
    bed_status: 'Available',
    daily_rate: 1000
  });

  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      let q = '?';
      if (deptFilter !== 'All') q += `department=${encodeURIComponent(deptFilter)}&`;
      if (statusFilter !== 'All') q += `status_filter=${encodeURIComponent(statusFilter)}&`;

      const [bedsRes, summaryRes, deptsRes] = await Promise.all([
        api.getBeds(q),
        api.getBedSummary(),
        api.getDepartments()
      ]);
      setBeds(bedsRes);
      setSummary(summaryRes);
      setDepartments(deptsRes);
    } catch (e) {
      setAlert({ type: 'error', message: 'Failed to load beds: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [deptFilter, statusFilter]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.addBed(formData);
      setAlert({ type: 'success', message: `Bed ${formData.bed_number} created successfully.` });
      setAddModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error creating bed: ' + err.message);
    }
  };

  const handleToggleMaintenance = async (bed) => {
    const nextStatus = bed.bed_status === 'Maintenance' ? 'Available' : 'Maintenance';
    try {
      await api.updateBed(bed.bed_id, { bed_status: nextStatus });
      setAlert({ type: 'info', message: `Bed ${bed.bed_number} is now marked ${nextStatus}.` });
      fetchData();
    } catch (e) {
      alert('Error updating bed: ' + e.message);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Bed & Ward Management"
        subtitle="Live Bed Inventory, Ward Occupancy Rates, ICU Allocation & Maintenance Tracking"
        actionButton={
          hasRole(['Admin']) && (
            <button
              onClick={() => {
                const nextNo = beds.length + 101;
                setFormData({
                  bed_id: `BED-${nextNo}`,
                  bed_number: `B-${nextNo}`,
                  department: 'General Medicine',
                  ward: 'Level 2 Ward',
                  bed_type: 'General Ward',
                  bed_status: 'Available',
                  daily_rate: 1000
                });
                setAddModalOpen(true);
              }}
              className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Bed</span>
            </button>
          )
        }
      />

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Inventory Beds</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{summary?.total_beds ?? '--'}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="text-xs font-bold text-emerald-700 uppercase">Available / Vacant</div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{summary?.available_beds ?? '--'}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-indigo-200 bg-indigo-50/20 shadow-2xs">
          <div className="text-xs font-bold text-indigo-700 uppercase">Occupied Beds</div>
          <div className="text-2xl font-extrabold text-indigo-900 mt-1">{summary?.occupied_beds ?? '--'}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="text-xs font-bold text-amber-700 uppercase">Under Maintenance</div>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">{summary?.maintenance_beds ?? '--'}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
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

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
          >
            <option value="All">All Bed Statuses</option>
            <option value="Available">Available Only</option>
            <option value="Occupied">Occupied Only</option>
            <option value="Maintenance">Maintenance</option>
          </select>
        </div>
        <span className="text-xs text-slate-500 font-semibold">{beds.length} Beds Displayed</span>
      </div>

      {/* Bed Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {beds.map(b => {
          const isAvail = b.bed_status === 'Available';
          const isOcc = b.bed_status === 'Occupied';
          const isMaint = b.bed_status === 'Maintenance';

          return (
            <div
              key={b.bed_id}
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isAvail
                  ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-400'
                  : isOcc
                  ? 'bg-indigo-50/40 border-indigo-200 hover:border-indigo-400'
                  : 'bg-amber-50/40 border-amber-200 hover:border-amber-400'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono font-extrabold text-sm text-slate-900">{b.bed_number}</span>
                  <span className={`w-2.5 h-2.5 rounded-full ${isAvail ? 'bg-emerald-500' : isOcc ? 'bg-indigo-600' : 'bg-amber-500'}`}></span>
                </div>
                <p className="text-[11px] font-semibold text-slate-700 truncate">{b.department}</p>
                <p className="text-[10px] text-slate-500">{b.bed_type}</p>
                <p className="text-[10px] font-mono text-slate-400 mt-1">₹{b.daily_rate}/day</p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                <span className={`text-[10px] font-bold ${isAvail ? 'text-emerald-700' : isOcc ? 'text-indigo-800' : 'text-amber-700'}`}>
                  {b.bed_status}
                </span>
                {hasRole(['Admin']) && !isOcc && (
                  <button
                    onClick={() => handleToggleMaintenance(b)}
                    title={isMaint ? 'Return to Available' : 'Mark for Maintenance'}
                    className="p-1 hover:bg-white rounded text-slate-400 hover:text-slate-800"
                  >
                    <Wrench className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* ADD BED MODAL */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Hospital Bed to Inventory"
      >
        <form onSubmit={handleCreate} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Bed ID</label>
              <input
                type="text"
                required
                value={formData.bed_id}
                onChange={(e) => setFormData({...formData, bed_id: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Bed Number</label>
              <input
                type="text"
                required
                value={formData.bed_number}
                onChange={(e) => setFormData({...formData, bed_number: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Department</label>
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
            <div>
              <label className="font-bold text-slate-700 block mb-1">Bed Type</label>
              <select
                value={formData.bed_type}
                onChange={(e) => setFormData({...formData, bed_type: e.target.value})}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="General Ward">General Ward</option>
                <option value="Semi-Private">Semi-Private</option>
                <option value="Private Deluxe">Private Deluxe</option>
                <option value="ICU">ICU</option>
                <option value="Emergency Bed">Emergency Bed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Daily Rate (INR)</label>
              <input
                type="number"
                value={formData.daily_rate}
                onChange={(e) => setFormData({...formData, daily_rate: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Ward Name</label>
              <input
                type="text"
                value={formData.ward}
                onChange={(e) => setFormData({...formData, ward: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-bold"
            >
              Save Bed
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
