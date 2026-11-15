import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const colorSchemes = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
  };

  const scheme = colorSchemes[color] || colorSchemes.blue;

  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h4 className="text-2xl font-extrabold text-slate-900 mt-1">{value}</h4>
          {subtitle && (
            <p className="text-xs text-slate-500 mt-1 flex items-center font-medium">
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl border ${scheme}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};
