import React from 'react';
import { Sparkles, Clock } from 'lucide-react';

export const ComingSoonBadge = ({ label = 'Coming in V2', className = '' }) => {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs ${className}`}
    >
      <Clock className="w-3 h-3 text-amber-600" />
      {label}
    </span>
  );
};

export const UpcomingActionCard = ({
  title,
  description,
  icon: Icon,
  versionBadge = 'Version 2 Module'
}) => {
  return (
    <div className="group relative bg-slate-50/80 rounded-2xl p-5 border border-dashed border-slate-300 transition-all">
      <div className="flex items-start justify-between mb-3">
        <div className="w-10 h-10 rounded-xl bg-slate-200/80 text-slate-500 flex items-center justify-center">
          {Icon && <Icon className="w-5 h-5" />}
        </div>
        <ComingSoonBadge label={versionBadge} />
      </div>
      <h4 className="text-base font-semibold text-slate-700">{title}</h4>
      <p className="mt-1 text-xs text-slate-500 leading-relaxed">{description}</p>
      <button
        disabled
        className="mt-4 w-full py-2 px-3 text-xs font-medium text-slate-400 bg-slate-100 rounded-lg cursor-not-allowed border border-slate-200 text-center"
      >
        Locked in Version 1
      </button>
    </div>
  );
};
