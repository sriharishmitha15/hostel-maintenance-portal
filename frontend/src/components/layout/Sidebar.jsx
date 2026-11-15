import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  PlusCircle, 
  ClipboardList, 
  Users, 
  BarChart3, 
  Wrench,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export const Sidebar = () => {
  const { user } = useAuth();
  const role = user?.role;

  const studentLinks = [
    { to: '/student/dashboard', label: 'My Complaints', icon: ClipboardList },
    { to: '/student/new', label: 'Submit Complaint', icon: PlusCircle },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', label: 'My Tasks Queue', icon: Wrench },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'All Complaints', icon: ClipboardList },
    { to: '/admin/staff', label: 'Manage Staff', icon: Users },
    { to: '/admin/analytics', label: 'Reports & Analytics', icon: BarChart3 },
  ];

  const links = role === 'admin' ? adminLinks : role === 'staff' ? staffLinks : studentLinks;

  return (
    <aside className="w-64 border-r border-slate-200 bg-white min-h-[calc(100vh-4rem)] p-4 hidden md:flex flex-col justify-between">
      <div className="space-y-6">
        <div>
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {role === 'admin' ? 'Administration' : role === 'staff' ? 'Staff Portal' : 'Student Portal'}
          </p>
          <nav className="space-y-1">
            {links.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'bg-brand-50 text-brand-700 shadow-sm border border-brand-200/60 font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
        <p className="font-semibold text-slate-700">Hostel Maintenance System</p>
        <p className="text-[11px] mt-0.5">Quick 24/7 service resolution</p>
      </div>
    </aside>
  );
};
