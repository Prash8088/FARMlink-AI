import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Cpu,
  TrendingUp,
  Truck,
  CheckCircle2,
  Clock,
  Sparkles,
  Lock,
  ArrowRight,
  Database,
  BarChart4
} from 'lucide-react';

export const FeaturesPage = () => {
  return (
    <div className="py-12 sm:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
      <div className="text-center max-w-3xl mx-auto">
        <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Product Roadmap</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mt-2">
          Architecture & Version Release Plan
        </h1>
        <p className="mt-4 text-base text-slate-600 leading-relaxed">
          FARMlink AI is developed through a disciplined, version-by-version release strategy. Here is our architectural roadmap and active feature availability.
        </p>
      </div>

      {/* Version 1 – Foundation (ACTIVE) */}
      <div className="bg-white rounded-3xl p-8 sm:p-10 border-2 border-emerald-500 shadow-md relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs font-bold px-4 py-1.5 rounded-bl-2xl uppercase tracking-wider">
          Currently Live (V1)
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Version 1: Foundation, Auth & Role Dashboards</h2>
            <p className="text-xs text-slate-500 font-medium">Core Security, Identity & Multi-Role Governance</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Role-Based Authentication
            </h3>
            <p className="text-slate-600">
              Four distinct roles (Farmer, Buyer, Transporter, Admin) with secure JWT cookie/bearer auth and bcryptjs 12-round hashing.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Dedicated Dashboards
            </h3>
            <p className="text-slate-600">
              Four custom workspaces with real DB figures, zero-state metrics, recent activity tracking, and role-appropriate actions.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Profile Management
            </h3>
            <p className="text-slate-600">
              Personal, agricultural, commercial, and freight profile management with strict anti-tampering guards.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <h3 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Admin User Directory
            </h3>
            <p className="text-slate-600">
              Full admin dashboard with user search, role filter, status toggle (activate/deactivate), and platform metrics.
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Versions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Version 2 */}
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold mb-4">
            <Clock className="w-3.5 h-3.5 text-amber-600" />
            <span>Version 2 – Next Release</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-3">Direct Marketplace & Crop Price ML</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Empowering direct commercial transactions, crop listing catalogues, price forecasts, and transport booking.
          </p>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span><strong>Direct Agricultural Product Selling:</strong> Farmers publish crops with quality grade and minimum sale price.</span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span><strong>ML Crop Price Prediction:</strong> Machine learning forecasts for mandi crop rates based on historical data.</span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span><strong>Smart Transport Booking:</strong> Direct booking of trucks and refrigerated containers at farm gate.</span>
            </li>
          </ul>
        </div>

        {/* Version 3 */}
        <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200 relative">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-100 text-purple-800 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>Version 3 – Advanced AI Intelligence</span>
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-3">AI Buyer Matching & Profit Optimization</h2>
          <p className="text-xs text-slate-600 mb-6 leading-relaxed">
            Machine learning algorithms connecting growers with the most profitable bulk institutional buyers.
          </p>

          <ul className="space-y-3 text-xs text-slate-600">
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span><strong>AI-Powered Buyer Matching:</strong> Intelligent recommendation engine matching crop volume and harvest dates.</span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span><strong>Farmer Profit Calculator:</strong> Real-time input cost vs net realization margin simulation.</span>
            </li>
            <li className="flex items-start gap-2">
              <Lock className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
              <span><strong>Smart Transportation Optimization:</strong> Multi-stop route bundling for lower freight cost per quintal.</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};
