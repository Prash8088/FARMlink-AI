import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { StatCard } from '../../components/common/StatCard';
import { UpcomingActionCard } from '../../components/common/ComingSoonBadge';
import { formatDate } from '../../utils/formatters';
import {
  Building2,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Edit,
  UserCheck,
  Search,
  FileText,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const BuyerDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/60 text-blue-200 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-blue-300" />
            <span>Agri Procurement Console • Version 1</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName || 'Buyer'}!
          </h2>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
            Your commercial purchasing account is initialized for{' '}
            <strong className="text-white">
              {user?.buyerDetails?.businessName || `${user?.fullName}'s Enterprise`}
            </strong>.
            Source directly from certified farmers across India without intermediate broker markups.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <Link
              to="/profile"
              className="px-4 py-2 bg-white text-blue-950 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-blue-700" />
              View Commercial Profile
            </Link>
            <Link
              to="/profile/edit"
              className="px-4 py-2 bg-blue-800/40 text-blue-100 hover:bg-blue-800/60 font-semibold rounded-xl border border-blue-400/30 transition-colors inline-flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Update Sourcing Preferences
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Procurement Metrics
          </h3>
          <span className="text-xs text-slate-400 font-medium">Real platform telemetry</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Total Orders"
            value="0"
            subtext="Lifetime farm purchase contracts"
            icon={ShoppingBag}
            color="blue"
            badgeText="V1 Zero Baseline"
          />
          <StatCard
            title="Active Orders"
            value="0"
            subtext="Contracts currently in transit / fulfillment"
            icon={Clock}
            color="amber"
            badgeText="Pending V2 Marketplace"
          />
          <StatCard
            title="Completed Purchases"
            value="0"
            subtext="Fulfilled deliveries confirmed at warehouse"
            icon={CheckCircle}
            color="emerald"
            badgeText="Verified Receipts"
          />
        </div>
      </div>

      {/* Two Column Layout: Commercial Profile & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Buyer Specs (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Commercial Entity Profile</h3>
              <p className="text-xs text-slate-500">Business registration and purchasing categories</p>
            </div>
            <Link
              to="/profile/edit"
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Profile
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">Business Name</span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {user?.buyerDetails?.businessName || 'Business name not specified'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">Business Category</span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {user?.buyerDetails?.businessType || 'Wholesale Buyer'}
              </p>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">
                Procurement Hub / Mandi Location
              </span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {user?.buyerDetails?.businessLocation || `${user?.village}, ${user?.district}, ${user?.state}`}
              </p>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">
                Required Agricultural Categories
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {user?.buyerDetails?.requiredCategories && user.buyerDetails.requiredCategories.length > 0 ? (
                  user.buyerDetails.requiredCategories.map((cat, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-blue-100/70 text-blue-800 font-semibold text-xs border border-blue-200"
                    >
                      {cat}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">
                    All major food categories (Grain, Vegetables, Fruits, Oilseeds). Click 'Edit Profile' to customize.
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline (1 Col) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">Recent Activity</h3>
            <span className="text-xs text-slate-400">Activity record</span>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Buyer Account Verified</p>
                <p className="text-[11px] text-slate-500">
                  Authentication and enterprise entity record created successfully.
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
                <p className="text-xs font-bold text-slate-900">Escrow Security Active</p>
                <p className="text-[11px] text-slate-500">
                  Direct payment protocols enabled for forthcoming purchase orders.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Active</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">AI Matching Engine</p>
                <p className="text-[11px] text-slate-500">
                  Upcoming V2/V3 module will automatically connect crop listings to your specifications.
                </p>
                <span className="text-[10px] text-amber-600 font-semibold mt-1 block">Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Action Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Upcoming Sourcing Actions (Version 2)
            </h3>
            <p className="text-xs text-slate-500">
              Procurement catalog and smart matching tools unlock in the next version.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <UpcomingActionCard
            title="Browse Produce Catalog"
            description="Explore farm listings with certified quality photos, mandi rate comparisons, and farm locations."
            icon={Search}
            versionBadge="Version 2 Feature"
          />

          <UpcomingActionCard
            title="Post Bulk Procurement RFQ"
            description="Broadcast your volume demand (e.g. 50 tonnes Wheat) to regional farmer clusters directly."
            icon={FileText}
            versionBadge="Version 2 Feature"
          />

          <UpcomingActionCard
            title="Coordinate Fleet Logistics"
            description="Select registered logistics providers to arrange temperature-controlled farm-gate dispatch."
            icon={Truck}
            versionBadge="Version 2 Feature"
          />
        </div>
      </div>
    </div>
  );
};
