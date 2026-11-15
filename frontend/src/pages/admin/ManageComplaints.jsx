import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { complaintApi } from '../../api/complaintApi';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { ComplaintFilter } from '../../components/complaints/ComplaintFilter';
import { AssignStaffModal } from '../../components/complaints/AssignStaffModal';
import { Spinner } from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatters';
import { UserCheck, Eye, XCircle, CheckCircle2, RotateCcw } from 'lucide-react';

export const ManageComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    category_id: 'All',
    search: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, catRes, staffRes] = await Promise.all([
        complaintApi.getComplaints(filters),
        complaintApi.getCategories(),
        adminApi.getStaffMembers()
      ]);
      setComplaints(compRes.data.complaints || []);
      setCategories(catRes.data.categories || []);
      setStaffList(staffRes.data.staff || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filters.status, filters.priority, filters.category_id]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData();
    }, 400);
    return () => clearTimeout(handler);
  }, [filters.search]);

  const handleOpenAssign = (complaint) => {
    setSelectedComplaint(complaint);
    setAssignModalOpen(true);
  };

  const handleQuickStatus = async (complaintId, newStatus) => {
    const promptMsg = newStatus === 'Rejected' ? 'Enter rejection reason:' : 'Enter status remarks:';
    const remarks = window.prompt(promptMsg, newStatus === 'Rejected' ? 'Duplicate / Invalid request' : '');
    if (remarks === null) return; // User cancelled

    try {
      await adminApi.updateStatus(complaintId, { status: newStatus, remarks });
      fetchData();
    } catch (err) {
      alert(err.message || 'Status update failed.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Manage Complaints</h2>
        <p className="text-xs text-slate-500 mt-1">
          Review, assign staff, modify priority, and oversee all student maintenance tickets
        </p>
      </div>

      {/* Filter toolbar */}
      <ComplaintFilter
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        onReset={() => setFilters({ status: 'All', priority: 'All', category_id: 'All', search: '' })}
      />

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Table view */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <Spinner size="lg" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            No complaints found matching current filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold border-b border-slate-100">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Complaint Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Priority</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Assigned Staff</th>
                  <th className="p-3.5">Lodged Date</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-500">#{c.id}</td>
                    <td className="p-3.5">
                      <p className="font-bold text-slate-800 max-w-xs truncate">{c.title}</p>
                      <p className="text-[11px] text-slate-400">By: {c.student_name}</p>
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-slate-700 font-semibold">
                        {c.category_name}
                      </span>
                    </td>
                    <td className="p-3.5"><PriorityBadge priority={c.priority} /></td>
                    <td className="p-3.5"><StatusBadge status={c.status} /></td>
                    <td className="p-3.5 text-slate-600">{c.hostel_block} • Rm {c.room_number}</td>
                    <td className="p-3.5 font-semibold text-slate-700">
                      {c.assigned_staff_name || <span className="text-slate-400 italic font-normal">Unassigned</span>}
                    </td>
                    <td className="p-3.5 text-slate-500">{formatDate(c.created_at)}</td>
                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/student/complaints/${c.id}`}
                          title="View Details"
                          className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>

                        <button
                          onClick={() => handleOpenAssign(c)}
                          title="Assign Staff"
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>

                        {c.status !== 'Rejected' && c.status !== 'Resolved' && (
                          <button
                            onClick={() => handleQuickStatus(c.id, 'Rejected')}
                            title="Reject Complaint"
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {c.status !== 'Resolved' && (
                          <button
                            onClick={() => handleQuickStatus(c.id, 'Resolved')}
                            title="Mark Resolved"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
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
          onSuccess={fetchData}
        />
      )}
    </div>
  );
};
