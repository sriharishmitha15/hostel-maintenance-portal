import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { ComplaintTimeline } from '../../components/complaints/ComplaintTimeline';
import { Spinner } from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatters';
import { ArrowLeft, Building, Calendar, User, Wrench, Image as ImageIcon, ShieldAlert } from 'lucide-react';

export const ComplaintDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await complaintApi.getComplaintById(id);
        setComplaint(res.data.complaint);
      } catch (err) {
        setError(err.message || 'Failed to load complaint details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 text-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-xl mx-auto py-12 text-center">
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl mb-4 text-sm font-medium">
          {error || 'Complaint not found.'}
        </div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Go back</span>
        </button>
      </div>
    );
  }

  const submissionImages = complaint.images?.filter(img => img.image_type === 'submission') || [];
  const resolutionImages = complaint.images?.filter(img => img.image_type === 'resolution') || [];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to List</span>
      </button>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-2">
              <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                Complaint #{complaint.id}
              </span>
              <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-100">
                {complaint.category_name}
              </span>
              <PriorityBadge priority={complaint.priority} />
            </div>

            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              {complaint.title}
            </h1>

            <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
              <span className="flex items-center gap-1 font-medium text-slate-700">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                {complaint.hostel_block} • Room {complaint.room_number}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Lodged on {formatDate(complaint.created_at)}
              </span>
            </div>
          </div>

          <StatusBadge status={complaint.status} />
        </div>

        {/* Description */}
        <div className="py-6 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Issue Description
          </h3>
          <p className="text-sm text-slate-700 whitespace-pre-line leading-relaxed">
            {complaint.description}
          </p>
        </div>

        {/* Assigned Staff & Student Info */}
        <div className="py-6 border-b border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" />
              <span>Lodged By (Student)</span>
            </h4>
            <p className="text-sm font-bold text-slate-800">{complaint.student_name}</p>
            <p className="text-xs text-slate-500">{complaint.student_email}</p>
            {complaint.student_phone && (
              <p className="text-xs text-slate-500">Phone: {complaint.student_phone}</p>
            )}
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/70">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Wrench className="w-3.5 h-3.5" />
              <span>Assigned Maintenance Staff</span>
            </h4>
            {complaint.assigned_staff_name ? (
              <div>
                <p className="text-sm font-bold text-slate-800">{complaint.assigned_staff_name}</p>
                <p className="text-xs text-brand-600 font-semibold mt-0.5">Assigned & Working on Task</p>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No staff assigned yet. Awaiting warden review.</p>
            )}
          </div>
        </div>

        {/* Images Section */}
        <div className="py-6 border-b border-slate-100 space-y-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Photo Documentation
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Initial Evidence */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                <span>Issue Photos (Lodged by Student)</span>
              </p>
              {submissionImages.length > 0 ? (
                <div className="flex gap-2.5 flex-wrap">
                  {submissionImages.map((img) => (
                    <a
                      key={img.id}
                      href={img.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-xl overflow-hidden border border-slate-200 w-28 h-28 block"
                    >
                      <img src={img.image_url} alt="Submission proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No initial photos attached.</p>
              )}
            </div>

            {/* Resolution Evidence */}
            <div>
              <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
                <span>Resolution Photos (Fixed by Staff)</span>
              </p>
              {resolutionImages.length > 0 ? (
                <div className="flex gap-2.5 flex-wrap">
                  {resolutionImages.map((img) => (
                    <a
                      key={img.id}
                      href={img.image_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group relative rounded-xl overflow-hidden border border-emerald-300 w-28 h-28 block"
                    >
                      <img src={img.image_url} alt="Resolution proof" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </a>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 italic">No resolution photos uploaded yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Activity & Audit Timeline */}
        <div className="pt-6">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            Status Transition & Audit History
          </h3>
          <ComplaintTimeline logs={complaint.logs} />
        </div>
      </div>
    </div>
  );
};
