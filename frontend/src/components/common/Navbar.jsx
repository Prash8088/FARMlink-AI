import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { RoleBadge } from './Badge';
import {
  Sprout,
  Menu,
  X,
  LayoutDashboard,
  User,
  LogOut,
  ChevronDown
} from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, getRoleDashboardPath } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const dashboardPath = user ? getRoleDashboardPath(user.role) : '/login';

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl text-slate-900 tracking-tight">FARM<span className="text-emerald-600">link</span></span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 tracking-wider">AI</span>
              </div>
              <p className="text-[10px] text-slate-500 font-medium tracking-wide">Agri Marketplace Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              Home
            </NavLink>
            <NavLink
              to="/marketplace"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              Produce Marketplace
            </NavLink>
            <NavLink
              to="/about"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              About Platform
            </NavLink>
            <NavLink
              to="/features"
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? 'text-emerald-600 font-semibold' : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              Features & Roadmap
            </NavLink>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pr-3 rounded-full hover:bg-slate-100 transition-colors border border-slate-200"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white font-semibold text-xs flex items-center justify-center">
                    {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-900 leading-tight">
                      {user.fullName}
                    </p>
                    <RoleBadge role={user.role} className="text-[9px] py-0 px-1.5" />
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200/80 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs text-slate-500">Signed in as</p>
                      <p className="text-xs font-semibold text-slate-800 truncate">{user.email}</p>
                    </div>

                    <Link
                      to={dashboardPath}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-700 hover:bg-emerald-50 hover:text-emerald-700 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      My Profile
                    </Link>

                    <div className="border-t border-slate-100 my-1"></div>

                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        handleLogout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-emerald-600 transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm hover:shadow transition-all"
                >
                  Join Platform
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-emerald-50 rounded-lg"
          >
            Home
          </Link>
          <Link
            to="/marketplace"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-emerald-700 font-semibold hover:bg-emerald-50 rounded-lg"
          >
            Produce Marketplace
          </Link>
          <Link
            to="/about"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-emerald-50 rounded-lg"
          >
            About Platform
          </Link>
          <Link
            to="/features"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-emerald-50 rounded-lg"
          >
            Features & Roadmap
          </Link>

          {isAuthenticated && user ? (
            <div className="pt-3 border-t border-slate-100 space-y-2">
              <div className="px-3 py-1">
                <p className="text-xs text-slate-500 font-medium">Logged in as {user.fullName}</p>
                <RoleBadge role={user.role} className="mt-1" />
              </div>
              <Link
                to={dashboardPath}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-emerald-600 bg-emerald-50 rounded-lg"
              >
                Go to Dashboard
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                My Profile
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 text-base font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-slate-100 flex flex-col gap-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl"
              >
                Join Platform
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
