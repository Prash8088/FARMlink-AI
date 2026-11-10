import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, isAuthenticated, loading, getRoleDashboardPath } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium text-slate-500">Authenticating session...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isActive) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-rose-200 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Account Deactivated</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Your FARMlink AI account has been placed on hold by an administrator. Please reach out to administrative support to resolve this issue.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-medium hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Login
          </Link>
        </div>
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const userHome = getRoleDashboardPath(user.role);
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-600 mb-6 leading-relaxed">
            Your role (<strong className="capitalize">{user.role}</strong>) does not have authorization to view this dashboard module.
          </p>
          <Link
            to={userHome}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            Go to Your {user.role.toUpperCase()} Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
};
