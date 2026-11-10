import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import {
  Sprout,
  TrendingUp,
  Truck,
  Building2,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Users,
  Layers,
  BarChart3,
  MapPin,
  Lock
} from 'lucide-react';

export const LandingPage = () => {
  const { isAuthenticated, user, getRoleDashboardPath } = useAuth();
  const dashboardPath = user ? getRoleDashboardPath(user.role) : '/dashboard';

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 lg:pt-24 bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-8 shadow-xs">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>Version 1.0 Foundation Live • AI-Powered Marketplace</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Connecting Farmers, Buyers & Transporters on <span className="text-emerald-600 underline decoration-emerald-300">One Unified Platform</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminate predatory middlemen. FARMlink AI empowers agricultural producers with direct buyer access, verified freight logistics, and role-governed transparent trading.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
              <Link
                to={dashboardPath}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl transition-all"
              >
                Go to Your {user?.role?.toUpperCase()} Dashboard
                <ArrowRight className="w-5 h-5" />
              </Link>
            ) : (
              <>
                <Link
                  to="/register?role=farmer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-2xl shadow-lg shadow-emerald-600/25 hover:shadow-xl hover:-translate-y-0.5 transition-all"
                >
                  <Sprout className="w-5 h-5" />
                  Join as Farmer
                </Link>
                <Link
                  to="/register?role=buyer"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-2xl shadow-xs hover:shadow transition-all"
                >
                  <Building2 className="w-5 h-5 text-blue-600" />
                  Register as Buyer / Transporter
                </Link>
              </>
            )}
          </div>

          {/* Trust Highlights */}
          <div className="mt-14 pt-8 border-t border-slate-200/80 grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto text-slate-600 text-xs font-semibold">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Zero Middleman Cut</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Verified Role Security</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Real-Time User Auth</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Pan-India Coverage</span>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow Architecture Illustration */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-2">Three-Pillar Synergy</p>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            How FARMlink AI Bridges the Agriculture Value Chain
          </h2>
          <p className="mt-3 text-sm text-slate-500">
            A closed-loop ecosystem engineered to keep farm revenues where they belong: with the producer.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Step 1: Farmer */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mb-6">
              1
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Sprout className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-bold text-slate-900">Farmer Sells Direct</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Farmers register with verified farm details, list harvested crops with transparent quality grades, and eliminate commission agents.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-emerald-700">
              <span>Farmer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Step 2: Buyer */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg mb-6">
              2
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-bold text-slate-900">Buyer Procures Bulk</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Wholesalers, retail chains, and food processors source farm-fresh produce with guaranteed provenance and transparent bulk pricing.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-blue-700">
              <span>Buyer Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>

          {/* Step 3: Transporter */}
          <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-lg mb-6">
              3
            </div>
            <div className="flex items-center gap-2 mb-2">
              <Truck className="w-5 h-5 text-amber-600" />
              <h3 className="text-lg font-bold text-slate-900">Transporter Delivers</h3>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed">
              Logistics providers register vehicle capacities, pick up harvested produce at farm gates, and ensure timely temperature-controlled transit.
            </p>
            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-medium text-amber-700">
              <span>Transporter Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </section>

      {/* Role Benefits Grid */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Engineered Specifically for Every Stakeholder
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Tailored workspaces with dedicated data views, actions, and security controls.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Farmer Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                <Sprout className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">For Farmers</h3>
              <p className="text-xs text-slate-500 mb-6">Maximize yields, retain 100% sale proceeds.</p>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Direct connection to commercial buyers without commission fees</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Dedicated farmer dashboard tracking crops, orders & earnings</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span>Farm profile with land area, location, and crops grown</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-500">Upcoming V2: AI Crop Price Prediction & Harvest Planning</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  to="/register?role=farmer"
                  className="block w-full py-2.5 text-center text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl transition-colors"
                >
                  Create Farmer Account
                </Link>
              </div>
            </div>

            {/* Buyer Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">For Agri Buyers</h3>
              <p className="text-xs text-slate-500 mb-6">Secure steady, verified bulk supply chains.</p>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Procure directly from verified farm producers with traceable provenance</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Enterprise buyer dashboard tracking purchases and order statuses</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Configurable procurement category preferences</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-500">Upcoming V2: AI Buyer Matching & Bulk Contract Generator</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  to="/register?role=buyer"
                  className="block w-full py-2.5 text-center text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors"
                >
                  Create Buyer Account
                </Link>
              </div>
            </div>

            {/* Transporter Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">For Transporters</h3>
              <p className="text-xs text-slate-500 mb-6">Fill fleet capacity on every return run.</p>
              <ul className="space-y-3 text-xs text-slate-600">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Vehicle registration and payload capacity management</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Transporter dashboard tracking available requests and deliveries</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <span>Operating routes and geographic regional preferences</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <span className="text-slate-500">Upcoming V2: Smart Route Optimization & Live GPS Transit</span>
                </li>
              </ul>
              <div className="mt-8">
                <Link
                  to="/register?role=transporter"
                  className="block w-full py-2.5 text-center text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors"
                >
                  Create Transporter Account
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Architecture Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 overflow-hidden relative">
          <div className="max-w-3xl relative z-10">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Enterprise Security</span>
            <h2 className="text-2xl sm:text-3xl font-bold mt-2 mb-4">
              Version 1 Production-Grade Foundation
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed mb-8">
              FARMlink AI is built on a resilient, modular full-stack architecture featuring MongoDB Atlas, Express REST APIs, JWT authentication with secure HTTP-only cookies, bcryptjs password hashing, role-based authorization guards, and responsive Tailwind UI.
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium">
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-emerald-400 font-bold mb-1">JWT Tokens</p>
                <p className="text-slate-400">HTTP-only cookie + Bearer</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-emerald-400 font-bold mb-1">bcryptjs</p>
                <p className="text-slate-400">12 Salt Rounds Hashing</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-emerald-400 font-bold mb-1">RBAC System</p>
                <p className="text-slate-400">Farmer, Buyer, Transporter, Admin</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                <p className="text-emerald-400 font-bold mb-1">MongoDB Atlas</p>
                <p className="text-slate-400">Mongoose Schemas & Indexes</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
