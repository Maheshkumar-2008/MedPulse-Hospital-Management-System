import React from 'react';

const STATUS_CONFIGS = {
  'Discharged': { bg: 'bg-emerald-100 text-emerald-800 border-emerald-300', dot: 'bg-emerald-500' },
  'Under Treatment': { bg: 'bg-blue-100 text-blue-800 border-blue-300', dot: 'bg-blue-600' },
  'Waiting for Consultation': { bg: 'bg-amber-100 text-amber-800 border-amber-300', dot: 'bg-amber-500' },
  'Under Consultation': { bg: 'bg-sky-100 text-sky-800 border-sky-300', dot: 'bg-sky-500' },
  'Emergency': { bg: 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse', dot: 'bg-rose-600' },
  'Under Observation': { bg: 'bg-purple-100 text-purple-800 border-purple-300', dot: 'bg-purple-600' },
  'Registered': { bg: 'bg-slate-100 text-slate-700 border-slate-300', dot: 'bg-slate-500' },
  'Admitted': { bg: 'bg-indigo-100 text-indigo-900 border-indigo-300', dot: 'bg-indigo-700' },
  'Referred to Another Hospital': { bg: 'bg-teal-100 text-teal-800 border-teal-300', dot: 'bg-teal-600' },
  'Deceased': { bg: 'bg-gray-200 text-gray-900 border-gray-400', dot: 'bg-gray-700' },
};

export const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIGS[status] || {
    bg: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500'
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg}`}>
      <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
      {status}
    </span>
  );
};
