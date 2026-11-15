import React from 'react';
import { STATUS_COLORS, PRIORITY_COLORS } from '../../utils/constants';

export const StatusBadge = ({ status }) => {
  const config = STATUS_COLORS[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200',
    dot: 'bg-slate-400'
  };

  const formattedStatus = status ? status.replace('_', ' ') : 'Unknown';

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}>
      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${config.dot}`} />
      {formattedStatus}
    </span>
  );
};

export const PriorityBadge = ({ priority }) => {
  const config = PRIORITY_COLORS[priority] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200'
  };

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
      {priority || 'Normal'}
    </span>
  );
};
