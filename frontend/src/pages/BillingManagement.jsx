import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { PageHeader } from '../components/PageHeader';
import { AlertMessage } from '../components/AlertMessage';
import { 
  Receipt, Plus, DollarSign, Download, CheckCircle2, 
  CreditCard, Clock, FileText, ArrowRight 
} from 'lucide-react';

export const BillingManagement = () => {
  const { user } = useAuth();
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Generate Bill Modal
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [billForm, setBillForm] = useState({
    patient_id: '',
    consultation_charges: 500,
    room_charges: 0,
    medicine_charges: 300,
    laboratory_charges: 450,
    other_charges: 100
  });

  // Record Payment Modal
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [payAmount, setPayAmount] = useState(0);
  const [payMode, setPayMode] = useState('UPI');

  const [alert, setAlert] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [billsRes, sumRes, patRes] = await Promise.all([
        api.getBills(),
        api.getRevenueSummary(),
        api.getPatients()
      ]);
      setBills(billsRes);
      setSummary(sumRes);
      setPatients(patRes);
      if (patRes.length > 0) setBillForm(prev => ({ ...prev, patient_id: patRes[0].patient_id }));
    } catch (e) {
      setAlert({ type: 'error', message: 'Error loading billing data: ' + e.message });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGenerateBill = async (e) => {
    e.preventDefault();
    try {
      const res = await api.generateBill(billForm);
      setAlert({ type: 'success', message: res.message });
      setBillModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Error generating invoice: ' + err.message);
    }
  };

  const openPayModal = (b) => {
    setSelectedBill(b);
    setPayAmount(b.total_amount);
    setPayModalOpen(true);
  };

  const handlePaySubmit = async (e) => {
    e.preventDefault();
    if (!selectedBill) return;
    try {
      const res = await api.recordPayment({
        bill_id: selectedBill.bill_id,
        amount_paid: parseFloat(payAmount) || 0,
        payment_mode: payMode
      });
      setAlert({ type: 'success', message: res.message });
      setPayModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Payment recording failed: ' + err.message);
    }
  };

  const calculateFormTotal = () => {
    return (
      Number(billForm.consultation_charges || 0) +
      Number(billForm.room_charges || 0) +
      Number(billForm.medicine_charges || 0) +
      Number(billForm.laboratory_charges || 0) +
      Number(billForm.other_charges || 0)
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Hospital Billing & Payment Management"
        subtitle="Invoicing, Consultation Fees, Diagnostic Pricing, Online Settlements & Automated PDF Receipts"
        actionButton={
          <button
            onClick={() => setBillModalOpen(true)}
            className="px-4 py-2 bg-hospital-600 hover:bg-hospital-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Generate New Patient Invoice</span>
          </button>
        }
      />

      {alert && <AlertMessage type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

      {/* Revenue KPI Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Total Invoiced Amount</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1 font-mono">
            ₹{summary?.total_billed_amount?.toLocaleString('en-IN') ?? '--'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-emerald-200 bg-emerald-50/20 shadow-2xs">
          <div className="text-xs font-bold text-emerald-700 uppercase">Settled Revenue (Paid)</div>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1 font-mono">
            ₹{summary?.total_collected_revenue?.toLocaleString('en-IN') ?? '--'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-200 bg-rose-50/20 shadow-2xs">
          <div className="text-xs font-bold text-rose-700 uppercase">Pending Receivables</div>
          <div className="text-2xl font-extrabold text-rose-800 mt-1 font-mono">
            ₹{summary?.pending_amount?.toLocaleString('en-IN') ?? '--'}
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase">Invoices Issued</div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            {summary?.total_invoices_issued ?? '--'}
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-sm font-bold text-slate-900">Hospital Billing Ledger</h3>
          <span className="text-xs text-slate-400">PDF receipt generation supported</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Invoice ID & Patient</th>
                <th className="py-3 px-4">Consultation</th>
                <th className="py-3 px-4">Room & Bed</th>
                <th className="py-3 px-4">Pharmacy & Lab</th>
                <th className="py-3 px-4">Total Amount</th>
                <th className="py-3 px-4">Payment Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bills.map(b => (
                <tr key={b.bill_id} className="hover:bg-hospital-50/40">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{b.patient_name}</div>
                    <div className="text-[11px] font-mono text-hospital-600 font-semibold">{b.bill_id} ({b.patient_id})</div>
                  </td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">₹{b.consultation_charges}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">₹{b.room_charges}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-700">
                    ₹{Number(b.medicine_charges || 0) + Number(b.laboratory_charges || 0)}
                  </td>
                  <td className="py-3.5 px-4 font-mono font-extrabold text-slate-900 text-sm">
                    ₹{b.total_amount?.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                      b.payment_status === 'Paid'
                        ? 'bg-emerald-100 text-emerald-800'
                        : b.payment_status === 'Partially Paid'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}>
                      {b.payment_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {b.payment_status !== 'Paid' && (
                        <button
                          onClick={() => openPayModal(b)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-xs"
                        >
                          Record Pay
                        </button>
                      )}
                      <a
                        href={api.getReceiptUrl(b.bill_id)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg text-xs flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>PDF</span>
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* GENERATE BILL MODAL */}
      <Modal
        isOpen={billModalOpen}
        onClose={() => setBillModalOpen(false)}
        title="Generate Patient Hospital Bill"
      >
        <form onSubmit={handleGenerateBill} className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-700 block mb-1">Select Patient *</label>
            <select
              required
              value={billForm.patient_id}
              onChange={(e) => setBillForm({...billForm, patient_id: e.target.value})}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
            >
              {patients.map(p => (
                <option key={p.patient_id} value={p.patient_id}>{p.full_name} ({p.patient_id})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Consultation Charges (₹)</label>
              <input
                type="number"
                value={billForm.consultation_charges}
                onChange={(e) => setBillForm({...billForm, consultation_charges: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Hospital Room Charges (₹)</label>
              <input
                type="number"
                value={billForm.room_charges}
                onChange={(e) => setBillForm({...billForm, room_charges: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Pharmacy (₹)</label>
              <input
                type="number"
                value={billForm.medicine_charges}
                onChange={(e) => setBillForm({...billForm, medicine_charges: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Diagnostics / Lab (₹)</label>
              <input
                type="number"
                value={billForm.laboratory_charges}
                onChange={(e) => setBillForm({...billForm, laboratory_charges: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">Other Supplies (₹)</label>
              <input
                type="number"
                value={billForm.other_charges}
                onChange={(e) => setBillForm({...billForm, other_charges: parseFloat(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="p-3 bg-hospital-50 border border-hospital-200 rounded-xl flex items-center justify-between">
            <span className="font-bold text-hospital-900">Computed Total Bill:</span>
            <span className="font-mono text-base font-extrabold text-hospital-700">
              ₹{calculateFormTotal().toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setBillModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-hospital-600 hover:bg-hospital-700 text-white rounded-xl font-bold shadow-xs"
            >
              Issue Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={payModalOpen}
        onClose={() => setPayModalOpen(false)}
        title={`Record Payment for ${selectedBill?.bill_id}`}
      >
        <form onSubmit={handlePaySubmit} className="space-y-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
            <span className="text-slate-500">Patient:</span>
            <strong className="text-slate-900">{selectedBill?.patient_name}</strong>
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase block mb-1">Amount Paid (INR) *</label>
            <input
              type="number"
              required
              value={payAmount}
              onChange={(e) => setPayAmount(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm font-mono"
            />
          </div>

          <div>
            <label className="font-bold text-slate-700 uppercase block mb-1">Payment Mode *</label>
            <select
              value={payMode}
              onChange={(e) => setPayMode(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold"
            >
              <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="Cash">Cash at Counter</option>
              <option value="Insurance">TPA Insurance Cashless</option>
              <option value="Net Banking">Net Banking</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPayModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold"
            >
              Confirm Settlement
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
