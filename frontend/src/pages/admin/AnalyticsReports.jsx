import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { StatCard } from '../../components/common/StatCard';
import { Spinner } from '../../components/common/Spinner';
import { BarChart3, TrendingUp, CheckCircle2, Clock, XCircle, Printer } from 'lucide-react';

export const AnalyticsReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await adminApi.getAnalytics();
        setData(res.data);
      } catch (err) {
        setError(err.message || 'Failed to fetch analytics.');
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const total = summary.total_complaints || 1; // avoid division by 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Analytics & Reports</h2>
          <p className="text-xs text-slate-500 mt-1">
            Comprehensive resolution metrics, breakdown by maintenance category, and staff performance
          </p>
        </div>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all self-start sm:self-auto"
        >
          <Printer className="w-3.5 h-3.5" />
          <span>Print / Export Report</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Complaints" value={summary.total_complaints || 0} icon={BarChart3} color="blue" />
        <StatCard title="Resolved Issues" value={summary.resolved || 0} icon={CheckCircle2} color="emerald" />
        <StatCard title="Awaiting Allocation" value={summary.pending || 0} icon={Clock} color="amber" />
        <StatCard title="Resolution Efficiency" value={`${summary.resolution_rate || 0}%`} icon={TrendingUp} color="purple" />
      </div>

      {/* Status Progress Bars */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-900 mb-4">Complaint Status Distribution</h3>
        <div className="space-y-3.5">
          {[
            { label: 'Resolved', count: summary.resolved || 0, color: 'bg-emerald-500' },
            { label: 'In Progress / Assigned', count: (summary.in_progress || 0) + (summary.assigned || 0), color: 'bg-purple-500' },
            { label: 'Pending Review', count: summary.pending || 0, color: 'bg-amber-500' },
            { label: 'Rejected / Closed', count: summary.rejected || 0, color: 'bg-rose-500' },
          ].map((item, i) => {
            const percent = Math.round((item.count / total) * 100);
            return (
              <div key={i}>
                <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                  <span>{item.label}</span>
                  <span>{item.count} ({percent}%)</span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Category Breakdown & Staff Performance Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Complaints by Category</h3>
          <div className="space-y-3">
            {data?.categories_breakdown?.map((cat, idx) => {
              const catPercent = Math.round((cat.count / total) * 100);
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800">{cat.category}</span>
                    <span className="text-slate-500 font-mono">{cat.count} issues ({catPercent}%)</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-brand-500 rounded-full transition-all duration-500"
                      style={{ width: `${catPercent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff Performance Metrics */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-4">Staff Task Resolution</h3>
          <div className="space-y-4">
            {data?.staff_workload?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No staff tasks found.</p>
            ) : (
              data?.staff_workload?.map((st) => {
                const totalAssigned = st.assigned || 1;
                const resolutionRate = Math.round((st.completed / totalAssigned) * 100);
                return (
                  <div key={st.staff_id} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-slate-800">{st.staff_name}</span>
                      <span className="text-slate-500 font-mono">
                        {st.completed}/{st.assigned} completed ({resolutionRate}%)
                      </span>
                    </div>
                    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${resolutionRate}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
