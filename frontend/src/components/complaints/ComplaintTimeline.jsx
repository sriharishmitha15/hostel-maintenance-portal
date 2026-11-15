import React from 'react';
import { formatDate } from '../../utils/formatters';
import { CheckCircle2, Clock, AlertCircle, UserCheck, MessageSquare } from 'lucide-react';

export const ComplaintTimeline = ({ logs = [] }) => {
  if (!logs || logs.length === 0) {
    return <p className="text-xs text-slate-400 italic">No activity logs recorded yet.</p>;
  }

  const getActionIcon = (action) => {
    if (action.includes('RESOLVED')) return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    if (action.includes('ASSIGNED')) return <UserCheck className="w-4 h-4 text-blue-500" />;
    if (action.includes('PROGRESS')) return <Clock className="w-4 h-4 text-purple-500" />;
    if (action.includes('REJECTED')) return <AlertCircle className="w-4 h-4 text-rose-500" />;
    return <MessageSquare className="w-4 h-4 text-slate-400" />;
  };

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {logs.map((log, index) => (
        <div key={log.id || index} className="relative group">
          {/* Dot Icon */}
          <div className="absolute -left-6 mt-1 flex items-center justify-center w-5 h-5 rounded-full bg-white ring-4 ring-slate-50 border border-slate-200">
            {getActionIcon(log.action)}
          </div>

          <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-1">
              <span className="text-xs font-bold text-slate-800">
                {log.action.replace(/_/g, ' ')}
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                {formatDate(log.created_at)}
              </span>
            </div>

            {log.remarks && (
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                "{log.remarks}"
              </p>
            )}

            {log.changed_by_user_name && (
              <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
                <span>By:</span>
                <span className="font-semibold text-slate-600">{log.changed_by_user_name}</span>
                <span className="uppercase text-[9px] bg-slate-200/70 text-slate-600 px-1 py-0.2 rounded font-bold">
                  {log.changed_by_user_role}
                </span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
