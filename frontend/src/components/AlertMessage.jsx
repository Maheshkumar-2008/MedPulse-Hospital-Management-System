import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';

export const AlertMessage = ({ type = 'info', message, onClose }) => {
  if (!message) return null;

  const styles = {
    info: 'bg-hospital-50 border-hospital-200 text-hospital-800 icon-hospital-600',
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 icon-emerald-600',
    error: 'bg-rose-50 border-rose-200 text-rose-800 icon-rose-600',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 icon-amber-600'
  };

  const icons = {
    info: Info,
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle
  };

  const Icon = icons[type] || Info;

  return (
    <div className={`p-4 rounded-xl border flex items-start gap-3 shadow-sm ${styles[type]}`}>
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 text-sm font-medium">{message}</div>
      {onClose && (
        <button onClick={onClose} className="text-xs font-bold opacity-70 hover:opacity-100">
          Dismiss
        </button>
      )}
    </div>
  );
};
