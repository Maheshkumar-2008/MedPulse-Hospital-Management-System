import React from 'react';
import { useAuth } from '../context/AuthContext';
import { PageHeader } from '../components/PageHeader';
import { 
  User, ShieldCheck, Mail, Phone, Building2, 
  KeyRound, Clock, Calendar, CheckCircle2 
} from 'lucide-react';

export const UserProfile = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <PageHeader
        title="Hospital Employee Profile"
        subtitle="Staff Credentials, Department Assignment, Role-Based Access Privileges & Shift Authentication"
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-hospital-700 to-hospital-500 text-white flex items-center justify-center font-extrabold text-2xl shadow-md">
            {user?.full_name ? user.full_name[0] : 'U'}
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-slate-900">{user?.full_name}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-2 mt-1">
              <span className="font-mono font-bold text-hospital-700 bg-hospital-50 px-2 py-0.5 rounded border border-hospital-200">
                {user?.employee_id}
              </span>
              <span>•</span>
              <span className="font-semibold text-slate-700">{user?.department}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Assigned Hospital Role</span>
            <p className="text-sm font-extrabold text-hospital-700 mt-1">{user?.role}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Account Verification Status</span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold mt-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Admin Approved & Active</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Official Email Address</span>
            <p className="text-sm font-medium text-slate-800 mt-1">{user?.email || 'staff@medpulse.org'}</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
            <span className="text-[10px] text-slate-400 uppercase font-bold">Registered Mobile Number</span>
            <p className="text-sm font-medium text-slate-800 mt-1">{user?.mobile_number || '+91 98480XXXXX'}</p>
          </div>
        </div>

        <div className="p-4 bg-hospital-50/60 rounded-xl border border-hospital-200 text-xs text-hospital-900 space-y-1">
          <h4 className="font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-hospital-600" />
            <span>Role-Based Access Control (RBAC) Entitlements</span>
          </h4>
          <p className="text-slate-600 text-[11px]">
            Your session is authorized for clinical modules, status updates, and inpatient records under 
            Mohan Babu University Academic Hospital System standards.
          </p>
        </div>
      </div>
    </div>
  );
};
