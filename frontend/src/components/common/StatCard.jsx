import React from 'react';

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = 'emerald',
  badgeText
}) => {
  const colorMap = {
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100'
  };

  return (
    <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-slate-500">{title}</span>
        {Icon && (
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center border ${
              colorMap[color] || colorMap.emerald
            }`}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className="flex items-baseline gap-2">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">
          {value}
        </span>
        {badgeText && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
            {badgeText}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs font-medium text-slate-400">{subtext}</p>
      )}
    </div>
  );
};
