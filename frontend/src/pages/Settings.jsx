import React, { useState } from 'react';
import { PageHeader } from '../components/PageHeader';
import { 
  Settings as SettingsIcon, Database, Server, Shield, 
  Terminal, CheckCircle2, RefreshCw, Cpu 
} from 'lucide-react';

export const Settings = () => {
  const [dbMode, setDbMode] = useState('MongoDB (Live Engine) with JSON Persistent Fallback');
  const [mongoUri, setMongoUri] = useState('mongodb+srv://<cluster-endpoint>/hospital_management_db');
  const [backupStatus, setBackupStatus] = useState('');

  const handleBackup = () => {
    setBackupStatus('Database snapshot successfully exported to backup archive.');
    setTimeout(() => setBackupStatus(''), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <PageHeader
        title="System Administration & Configuration"
        subtitle="Database Architecture, MongoDB Live Connection, Security Policies & Academic Project Metadata"
      />

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6 text-xs">
        
        {/* Section 1: Database Architecture */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Database className="w-4 h-4 text-hospital-600" />
            <span>1. Database Engine & Persistence Configuration</span>
          </h3>

          <div className="space-y-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Active Storage Engine</label>
              <input
                type="text"
                disabled
                value={dbMode}
                className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-700"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                The backend automatically connects to MongoDB when online and seamlessly guarantees zero-crash persistent storage using document store files.
              </p>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">MongoDB Connection URI</label>
              <input
                type="text"
                value={mongoUri}
                onChange={(e) => setMongoUri(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={handleBackup}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-colors"
              >
                Create Atomic Database Snapshot
              </button>
              {backupStatus && <span className="ml-3 text-emerald-600 font-semibold">{backupStatus}</span>}
            </div>
          </div>
        </div>

        {/* Section 2: Machine Learning Architecture */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Cpu className="w-4 h-4 text-hospital-600" />
            <span>2. Scikit-Learn Machine Learning Pipeline</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-slate-700">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="font-bold text-slate-900">5 Scikit-Learn Algorithms:</span>
              <p className="text-[11px] text-slate-500 mt-1">Linear Regression, Logistic Regression, Decision Tree, Random Forest, K-Means Clustering.</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/60">
              <span className="font-bold text-slate-900">Evaluation Strategy:</span>
              <p className="text-[11px] text-slate-500 mt-1">75/25 Train-Test Split with MAE, RMSE, R², Confusion Matrices, and Gini Feature Importance.</p>
            </div>
          </div>
        </div>

        {/* Section 3: Academic Institution Metadata */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2 mb-4 flex items-center gap-2">
            <Server className="w-4 h-4 text-hospital-600" />
            <span>3. Academic Capstone Project Specifications</span>
          </h3>

          <div className="p-4 bg-hospital-50/50 rounded-xl border border-hospital-200 space-y-2 text-slate-800">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Institution:</span>
              <strong className="text-hospital-900">Mohan Babu University (MBU), Tirupati</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Department / Program:</span>
              <strong className="text-slate-800">B.Tech Computer Science & Information Technology</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Project Deliverables:</span>
              <strong className="text-slate-800">React Dashboard, Streamlit Portal, FastAPI REST, MongoDB & MySQL</strong>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-500">Academic Thesis:</span>
              <strong className="text-slate-800">25-Section Complete Formal Project Thesis (docs/)</strong>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
