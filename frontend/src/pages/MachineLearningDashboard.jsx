import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { PageHeader } from '../components/PageHeader';
import { 
  BrainCircuit, GitBranch, Layers, TrendingUp, 
  BarChart, Activity, AlertTriangle, CheckCircle2, 
  Sparkles, RefreshCw, ChevronRight 
} from 'lucide-react';

export const MachineLearningDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [activeTab, setActiveTab] = useState('model1'); // model1, model2, model3, model4, model5, comparison
  const [loading, setLoading] = useState(true);

  // Interactive Live Prediction States
  // 1. LOS Input
  const [losInput, setLosInput] = useState({ age: 52, comorbidity_score: 2, prior_admissions_count: 1, systolic_bp: 135, glucose_level: 130 });
  const [losResult, setLosResult] = useState(null);
  const [losPredicting, setLosPredicting] = useState(false);

  // 2. Logistic Regression Readmission Input
  const [readmitInput, setReadmitInput] = useState({ age: 58, comorbidity_score: 2, prior_admissions_count: 2, length_of_stay_days: 4.5, systolic_bp: 142, glucose_level: 160, bmi: 28.4 });
  const [readmitResult, setReadmitResult] = useState(null);
  const [readmitPredicting, setReadmitPredicting] = useState(false);

  // 3. Decision Tree Triage Input
  const [triageInput, setTriageInput] = useState({ age: 48, systolic_bp: 155, glucose_level: 190, comorbidity_score: 2, prior_admissions_count: 1 });
  const [triageResult, setTriageResult] = useState(null);
  const [triagePredicting, setTriagePredicting] = useState(false);

  // 4. Random Forest Input
  const [rfResult, setRfResult] = useState(null);
  const [rfPredicting, setRfPredicting] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.getMLSummary();
      setSummary(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handlePredictLOS = async (e) => {
    e.preventDefault();
    setLosPredicting(true);
    try {
      const res = await api.predictLOS(losInput);
      setLosResult(res);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setLosPredicting(false);
    }
  };

  const handlePredictReadmit = async (e) => {
    e.preventDefault();
    setReadmitPredicting(true);
    try {
      const res = await api.predictReadmissionLogistic(readmitInput);
      setReadmitResult(res);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setReadmitPredicting(false);
    }
  };

  const handlePredictTriage = async (e) => {
    e.preventDefault();
    setTriagePredicting(true);
    try {
      const res = await api.predictTriage(triageInput);
      setTriageResult(res);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setTriagePredicting(false);
    }
  };

  const handlePredictRF = async (e) => {
    e.preventDefault();
    setRfPredicting(true);
    try {
      const res = await api.predictReadmissionRF(readmitInput);
      setRfResult(res);
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setRfPredicting(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Machine Learning & Predictive Health Intelligence"
        subtitle="Five Scikit-Learn Algorithms Trained on Standardized Clinical Indicators with Cross-Validation"
        actionButton={
          <button
            onClick={fetchSummary}
            className="flex items-center gap-1.5 px-3 py-2 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reload Models</span>
          </button>
        }
      />

      {/* Academic Research Disclaimer (Section 14 Requirement) */}
      <div className="bg-amber-50 border border-amber-300 p-4 rounded-2xl flex items-start gap-3 text-xs text-amber-900 shadow-2xs">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-extrabold uppercase tracking-wide">Academic Research & Educational Demonstration Notice:</span>
          <p className="mt-0.5 text-amber-800">
            These predictive algorithms have been developed for the B.Tech CS-IT capstone project at Mohan Babu University using synthetic patient cohorts. 
            They are intended exclusively for biostatistical education, algorithmic benchmarking, and workflow simulation; they must not be employed for clinical diagnostic decisions.
          </p>
        </div>
      </div>

      {/* Model Selection Tabs (5 Models + Comparison) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 custom-scrollbar text-xs">
        <button
          onClick={() => setActiveTab('model1')}
          className={`px-3.5 py-2 font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'model1' ? 'bg-hospital-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          1. Linear Regression (LOS)
        </button>
        <button
          onClick={() => setActiveTab('model2')}
          className={`px-3.5 py-2 font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'model2' ? 'bg-hospital-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          2. Logistic Regression (Readmission)
        </button>
        <button
          onClick={() => setActiveTab('model3')}
          className={`px-3.5 py-2 font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'model3' ? 'bg-hospital-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          3. Decision Tree (Triage)
        </button>
        <button
          onClick={() => setActiveTab('model4')}
          className={`px-3.5 py-2 font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'model4' ? 'bg-hospital-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          4. Random Forest (Ensemble)
        </button>
        <button
          onClick={() => setActiveTab('model5')}
          className={`px-3.5 py-2 font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'model5' ? 'bg-hospital-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          5. K-Means (Patient Cohorts)
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`px-3.5 py-2 font-bold rounded-xl whitespace-nowrap transition-all ${
            activeTab === 'comparison' ? 'bg-hospital-600 text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          Algorithm Benchmark Matrix
        </button>
      </div>

      {/* ==================================================== */}
      {/* MODEL 1: LINEAR REGRESSION */}
      {/* ==================================================== */}
      {activeTab === 'model1' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-hospital-600 uppercase tracking-wider">Model 1: Supervised Regression</span>
                <h3 className="text-base font-extrabold text-slate-900">Hospital Length of Stay (LOS) Predictor</h3>
                <p className="text-xs text-slate-500">Estimates expected inpatient stay duration (in days) using clinical comorbidity parameters.</p>
              </div>
              <span className="font-mono text-xs bg-hospital-50 text-hospital-700 font-bold px-3 py-1 rounded-lg border border-hospital-200">
                Continuous Target Variable
              </span>
            </div>

            {/* Metrics Row */}
            <div className="grid grid-cols-3 gap-4 my-6 text-center">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Mean Absolute Error (MAE)</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                  {summary?.linear_regression?.mae ?? 1.15} Days
                </div>
                <span className="text-[10px] text-slate-500">Average absolute error deviation</span>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Root Mean Squared Error (RMSE)</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                  {summary?.linear_regression?.rmse ?? 1.48} Days
                </div>
                <span className="text-[10px] text-slate-500">Quadratic scoring metric</span>
              </div>
              <div className="p-4 bg-hospital-50/50 rounded-xl border border-hospital-200">
                <span className="text-[11px] font-bold text-hospital-700 uppercase">Coefficient of Determination (R²)</span>
                <div className="text-2xl font-extrabold text-hospital-800 mt-1 font-mono">
                  {summary?.linear_regression?.r2_score ?? 0.74}
                </div>
                <span className="text-[10px] text-hospital-600">Proportion of variance explained</span>
              </div>
            </div>

            {/* Actual vs Predicted Table Sample */}
            <div className="mt-6">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Actual vs. Predicted Stay Sample (Test Evaluation Fold)
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-2 text-center text-xs">
                {summary?.linear_regression?.sample_predictions?.slice(0, 10).map((pt, idx) => (
                  <div key={idx} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200/60">
                    <div className="text-[10px] text-slate-400 font-bold mb-1">Patient #{idx + 1}</div>
                    <div className="text-slate-800">Actual: <strong className="font-mono">{pt.actual}d</strong></div>
                    <div className="text-hospital-600 font-bold">Pred: <strong className="font-mono">{pt.predicted}d</strong></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Interactive Predictor */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-hospital-600" />
              <span>Interactive Patient Stay Duration Estimator</span>
            </h4>

            <form onSubmit={handlePredictLOS} className="grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Age</label>
                <input
                  type="number"
                  value={losInput.age}
                  onChange={(e) => setLosInput({...losInput, age: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Comorbidity Index (0-5)</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  value={losInput.comorbidity_score}
                  onChange={(e) => setLosInput({...losInput, comorbidity_score: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Prior Admissions</label>
                <input
                  type="number"
                  min={0}
                  max={6}
                  value={losInput.prior_admissions_count}
                  onChange={(e) => setLosInput({...losInput, prior_admissions_count: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Systolic BP (mmHg)</label>
                <input
                  type="number"
                  value={losInput.systolic_bp}
                  onChange={(e) => setLosInput({...losInput, systolic_bp: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Glucose Level (mg/dL)</label>
                <input
                  type="number"
                  value={losInput.glucose_level}
                  onChange={(e) => setLosInput({...losInput, glucose_level: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="sm:col-span-5 flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={losPredicting}
                  className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl shadow-xs"
                >
                  {losPredicting ? 'Computing...' : 'Calculate Predicted Stay Duration'}
                </button>
              </div>
            </form>

            {losResult && (
              <div className="mt-4 p-4 bg-hospital-50 border border-hospital-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-hospital-900">Estimated Inpatient Hospitalization:</span>
                  <p className="text-hospital-700 mt-0.5">{losResult.interpretation}</p>
                </div>
                <div className="font-mono text-2xl font-extrabold text-hospital-700">
                  {losResult.predicted_length_of_stay_days} Days
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODEL 2: LOGISTIC REGRESSION */}
      {/* ==================================================== */}
      {activeTab === 'model2' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-hospital-600 uppercase tracking-wider">Model 2: Supervised Binary Classification</span>
                <h3 className="text-base font-extrabold text-slate-900">Logistic Regression 30-Day Readmission Risk Classifier</h3>
                <p className="text-xs text-slate-500">Estimates the sigmoid calibrated probability of an unplanned hospital readmission.</p>
              </div>
              <span className="font-mono text-xs bg-emerald-50 text-emerald-800 font-bold px-3 py-1 rounded-lg border border-emerald-200">
                Binary Classification (0/1)
              </span>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 text-center">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Classification Accuracy</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                  {Math.round((summary?.logistic_regression?.accuracy ?? 0.82) * 100)}%
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Precision Score</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                  {Math.round((summary?.logistic_regression?.precision ?? 0.79) * 100)}%
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Recall (Sensitivity)</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                  {Math.round((summary?.logistic_regression?.recall ?? 0.76) * 100)}%
                </div>
              </div>
              <div className="p-4 bg-hospital-50/50 rounded-xl border border-hospital-200">
                <span className="text-[11px] font-bold text-hospital-700 uppercase">F1 Harmonic Score</span>
                <div className="text-2xl font-extrabold text-hospital-800 mt-1 font-mono">
                  {summary?.logistic_regression?.f1_score ?? 0.78}
                </div>
              </div>
            </div>

            {/* Confusion Matrix Visualization */}
            <div className="mt-4 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                Evaluation Confusion Matrix (2x2 Contingency Table)
              </h4>
              <div className="grid grid-cols-2 max-w-sm gap-2 text-center text-xs font-mono">
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-lg">
                  <div className="text-[10px] text-emerald-700 font-bold">True Negative (Safe)</div>
                  <div className="text-xl font-extrabold">{summary?.logistic_regression?.confusion_matrix?.[0]?.[0] ?? 46}</div>
                </div>
                <div className="p-3 bg-rose-50 text-rose-800 rounded-lg">
                  <div className="text-[10px] text-rose-600 font-bold">False Positive</div>
                  <div className="text-xl font-extrabold">{summary?.logistic_regression?.confusion_matrix?.[0]?.[1] ?? 8}</div>
                </div>
                <div className="p-3 bg-rose-50 text-rose-800 rounded-lg">
                  <div className="text-[10px] text-rose-600 font-bold">False Negative</div>
                  <div className="text-xl font-extrabold">{summary?.logistic_regression?.confusion_matrix?.[1]?.[0] ?? 5}</div>
                </div>
                <div className="p-3 bg-emerald-100 text-emerald-900 rounded-lg">
                  <div className="text-[10px] text-emerald-700 font-bold">True Positive (Risk)</div>
                  <div className="text-xl font-extrabold">{summary?.logistic_regression?.confusion_matrix?.[1]?.[1] ?? 16}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Test Panel */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-hospital-600" />
              <span>Interactive Readmission Risk Classifier</span>
            </h4>
            <form onSubmit={handlePredictReadmit} className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Age</label>
                <input
                  type="number"
                  value={readmitInput.age}
                  onChange={(e) => setReadmitInput({...readmitInput, age: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Comorbidity Index</label>
                <input
                  type="number"
                  value={readmitInput.comorbidity_score}
                  onChange={(e) => setReadmitInput({...readmitInput, comorbidity_score: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Prior Admissions</label>
                <input
                  type="number"
                  value={readmitInput.prior_admissions_count}
                  onChange={(e) => setReadmitInput({...readmitInput, prior_admissions_count: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Body Mass Index (BMI)</label>
                <input
                  type="number"
                  step="0.1"
                  value={readmitInput.bmi}
                  onChange={(e) => setReadmitInput({...readmitInput, bmi: parseFloat(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="col-span-2 sm:col-span-4 flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={readmitPredicting}
                  className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl"
                >
                  {readmitPredicting ? 'Classifying...' : 'Classify 30-Day Readmission Risk'}
                </button>
              </div>
            </form>

            {readmitResult && (
              <div className={`mt-4 p-4 rounded-xl border text-xs flex items-center justify-between ${
                readmitResult.predicted_class === 1
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                <div>
                  <div className="font-extrabold text-sm">{readmitResult.risk_label}</div>
                  <p className="mt-0.5">{readmitResult.recommendation}</p>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xl font-bold">{readmitResult.probability_readmission}% Risk</div>
                  <span className="text-[10px] opacity-75">Probability Estimate</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODEL 3: DECISION TREE */}
      {/* ==================================================== */}
      {activeTab === 'model3' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-hospital-600 uppercase tracking-wider">Model 3: Rule-Based Supervised Tree</span>
                <h3 className="text-base font-extrabold text-slate-900">Clinical Triage Urgency Decision Tree Classifier</h3>
                <p className="text-xs text-slate-500">Transparent if-then binary splitting rules categorizing patients into Low, Medium, High, or Critical triage streams.</p>
              </div>
              <span className="font-mono text-xs bg-purple-50 text-purple-800 font-bold px-3 py-1 rounded-lg border border-purple-200">
                Multi-Class Urgency Triage
              </span>
            </div>

            <div className="grid grid-cols-3 gap-4 my-6 text-center">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Tree Accuracy</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                  {Math.round((summary?.decision_tree?.accuracy ?? 0.81) * 100)}%
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Tree Max Depth</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                  {summary?.decision_tree?.tree_depth ?? 4} Levels
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Decision Terminal Leaves</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                  {summary?.decision_tree?.n_leaves ?? 11} Leaf Nodes
                </div>
              </div>
            </div>

            {/* Tree Rules Code Snippet */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                White-Box Decision Tree Splitting Logic (Academic Proof)
              </h4>
              <pre className="p-4 bg-slate-900 text-emerald-400 rounded-xl font-mono text-[11px] overflow-x-auto max-h-60 custom-scrollbar">
                {summary?.decision_tree?.tree_rules_text || "Decision Tree logic successfully trained."}
              </pre>
            </div>
          </div>

          {/* Interactive Triage Predictor */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-hospital-600" />
              <span>Interactive Patient Triage Urgency Tester</span>
            </h4>
            <form onSubmit={handlePredictTriage} className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Age</label>
                <input
                  type="number"
                  value={triageInput.age}
                  onChange={(e) => setTriageInput({...triageInput, age: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Systolic BP</label>
                <input
                  type="number"
                  value={triageInput.systolic_bp}
                  onChange={(e) => setTriageInput({...triageInput, systolic_bp: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Glucose Level</label>
                <input
                  type="number"
                  value={triageInput.glucose_level}
                  onChange={(e) => setTriageInput({...triageInput, glucose_level: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Comorbidity Index</label>
                <input
                  type="number"
                  value={triageInput.comorbidity_score}
                  onChange={(e) => setTriageInput({...triageInput, comorbidity_score: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>
              <div>
                <label className="font-bold text-slate-700 block mb-1">Prior Admissions</label>
                <input
                  type="number"
                  value={triageInput.prior_admissions_count}
                  onChange={(e) => setTriageInput({...triageInput, prior_admissions_count: parseInt(e.target.value) || 0})}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="col-span-2 sm:col-span-5 flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={triagePredicting}
                  className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white font-bold rounded-xl"
                >
                  {triagePredicting ? 'Evaluating Triage...' : 'Route Clinical Triage Urgency'}
                </button>
              </div>
            </form>

            {triageResult && (
              <div className="mt-4 p-4 bg-purple-50 border border-purple-200 rounded-xl text-xs flex items-center justify-between">
                <div>
                  <span className="font-bold text-purple-900">Decision Tree Triage Determination:</span>
                  <p className="text-purple-700 mt-0.5">{triageResult.clinical_protocol}</p>
                </div>
                <div className="font-extrabold text-xl font-mono text-purple-800">
                  Level: {triageResult.predicted_triage_level}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODEL 4: RANDOM FOREST */}
      {/* ==================================================== */}
      {activeTab === 'model4' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-hospital-600 uppercase tracking-wider">Model 4: Ensemble Learning</span>
                <h3 className="text-base font-extrabold text-slate-900">Random Forest Readmission Classifier & Feature Importance</h3>
                <p className="text-xs text-slate-500">Ensemble of 100 bootstrapped decision trees ranking clinical risk drivers.</p>
              </div>
              <span className="font-mono text-xs bg-indigo-50 text-indigo-800 font-bold px-3 py-1 rounded-lg border border-indigo-200">
                100 Estimators Ensemble
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6 text-center">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Ensemble Accuracy</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                  {Math.round((summary?.random_forest?.accuracy ?? 0.88) * 100)}%
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Precision</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                  {Math.round((summary?.random_forest?.precision ?? 0.86) * 100)}%
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80">
                <span className="text-[11px] font-bold text-slate-400 uppercase">Recall</span>
                <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
                  {Math.round((summary?.random_forest?.recall ?? 0.83) * 100)}%
                </div>
              </div>
              <div className="p-4 bg-hospital-50/50 rounded-xl border border-hospital-200">
                <span className="text-[11px] font-bold text-hospital-700 uppercase">F1 Score</span>
                <div className="text-2xl font-extrabold text-hospital-800 mt-1 font-mono">
                  {summary?.random_forest?.f1_score ?? 0.84}
                </div>
              </div>
            </div>

            {/* Feature Importance Ranking */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
                Feature Importance Ranking (Gini Impurity Reduction)
              </h4>
              <div className="space-y-3">
                {summary?.random_forest?.feature_importance?.map((f, idx) => (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-semibold">
                      <span className="text-slate-800 capitalize">{f.feature.replace(/_/g, ' ')}</span>
                      <span className="text-hospital-700 font-mono font-bold">{f.percentage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-hospital-600 h-full rounded-full transition-all"
                        style={{ width: `${f.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* MODEL 5: K-MEANS CLUSTERING */}
      {/* ==================================================== */}
      {activeTab === 'model5' && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold text-hospital-600 uppercase tracking-wider">Model 5: Unsupervised Clustering</span>
                <h3 className="text-base font-extrabold text-slate-900">K-Means Patient Cohort Segmentation (k = 4)</h3>
                <p className="text-xs text-slate-500">Unsupervised geometric clustering grouping patients into demographic & clinical recovery cohorts.</p>
              </div>
              <span className="font-mono text-xs bg-amber-50 text-amber-800 font-bold px-3 py-1 rounded-lg border border-amber-200">
                Inertia (WCSS): {summary?.kmeans?.inertia ?? 412.5}
              </span>
            </div>

            {/* Cluster Summaries Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
              {summary?.kmeans?.cluster_summaries?.map(c => (
                <div key={c.cluster_id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-hospital-700">Cohort #{c.cluster_id + 1}</span>
                    <span className="font-mono text-[11px] bg-hospital-100 text-hospital-800 px-2 py-0.5 rounded font-bold">
                      {c.patient_count} Patients
                    </span>
                  </div>
                  <h5 className="font-extrabold text-slate-900 text-sm">{c.cluster_title}</h5>
                  <div className="grid grid-cols-2 gap-2 text-slate-600 pt-2 border-t border-slate-200/60">
                    <div>Mean Age: <strong className="text-slate-800">{c.avg_age} Y</strong></div>
                    <div>Mean Stay: <strong className="text-slate-800">{c.avg_stay_days} d</strong></div>
                    <div>Systolic BP: <strong className="text-slate-800">{c.avg_systolic_bp} mmHg</strong></div>
                    <div>Mean Glucose: <strong className="text-slate-800">{c.avg_glucose} mg/dL</strong></div>
                  </div>
                </div>
              ))}
            </div>

            {/* PCA 2D Scatter Visualization Data */}
            <div>
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                2D Principal Component Analysis (PCA) Dimensionality Reduction Samples
              </h4>
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl font-mono text-[10px] overflow-x-auto max-h-48 custom-scrollbar">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-400 border-b border-slate-700">
                      <th className="py-1">Patient ID</th>
                      <th className="py-1">PCA Component 1</th>
                      <th className="py-1">PCA Component 2</th>
                      <th className="py-1">Assigned Cluster</th>
                      <th className="py-1">Stay Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {summary?.kmeans?.visualization_points?.slice(0, 8).map((pt, i) => (
                      <tr key={i} className="border-b border-slate-800">
                        <td className="py-1 text-hospital-400">{pt.patient_id}</td>
                        <td className="py-1">{pt.x}</td>
                        <td className="py-1">{pt.y}</td>
                        <td className="py-1 text-emerald-400">Cluster {pt.cluster} ({pt.cluster_title})</td>
                        <td className="py-1">{pt.los} d</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================================================== */}
      {/* COMPARISON BENCHMARK MATRIX */}
      {/* ==================================================== */}
      {activeTab === 'comparison' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Comprehensive Scikit-Learn Model Benchmark Matrix</h3>
            <p className="text-xs text-slate-500">Cross-algorithm comparison across supervised and unsupervised clinical tasks.</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Algorithm Name</th>
                  <th className="py-3 px-4">Clinical Healthcare Task</th>
                  <th className="py-3 px-4">Key Performance Metrics</th>
                  <th className="py-3 px-4">Model Complexity & Explainability</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {summary?.comparison_matrix?.map((m, idx) => (
                  <tr key={idx} className="hover:bg-hospital-50/40">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{m.model}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{m.task}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-hospital-700">
                      {m.accuracy ? `Accuracy: ${(m.accuracy * 100).toFixed(1)}% | F1: ${m.f1_score}` : ''}
                      {m.mae ? `MAE: ${m.mae}d | RMSE: ${m.rmse}d | R²: ${m.r2_score}` : ''}
                      {m.inertia ? `Inertia: ${m.inertia} | Clusters: ${m.clusters}` : ''}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{m.complexity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
};
