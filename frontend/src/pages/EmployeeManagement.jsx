import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';
import {
  Users, UserPlus, Search, Filter, ShieldCheck,
  CheckCircle2, XCircle, Clock, Calendar, Mail,
  Phone, Briefcase, Award, Trash2, Edit3, UserCheck
} from 'lucide-react';

export const EmployeeManagement = () => {
  const { user, hasRole } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [pendingUsers, setPendingUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all'); // 'all' | 'pending' | 'attendance'
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [formData, setFormData] = useState({
    employee_id: '',
    full_name: '',
    mobile_number: '',
    email: '',
    gender: 'Male',
    age: 35,
    address: 'Tirupati, AP',
    qualification: 'MBBS, MD',
    department: 'General Medicine',
    designation: 'Senior Consultant',
    role: 'Doctor',
    joining_date: new Date().toISOString().slice(0, 10),
    status: 'Active'
  });

  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [empRes, statsRes, attRes] = await Promise.all([
        api.getEmployees(),
        api.getEmployeeStats(),
        api.getAttendance()
      ]);
      setEmployees(empRes);
      setStats(statsRes);
      setAttendance(attRes);

      if (hasRole(['Admin'])) {
        const pendingRes = await api.getPendingApprovals();
        setPendingUsers(pendingRes);
      }
    } catch (e) {
      setAlert({ type: 'error', message: 'Error fetching employee data: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingEmp(null);
    setFormData({
      employee_id: `EMP-${String(employees.length + 1).padStart(3, '0')}`,
      full_name: '',
      mobile_number: '',
      email: '',
      gender: 'Male',
      age: 32,
      address: 'Tirupati, AP',
      qualification: 'MBBS, MD',
      department: 'General Medicine',
      designation: 'Consultant',
      role: 'Doctor',
      joining_date: new Date().toISOString().slice(0, 10),
      status: 'Active'
    });
    setModalOpen(true);
  };

  const openEditModal = (emp) => {
    setEditingEmp(emp);
    setFormData(emp);
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingEmp) {
        await api.updateEmployee(editingEmp.employee_id, formData);
        setAlert({ type: 'success', message: `Employee ${formData.full_name} updated successfully.` });
      } else {
        await api.createEmployee(formData);
        setAlert({ type: 'success', message: `Employee ${formData.full_name} created successfully with active credentials.` });
      }
      setModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error saving employee: ' + err.message);
    }
  };

  const handleDeactivate = async (empId) => {
    if (!window.confirm(`Are you sure you want to deactivate employee ${empId}?`)) return;
    try {
      await api.deactivateEmployee(empId);
      setAlert({ type: 'warning', message: `Employee ${empId} marked inactive.` });
      fetchData();
    } catch (e) {
      alert('Error deactivating: ' + e.message);
    }
  };

  const handleApproveUser = async (empId, isApproved) => {
    try {
      await api.approveUser({
        employee_id: empId,
        is_approved: isApproved,
        is_active: isApproved
      });
      setAlert({ type: 'success', message: `Employee application ${isApproved ? 'Approved' : 'Rejected'}.` });
      fetchData();
    } catch (e) {
      alert('Error updating approval status: ' + e.message);
    }
  };

  const filteredEmployees = employees.filter(e => {
    const q = search.toLowerCase();
    const nameMatch = (e.full_name || '').toLowerCase().includes(q);
    const idMatch = (e.employee_id || '').toLowerCase().includes(q);
    const phoneMatch = (e.mobile_number || '').includes(q);
    if (search && !(nameMatch || idMatch || phoneMatch)) return false;
    if (roleFilter !== 'All' && e.role !== roleFilter) return false;
    if (deptFilter !== 'All' && e.department !== deptFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Employee Management"
        subtitle="Staff Profiles, Role-Based Access Control, Credential Approvals & Shift Attendance"
        actionButton={
          hasRole(['Admin']) && (
            <button
              onClick={openAddModal}
              className="flex items-center gap-1.5 px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-md shadow-hospital-600/20 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add New Employee</span>
            </button>
          )
        }
      />

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Employees</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{stats?.total_employees ?? '--'}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="text-xs font-bold text-emerald-700 uppercase">Active Working Staff</div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">{stats?.active_employees ?? '--'}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Inactive / Suspended</div>
          <div className="text-2xl font-extrabold text-slate-600 mt-1">{stats?.inactive_employees ?? '--'}</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-200 bg-amber-50/20 shadow-2xs">
          <div className="text-xs font-bold text-amber-700 uppercase">Pending Approvals</div>
          <div className="text-2xl font-extrabold text-amber-800 mt-1">{pendingUsers.length}</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('all')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'all' ? 'border-hospital-600 text-hospital-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Active Staff Directory ({employees.length})
        </button>

        {hasRole(['Admin']) && (
          <button
            onClick={() => setActiveTab('pending')}
            className={`pb-3 text-xs font-bold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'pending' ? 'border-hospital-600 text-hospital-600' : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Pending Employee Approvals</span>
            {pendingUsers.length > 0 && (
              <span className="bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full text-[10px]">
                {pendingUsers.length}
              </span>
            )}
          </button>
        )}

        <button
          onClick={() => setActiveTab('attendance')}
          className={`pb-3 text-xs font-bold border-b-2 transition-colors ${
            activeTab === 'attendance' ? 'border-hospital-600 text-hospital-600' : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          Staff Attendance Logs ({attendance.length})
        </button>
      </div>

      {/* TAB 1: ALL EMPLOYEES */}
      {activeTab === 'all' && (
        <div className="space-y-4">
          {/* Search & Filter */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-center gap-3">
            <div className="flex-1 w-full relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search staff by Employee ID (EMP-001), Name, or Mobile..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold"
            >
              <option value="All">All Roles</option>
              <option value="Admin">Admin</option>
              <option value="Doctor">Doctor</option>
              <option value="Nurse">Nurse</option>
              <option value="Receptionist">Receptionist</option>
              <option value="Data Analyst">Data Analyst</option>
            </select>
          </div>

          {/* Employee Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Employee ID & Name</th>
                    <th className="py-3 px-4">Role & Designation</th>
                    <th className="py-3 px-4">Department</th>
                    <th className="py-3 px-4">Contact</th>
                    <th className="py-3 px-4">Qualifications</th>
                    <th className="py-3 px-4">Status</th>
                    {hasRole(['Admin']) && <th className="py-3 px-4 text-right">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredEmployees.map((emp) => (
                    <tr key={emp.employee_id} className="hover:bg-hospital-50/40 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{emp.full_name}</div>
                        <div className="text-[11px] font-mono text-hospital-600 font-bold">{emp.employee_id}</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-slate-800">{emp.designation}</span>
                        <div className="text-[11px] text-slate-400 font-medium">{emp.role}</div>
                      </td>
                      <td className="py-3 px-4 font-medium text-slate-700">{emp.department}</td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{emp.mobile_number}</div>
                        <div className="text-[10px] text-slate-400">{emp.email}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">{emp.qualification}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                        }`}>
                          {emp.status}
                        </span>
                      </td>
                      {hasRole(['Admin']) && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => openEditModal(emp)}
                              className="p-1.5 hover:bg-slate-100 rounded text-slate-500 hover:text-hospital-600 transition-colors"
                              title="Edit Employee"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            {emp.status === 'Active' && emp.employee_id !== user?.employee_id && (
                              <button
                                onClick={() => handleDeactivate(emp.employee_id)}
                                className="p-1.5 hover:bg-rose-50 rounded text-slate-400 hover:text-rose-600 transition-colors"
                                title="Deactivate Employee"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PENDING APPROVALS */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-5">
          <h3 className="text-sm font-bold text-slate-900 mb-2">Staff Registration Approval Queue</h3>
          <p className="text-xs text-slate-500 mb-4">
            Security policy mandates that all employee credentials require verified administrator approval before granting access.
          </p>

          {pendingUsers.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-400">
              No staff registrations currently awaiting administrative review.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingUsers.map(u => (
                <div key={u.employee_id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{u.full_name}</div>
                    <div className="text-[11px] text-slate-500">
                      ID: <span className="font-mono font-bold text-hospital-600">{u.employee_id}</span> • Role: <strong className="text-slate-700">{u.role}</strong> • Dept: {u.department}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Mobile: {u.mobile_number} • Email: {u.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleApproveUser(u.employee_id, true)}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 shadow-xs"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve Staff</span>
                    </button>
                    <button
                      onClick={() => handleApproveUser(u.employee_id, false)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Hospital Staff Attendance Logs</h3>
            <span className="text-xs text-slate-400">Daily check-in / check-out shift records</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Employee ID & Name</th>
                  <th className="py-3 px-4">Shift Date</th>
                  <th className="py-3 px-4">Check-In Time</th>
                  <th className="py-3 px-4">Check-Out Time</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {attendance.map((att, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{att.employee_name || att.employee_id}</div>
                      <div className="text-[10px] font-mono text-slate-400">{att.employee_id}</div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-700">{att.attendance_date}</td>
                    <td className="py-3 px-4 font-mono text-emerald-700">{att.check_in_time || '--'}</td>
                    <td className="py-3 px-4 font-mono text-slate-500">{att.check_out_time || 'On Shift'}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {att.attendance_status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-500">{att.remarks || 'Standard Shift'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ADD / EDIT EMPLOYEE MODAL */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEmp ? `Edit Staff Profile: ${editingEmp.employee_id}` : 'Register New Hospital Staff'}
      >
        <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700">Employee ID</label>
              <input
                type="text"
                required
                disabled={!!editingEmp}
                value={formData.employee_id}
                onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Full Name</label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700">Mobile Number</label>
              <input
                type="text"
                required
                value={formData.mobile_number}
                onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700">Role</label>
              <select
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Admin">Admin</option>
                <option value="Doctor">Doctor</option>
                <option value="Nurse">Nurse</option>
                <option value="Receptionist">Receptionist</option>
                <option value="Data Analyst">Data Analyst</option>
              </select>
            </div>
            <div>
              <label className="font-bold text-slate-700">Department</label>
              <input
                type="text"
                required
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
                className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700">Designation</label>
              <input
                type="text"
                required
                value={formData.designation}
                onChange={(e) => setFormData({...formData, designation: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700">Qualification</label>
              <input
                type="text"
                required
                value={formData.qualification}
                onChange={(e) => setFormData({...formData, qualification: e.target.value})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>
          </div>

          <div>
            <label className="font-bold text-slate-700">Residential Address</label>
            <input
              type="text"
              required
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-bold shadow-xs"
            >
              {editingEmp ? 'Save Changes' : 'Create Employee Profile'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
