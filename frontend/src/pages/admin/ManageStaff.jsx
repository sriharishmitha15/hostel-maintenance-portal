import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { Spinner } from '../../components/common/Spinner';
import { Modal } from '../../components/common/Modal';
import { Users, UserPlus, Phone, Building, Loader2, Mail } from 'lucide-react';

export const ManageStaff = () => {
  const [staff, setStaff] = useState([]);
  const [workload, setWorkload] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newStaffData, setNewStaffData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    department: 'Maintenance Office'
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [staffRes, analyticsRes] = await Promise.all([
        adminApi.getStaffMembers(),
        adminApi.getAnalytics()
      ]);

      setStaff(staffRes.data.staff || []);
      
      const workMap = {};
      analyticsRes.data?.staff_workload?.forEach(w => {
        workMap[w.staff_id] = w;
      });
      setWorkload(workMap);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load staff list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      await adminApi.createStaff(newStaffData);
      setIsAddModalOpen(false);
      setNewStaffData({ name: '', email: '', password: '', phone: '', department: 'Maintenance Office' });
      fetchData();
    } catch (err) {
      setError(err.message || 'Failed to create staff member.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Maintenance Staff Team</h2>
          <p className="text-xs text-slate-500 mt-1">
            Manage electricians, plumbers, carpenters, and technicians
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New Staff</span>
        </button>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
          {error}
        </div>
      )}

      {/* Staff Cards Grid */}
      {loading ? (
        <div className="py-20 text-center">
          <Spinner size="lg" />
        </div>
      ) : staff.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-slate-700">No staff members found</h3>
          <p className="text-xs text-slate-400 mt-1">Click "Add New Staff" to provision team accounts.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((s) => {
            const stats = workload[s.id] || { assigned: 0, completed: 0, pending: 0 };
            return (
              <div
                key={s.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <span className="text-xs font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                      ID #{s.id}
                    </span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border bg-amber-50 text-amber-700 border-amber-200">
                      Staff Member
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">{s.name}</h3>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.email}</span>
                    </div>
                    {s.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{s.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span>{s.hostel_block || 'Maintenance Office'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-50 p-2 rounded-lg">
                    <span className="block text-[10px] uppercase font-bold text-slate-400">Total</span>
                    <span className="font-extrabold text-slate-800 text-sm">{stats.assigned}</span>
                  </div>
                  <div className="bg-purple-50 p-2 rounded-lg text-purple-700">
                    <span className="block text-[10px] uppercase font-bold text-purple-500">Active</span>
                    <span className="font-extrabold text-sm">{stats.pending}</span>
                  </div>
                  <div className="bg-emerald-50 p-2 rounded-lg text-emerald-700">
                    <span className="block text-[10px] uppercase font-bold text-emerald-500">Done</span>
                    <span className="font-extrabold text-sm">{stats.completed}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Staff Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Provision New Maintenance Staff">
        <form onSubmit={handleCreateStaff} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Full Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Suresh Kumar (Plumber)"
              value={newStaffData.name}
              onChange={(e) => setNewStaffData({ ...newStaffData, name: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Email Address *
            </label>
            <input
              type="email"
              required
              placeholder="suresh@hostel.com"
              value={newStaffData.email}
              onChange={(e) => setNewStaffData({ ...newStaffData, email: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Temporary Password *
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={newStaffData.password}
                onChange={(e) => setNewStaffData({ ...newStaffData, password: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="9876543210"
                value={newStaffData.phone}
                onChange={(e) => setNewStaffData({ ...newStaffData, phone: e.target.value })}
                className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Department / Section
            </label>
            <input
              type="text"
              placeholder="Plumbing / Electrical / Carpentry"
              value={newStaffData.department}
              onChange={(e) => setNewStaffData({ ...newStaffData, department: e.target.value })}
              className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
              <span>Create Account</span>
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
