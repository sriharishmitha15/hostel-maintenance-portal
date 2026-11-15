import React, { useState, useEffect } from 'react';
import { staffApi } from '../../api/staffApi';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { StatusUpdateModal } from '../../components/complaints/StatusUpdateModal';
import { StatCard } from '../../components/common/StatCard';
import { Spinner } from '../../components/common/Spinner';
import { formatDate } from '../../utils/formatters';
import { Wrench, CheckCircle2, Clock, Building, User, Edit3, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StaffDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  const [selectedTask, setSelectedTask] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await staffApi.getTasks({ status: activeTab });
      setTasks(res.data.tasks || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to fetch assigned tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [activeTab]);

  const handleOpenModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  const totalAssigned = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'In_Progress').length;
  const resolvedCount = tasks.filter(t => t.status === 'Resolved').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Maintenance Staff Dashboard</h2>
        <p className="text-xs text-slate-500 mt-1">
          View assigned repair tasks, start work progress, and document resolutions
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Assigned Tasks" value={totalAssigned} icon={Wrench} color="blue" />
        <StatCard title="Currently In Progress" value={inProgressCount} icon={Clock} color="purple" />
        <StatCard title="Resolved Tasks" value={resolvedCount} icon={CheckCircle2} color="emerald" />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {['All', 'Assigned', 'In_Progress', 'Resolved'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 px-3 text-sm font-bold border-b-2 transition-all ${
              activeTab === tab
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Tasks List */}
      <div>
        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 text-sm rounded-xl mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="py-16 bg-white rounded-2xl border border-slate-200">
            <Spinner size="lg" />
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-6">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3 text-slate-400">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-700">No tasks in this category</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
              You are all caught up! New complaints assigned by the warden will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tasks.map((task) => (
              <div
                key={task.id}
                className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                        #{task.id}
                      </span>
                      <span className="text-xs font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded border border-brand-100">
                        {task.category_name}
                      </span>
                      <PriorityBadge priority={task.priority} />
                    </div>
                    <StatusBadge status={task.status} />
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mt-1">
                    {task.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {task.description}
                  </p>

                  <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 grid grid-cols-2 gap-2 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-semibold">{task.hostel_block} • Rm {task.room_number}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{task.student_name}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400">
                    Assigned: {formatDate(task.created_at)}
                  </span>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/student/complaints/${task.id}`}
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                    >
                      Details
                    </Link>

                    <button
                      onClick={() => handleOpenModal(task)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-3.5 py-1.5 rounded-lg shadow-sm transition-all"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Update Status</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Update Modal */}
      {selectedTask && (
        <StatusUpdateModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          complaint={selectedTask}
          onSuccess={fetchTasks}
        />
      )}
    </div>
  );
};
