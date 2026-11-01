/**
 * API Service for MedPulse Hospital Management System.
 * Connects React UI to FastAPI backend with JWT Bearer Token.
 * Production Backend: https://medpulse-hospital-management-system-wjy9.onrender.com
 */

export const RENDER_BACKEND_URL = 'https://medpulse-hospital-management-system-wjy9.onrender.com';

/**
 * Returns the normalized backend API base URL.
 * Guarantees the `/api/v1` prefix is always present and never duplicated.
 */
export function getApiBaseUrl() {
  let url = (import.meta.env.VITE_API_URL || '').trim();

  // If unset, detect whether running on Vercel / production or local development
  if (!url) {
    const isVercelOrCloud = typeof window !== 'undefined' && (
      window.location.hostname.includes('vercel.app') ||
      (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1')
    );

    if (import.meta.env.PROD || isVercelOrCloud) {
      url = `${RENDER_BACKEND_URL}/api/v1`;
    } else {
      return '/api/v1'; // Local Vite dev server proxy
    }
  }

  // Remove any trailing slashes
  url = url.replace(/\/+$/, '');

  // Guard against missing /api/v1 prefix
  if (!url.endsWith('/api/v1')) {
    url = `${url}/api/v1`;
  }

  return url;
}

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

  const baseUrl = getApiBaseUrl();
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  let response;
  try {
    response = await fetch(fullUrl, options);
  } catch (networkErr) {
    throw new Error(
      `Network connection failure: Unable to connect to MedPulse backend (${baseUrl}). ` +
      `Please check your internet connection and verify that CORS is permitted.`
    );
  }

  if (response.status === 401) {
    // Only dispatch expired token event for authenticated routes, not initial login attempts
    if (!endpoint.includes('/auth/login')) {
      clearAuthToken();
      window.dispatchEvent(new Event('auth-expired'));
    }
  }

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      if (Array.isArray(errJson.detail)) {
        // FastAPI / Pydantic 422 validation errors
        errorDetail = errJson.detail
          .map((d) => `${d.loc ? d.loc[d.loc.length - 1] : 'Field'}: ${d.msg}`)
          .join(', ');
      } else if (typeof errJson.detail === 'string') {
        errorDetail = errJson.detail;
      } else if (errJson.message) {
        errorDetail = errJson.message;
      }
    } catch (_) {
      // Non-JSON error body (e.g. Vercel HTML 404 or gateway error page).
      // If the response is not JSON, the request likely hit the wrong server.
      if (response.status === 404) {
        errorDetail = 'Unable to reach the hospital backend server. Please try again or contact your system administrator.';
      }
    }

    if (!errorDetail) {
      switch (response.status) {
        case 400:
          errorDetail = 'Invalid request. Please check the supplied parameters.';
          break;
        case 401:
          errorDetail = 'Invalid credentials. Please check your Employee ID, Full Name, and Password or OTP.';
          break;
        case 403:
          errorDetail = 'Access denied. Your employee account is awaiting administrator approval or has been deactivated.';
          break;
        case 404:
          errorDetail = 'Unable to reach the hospital backend server. Please try again or contact your system administrator.';
          break;
        case 422:
          errorDetail = 'Validation error. One or more required fields are missing or invalid.';
          break;
        case 500:
        case 502:
        case 503:
          errorDetail = 'The hospital server encountered an issue. Please try again shortly.';
          break;
        default:
          errorDetail = `Something went wrong (${response.status}). Please try again.`;
      }
    }

    const err = new Error(errorDetail);
    err.status = response.status;
    throw err;
  }

  return response.json();
}

export const api = {
  // Base URL helper
  getBaseUrl: getApiBaseUrl,

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
  getReceiptUrl: (billId) => `${getApiBaseUrl()}/billing/receipt/${billId}`,

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
    `${getApiBaseUrl()}/reports/download?report_type=${reportType}&format=${format}`
};
