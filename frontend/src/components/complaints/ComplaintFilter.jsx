import React from 'react';
import { Search, Filter, RotateCcw } from 'lucide-react';
import { COMPLAINT_STATUS, COMPLAINT_PRIORITY } from '../../utils/constants';

export const ComplaintFilter = ({ 
  filters, 
  setFilters, 
  categories = [], 
  onReset 
}) => {
  return (
    <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search title, room, desc..."
            value={filters.search || ''}
            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
            className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          />
        </div>

        {/* Status */}
        <div>
          <select
            value={filters.status || 'All'}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="All">All Statuses</option>
            {Object.values(COMPLAINT_STATUS).map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>

        {/* Priority */}
        <div>
          <select
            value={filters.priority || 'All'}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="All">All Priorities</option>
            {Object.values(COMPLAINT_PRIORITY).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <select
            value={filters.category_id || 'All'}
            onChange={(e) => setFilters(prev => ({ ...prev, category_id: e.target.value }))}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
          >
            <option value="All">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {/* Reset Button */}
        <div>
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      </div>
    </div>
  );
};
