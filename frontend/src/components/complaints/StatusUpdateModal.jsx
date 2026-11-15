import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { staffApi } from '../../api/staffApi';
import { CheckCircle2, Loader2, UploadCloud, Image as ImageIcon } from 'lucide-react';

export const StatusUpdateModal = ({ isOpen, onClose, complaint, onSuccess }) => {
  const [status, setStatus] = useState('In_Progress');
  const [remarks, setRemarks] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    const formData = new FormData();
    formData.append('status', status);
    formData.append('remarks', remarks || `Updated status to ${status}.`);
    if (selectedFile) {
      formData.append('images', selectedFile);
    }

    try {
      await staffApi.updateTaskStatus(complaint.id, formData);
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update status.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Update Work Status - Task #${complaint?.id}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Status Transition *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setStatus('In_Progress')}
              className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                status === 'In_Progress'
                  ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-sm ring-2 ring-purple-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <span>Work in Progress</span>
            </button>

            <button
              type="button"
              onClick={() => setStatus('Resolved')}
              className={`p-3 rounded-xl border text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                status === 'Resolved'
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-sm ring-2 ring-emerald-500/20'
                  : 'border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark Resolved</span>
            </button>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Resolution Notes / Remarks *
          </label>
          <textarea
            rows="3"
            required
            placeholder="Describe what was fixed, parts replaced, or next steps..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Optional Resolution Proof Photo */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Upload Resolution Proof Photo (Optional)
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-brand-400 transition-colors">
            {previewUrl ? (
              <div className="relative inline-block">
                <img src={previewUrl} alt="Preview" className="h-28 rounded-lg object-cover mx-auto" />
                <button
                  type="button"
                  onClick={() => { setSelectedFile(null); setPreviewUrl(''); }}
                  className="mt-2 text-xs text-rose-600 font-semibold hover:underline block mx-auto"
                >
                  Remove image
                </button>
              </div>
            ) : (
              <label className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                <span className="text-xs font-semibold text-brand-600 hover:underline">Click to upload photo</span>
                <span className="text-xs text-slate-400 block mt-0.5">JPG, PNG or WEBP (Max 5MB)</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            )}
          </div>
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
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>Save & Update</span>
          </button>
        </div>
      </form>
    </Modal>
  );
};
