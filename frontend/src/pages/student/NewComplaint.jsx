import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { complaintApi } from '../../api/complaintApi';
import { COMPLAINT_PRIORITY } from '../../utils/constants';
import { PlusCircle, UploadCloud, X, Loader2, ArrowLeft } from 'lucide-react';

export const NewComplaint = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    priority: 'Medium',
    hostel_block: user?.hostel_block || 'Block A',
    room_number: user?.room_number || ''
  });
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await complaintApi.getCategories();
        setCategories(res.data.categories || []);
        if (res.data.categories?.length > 0) {
          setFormData(prev => ({ ...prev, category_id: res.data.categories[0].id }));
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const newFiles = [...images, ...files].slice(0, 3); // Max 3 images
    setImages(newFiles);

    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPreviews(newPreviews);
  };

  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setImages(updatedImages);
    setPreviews(updatedPreviews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.category_id || !formData.room_number) {
      setError('Please fill in all mandatory fields.');
      return;
    }

    setSubmitting(true);
    setError('');

    const submission = new FormData();
    submission.append('title', formData.title);
    submission.append('description', formData.description);
    submission.append('category_id', formData.category_id);
    submission.append('priority', formData.priority);
    submission.append('hostel_block', formData.hostel_block);
    submission.append('room_number', formData.room_number);

    images.forEach(img => {
      submission.append('images', img);
    });

    try {
      await complaintApi.submitComplaint(submission);
      navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to lodge complaint.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <button
        onClick={() => navigate('/student/dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Dashboard</span>
      </button>

      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="border-b border-slate-100 pb-4 mb-6">
          <h2 className="text-xl font-extrabold text-slate-900">Submit Maintenance Complaint</h2>
          <p className="text-xs text-slate-500 mt-1">
            Fill in the details below. Our maintenance team will review and assign staff.
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Complaint Subject / Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Bathroom tap leaking constantly"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Category *
              </label>
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                required
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Urgency / Priority *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              >
                {Object.values(COMPLAINT_PRIORITY).map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Hostel Block *
              </label>
              <input
                type="text"
                required
                value={formData.hostel_block}
                onChange={(e) => setFormData({ ...formData, hostel_block: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Room Number *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 204"
                value={formData.room_number}
                onChange={(e) => setFormData({ ...formData, room_number: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Detailed Description *
            </label>
            <textarea
              rows="4"
              required
              placeholder="Describe the issue clearly (e.g. when it started, severity, equipment details)..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none"
            />
          </div>

          {/* Photo Attachments */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Attach Proof Photos (Max 3)
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-5 text-center hover:border-brand-400 transition-colors bg-slate-50/50">
              <label className="cursor-pointer block">
                <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1.5" />
                <span className="text-xs font-bold text-brand-600 hover:underline">Click to upload photos</span>
                <span className="text-xs text-slate-400 block mt-0.5">PNG, JPG, or WEBP up to 5MB</span>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {previews.length > 0 && (
              <div className="flex gap-3 mt-3 flex-wrap">
                {previews.map((url, idx) => (
                  <div key={idx} className="relative group rounded-xl overflow-hidden border border-slate-200 w-24 h-24">
                    <img src={url} alt={`Preview ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-1 right-1 bg-slate-900/70 hover:bg-rose-600 text-white p-1 rounded-full transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate('/student/dashboard')}
              className="px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />}
              <span>Submit Complaint</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
