import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', trend }) => {
  const colorMap = {
    blue: 'border-l-hospital-600 text-hospital-600 bg-hospital-50',
    emerald: 'border-l-emerald-600 text-emerald-600 bg-emerald-50',
    rose: 'border-l-rose-600 text-rose-600 bg-rose-50',
    amber: 'border-l-amber-600 text-amber-600 bg-amber-50',
    purple: 'border-l-purple-600 text-purple-600 bg-purple-50',
    indigo: 'border-l-indigo-600 text-indigo-600 bg-indigo-50',
  };

  const activeTheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`bg-white rounded-xl p-5 border border-slate-200/80 border-l-4 ${activeTheme.split(' ')[0]} shadow-sm hover:shadow-md transition-shadow`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-lg ${activeTheme.split(' ')[2]} ${activeTheme.split(' ')[1]}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center text-xs text-slate-600">
          <span className="font-semibold text-emerald-600 mr-1.5">{trend}</span>
          <span>vs previous 30 days</span>
        </div>
      )}
    </div>
  );
};
