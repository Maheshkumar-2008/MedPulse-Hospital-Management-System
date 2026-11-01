import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard, Users, UserPlus, Users2, ActivitySquare,
  Stethoscope, Building2, BedDouble, FileSpreadsheet,
  FileText, Receipt, BarChart3, BrainCircuit, Download,
  User, Settings, LogOut, HeartPulse, ChevronRight
} from 'lucide-react';

export const Sidebar = ({ activePage, onNavigate }) => {
  const { user, hasRole, logout } = useAuth();

  const navigationSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard', label: 'Admin Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Data Analyst'] },
        { id: 'status_tracking', label: 'Patient Status Tracking', icon: ActivitySquare, highlight: true, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Data Analyst'] },
        { id: 'patient_analytics', label: 'Patient Analytics', icon: BarChart3, roles: ['Admin', 'Doctor', 'Data Analyst'] },
        { id: 'ml_dashboard', label: 'Machine Learning', icon: BrainCircuit, highlightBadge: '5 Models', roles: ['Admin', 'Doctor', 'Data Analyst'] },
      ]
    },
    {
      title: 'PATIENT CARE',
      items: [
        { id: 'patient_registration', label: 'Patient Registration', icon: UserPlus, roles: ['Admin', 'Receptionist', 'Nurse', 'Doctor'] },
        { id: 'patient_management', label: 'Patient Management', icon: Users2, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Data Analyst'] },
        { id: 'medical_records', label: 'Medical Records', icon: FileSpreadsheet, roles: ['Admin', 'Doctor', 'Nurse'] },
        { id: 'admission_management', label: 'Admissions', icon: HeartPulse, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
        { id: 'discharge_management', label: 'Discharges', icon: LogOut, roles: ['Admin', 'Doctor', 'Nurse'] },
      ]
    },
    {
      title: 'FACILITY & STAFF',
      items: [
        { id: 'employee_management', label: 'Employee Management', icon: Users, roles: ['Admin'] },
        { id: 'doctor_management', label: 'Doctor Management', icon: Stethoscope, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
        { id: 'department_management', label: 'Department Directory', icon: Building2, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Data Analyst'] },
        { id: 'bed_management', label: 'Bed Management', icon: BedDouble, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist'] },
      ]
    },
    {
      title: 'FINANCE & ARCHIVE',
      items: [
        { id: 'billing_management', label: 'Billing & Invoicing', icon: Receipt, roles: ['Admin', 'Receptionist'] },
        { id: 'reports', label: 'Reports Export', icon: Download, roles: ['Admin', 'Doctor', 'Data Analyst'] },
      ]
    },
    {
      title: 'ACCOUNT',
      items: [
        { id: 'profile', label: 'My Profile', icon: User, roles: ['Admin', 'Doctor', 'Nurse', 'Receptionist', 'Data Analyst'] },
        { id: 'settings', label: 'System Settings', icon: Settings, roles: ['Admin'] },
      ]
    }
  ];

  return (
    <aside className="w-64 bg-[#0a192f] text-slate-300 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800 shadow-xl select-none">
      {/* Top Brand Accent */}
      <div className="p-4 border-b border-slate-800/80 bg-[#071324] flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></div>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Hospital Live Roster</span>
        </div>
        <span className="text-[10px] font-mono text-hospital-400 bg-hospital-950 px-2 py-0.5 rounded border border-hospital-800">
          v1.0-MBU
        </span>
      </div>

      {/* Nav List */}
      <nav className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-5">
        {navigationSections.map((sec, idx) => {
          // Filter items by employee role
          const visibleItems = sec.items.filter(item => hasRole(item.roles));
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <div className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400/90 mb-1.5">
                {sec.title}
              </div>
              {visibleItems.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                
                return (
                  <button
                    key={item.id}
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 ${
                      isActive
                        ? 'bg-hospital-600 text-white shadow-md shadow-hospital-600/30'
                        : item.highlight
                        ? 'text-sky-300 hover:bg-slate-800/60 hover:text-white'
                        : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-hospital-400' : 'text-slate-400'}`} />
                      <span>{item.label}</span>
                    </div>

                    {item.highlightBadge && (
                      <span className="text-[9px] font-bold bg-hospital-500/20 text-hospital-300 border border-hospital-400/30 px-1.5 py-0.2 rounded-full">
                        {item.highlightBadge}
                      </span>
                    )}

                    {isActive && <ChevronRight className="w-3.5 h-3.5 text-white/80" />}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Bottom Footer Info */}
      <div className="p-3 border-t border-slate-800/80 bg-[#071324] text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-300">Mohan Babu University</span>
          <span className="text-hospital-400 font-mono">B.Tech CS-IT</span>
        </div>
        <p className="text-[10px] text-slate-400 mt-1">Hospital Patient Data Analysis</p>
      </div>
    </aside>
  );
};
