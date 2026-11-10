import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Alert } from '../../components/common/Alert';
import {
  Sprout,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Building2,
  Truck,
  Eye,
  EyeOff
} from 'lucide-react';

export const LoginPage = () => {
  const { login, isAuthenticated, user, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState(false);

  // If already logged in, redirect immediately
  useEffect(() => {
    if (isAuthenticated && user) {
      const from = location.state?.from?.pathname || getRoleDashboardPath(user.role);
      navigate(from, { replace: true });
    }
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setSessionExpiredNotice(true);
    }
  }, [isAuthenticated, user, navigate, location, getRoleDashboardPath]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!formData.email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }
    if (!formData.password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    try {
      setLoading(true);
      const loggedUser = await login(formData.email.trim(), formData.password);
      const destination = location.state?.from?.pathname || getRoleDashboardPath(loggedUser.role);
      navigate(destination, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  // Helper for quick demo filling
  const setDemoCredentials = (email, password) => {
    setFormData({ email, password });
    setErrorMessage('');
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-xl mx-auto">
      {/* Brand Icon & Heading */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Sprout className="w-7 h-7" />
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to FARMlink AI
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Enter your registered credentials to access your role-based dashboard.
        </p>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        {sessionExpiredNotice && (
          <Alert
            type="info"
            message="Your session has expired. Please sign in again to continue."
            onClose={() => setSessionExpiredNotice(false)}
          />
        )}

        {errorMessage && (
          <Alert
            type="error"
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email Field */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Password
              </label>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all text-slate-900"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>Sign In to Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Demo Fast-Login Selector */}
        <div className="pt-6 border-t border-slate-100">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wider text-center mb-3">
            Quick Fill Demo Accounts (Version 1 Testing)
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setDemoCredentials('farmer.ramesh@farmlink.ai', 'Password123!')}
              className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-800 text-left transition-colors flex items-center gap-2"
            >
              <Sprout className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Farmer</p>
                <p className="text-[10px] text-emerald-700 opacity-80">Ramesh Patel</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('buyer.ananya@farmlink.ai', 'Password123!')}
              className="p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-800 text-left transition-colors flex items-center gap-2"
            >
              <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Agro Buyer</p>
                <p className="text-[10px] text-blue-700 opacity-80">Ananya Sharma</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('transporter.vikram@farmlink.ai', 'Password123!')}
              className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100 text-amber-800 text-left transition-colors flex items-center gap-2"
            >
              <Truck className="w-4 h-4 text-amber-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Transporter</p>
                <p className="text-[10px] text-amber-700 opacity-80">Vikram Singh</p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => setDemoCredentials('admin@farmlink.ai', 'Admin@FarmLink2026!')}
              className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100 text-purple-800 text-left transition-colors flex items-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-purple-600 flex-shrink-0" />
              <div>
                <p className="font-bold">Platform Admin</p>
                <p className="text-[10px] text-purple-700 opacity-80">Central Control</p>
              </div>
            </button>
          </div>
        </div>

        {/* Link to Registration */}
        <div className="text-center text-xs text-slate-500 pt-2">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-emerald-600 hover:text-emerald-700">
            Create an Account
          </Link>
        </div>
      </div>
    </div>
  );
};
