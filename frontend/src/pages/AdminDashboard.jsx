import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { StatCard } from '../components/StatCard';
import { PageHeader } from '../components/PageHeader';
import { 
  Users, UserCheck, Stethoscope, HeartPulse, LogOut, 
  BedDouble, AlertTriangle, Activity, DollarSign, 
  Filter, Search, RefreshCw, Download
} from 'lucide-react';

export const AdminDashboard = ({ onNavigate }) => {
  const [kpis, setKpis] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterDept, setFilterDept] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [kpiRes, chartRes] = await Promise.all([
        api.getDashboardKPIs(),
        api.getChartsData()
      ]);
      setKpis(kpiRes);
      setCharts(chartRes);
    } catch (e) {
      console.error('Dashboard load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Hospital Administration Dashboard"
        subtitle="Executive Clinical Performance, Live Inpatient Metrics, Capacity & Revenue Overview"
        actionButton={
          <div className="flex items-center gap-2">
            <button
              onClick={loadData}
              className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              onClick={() => onNavigate('reports')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-md shadow-hospital-600/20 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export PDF / Excel</span>
            </button>
          </div>
        }
      />

      {/* Emergency Alert Banner if Emergency Patients > 0 */}
      {kpis?.emergency_patients > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-600 text-white rounded-xl animate-pulse">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-rose-900">
                {kpis.emergency_patients} Emergency Triage Patient(s) Currently Active
              </h4>
              <p className="text-xs text-rose-700">Immediate clinical observation or emergency care pathway required.</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('status_tracking')}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg shadow-sm"
          >
            Monitor Emergency Patients
          </button>
        </div>
      )}

      {/* KPI Cards Row (9 KPIs Required by Section 12) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <StatCard
          title="Total Registered Patients"
          value={kpis?.total_patients ?? '--'}
          subtitle="All active medical profiles"
          icon={Users}
          color="blue"
          trend="+12%"
        />
        <StatCard
          title="Hospital Staff Roster"
          value={kpis?.total_employees ?? '--'}
          subtitle={`${kpis?.active_employees ?? 0} currently active`}
          icon={UserCheck}
          color="emerald"
        />
        <StatCard
          title="Specialist Doctors"
          value={kpis?.total_doctors ?? '--'}
          subtitle="Across 10 clinical depts"
          icon={Stethoscope}
          color="indigo"
        />
        <StatCard
          title="Active Admissions"
          value={kpis?.admitted_patients ?? '--'}
          subtitle={`Total historic: ${kpis?.total_admissions ?? 0}`}
          icon={HeartPulse}
          color="purple"
        />
        <StatCard
          title="Emergency Patients"
          value={kpis?.emergency_patients ?? '--'}
          subtitle="Urgent critical care triage"
          icon={AlertTriangle}
          color="rose"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Discharges"
          value={kpis?.total_discharges ?? '--'}
          subtitle="Successfully rehabilitated"
          icon={LogOut}
          color="emerald"
        />
        <StatCard
          title="Total Hospital Beds"
          value={kpis?.total_beds ?? '--'}
          subtitle="Capacity across all wards"
          icon={BedDouble}
          color="blue"
        />
        <StatCard
          title="Available Beds"
          value={kpis?.available_beds ?? '--'}
          subtitle="Vacant for immediate intake"
          icon={BedDouble}
          color="emerald"
        />
        <StatCard
          title="Occupied Beds"
          value={kpis?.occupied_beds ?? '--'}
          subtitle={`Occupancy: ${kpis?.total_beds ? Math.round((kpis.occupied_beds / kpis.total_beds)*100) : 0}%`}
          icon={BedDouble}
          color="amber"
        />
      </div>

      {/* Quick Modules Action Banner */}
      <div className="bg-gradient-to-r from-hospital-900 to-hospital-800 text-white rounded-2xl p-5 shadow-lg flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
            <Activity className="w-6 h-6 text-hospital-300" />
          </div>
          <div>
            <h3 className="text-base font-bold">Patient Status Tracking Module (Flagship)</h3>
            <p className="text-xs text-sky-200">
              Live bedside monitoring across 10 vital health states, doctor assignments, and bed allocations.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => onNavigate('status_tracking')}
            className="px-4 py-2 bg-hospital-500 hover:bg-hospital-400 text-white text-xs font-bold rounded-xl transition-all shadow-md"
          >
            Open Status Tracker
          </button>
          <button
            onClick={() => onNavigate('patient_registration')}
            className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white text-xs font-bold rounded-xl transition-all border border-white/20"
          >
            Register New Patient
          </button>
        </div>
      </div>

      {/* 10 ANALYTICS CHARTS SECTION (Section 12) */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900">Hospital Analytics & Clinical Metrics (10 Visualizations)</h2>
          <span className="text-xs text-slate-500">Live aggregated statistics</span>
        </div>

        {/* Row 1: Gender Distribution & Age Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Gender Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">1. Gender-wise Patient Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Proportion of male, female, and other demographic profiles</p>
            <div className="space-y-3">
              {charts?.gender_distribution?.map((g, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{g.name}</span>
                    <span className="text-hospital-700 font-bold">{g.value} Patients</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-hospital-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${kpis?.total_patients ? (g.value / kpis.total_patients) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 2: Age-wise Patient Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">2. Age-wise Patient Cohort Distribution</h3>
            <p className="text-xs text-slate-500 mb-4">Pediatric, Young Adult, Middle Aged & Senior populations</p>
            <div className="space-y-3">
              {charts?.age_distribution?.map((a, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{a.age_group}</span>
                    <span className="text-emerald-700 font-bold">{a.count} Patients</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                    <div 
                      className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${kpis?.total_patients ? (a.count / kpis.total_patients) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 2: Disease Statistics & Department Count */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 3: Disease-wise Statistics */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">3. Disease-wise Patient Statistics</h3>
            <p className="text-xs text-slate-500 mb-4">Top diagnosed clinical conditions in hospital registry</p>
            <div className="space-y-2.5">
              {charts?.disease_statistics?.map((d, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-800">{d.disease}</span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 bg-hospital-100 text-hospital-800 rounded-md">
                    {d.count} Cases
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 4: Department-wise Patient Count */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">4. Department-wise Patient Count</h3>
            <p className="text-xs text-slate-500 mb-4">Patient volume allocated across hospital clinical wings</p>
            <div className="space-y-3">
              {charts?.department_distribution?.map((dept, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700">{dept.department}</span>
                    <span className="text-slate-900 font-bold">{dept.patients} Patients</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div 
                      className="bg-sky-500 h-full rounded-full transition-all"
                      style={{ width: `${kpis?.total_patients ? (dept.patients / kpis.total_patients) * 100 : 0}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Row 3: Monthly Admissions & Discharges */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <h3 className="text-sm font-bold text-slate-800 mb-1">5 & 6. Monthly Admissions and Discharges Statistics</h3>
          <p className="text-xs text-slate-500 mb-4">Inpatient throughput dynamics across calendar months</p>
          <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 text-center">
            {charts?.monthly_trends?.map((m, idx) => (
              <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-200/60">
                <div className="text-[11px] font-bold text-slate-500 mb-1">{m.month}</div>
                <div className="text-xs font-bold text-hospital-600">+{m.admissions}</div>
                <div className="text-[10px] text-emerald-600 font-semibold">-{m.discharges}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Row 4: Doctor-wise Statistics & Bed Occupancy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 7: Doctor-wise Patient Statistics */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">7. Doctor-wise Patient Consultation Volume</h3>
            <p className="text-xs text-slate-500 mb-4">Active clinical caseload under specialized attending physicians</p>
            <div className="space-y-2">
              {charts?.doctor_statistics?.map((doc, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-hospital-100 text-hospital-700 flex items-center justify-center font-bold text-[10px]">
                      {doc.doctor[3]}
                    </div>
                    <span className="text-xs font-bold text-slate-800">{doc.doctor}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-hospital-700">{doc.patients} Assigned</span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 8: Bed Occupancy Analysis */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-1">8. Bed Occupancy Analysis by Ward Type</h3>
            <p className="text-xs text-slate-500 mb-4">Capacity and occupancy rate for General, ICU, and Deluxe wards</p>
            <div className="space-y-3.5">
              {charts?.bed_occupancy?.map((b, idx) => {
                const pct = b.total > 0 ? Math.round((b.occupied / b.total) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-700">{b.type}</span>
                      <span className="text-slate-900 font-bold">{b.occupied} / {b.total} Beds ({pct}%)</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${pct > 80 ? 'bg-rose-500' : pct > 50 ? 'bg-amber-500' : 'bg-emerald-500'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 5: Patient Status Distribution & Revenue Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 9: Patient Status Distribution */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">9. Patient Status Distribution</h3>
                <p className="text-xs text-slate-500">Live distribution across 10 vital health tracking stages</p>
              </div>
              <button
                onClick={() => onNavigate('status_tracking')}
                className="text-xs text-hospital-600 font-bold hover:underline"
              >
                View Full Tracking Table &rarr;
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {charts?.status_distribution?.map((st, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-700 truncate mr-2">{st.status}</span>
                  <span className="text-xs font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded shadow-2xs">
                    {st.count}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Chart 10: Hospital Revenue Analysis */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-800">10. Hospital Revenue Analysis</h3>
                <p className="text-xs text-slate-500">Breakdown of consultations, beds, pharmacy, and diagnostic revenue</p>
              </div>
              <button
                onClick={() => onNavigate('billing_management')}
                className="text-xs text-hospital-600 font-bold hover:underline"
              >
                Invoicing Portal &rarr;
              </button>
            </div>
            <div className="space-y-3">
              {charts?.revenue_analysis?.map((rev, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                  <span className="text-xs font-semibold text-slate-700">{rev.category}</span>
                  <span className="text-xs font-mono font-bold text-emerald-700">
                    INR ₹{rev.amount.toLocaleString('en-IN')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
