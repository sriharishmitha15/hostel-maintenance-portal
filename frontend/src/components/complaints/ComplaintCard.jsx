import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { formatDate } from '../../utils/formatters';
import { Building, Calendar, Image as ImageIcon, ArrowRight, User } from 'lucide-react';

export const ComplaintCard = ({ complaint, basePath = '/student/complaints' }) => {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all hover:border-brand-300 group flex flex-col justify-between">
      <div>
        <div className="flex items-start justify-between gap-3 mb-2.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              #{complaint.id}
            </span>
            <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-100">
              {complaint.category_name || 'General'}
            </span>
            <PriorityBadge priority={complaint.priority} />
          </div>
          <StatusBadge status={complaint.status} />
        </div>

        <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-600 transition-colors line-clamp-1">
          {complaint.title}
        </h3>

        <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
          {complaint.description}
        </p>
      </div>

      <div className="mt-4 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 font-medium text-slate-600">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            {complaint.hostel_block} • {complaint.room_number}
          </span>
          <span className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(complaint.created_at)}
          </span>
        </div>

        <Link
          to={`${basePath}/${complaint.id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700 group-hover:translate-x-0.5 transition-transform"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
};
