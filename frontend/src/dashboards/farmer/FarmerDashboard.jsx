import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { productService } from '../../services/productService';
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
  UserCheck,
  Plus
} from 'lucide-react';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);

  useEffect(() => {
    const loadProductStats = async () => {
      try {
        const res = await productService.getMyProducts({ limit: 1 });
        if (res.success && res.data?.summary) {
          setProductCount(res.data.summary.totalListings);
          setAvailableCount(res.data.summary.available);
        }
      } catch (e) {
        console.warn('Could not load farmer listing stats', e);
      }
    };

    loadProductStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sprout className="w-3.5 h-3.5 text-emerald-300" />
            <span>Farmer Operations Console • Version 2 Active</span>
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
              to="/dashboard/farmer/products"
              className="px-4 py-2 bg-white text-emerald-900 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-emerald-700" />
              Manage Produce Listings ({productCount})
            </Link>
            <Link
              to="/dashboard/farmer/products/new"
              className="px-4 py-2 bg-emerald-900/60 text-emerald-100 hover:bg-emerald-900/80 font-semibold rounded-xl border border-emerald-400/40 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-300" />
              Publish New Crop
            </Link>
            <Link
              to="/profile"
              className="px-4 py-2 bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60 font-semibold rounded-xl border border-emerald-400/30 transition-colors inline-flex items-center gap-1.5"
            >
              <UserCheck className="w-3.5 h-3.5" />
              View Farm Profile
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
            value={productCount}
            subtext={`${availableCount} currently active for bulk buyers`}
            icon={Package}
            color="emerald"
            badgeText="Version 2 Live"
          />
          <StatCard
            title="Active Orders"
            value="0"
            subtext="No active buyer purchase requests"
            icon={Layers}
            color="blue"
            badgeText="Upcoming V3"
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
                <Package className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Marketplace Module Activated</p>
                <p className="text-[11px] text-slate-500">
                  Version 2 is live. You can now publish, manage, and price harvest listings.
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold mt-1 block">
                  Version 2 Live
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
                <p className="text-xs font-bold text-slate-900">Version 3 AI Matchmaker</p>
                <p className="text-[11px] text-slate-500">
                  Automated institutional buyer matching scheduled for upcoming release.
                </p>
                <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Marketplace Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Marketplace Operations
            </h3>
            <p className="text-xs text-slate-500">
              Active tools to manage your harvest supply and connect with buyers.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {/* Active Version 2 Action Card */}
          <div className="bg-white rounded-2xl p-5 border-2 border-emerald-500/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <Package className="w-5 h-5" />
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  Active V2
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900">Publish Harvest Produce</h4>
              <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                Create new crop listings with multiple photos, quality grades, and transparent minimum prices per quintal.
              </p>
            </div>
            <Link
              to="/dashboard/farmer/products/new"
              className="mt-4 w-full py-2.5 px-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl text-center transition-colors shadow-xs"
            >
              Add New Crop Listing →
            </Link>
          </div>

          <UpcomingActionCard
            title="ML Crop Price Prediction"
            description="Machine learning forecasts analyzing historical mandi rates to recommend optimal selling times."
            icon={TrendingUp}
            versionBadge="Version 3 Feature"
          />

          <UpcomingActionCard
            title="Book Dedicated Transport"
            description="Request verified refrigerated or dry container vehicles to pick up harvested stock at your farm."
            icon={Truck}
            versionBadge="Version 3 Feature"
          />
        </div>
      </div>
    </div>
  );
};
