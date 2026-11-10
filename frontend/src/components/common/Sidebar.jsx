import React from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { RoleBadge } from './Badge';
import {
  Sprout,
  LayoutDashboard,
  User,
  Users,
  Settings,
  LogOut,
  ShoppingBag,
  TrendingUp,
  Truck,
  Package,
  Layers,
  ChevronRight,
  ShieldCheck,
  Building2,
  Tractor
} from 'lucide-react';

export const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Build role-specific navigation menus
  const getNavItems = () => {
    switch (user.role) {
      case 'farmer':
        return [
          { label: 'Overview', path: '/dashboard/farmer', icon: LayoutDashboard },
          { label: 'Produce Listings', path: '/dashboard/farmer/products', icon: Package, badge: 'V2 Live' },
          { label: 'Farm Profile', path: '/profile', icon: Tractor },
          { label: 'Crop Price Forecast', path: '#', icon: TrendingUp, badge: 'V3' },
          { label: 'Transport Booking', path: '#', icon: Truck, badge: 'V3' },
          { label: 'Settings', path: '/settings', icon: Settings }
        ];

      case 'buyer':
        return [
          { label: 'Overview', path: '/dashboard/buyer', icon: LayoutDashboard },
          { label: 'Business Profile', path: '/profile', icon: Building2 },
          { label: 'Agri Sourcing', path: '#', icon: ShoppingBag, badge: 'V3' },
          { label: 'Order Contracts', path: '#', icon: Layers, badge: 'V3' },
          { label: 'Logistics Tracker', path: '#', icon: Truck, badge: 'V3' },
          { label: 'Settings', path: '/settings', icon: Settings }
        ];

      case 'transporter':
        return [
          { label: 'Overview', path: '/dashboard/transporter', icon: LayoutDashboard },
          { label: 'Vehicle Profile', path: '/profile', icon: Truck },
          { label: 'Freight Requests', path: '#', icon: Package, badge: 'V3' },
          { label: 'Trip Management', path: '#', icon: Layers, badge: 'V3' },
          { label: 'Settings', path: '/settings', icon: Settings }
        ];

      case 'admin':
        return [
          { label: 'Dashboard Overview', path: '/dashboard/admin', icon: LayoutDashboard },
          { label: 'Marketplace Directory', path: '/dashboard/admin?tab=products', icon: Package, badge: 'V2' },
          { label: 'User Directory', path: '/dashboard/admin?tab=users', icon: Users },
          { label: 'Platform Statistics', path: '/dashboard/admin?tab=stats', icon: TrendingUp },
          { label: 'Administrator Profile', path: '/profile', icon: ShieldCheck },
          { label: 'System Settings', path: '/settings', icon: Settings }
        ];

      default:
        return [];
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-slate-900 text-slate-200 flex flex-col flex-shrink-0 min-h-screen border-r border-slate-800">
      {/* Brand Header */}
      <div className="p-6 border-b border-slate-800">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5 text-slate-900" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-extrabold text-lg text-white tracking-tight">FARM<span className="text-emerald-400">link</span></span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">AI</span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Marketplace Portal</p>
          </div>
        </Link>
      </div>

      {/* Role Indicator Banner */}
      <div className="px-6 py-4 bg-slate-950/50 border-b border-slate-800/80">
        <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">Active Workspace</p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-sm font-semibold text-white capitalize">{user.role} Console</span>
          <RoleBadge role={user.role} />
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isExternalOrLocked = item.path === '#';

          if (isExternalOrLocked) {
            return (
              <div
                key={idx}
                className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-500 cursor-not-allowed group opacity-75"
                title="This module will be activated in Version 3"
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 text-slate-600" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                    {item.badge}
                  </span>
                )}
              </div>
            );
          }

          return (
            <NavLink
              key={idx}
              to={item.path}
              end={item.path === '/dashboard/farmer' || item.path === '/dashboard/buyer' || item.path === '/dashboard/transporter' || item.path === '/dashboard/admin'}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-900/30 font-semibold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {item.badge && !isActive && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-900/80 text-emerald-300 border border-emerald-700/60">
                        {item.badge}
                      </span>
                    )}
                    <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${isActive ? 'opacity-100' : ''}`} />
                  </div>
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User Card & Logout Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40">
        <div className="flex items-center gap-3 mb-3 p-2 rounded-xl bg-slate-800/50">
          <div className="w-9 h-9 rounded-full bg-emerald-700 text-white font-bold text-sm flex items-center justify-center flex-shrink-0">
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{user.fullName}</p>
            <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium text-rose-400 bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out of Console
        </button>
      </div>
    </aside>
  );
};
