import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';
import { 
  UserPlus, CheckCircle2, User, Phone, MapPin, 
  Droplet, Calendar, ShieldAlert, FileText, Stethoscope
} from 'lucide-react';

export const PatientRegistration = ({ onNavigate }) => {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const [formData, setFormData] = useState({
    full_name: '',
    age: 35,
    dob: '1991-05-15',
    gender: 'Male',
    mobile_number: '',
    address: '',
    blood_group: 'B+',
    emergency_contact: '',
    department: 'General Medicine',
    primary_diagnosis: '',
    medical_history: 'No known chronic conditions',
    allergies: 'None',
    assigned_doctor_id: '',
    current_status: 'Registered'
  });

  useEffect(() => {
    Promise.all([api.getDepartments(), api.getDoctors()])
      .then(([deptRes, docRes]) => {
        setDepartments(deptRes);
        setDoctors(docRes);
        if (docRes.length > 0) {
          setFormData(prev => ({ ...prev, assigned_doctor_id: docRes[0].doctor_id }));
        }
      })
      .catch(() => {});
  }, []);

  const handleAgeChange = (val) => {
    const age = parseInt(val) || 0;
    const currentYear = new Date().getFullYear();
    const birthYear = currentYear - age;
    setFormData(prev => ({
      ...prev,
      age: age,
      dob: `${birthYear}-01-01`
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setAlert(null);

    try {
      const res = await api.registerPatient(formData);
      setAlert({
        type: 'success',
        message: `Patient registered successfully with Unique Health ID: ${res.patient.patient_id}`
      });
      // Reset form
      setFormData({
        full_name: '',
        age: 30,
        dob: '1996-01-01',
        gender: 'Male',
        mobile_number: '',
        address: '',
        blood_group: 'O+',
        emergency_contact: '',
        department: 'General Medicine',
        primary_diagnosis: '',
        medical_history: 'No major history',
        allergies: 'None',
        assigned_doctor_id: doctors[0]?.doctor_id || '',
        current_status: 'Registered'
      });
    } catch (err) {
      setAlert({ type: 'error', message: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="Patient Intake & Registration"
        subtitle="Enroll New Patients, Issue Unique Hospital IDs & Initialize Electronic Health Record (EHR)"
      />

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        
        {/* Section 1: Demographics */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <User className="w-4 h-4 text-hospital-600" />
            <span>1. Demographics & Identification</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                placeholder="e.g. Ramesh Chandra"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Age (Y) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={120}
                  value={formData.age}
                  onChange={(e) => handleAgeChange(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Gender *
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({...formData, gender: e.target.value})}
                  className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Blood Group *
                </label>
                <select
                  value={formData.blood_group}
                  onChange={(e) => setFormData({...formData, blood_group: e.target.value})}
                  className="w-full px-2 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Date of Birth
              </label>
              <input
                type="date"
                required
                value={formData.dob}
                onChange={(e) => setFormData({...formData, dob: e.target.value})}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Primary Contact Number *
              </label>
              <input
                type="text"
                required
                value={formData.mobile_number}
                onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                placeholder="+91 98480XXXXX"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-hospital-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Contact & Address */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Phone className="w-4 h-4 text-hospital-600" />
            <span>2. Residential Address & Emergency Kin Contact</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Residential Street Address *
              </label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="House / Street / City / Pincode"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Emergency Contact Number *
              </label>
              <input
                type="text"
                required
                value={formData.emergency_contact}
                onChange={(e) => setFormData({...formData, emergency_contact: e.target.value})}
                placeholder="Family / Next of Kin Mobile"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Clinical Intake & Department */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-hospital-600" />
            <span>3. Clinical Assignment & Initial Diagnosis</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Clinical Department *
              </label>
              <select
                value={formData.department}
                onChange={(e) => setFormData({...formData, department: e.target.value})}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                {departments.map(d => (
                  <option key={d.department_id} value={d.department_name}>{d.department_name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Assigned Attending Doctor
              </label>
              <select
                value={formData.assigned_doctor_id}
                onChange={(e) => setFormData({...formData, assigned_doctor_id: e.target.value})}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
              >
                <option value="">None / Routine Intake</option>
                {doctors.map(doc => (
                  <option key={doc.doctor_id} value={doc.doctor_id}>
                    {doc.doctor_name} ({doc.specialization})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Initial Triage Status
              </label>
              <select
                value={formData.current_status}
                onChange={(e) => setFormData({...formData, current_status: e.target.value})}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold"
              >
                <option value="Registered">Registered (Routine)</option>
                <option value="Waiting for Consultation">Waiting for Consultation</option>
                <option value="Under Treatment">Under Treatment</option>
                <option value="Emergency">Emergency Red</option>
              </select>
            </div>
          </div>

          <div className="mt-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Primary Chief Complaint / Diagnosis *
            </label>
            <input
              type="text"
              required
              value={formData.primary_diagnosis}
              onChange={(e) => setFormData({...formData, primary_diagnosis: e.target.value})}
              placeholder="e.g. Acute chest pain, Viral pyrexia, Blunt trauma"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Known Drug Allergies
              </label>
              <input
                type="text"
                value={formData.allergies}
                onChange={(e) => setFormData({...formData, allergies: e.target.value})}
                placeholder="e.g. Penicillin, Sulfa, None"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">
                Past Medical History
              </label>
              <input
                type="text"
                value={formData.medical_history}
                onChange={(e) => setFormData({...formData, medical_history: e.target.value})}
                placeholder="e.g. Type 2 Diabetes for 5 years, Asthma"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <p className="text-xs text-slate-500">
            A unique <strong className="text-slate-800">PAT-XXXX</strong> ID will be generated upon submission.
          </p>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-hospital-600 hover:bg-hospital-700 active:bg-hospital-800 text-white font-bold rounded-xl shadow-lg shadow-hospital-600/20 text-xs flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Registering Patient...' : 'Register Patient & Open EHR'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
