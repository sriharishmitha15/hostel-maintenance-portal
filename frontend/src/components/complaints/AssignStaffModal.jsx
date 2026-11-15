import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { adminApi } from '../../api/adminApi';
import { COMPLAINT_PRIORITY } from '../../utils/constants';
import { UserCheck, Loader2 } from 'lucide-react';

export const AssignStaffModal = ({ 
  isOpen, 
  onClose, 
  complaint, 
  staffList = [], 
  onSuccess 
}) => {
  const [selectedStaff, setSelectedStaff] = useState('');
  const [priority, setPriority] = useState(complaint?.priority || 'Medium');
  const [remarks, setRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaff) {
      setError('Please select a staff member.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      await adminApi.assignComplaint(complaint.id, {
        staff_id: parseInt(selectedStaff),
        priority,
        remarks: remarks || `Assigned to staff by admin.`
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to assign staff.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Complaint #${complaint?.id}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Assign Maintenance Staff *
          </label>
          <select
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(e.target.value)}
            required
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
          >
            <option value="">Select Staff Member</option>
            {staffList.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.hostel_block || 'Maintenance Dept'})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Update Priority
          </label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
          >
            {Object.values(COMPLAINT_PRIORITY).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Assignment Remarks / Instructions
          </label>
          <textarea
            rows="3"
            placeholder="Add specific instructions for the staff member..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
            <span>Confirm Assignment</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
