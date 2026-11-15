import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintApi } from '../../api/complaintApi';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { ComplaintFilter } from '../../components/complaints/ComplaintFilter';
import { StatCard } from '../../components/common/StatCard';
import { Spinner } from '../../components/common/Spinner';
import { PlusCircle, ClipboardList, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const StudentDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    status: 'All',
    priority: 'All',
    category_id: 'All',
    search: '',
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [compRes, catRes] = await Promise.all([
        complaintApi.getComplaints(filters),
        complaintApi.getCategories()
      ]);
      setComplaints(compRes.data.complaints || []);
      setCategories(catRes.data.categories || []);
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

  // Debounced search trigger
  useEffect(() => {
    const handler = setTimeout(() => {
      fetchData();
    }, 400);
    return () => clearTimeout(handler);
  }, [filters.search]);

  // Summary counts
  const total = complaints.length;
  const pending = complaints.filter(c => c.status === 'Pending').length;
  const inProgress = complaints.filter(c => c.status === 'In_Progress' || c.status === 'Assigned').length;
  const resolved = complaints.filter(c => c.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Student Dashboard</h2>
          <p className="text-xs text-slate-500 mt-1">
            Lodge complaints, monitor repair status, and review work resolution
          </p>
        </div>

        <Link
          to="/student/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Complaint</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Lodged" value={total} icon={ClipboardList} color="blue" />
        <StatCard title="Awaiting Review" value={pending} icon={Clock} color="amber" />
        <StatCard title="In Progress" value={inProgress} icon={Clock} color="purple" />
        <StatCard title="Resolved Issues" value={resolved} icon={CheckCircle2} color="emerald" />
      </div>

      {/* Filter Toolbar */}
      <ComplaintFilter
        filters={filters}
        setFilters={setFilters}
        categories={categories}
        onReset={() => setFilters({ status: 'All', priority: 'All', category_id: 'All', search: '' })}
      />

      {/* Complaints List */}
      <div>
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-12 bg-white rounded-2xl border border-slate-200">
            <Spinner size="lg" />
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <ClipboardList className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No complaints found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              You haven't submitted any complaints matching this filter yet.
            </p>
            <Link
              to="/student/new"
              className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand-600 hover:underline"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Lodge a new request now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {complaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} basePath="/student/complaints" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
