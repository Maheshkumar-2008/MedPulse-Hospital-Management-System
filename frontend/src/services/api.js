/**
 * API Service for MedPulse Hospital Management System.
 * Connects React UI to FastAPI backend with JWT Bearer Token.
 */

const API_BASE = '/api/v1';

export const getAuthToken = () => {
  return localStorage.getItem('medpulse_token') || '';
};

export const setAuthToken = (token) => {
  localStorage.setItem('medpulse_token', token);
};

export const clearAuthToken = () => {
  localStorage.removeItem('medpulse_token');
  localStorage.removeItem('medpulse_user');
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('medpulse_user');
  return user ? JSON.parse(user) : null;
};

export const setCurrentUser = (user) => {
  localStorage.setItem('medpulse_user', JSON.stringify(user));
};

async function apiRequest(endpoint, method = 'GET', body = null) {
  const headers = {
    'Content-Type': 'application/json',
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = {
    method,
    headers,
  };

  if (body) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options);

  if (response.status === 401) {
    // If unauthorized, redirect to login state
    clearAuthToken();
    window.dispatchEvent(new Event('auth-expired'));
  }

  if (!response.ok) {
    let errorDetail = 'API request failed';
    try {
      const errJson = await response.json();
      errorDetail = errJson.detail || errJson.message || errorDetail;
    } catch (e) {
      errorDetail = `Error ${response.status}: ${response.statusText}`;
    }
    throw new Error(errorDetail);
  }

  return response.json();
}

export const api = {
  // Auth
  login: (data) => apiRequest('/auth/login', 'POST', data),
  registerStaff: (data) => apiRequest('/auth/register-request', 'POST', data),
  requestOtp: (mobile) => apiRequest(`/auth/request-otp?mobile_number=${encodeURIComponent(mobile)}`, 'POST'),
  forgotPassword: (data) => apiRequest('/auth/forgot-password', 'POST', data),
  getMe: () => apiRequest('/auth/me'),
  getPendingApprovals: () => apiRequest('/auth/pending-approvals'),
  approveUser: (data) => apiRequest('/auth/approve-user', 'POST', data),

  // Employees
  getEmployees: (params = '') => apiRequest(`/employees/${params}`),
  getEmployeeStats: () => apiRequest('/employees/statistics'),
  getEmployeeProfile: (id) => apiRequest(`/employees/${id}`),
  createEmployee: (data) => apiRequest('/employees/', 'POST', data),
  updateEmployee: (id, data) => apiRequest(`/employees/${id}`, 'PUT', data),
  deactivateEmployee: (id) => apiRequest(`/employees/${id}`, 'DELETE'),
  getAttendance: () => apiRequest('/employees/attendance'),
  markAttendance: (status = 'Present', remarks = '') => 
    apiRequest(`/employees/attendance/mark?attendance_status=${status}&remarks=${encodeURIComponent(remarks)}`, 'POST'),

  // Patients
  getPatients: (params = '') => apiRequest(`/patients/${params}`),
  getPatientProfile: (id) => apiRequest(`/patients/${id}`),
  registerPatient: (data) => apiRequest('/patients/', 'POST', data),
  updatePatient: (id, data) => apiRequest(`/patients/${id}`, 'PUT', data),
  deletePatient: (id) => apiRequest(`/patients/${id}`, 'DELETE'),

  // Status Tracking (Flagship)
  getStatusDashboard: () => apiRequest('/status-tracking/dashboard-metrics'),
  getStatusList: (params = '') => apiRequest(`/status-tracking/list${params}`),
  getStatusHistory: (id) => apiRequest(`/status-tracking/history/${id}`),
  updateStatus: (data) => apiRequest('/status-tracking/update', 'POST', data),

  // Doctors
  getDoctors: (params = '') => apiRequest(`/doctors/${params}`),
  getDoctorProfile: (id) => apiRequest(`/doctors/${id}`),
  createDoctor: (data) => apiRequest('/doctors/', 'POST', data),
  updateDoctor: (id, data) => apiRequest(`/doctors/${id}`, 'PUT', data),
  assignDoctor: (patientId, doctorId) => 
    apiRequest(`/doctors/assign-patient?patient_id=${patientId}&doctor_id=${doctorId}`, 'POST'),

  // Departments
  getDepartments: () => apiRequest('/departments/'),
  addDepartment: (data) => apiRequest('/departments/', 'POST', data),
  updateDepartment: (id, data) => apiRequest(`/departments/${id}`, 'PUT', data),

  // Admissions & Discharges
  getAdmissions: (params = '') => apiRequest(`/admissions/${params}`),
  admitPatient: (data) => apiRequest('/admissions/admit', 'POST', data),
  dischargePatient: (data) => apiRequest('/admissions/discharge', 'POST', data),

  // Beds
  getBeds: (params = '') => apiRequest(`/beds/${params}`),
  getBedSummary: () => apiRequest('/beds/summary'),
  addBed: (data) => apiRequest('/beds/', 'POST', data),
  updateBed: (id, data) => apiRequest(`/beds/${id}`, 'PUT', data),

  // Medical Records
  getMedicalRecords: (params = '') => apiRequest(`/medical-records/${params}`),
  createMedicalRecord: (data) => apiRequest('/medical-records/', 'POST', data),

  // Billing
  getBills: (params = '') => apiRequest(`/billing/${params}`),
  getRevenueSummary: () => apiRequest('/billing/revenue-summary'),
  generateBill: (data) => apiRequest('/billing/generate', 'POST', data),
  recordPayment: (data) => apiRequest('/billing/pay', 'POST', data),
  getReceiptUrl: (billId) => `${API_BASE}/billing/receipt/${billId}`,

  // Analytics & KPIs
  getDashboardKPIs: () => apiRequest('/analytics/dashboard-kpis'),
  getChartsData: () => apiRequest('/analytics/charts-data'),

  // Machine Learning
  getMLSummary: () => apiRequest('/ml/summary'),
  predictLOS: (data) => apiRequest('/ml/predict/length-of-stay', 'POST', data),
  predictReadmissionLogistic: (data) => apiRequest('/ml/predict/readmission-logistic', 'POST', data),
  predictReadmissionRF: (data) => apiRequest('/ml/predict/readmission-random-forest', 'POST', data),
  predictTriage: (data) => apiRequest('/ml/predict/triage', 'POST', data),
  getKMeansClusters: () => apiRequest('/ml/clusters/kmeans'),

  // Reports Download URL builder
  getReportDownloadUrl: (reportType, format = 'pdf') => 
    `${API_BASE}/reports/download?report_type=${reportType}&format=${format}`
};
