import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { LogIn, Loader2, ShieldCheck, Wrench, GraduationCap, AlertCircle } from 'lucide-react';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isExpired = new URLSearchParams(location.search).get('expired');

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin/dashboard');
      else if (user.role === 'staff') navigate('/staff/dashboard');
      else navigate('/student/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (demoEmail, demoPassword) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-brand-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-500/30 mb-4 font-black text-2xl">
          H
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Hostel Maintenance Portal
        </h2>
        <p className="mt-2 text-sm text-slate-400">
          Sign in to manage and track maintenance requests
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-2xl rounded-3xl border border-slate-100">
          {isExpired && (
            <div className="mb-4 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <span>Your session has expired. Please log in again.</span>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                placeholder="name@hostel.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 flex items-center justify-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-brand-600 hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 transition-all"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
              <span>Sign In</span>
            </button>
          </form>

          {/* Quick Demo Credentials Bar */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 text-center mb-2.5">
              Quick One-Click Demo Logins
            </p>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => fillDemo('admin@hostel.com', 'Admin@123')}
                className="flex flex-col items-center justify-center p-2 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-xl font-semibold transition-colors text-center"
              >
                <ShieldCheck className="w-4 h-4 mb-1" />
                <span className="text-[11px]">Admin</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('staff@hostel.com', 'Staff@123')}
                className="flex flex-col items-center justify-center p-2 bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200 rounded-xl font-semibold transition-colors text-center"
              >
                <Wrench className="w-4 h-4 mb-1" />
                <span className="text-[11px]">Staff</span>
              </button>
              <button
                type="button"
                onClick={() => fillDemo('student@hostel.com', 'Student@123')}
                className="flex flex-col items-center justify-center p-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-xl font-semibold transition-colors text-center"
              >
                <GraduationCap className="w-4 h-4 mb-1" />
                <span className="text-[11px]">Student</span>
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-slate-600">
            <span>New Student? </span>
            <Link to="/register" className="font-bold text-brand-600 hover:text-brand-700 hover:underline">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
