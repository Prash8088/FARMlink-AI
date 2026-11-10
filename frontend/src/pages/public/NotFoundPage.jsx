import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <span className="text-6xl font-black text-emerald-600">404</span>
        <h1 className="text-2xl font-bold text-slate-900 mt-2 mb-2">Page Not Found</h1>
        <p className="text-xs sm:text-sm text-slate-500 mb-6">
          The agricultural link or resource you are seeking does not exist or may have been relocated.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          Return to Platform Home
        </Link>
      </div>
    </div>
  );
};
