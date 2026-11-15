import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { StatCard } from '../../components/common/StatCard';
import { Spinner } from '../../components/common/Spinner';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { AssignStaffModal } from '../../components/complaints/AssignStaffModal';
import { formatDate } from '../../utils/formatters';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  AlertTriangle, 
  Users, 
  UserCheck, 
  ArrowRight,
  TrendingUp,
  Layers
} from 'lucide-react';

export const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, complaintsRes, staffRes] = await Promise.all([
        adminApi.getAnalytics(),
        adminApi.getAllComplaints(),
        adminApi.getStaffMembers()
      ]);

      setData(analyticsRes.data);
      setRecentComplaints(complaintsRes.data.complaints || []);
      setStaffList(staffRes.data.staff || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load administration analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOpenAssign = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignModalOpen(true);
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const summary = data?.summary || {};
  const unassigned = recentComplaints.filter(c => c.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Warden & Admin Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">
            System overview, complaint allocation, resolution metrics and staff management
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            to="/admin/complaints"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
          >
            <ClipboardList className="w-3.5 h-3.5" />
            <span>Manage All Complaints</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Complaints" value={summary.total_complaints || 0} icon={ClipboardList} color="blue" />
        <StatCard title="Pending Allocation" value={summary.pending || 0} icon={Clock} color="amber" />
        <StatCard title="In Progress" value={summary.in_progress || 0} icon={Clock} color="purple" />
        <StatCard 
          title="Resolution Rate" 
          value={`${summary.resolution_rate || 0}%`} 
          subtitle={`${summary.resolved || 0} resolved`}
          icon={TrendingUp} 
          color="emerald" 
        />
      </div>

      {/* Secondary Cards: Users & Categories */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Categories Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <Layers className="w-4 h-4 text-brand-600" />
            <span>Complaints by Category</span>
          </h3>
          <div className="space-y-2.5">
            {data?.categories_breakdown?.map((cat, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <span className="font-semibold text-slate-700">{cat.category}</span>
                <span className="font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  {cat.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-orange-500" />
            <span>Complaints by Priority</span>
          </h3>
          <div className="space-y-2.5">
            {data?.priority_breakdown && Object.entries(data.priority_breakdown).map(([p, count]) => (
              <div key={p} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={p} />
                </div>
                <span className="font-mono font-bold text-slate-800">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Workload */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-brand-600" />
              <span>Staff Workload</span>
            </h3>
            <Link to="/admin/staff" className="text-xs text-brand-600 font-bold hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-2.5">
            {data?.staff_workload?.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No staff members configured yet.</p>
            ) : (
              data?.staff_workload?.map((st) => (
                <div key={st.staff_id} className="flex items-center justify-between text-xs border-b border-slate-50 pb-2">
                  <span className="font-semibold text-slate-700 truncate max-w-[120px]">{st.staff_name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded font-bold" title="Pending">
                      {st.pending} active
                    </span>
                    <span className="text-[11px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold" title="Completed">
                      {st.completed} done
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Unassigned / Action Needed Complaints */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Complaints Awaiting Allocation</h3>
            <p className="text-xs text-slate-500">Unassigned issues lodged by students</p>
          </div>
          <Link to="/admin/complaints" className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1">
            <span>View All ({recentComplaints.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {unassigned.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-1.5" />
            <p className="font-semibold text-slate-600">Great job! No pending complaints need assignment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3">ID</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Priority</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Lodged By</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {unassigned.slice(0, 5).map((comp) => (
                  <tr key={comp.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-500">#{comp.id}</td>
                    <td className="p-3 font-bold text-slate-800 max-w-xs truncate">{comp.title}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                        {comp.category_name}
                      </span>
                    </td>
                    <td className="p-3"><PriorityBadge priority={comp.priority} /></td>
                    <td className="p-3 text-slate-600">{comp.hostel_block} • {comp.room_number}</td>
                    <td className="p-3 text-slate-600">{comp.student_name}</td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => handleOpenAssign(comp)}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-brand-600 hover:bg-brand-700 text-white rounded-lg text-xs font-bold transition-colors"
                      >
                        <UserCheck className="w-3 h-3" />
                        <span>Assign Staff</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Staff Assignment Modal */}
      {selectedComplaint && (
        <AssignStaffModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          complaint={selectedComplaint}
          staffList={staffList}
          onSuccess={fetchDashboardData}
        />
      )}
    </div>
  );
};
