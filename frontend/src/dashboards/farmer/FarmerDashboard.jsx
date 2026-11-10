import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { StatCard } from '../../components/common/StatCard';
import { UpcomingActionCard } from '../../components/common/ComingSoonBadge';
import { formatDate, formatCurrency } from '../../utils/formatters';
import {
  Sprout,
  Package,
  Layers,
  CheckCircle,
  IndianRupee,
  Clock,
  ArrowRight,
  TrendingUp,
  Truck,
  ShieldCheck,
  Edit,
  UserCheck
} from 'lucide-react';

export const FarmerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sprout className="w-3.5 h-3.5 text-emerald-300" />
            <span>Farmer Operations Console • Version 1</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste, {user?.fullName || 'Farmer'}!
          </h2>
          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
            Welcome to your direct farm management portal. Your agricultural profile is active for{' '}
            <strong className="text-white">
              {user?.farmerDetails?.farmName || `${user?.village || 'Local'} Farmland`}
            </strong>{' '}
            in {user?.district}, {user?.state}.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <Link
              to="/profile"
              className="px-4 py-2 bg-white text-emerald-900 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-emerald-700" />
              View Complete Farm Profile
            </Link>
            <Link
              to="/profile/edit"
              className="px-4 py-2 bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60 font-semibold rounded-xl border border-emerald-400/30 transition-colors inline-flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Update Farm Details
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Primary Stat Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Marketplace Overview
          </h3>
          <span className="text-xs text-slate-400 font-medium">Real platform telemetry</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Products Listed"
            value="0"
            subtext="Produce catalog unlocks in Version 2"
            icon={Package}
            color="emerald"
            badgeText="V1 Zero Baseline"
          />
          <StatCard
            title="Active Orders"
            value="0"
            subtext="No active buyer purchase requests"
            icon={Layers}
            color="blue"
            badgeText="Pending V2 Sourcing"
          />
          <StatCard
            title="Completed Orders"
            value="0"
            subtext="Total fulfilled farm deliveries"
            icon={CheckCircle}
            color="purple"
            badgeText="Verified"
          />
          <StatCard
            title="Net Earnings"
            value={formatCurrency(0)}
            subtext="Direct bank transfers upon delivery"
            icon={IndianRupee}
            color="emerald"
            badgeText="Escrow Safe"
          />
        </div>
      </div>

      {/* Two Column Layout: Farm Summary & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Farm Profile Summary (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Farm Profile & Crop Readiness</h3>
              <p className="text-xs text-slate-500">Configured agricultural operational specs</p>
            </div>
            <Link
              to="/profile/edit"
              className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Specs
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">Farm Name</span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {user?.farmerDetails?.farmName || 'Not yet configured'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">Farming Experience</span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {user?.farmerDetails?.farmingExperience
                  ? `${user.farmerDetails.farmingExperience} Years Active`
                  : 'Experience not set'}
              </p>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">
                Primary Harvest Crops
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {user?.farmerDetails?.mainCropsGrown && user.farmerDetails.mainCropsGrown.length > 0 ? (
                  user.farmerDetails.mainCropsGrown.map((crop, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100/70 text-emerald-800 font-semibold text-xs border border-emerald-200"
                    >
                      {crop}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">
                    No crops added. Click 'Edit Specs' to add your main crops.
                  </span>
                )}
              </div>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">
                Registered Location
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {user?.village}, {user?.district}, {user?.state}
              </p>
              {user?.address && (
                <p className="text-xs text-slate-500 mt-0.5">{user.address}</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline (1 Col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
            <span className="text-xs text-slate-400">Audit trail</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Account Activated</p>
                <p className="text-[11px] text-slate-500">
                  Welcome to FARMlink AI. Your farmer account is registered and authenticated.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Profile Security Verified</p>
                <p className="text-[11px] text-slate-500">
                  Role-based protection enabled for credentials & geographic data.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Active</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Version 2 Pipeline Ready</p>
                <p className="text-[11px] text-slate-500">
                  Direct crop listing & AI price prediction scheduled for upcoming release.
                </p>
                <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Action Cards (Clearly labeled as Version 2) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Upcoming Marketplace Actions (Version 2)
            </h3>
            <p className="text-xs text-slate-500">
              These modules are in active development and scheduled for the next release.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <UpcomingActionCard
            title="List Harvest Produce"
            description="Create public marketplace listings for crops with quality grade, quantity, and minimum price per quintal."
            icon={Package}
            versionBadge="Version 2 Feature"
          />

          <UpcomingActionCard
            title="ML Crop Price Prediction"
            description="Machine learning forecasts analyzing historical mandi rates to recommend optimal selling times."
            icon={TrendingUp}
            versionBadge="Version 2 Feature"
          />

          <UpcomingActionCard
            title="Book Dedicated Transport"
            description="Request verified refrigerated or dry container vehicles to pick up harvested stock at your farm."
            icon={Truck}
            versionBadge="Version 2 Feature"
          />
        </div>
      </div>
    </div>
  );
};
