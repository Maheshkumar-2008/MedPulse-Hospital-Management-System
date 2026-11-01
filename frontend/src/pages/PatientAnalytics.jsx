import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { 
  BarChart3, PieChart, TrendingUp, Users, 
  Activity, Stethoscope, RefreshCw, Filter 
} from 'lucide-react';

export const PatientAnalytics = () => {
  const [charts, setCharts] = useState(null);
  const [kpis, setKpis] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [cRes, kRes] = await Promise.all([
        api.getChartsData(),
        api.getDashboardKPIs()
      ]);
      setCharts(cRes);
      setKpis(kRes);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Clinical & Epidemiological Analytics"
        subtitle="Biostatistical Analysis, Population Demographics, Department Dynamics & Caseload Patterns"
        actionButton={
          <button
            onClick={loadData}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Re-compute Analytics</span>
          </button>
        }
      />

      {/* Top Aggregates */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase">Population Cohort</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{kpis?.total_patients ?? '--'}</div>
          <span className="text-[10px] text-slate-500">Registered hospital patients</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-200 bg-blue-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-blue-700 uppercase">Active Inpatient Stay</span>
          <div className="text-2xl font-extrabold text-blue-900 mt-1">{kpis?.admitted_patients ?? '--'}</div>
          <span className="text-[10px] text-blue-500">Currently admitted in beds</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-emerald-700 uppercase">Rehabilitation Rate</span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1">
            {kpis?.total_admissions ? Math.round(((kpis.total_discharges || 0) / kpis.total_admissions) * 100) : 0}%
          </div>
          <span className="text-[10px] text-emerald-600">Discharges vs admissions</span>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <span className="text-[11px] font-bold text-rose-700 uppercase">Emergency Ratio</span>
          <div className="text-2xl font-extrabold text-rose-800 mt-1">
            {kpis?.total_patients ? Math.round(((kpis.emergency_patients || 0) / kpis.total_patients) * 100) : 0}%
          </div>
          <span className="text-[10px] text-rose-500">Emergency cases incidence</span>
        </div>
      </div>

      {/* Analytics Visual Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Department Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Clinical Department Caseload Breakdown</h3>
          <p className="text-xs text-slate-500 mb-4">Patient volume distribution across 10 specialized divisions</p>
          <div className="space-y-3">
            {charts?.department_distribution?.map((d, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-700">{d.department}</span>
                  <span className="text-hospital-700 font-bold">{d.patients} Patients</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-hospital-600 h-full rounded-full transition-all"
                    style={{ width: `${kpis?.total_patients ? (d.patients / kpis.total_patients) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Diagnoses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Top Pathology Diagnoses Frequency</h3>
          <p className="text-xs text-slate-500 mb-4">Incidence count of clinical pathologies treated</p>
          <div className="space-y-2.5">
            {charts?.disease_statistics?.map((d, i) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60 flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-800">{d.disease}</span>
                <span className="font-mono font-bold text-hospital-800 bg-hospital-100 px-2 py-0.5 rounded">
                  {d.count} Cases
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Demographics Age Groups */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Age Group Population Pyramid</h3>
          <p className="text-xs text-slate-500 mb-4">Categorization across lifecycle stages</p>
          <div className="space-y-3">
            {charts?.age_distribution?.map((a, i) => (
              <div key={i} className="space-y-1 text-xs">
                <div className="flex justify-between font-semibold">
                  <span className="text-slate-700">{a.age_group}</span>
                  <span className="text-emerald-700 font-bold">{a.count} Patients</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-emerald-600 h-full rounded-full transition-all"
                    style={{ width: `${kpis?.total_patients ? (a.count / kpis.total_patients) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Admissions & Discharges Throughput */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Monthly Inpatient Admission Dynamics</h3>
          <p className="text-xs text-slate-500 mb-4">Admissions and successful discharges throughput</p>
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 text-center text-xs">
            {charts?.monthly_trends?.map((m, i) => (
              <div key={i} className="p-2 bg-slate-50 rounded-xl border border-slate-200/60">
                <div className="font-bold text-slate-500 text-[11px] mb-1">{m.month}</div>
                <div className="font-bold text-hospital-700">+{m.admissions} Adm</div>
                <div className="text-[10px] text-emerald-600 font-semibold">-{m.discharges} Dis</div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
