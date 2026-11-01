import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// 18 Pages
import { Login } from './pages/Login';
import { AdminDashboard } from './pages/AdminDashboard';
import { EmployeeManagement } from './pages/EmployeeManagement';
import { PatientRegistration } from './pages/PatientRegistration';
import { PatientManagement } from './pages/PatientManagement';
import { PatientStatusTracking } from './pages/PatientStatusTracking';
import { DoctorManagement } from './pages/DoctorManagement';
import { DepartmentManagement } from './pages/DepartmentManagement';
import { AdmissionManagement } from './pages/AdmissionManagement';
import { DischargeManagement } from './pages/DischargeManagement';
import { BedManagement } from './pages/BedManagement';
import { MedicalRecords } from './pages/MedicalRecords';
import { BillingManagement } from './pages/BillingManagement';
import { PatientAnalytics } from './pages/PatientAnalytics';
import { MachineLearningDashboard } from './pages/MachineLearningDashboard';
import { Reports } from './pages/Reports';
import { UserProfile } from './pages/UserProfile';
import { Settings } from './pages/Settings';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [activePage, setActivePage] = useState('dashboard');

  // Handle URL hash changes for easy browser back/forward and direct navigation
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '');
      if (hash) {
        setActivePage(hash);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const navigateTo = (pageId) => {
    setActivePage(pageId);
    window.location.hash = `/${pageId}`;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-hospital-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            Initializing MedPulse Clinical Environment...
          </p>
        </div>
      </div>
    );
  }

  // If not logged in, render Hospital Staff Login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Render the selected active page
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <AdminDashboard onNavigate={navigateTo} />;
      case 'status_tracking':
        return <PatientStatusTracking />;
      case 'patient_analytics':
        return <PatientAnalytics />;
      case 'ml_dashboard':
        return <MachineLearningDashboard />;
      case 'patient_registration':
        return <PatientRegistration onNavigate={navigateTo} />;
      case 'patient_management':
        return <PatientManagement onNavigate={navigateTo} />;
      case 'medical_records':
        return <MedicalRecords />;
      case 'admission_management':
        return <AdmissionManagement onNavigate={navigateTo} />;
      case 'discharge_management':
        return <DischargeManagement />;
      case 'employee_management':
        return <EmployeeManagement />;
      case 'doctor_management':
        return <DoctorManagement />;
      case 'department_management':
        return <DepartmentManagement />;
      case 'bed_management':
        return <BedManagement />;
      case 'billing_management':
        return <BillingManagement />;
      case 'reports':
        return <Reports />;
      case 'profile':
        return <UserProfile />;
      case 'settings':
        return <Settings />;
      default:
        return <AdminDashboard onNavigate={navigateTo} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans antialiased text-slate-900">
      {/* Top Navigation */}
      <Navbar onNavigate={navigateTo} activePage={activePage} />

      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar activePage={activePage} onNavigate={navigateTo} />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto">
            {renderActivePage()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
