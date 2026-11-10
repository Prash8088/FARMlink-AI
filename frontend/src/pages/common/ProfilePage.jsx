import React from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { RoleBadge, StatusBadge, VerifiedBadge } from '../../components/common/Badge';
import { formatDate } from '../../utils/formatters';
import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Shield,
  Edit,
  Sprout,
  Building2,
  Truck,
  IdCard,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const ProfilePage = () => {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-emerald-600/20">
              {user.fullName?.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900">{user.fullName}</h1>
                <RoleBadge role={user.role} />
              </div>
              <p className="text-xs text-slate-500 mt-0.5">{user.email}</p>
              <div className="mt-2 flex items-center gap-2">
                <StatusBadge isActive={user.isActive} />
                <VerifiedBadge isVerified={user.isVerified} />
              </div>
            </div>
          </div>

          <Link
            to="/profile/edit"
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
          >
            <Edit className="w-3.5 h-3.5" />
            Edit Profile Information
          </Link>
        </div>

        {/* General Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6 text-xs">
          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              User ID
            </span>
            <span className="font-mono text-slate-700 bg-slate-100 px-2 py-1 rounded text-[11px] block truncate">
              {user._id}
            </span>
          </div>

          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Primary Mobile Phone
            </span>
            <div className="flex items-center gap-1.5 font-bold text-slate-800">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>{user.phone}</span>
            </div>
          </div>

          <div>
            <span className="text-slate-400 font-semibold uppercase tracking-wider block mb-1">
              Platform Enrolment
            </span>
            <div className="flex items-center gap-1.5 font-medium text-slate-700">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Details */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <MapPin className="w-4 h-4 text-emerald-600" />
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Geographic Location & Address
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block mb-1">State / Province</span>
            <p className="font-bold text-slate-800 text-sm">{user.state}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block mb-1">District</span>
            <p className="font-bold text-slate-800 text-sm">{user.district}</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 block mb-1">Village or City</span>
            <p className="font-bold text-slate-800 text-sm">{user.village}</p>
          </div>
          {user.address && (
            <div className="sm:col-span-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-slate-400 block mb-1">Plot / Street Address</span>
              <p className="font-medium text-slate-800 text-sm">{user.address}</p>
            </div>
          )}
        </div>
      </div>

      {/* Role-Specific Specification Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          {user.role === 'farmer' && <Sprout className="w-4 h-4 text-emerald-600" />}
          {user.role === 'buyer' && <Building2 className="w-4 h-4 text-blue-600" />}
          {user.role === 'transporter' && <Truck className="w-4 h-4 text-amber-600" />}
          {user.role === 'admin' && <Shield className="w-4 h-4 text-purple-600" />}
          <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider capitalize">
            {user.role} Operational Specifications
          </h3>
        </div>

        {/* Farmer Information */}
        {user.role === 'farmer' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-emerald-700 font-semibold block mb-1">Farm / Property Name</span>
              <p className="text-sm font-bold text-slate-900">
                {user.farmerDetails?.farmName || 'Not specified'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-emerald-700 font-semibold block mb-1">Farming Experience</span>
              <p className="text-sm font-bold text-slate-900">
                {user.farmerDetails?.farmingExperience
                  ? `${user.farmerDetails.farmingExperience} Years`
                  : 'Not specified'}
              </p>
            </div>
            <div className="sm:col-span-2 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100">
              <span className="text-emerald-700 font-semibold block mb-1">Main Crops Grown</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.farmerDetails?.mainCropsGrown && user.farmerDetails.mainCropsGrown.length > 0 ? (
                  user.farmerDetails.mainCropsGrown.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 font-bold text-xs"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">No crops recorded.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Buyer Information */}
        {user.role === 'buyer' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <span className="text-blue-700 font-semibold block mb-1">Commercial Business Name</span>
              <p className="text-sm font-bold text-slate-900">
                {user.buyerDetails?.businessName || 'Not specified'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <span className="text-blue-700 font-semibold block mb-1">Business Classification</span>
              <p className="text-sm font-bold text-slate-900">
                {user.buyerDetails?.businessType || 'Wholesaler'}
              </p>
            </div>
            <div className="sm:col-span-2 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <span className="text-blue-700 font-semibold block mb-1">Procurement Hub / Mandi</span>
              <p className="text-sm font-bold text-slate-900">
                {user.buyerDetails?.businessLocation || 'Not specified'}
              </p>
            </div>
            <div className="sm:col-span-2 p-4 rounded-xl bg-blue-50/50 border border-blue-100">
              <span className="text-blue-700 font-semibold block mb-1">Required Crop Categories</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.buyerDetails?.requiredCategories && user.buyerDetails.requiredCategories.length > 0 ? (
                  user.buyerDetails.requiredCategories.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-blue-100 text-blue-900 font-bold text-xs"
                    >
                      {c}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">All agricultural categories.</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Transporter Information */}
        {user.role === 'transporter' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="text-amber-700 font-semibold block mb-1">Company / Fleet Name</span>
              <p className="text-sm font-bold text-slate-900">
                {user.transporterDetails?.companyOrIndividualName || 'Not specified'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="text-amber-700 font-semibold block mb-1">Vehicle Classification</span>
              <p className="text-sm font-bold text-slate-900">
                {user.transporterDetails?.vehicleType || 'Not specified'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="text-amber-700 font-semibold block mb-1">Vehicle Registration #</span>
              <p className="text-sm font-bold text-slate-900 font-mono">
                {user.transporterDetails?.vehicleRegNumber || 'Not specified'}
              </p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="text-amber-700 font-semibold block mb-1">Payload Capacity</span>
              <p className="text-sm font-bold text-slate-900">
                {user.transporterDetails?.vehicleCapacity || 'Not specified'}
              </p>
            </div>
            <div className="sm:col-span-2 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
              <span className="text-amber-700 font-semibold block mb-1">Operating Transport Corridors</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {user.transporterDetails?.operatingLocations && user.transporterDetails.operatingLocations.length > 0 ? (
                  user.transporterDetails.operatingLocations.map((l, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 font-bold text-xs"
                    >
                      {l}
                    </span>
                  ))
                ) : (
                  <span className="text-slate-400 italic">Regional corridor ({user.state}).</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Admin Information */}
        {user.role === 'admin' && (
          <div className="p-4 rounded-xl bg-purple-50 border border-purple-100 text-xs">
            <span className="text-purple-700 font-semibold block mb-1">Administrative Privileges</span>
            <p className="text-sm font-bold text-slate-900">
              Master System Administrator. Full access to user management, account activation, telemetry, and platform security.
            </p>
          </div>
        )}
      </div>

      {/* Security Governance Notice */}
      <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 text-xs text-slate-500 flex items-start gap-3">
        <Lock className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
        <p>
          <strong>Security Note:</strong> Account roles (<span className="capitalize">{user.role}</span>), email address, and platform verification status cannot be modified by users to prevent privilege escalation vulnerabilities.
        </p>
      </div>
    </div>
  );
};
