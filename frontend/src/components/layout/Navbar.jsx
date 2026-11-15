import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, User, Bell, Building } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin': return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'staff': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 sm:px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-black text-lg shadow-sm">
            H
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">Hostel Care</h1>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">Maintenance Request Portal</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {user?.hostel_block && (
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 font-medium">
            <Building className="w-3.5 h-3.5 text-slate-500" />
            <span>{user.hostel_block} • Room {user.room_number}</span>
          </div>
        )}

        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-slate-800 leading-tight">{user?.name}</span>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded border self-end mt-0.5 ${getRoleBadgeColor(user?.role)}`}>
              {user?.role}
            </span>
          </div>

          <button
            onClick={logout}
            title="Log Out"
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-transparent hover:border-rose-200"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
