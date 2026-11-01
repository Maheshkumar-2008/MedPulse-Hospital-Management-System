import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Building2, User, LogOut, Clock, CheckCircle2, 
  Bell, ShieldAlert, Activity, UserCheck 
} from 'lucide-react';

export const Navbar = ({ onNavigate, activePage }) => {
  const { user, logout } = useAuth();
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [attendanceMarked, setAttendanceMarked] = useState(false);
  const [attendanceMsg, setAttendanceMsg] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (user?.role === 'Admin') {
      api.getPendingApprovals()
        .then(res => setPendingCount(res.length))
        .catch(() => {});
    }
  }, [user]);

  const handleMarkAttendance = async () => {
    try {
      const res = await api.markAttendance('Present', 'Self-service shift log');
      setAttendanceMarked(true);
      setAttendanceMsg(res.message);
      setTimeout(() => setAttendanceMsg(''), 4000);
    } catch (e) {
      alert('Attendance error: ' + e.message);
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between">
        {/* Left: Branding & Tagline */}
        <div className="flex items-center gap-3">
          <div className="bg-hospital-600 text-white p-2.5 rounded-xl shadow-md shadow-hospital-600/20">
            <Activity className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl text-slate-900 tracking-tight">MedPulse</span>
              <span className="text-xs bg-hospital-100 text-hospital-800 font-bold px-2 py-0.5 rounded-md border border-hospital-200">
                Hospital System
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              Clinical Operations, Tracking & Machine Learning Platform
            </p>
          </div>
        </div>

        {/* Right: Live Clock, Attendance, Role Badge & Account */}
        <div className="flex items-center gap-3">
          {/* Live Clock */}
          <div className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200">
            <Clock className="w-3.5 h-3.5 text-hospital-600" />
            <span>{time}</span>
          </div>

          {/* Quick Shift Attendance Marker */}
          <button
            onClick={handleMarkAttendance}
            title="Mark Attendance Shift"
            className="hidden sm:flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>{attendanceMarked ? 'Shift Logged' : 'Log Attendance'}</span>
          </button>

          {/* Admin Pending Approvals Alert */}
          {user?.role === 'Admin' && pendingCount > 0 && (
            <button
              onClick={() => onNavigate('employees')}
              className="flex items-center gap-1 text-xs font-bold bg-amber-50 text-amber-700 border border-amber-300 px-2.5 py-1.5 rounded-lg animate-pulse"
              title={`${pendingCount} employee registration(s) pending approval`}
            >
              <ShieldAlert className="w-4 h-4 text-amber-600" />
              <span>{pendingCount} Pending</span>
            </button>
          )}

          {/* Employee User Badge */}
          <div 
            onClick={() => onNavigate('profile')}
            className="flex items-center gap-2.5 pl-2 py-1 pr-3 rounded-xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all"
          >
            <div className="w-8 h-8 rounded-lg bg-hospital-100 text-hospital-700 flex items-center justify-center font-bold text-sm border border-hospital-200">
              {user?.full_name ? user.full_name[0] : 'U'}
            </div>
            <div className="text-left hidden md:block">
              <div className="text-xs font-bold text-slate-800 leading-tight">{user?.full_name}</div>
              <div className="text-[10px] text-slate-500 flex items-center gap-1">
                <span className="font-semibold text-hospital-600">{user?.role}</span>
                <span>•</span>
                <span>{user?.employee_id}</span>
              </div>
            </div>
          </div>

          {/* Logout Action */}
          <button
            onClick={logout}
            title="Secure Employee Sign Out"
            className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors border border-transparent hover:border-rose-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {attendanceMsg && (
        <div className="bg-emerald-600 text-white text-xs font-medium py-1 px-4 text-center animate-in fade-in">
          {attendanceMsg}
        </div>
      )}
    </header>
  );
};
