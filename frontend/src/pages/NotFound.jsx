import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export const NotFound = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <h1 className="text-7xl font-extrabold text-brand-600 mb-2">404</h1>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Page Not Found</h2>
        <p className="text-xs text-slate-500 mb-6">
          The page or portal route you are looking for does not exist or has been moved.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow transition-all"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
