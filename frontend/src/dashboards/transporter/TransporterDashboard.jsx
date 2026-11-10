import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { StatCard } from '../../components/common/StatCard';
import { UpcomingActionCard } from '../../components/common/ComingSoonBadge';
import { formatDate } from '../../utils/formatters';
import {
  Truck,
  Package,
  Layers,
  CheckCircle,
  Clock,
  Edit,
  UserCheck,
  Navigation,
  Fuel,
  ShieldCheck,
  MapPin
} from 'lucide-react';

export const TransporterDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-amber-800 via-amber-700 to-yellow-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-900/60 text-amber-200 border border-amber-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Truck className="w-3.5 h-3.5 text-amber-300" />
            <span>Logistics & Fleet Console • Version 1</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Greetings, {user?.fullName || 'Transporter'}!
          </h2>
          <p className="mt-2 text-sm text-amber-100/90 leading-relaxed">
            Your logistics carrier profile is active for{' '}
            <strong className="text-white">
              {user?.transporterDetails?.companyOrIndividualName || `${user?.fullName}'s Fleet`}
            </strong>.
            Connect directly with growers and procurement centers to maximize payload on every route.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <Link
              to="/profile"
              className="px-4 py-2 bg-white text-amber-950 font-bold rounded-xl hover:bg-amber-50 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <UserCheck className="w-4 h-4 text-amber-700" />
              View Vehicle Profile
            </Link>
            <Link
              to="/profile/edit"
              className="px-4 py-2 bg-amber-900/40 text-amber-100 hover:bg-amber-900/60 font-semibold rounded-xl border border-amber-400/30 transition-colors inline-flex items-center gap-1.5"
            >
              <Edit className="w-3.5 h-3.5" />
              Update Fleet Specs
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Freight & Fleet Status
          </h3>
          <span className="text-xs text-slate-400 font-medium">Real platform telemetry</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <StatCard
            title="Available Transport Requests"
            value="0"
            subtext="Farm dispatch orders awaiting freight bid"
            icon={Package}
            color="amber"
            badgeText="V1 Zero Baseline"
          />
          <StatCard
            title="Active Deliveries"
            value="0"
            subtext="Vehicles currently loaded in transit"
            icon={Truck}
            color="blue"
            badgeText="Pending V2 Marketplace"
          />
          <StatCard
            title="Completed Deliveries"
            value="0"
            subtext="Fulfilled trips verified by receiving warehouse"
            icon={CheckCircle}
            color="emerald"
            badgeText="Verified Waybills"
          />
        </div>
      </div>

      {/* Two Column Layout: Vehicle Specs & Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehicle Specs (2 Cols) */}
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">Vehicle Specifications & Routes</h3>
              <p className="text-xs text-slate-500">Configured payload and regional operating routes</p>
            </div>
            <Link
              to="/profile/edit"
              className="text-xs font-semibold text-amber-700 hover:text-amber-800 flex items-center gap-1"
            >
              <Edit className="w-3.5 h-3.5" />
              Edit Specs
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">Company / Operator</span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {user?.transporterDetails?.companyOrIndividualName || 'Company name not specified'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">Vehicle Class</span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {user?.transporterDetails?.vehicleType || 'Medium Duty Truck'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">Registration Number</span>
              <p className="text-sm font-bold text-slate-900 mt-1 font-mono">
                {user?.transporterDetails?.vehicleRegNumber || 'Not registered'}
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">Rated Payload Capacity</span>
              <p className="text-sm font-bold text-slate-900 mt-1">
                {user?.transporterDetails?.vehicleCapacity || 'Capacity not configured'}
              </p>
            </div>

            <div className="sm:col-span-2 p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 font-medium uppercase tracking-wider">
                Operating Corridor / Regions
              </span>
              <div className="mt-2 flex flex-wrap gap-2">
                {user?.transporterDetails?.operatingLocations &&
                user.transporterDetails.operatingLocations.length > 0 ? (
                  user.transporterDetails.operatingLocations.map((loc, idx) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 rounded-lg bg-amber-100/70 text-amber-800 font-semibold text-xs border border-amber-200"
                    >
                      {loc}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">
                    Regional corridor: {user?.state}, {user?.district}. Click 'Edit Specs' to add inter-state corridors.
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
                <p className="text-xs font-bold text-slate-900">Transporter Profile Enrolled</p>
                <p className="text-[11px] text-slate-500">
                  Carrier registration details authenticated on FARMlink AI network.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {formatDate(user?.createdAt)}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Fleet Security Validated</p>
                <p className="text-[11px] text-slate-500">
                  Vehicle telemetry and driver identity checks configured for Version 2 dispatch.
                </p>
                <span className="text-[10px] text-slate-400 mt-1 block">Active</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">Version 2 Freight Board</p>
                <p className="text-[11px] text-slate-500">
                  Live load matching and farm-gate dispatch requests will appear here.
                </p>
                <span className="text-[10px] text-blue-600 font-semibold mt-1 block">Upcoming</span>
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
              Upcoming Logistics Capabilities (Version 2)
            </h3>
            <p className="text-xs text-slate-500">
              Interactive load booking and route tools will be available in the next release.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <UpcomingActionCard
            title="Browse Farm Freight Requests"
            description="View real-time farm produce pickup requests near your current truck location."
            icon={Package}
            versionBadge="Version 2 Feature"
          />

          <UpcomingActionCard
            title="AI Route & Fuel Optimization"
            description="Automated route calculations reducing empty return trips and minimizing per-km fuel expenditure."
            icon={Navigation}
            versionBadge="Version 2 Feature"
          />

          <UpcomingActionCard
            title="Digital Bill of Lading & e-Waybill"
            description="Automatic generation of verified transit documents and QR-verified delivery confirmations."
            icon={ShieldCheck}
            versionBadge="Version 2 Feature"
          />
        </div>
      </div>
    </div>
  );
};
