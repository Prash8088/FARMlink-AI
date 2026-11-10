import React, { useState } from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { Sidebar } from '../components/common/Sidebar';
import { RoleBadge, StatusBadge, VerifiedBadge } from '../components/common/Badge';
import {
  Menu,
  X,
  Bell,
  User as UserIcon,
  LogOut,
  Settings,
  ChevronDown,
  ShieldCheck,
  Building,
  Truck,
  Sprout
} from 'lucide-react';

export const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'farmer':
        return <Sprout className="w-4 h-4 text-emerald-600" />;
      case 'buyer':
        return <Building className="w-4 h-4 text-blue-600" />;
      case 'transporter':
        return <Truck className="w-4 h-4 text-amber-600" />;
      case 'admin':
        return <ShieldCheck className="w-4 h-4 text-purple-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <Sidebar />
      </div>

      {/* Mobile Drawer Sidebar */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setMobileSidebarOpen(false)}
          ></div>
          <div className="relative flex-1 flex flex-col max-w-xs w-full bg-slate-900 z-10">
            <div className="absolute top-2 right-2">
              <button
                onClick={() => setMobileSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">Console</span>
                <span className="text-xs text-slate-300">/</span>
                <span className="text-xs font-semibold text-slate-800 capitalize flex items-center gap-1.5">
                  {getRoleIcon()}
                  {user?.role} Portal
                </span>
              </div>
              <h1 className="text-sm sm:text-base font-bold text-slate-900">
                Welcome, {user?.fullName || 'User'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Account Status Badges */}
            <div className="hidden sm:flex items-center gap-2">
              <StatusBadge isActive={user?.isActive} />
              <VerifiedBadge isVerified={user?.isVerified} />
              <RoleBadge role={user?.role} />
            </div>

            {/* Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white font-bold text-xs flex items-center justify-center">
                  {user?.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <ChevronDown className="w-4 h-4 text-slate-500" />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-semibold text-slate-900 truncate">{user?.fullName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  </div>

                  <Link
                    to="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <UserIcon className="w-4 h-4" />
                    View Profile
                  </Link>
                  <Link
                    to="/profile/edit"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    Edit Profile
                  </Link>

                  <div className="border-t border-slate-100 my-1"></div>

                  <button
                    onClick={() => {
                      setUserMenuOpen(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Body Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
