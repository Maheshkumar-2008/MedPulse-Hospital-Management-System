import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { 
  Building2, ShieldCheck, Lock, Phone, User, 
  KeyRound, ArrowRight, CheckCircle2, AlertCircle, HelpCircle
} from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const [tab, setTab] = useState('login'); // 'login' | 'register' | 'forgot'
  const [loginMethod, setLoginMethod] = useState('password'); // 'password' | 'otp'

  // Login form state
  const [fullName, setFullName] = useState('Dr. Rajesh Varma');
  const [mobileNumber, setMobileNumber] = useState('9848022331');
  const [employeeId, setEmployeeId] = useState('EMP-001');
  const [password, setPassword] = useState('Admin@123');
  const [otp, setOtp] = useState('');
  const [otpSentMsg, setOtpSentMsg] = useState('');

  // Register state
  const [regData, setRegData] = useState({
    employee_id: '',
    full_name: '',
    mobile_number: '',
    email: '',
    gender: 'Male',
    age: 32,
    qualification: 'MBBS, MD',
    department: 'General Medicine',
    designation: 'Resident Medical Officer',
    role: 'Doctor',
    password: ''
  });

  // Forgot password state
  const [forgotData, setForgotData] = useState({
    employee_id: '',
    mobile_number: '',
    new_password: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Quick Demo Preset
  const handlePreset = (name, mobile, id, role, pw) => {
    setFullName(name);
    setMobileNumber(mobile);
    setEmployeeId(id);
    setPassword(pw);
    setError('');
  };

  const handleSendOtp = async () => {
    if (!mobileNumber) {
      setError('Please enter your registered mobile number first.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await api.requestOtp(mobileNumber);
      setOtpSentMsg(res.message + ' (Demo verification code: ' + res.demo_otp_hint + ')');
      setOtp(res.demo_otp_hint);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const payload = {
        full_name: fullName.trim(),
        mobile_number: mobileNumber.trim(),
        employee_id: employeeId.trim(),
      };
      if (loginMethod === 'password') {
        payload.password = password;
      } else {
        payload.otp = otp;
      }

      const res = await api.login(payload);
      login(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.registerStaff(regData);
      setSuccessMsg(res.message + ' Your account must be approved by the Chief Medical Administrator before sign-in.');
      setTab('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      const res = await api.forgotPassword(forgotData);
      setSuccessMsg(res.message);
      setTab('login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 selection:bg-hospital-500 selection:text-white">
      <div className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-12 bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden">
        
        {/* Left Hospital Hero Banner */}
        <div className="md:col-span-5 bg-gradient-to-br from-[#0c4a6e] to-[#0369a1] text-white p-8 sm:p-10 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -right-16 -top-16 w-56 h-56 bg-white/10 rounded-full blur-2xl"></div>
          <div className="absolute -left-16 -bottom-16 w-56 h-56 bg-hospital-400/20 rounded-full blur-2xl"></div>

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-bold text-sky-200 mb-6 border border-white/20">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Authorized Hospital Personnel Only</span>
            </div>
            
            <h1 className="text-3xl font-extrabold tracking-tight leading-tight">
              MedPulse Health
            </h1>
            <p className="text-sm text-sky-100/90 mt-2">
              Hospital Patient Data Analysis and Management System
            </p>
            <p className="text-xs text-sky-200/70 mt-1 font-mono">
              Mohan Babu University (MBU) Capstone Project
            </p>

            <div className="mt-8 space-y-3.5 text-xs text-sky-100/90">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Admin-approved employee accounts with RBAC</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>10-stage live patient status tracking module</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>5 Scikit-Learn clinical machine learning models</span>
              </div>
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Dual MongoDB live engine & academic MySQL deliverables</span>
              </div>
            </div>
          </div>

          {/* Quick Demo Credentials Switcher */}
          <div className="mt-8 pt-6 border-t border-white/15 relative z-10">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sky-200/90 mb-2">
              Select Demo Staff Profile:
            </p>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handlePreset('Dr. Rajesh Varma', '9848022331', 'EMP-001', 'Admin', 'Admin@123')}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-left transition-colors border border-white/10"
              >
                <div className="font-bold text-white">Chief Admin</div>
                <div className="text-[10px] text-sky-200">EMP-001</div>
              </button>
              <button
                type="button"
                onClick={() => handlePreset('Dr. Sunita Sharma', '9848022332', 'EMP-002', 'Doctor', 'Staff@123')}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-left transition-colors border border-white/10"
              >
                <div className="font-bold text-white">Cardiologist</div>
                <div className="text-[10px] text-sky-200">EMP-002</div>
              </button>
              <button
                type="button"
                onClick={() => handlePreset('Nurse Divya Rao', '9848022340', 'EMP-010', 'Nurse', 'Staff@123')}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-left transition-colors border border-white/10"
              >
                <div className="font-bold text-white">Head Nurse</div>
                <div className="text-[10px] text-sky-200">EMP-010</div>
              </button>
              <button
                type="button"
                onClick={() => handlePreset('Aditya Singh', '9848022344', 'EMP-014', 'Data Analyst', 'Staff@123')}
                className="bg-white/10 hover:bg-white/20 p-2 rounded-lg text-left transition-colors border border-white/10"
              >
                <div className="font-bold text-white">Data Analyst</div>
                <div className="text-[10px] text-sky-200">EMP-014</div>
              </button>
            </div>
          </div>
        </div>

        {/* Right Authentication Form Panel */}
        <div className="md:col-span-7 p-8 sm:p-10 flex flex-col justify-center bg-white">
          {/* Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 mb-6">
            <button
              onClick={() => { setTab('login'); setError(''); }}
              className={`text-sm font-bold pb-2 relative transition-colors ${
                tab === 'login' ? 'text-hospital-600 border-b-2 border-hospital-600' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Staff Sign In
            </button>
            <button
              onClick={() => { setTab('register'); setError(''); }}
              className={`text-sm font-bold pb-2 relative transition-colors ${
                tab === 'register' ? 'text-hospital-600 border-b-2 border-hospital-600' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              New Staff Application
            </button>
            <button
              onClick={() => { setTab('forgot'); setError(''); }}
              className={`text-sm font-bold pb-2 relative transition-colors ${
                tab === 'forgot' ? 'text-hospital-600 border-b-2 border-hospital-600' : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Reset Credentials
            </button>
          </div>

          {/* Feedback Alerts */}
          {error && (
            <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {tab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  1. Hospital Employee ID
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value)}
                    placeholder="e.g. EMP-001"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  2. Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter registered full name"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  3. Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="e.g. 9848022331"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all font-mono"
                  />
                </div>
              </div>

              {/* Verification Method Toggle */}
              <div className="pt-1">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    4. Security Verification
                  </label>
                  <div className="flex items-center gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setLoginMethod('password')}
                      className={`font-semibold px-2 py-0.5 rounded ${loginMethod === 'password' ? 'bg-hospital-100 text-hospital-700' : 'text-slate-400'}`}
                    >
                      Password
                    </button>
                    <span>|</span>
                    <button
                      type="button"
                      onClick={() => setLoginMethod('otp')}
                      className={`font-semibold px-2 py-0.5 rounded ${loginMethod === 'otp' ? 'bg-hospital-100 text-hospital-700' : 'text-slate-400'}`}
                    >
                      Mobile OTP
                    </button>
                  </div>
                </div>

                {loginMethod === 'password' ? (
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter account password"
                      className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
                    />
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="6-Digit OTP Code"
                        maxLength={6}
                        className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-center font-mono tracking-widest focus:outline-none focus:ring-2 focus:ring-hospital-500 focus:bg-white transition-all"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors whitespace-nowrap"
                      >
                        Send OTP
                      </button>
                    </div>
                    {otpSentMsg && (
                      <p className="text-[11px] text-emerald-600 mt-1 font-medium">{otpSentMsg}</p>
                    )}
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-4 bg-hospital-600 hover:bg-hospital-700 active:bg-hospital-800 text-white font-bold py-3 rounded-xl shadow-lg shadow-hospital-600/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <span>{loading ? 'Authenticating...' : 'Sign In to Hospital Portal'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          )}

          {/* TAB 2: STAFF REGISTRATION */}
          {tab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
              <p className="text-xs text-slate-500">
                Submit your profile for administrative verification. All accounts require approval by the Chief Medical Director.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Employee ID</label>
                  <input
                    type="text"
                    required
                    value={regData.employee_id}
                    onChange={(e) => setRegData({...regData, employee_id: e.target.value})}
                    placeholder="EMP-016"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Full Name</label>
                  <input
                    type="text"
                    required
                    value={regData.full_name}
                    onChange={(e) => setRegData({...regData, full_name: e.target.value})}
                    placeholder="Dr. Full Name"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={regData.mobile_number}
                    onChange={(e) => setRegData({...regData, mobile_number: e.target.value})}
                    placeholder="98480XXXXX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Email Address</label>
                  <input
                    type="email"
                    required
                    value={regData.email}
                    onChange={(e) => setRegData({...regData, email: e.target.value})}
                    placeholder="name@medpulse.org"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Role</label>
                  <select
                    value={regData.role}
                    onChange={(e) => setRegData({...regData, role: e.target.value})}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  >
                    <option value="Doctor">Doctor</option>
                    <option value="Nurse">Nurse</option>
                    <option value="Receptionist">Receptionist</option>
                    <option value="Data Analyst">Data Analyst</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Department</label>
                  <input
                    type="text"
                    value={regData.department}
                    onChange={(e) => setRegData({...regData, department: e.target.value})}
                    placeholder="Cardiology"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700">Age</label>
                  <input
                    type="number"
                    value={regData.age}
                    onChange={(e) => setRegData({...regData, age: parseInt(e.target.value) || 30})}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700">Desired Password</label>
                <input
                  type="password"
                  required
                  value={regData.password}
                  onChange={(e) => setRegData({...regData, password: e.target.value})}
                  placeholder="Set account password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-hospital-600 hover:bg-hospital-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                {loading ? 'Submitting Application...' : 'Submit Application for Admin Approval'}
              </button>
            </form>
          )}

          {/* TAB 3: FORGOT PASSWORD */}
          {tab === 'forgot' && (
            <form onSubmit={handleForgotSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                Verify your registered mobile number and employee ID to reset your password.
              </p>

              <div>
                <label className="text-xs font-bold text-slate-700">Employee ID</label>
                <input
                  type="text"
                  required
                  value={forgotData.employee_id}
                  onChange={(e) => setForgotData({...forgotData, employee_id: e.target.value})}
                  placeholder="e.g. EMP-001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">Registered Mobile Number</label>
                <input
                  type="text"
                  required
                  value={forgotData.mobile_number}
                  onChange={(e) => setForgotData({...forgotData, mobile_number: e.target.value})}
                  placeholder="Enter 10-digit mobile number"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700">New Password</label>
                <input
                  type="password"
                  required
                  value={forgotData.new_password}
                  onChange={(e) => setForgotData({...forgotData, new_password: e.target.value})}
                  placeholder="Enter new password"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs mt-1"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-hospital-600 hover:bg-hospital-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                {loading ? 'Updating Password...' : 'Reset Password'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
