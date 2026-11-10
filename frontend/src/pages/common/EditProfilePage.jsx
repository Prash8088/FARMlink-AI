import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { userService } from '../../services/userService';
import { Alert } from '../../components/common/Alert';
import { INDIAN_STATES, BUYER_TYPES, VEHICLE_TYPES } from '../../utils/constants';
import {
  User,
  Phone,
  MapPin,
  Save,
  ArrowLeft,
  Lock,
  Sprout,
  Building2,
  Truck
} from 'lucide-react';

export const EditProfilePage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    state: user?.state || '',
    district: user?.district || '',
    village: user?.village || '',
    address: user?.address || '',
    // Farmer
    farmName: user?.farmerDetails?.farmName || '',
    farmingExperience: user?.farmerDetails?.farmingExperience || 0,
    mainCropsGrown: user?.farmerDetails?.mainCropsGrown?.join(', ') || '',
    // Buyer
    businessName: user?.buyerDetails?.businessName || '',
    businessType: user?.buyerDetails?.businessType || 'Wholesale Distributor',
    businessLocation: user?.buyerDetails?.businessLocation || '',
    requiredCategories: user?.buyerDetails?.requiredCategories?.join(', ') || '',
    // Transporter
    companyOrIndividualName: user?.transporterDetails?.companyOrIndividualName || '',
    vehicleType: user?.transporterDetails?.vehicleType || 'Medium Duty Truck (6-10 MT)',
    vehicleRegNumber: user?.transporterDetails?.vehicleRegNumber || '',
    vehicleCapacity: user?.transporterDetails?.vehicleCapacity || '',
    operatingLocations: user?.transporterDetails?.operatingLocations?.join(', ') || ''
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    if (alert) setAlert(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    if (!formData.fullName.trim()) {
      setAlert({ type: 'error', message: 'Full name is required' });
      return;
    }
    if (!formData.phone.trim()) {
      setAlert({ type: 'error', message: 'Phone number is required' });
      return;
    }

    try {
      setLoading(true);

      const payload = {
        fullName: formData.fullName.trim(),
        phone: formData.phone.trim(),
        state: formData.state.trim(),
        district: formData.district.trim(),
        village: formData.village.trim(),
        address: formData.address.trim()
      };

      if (user.role === 'farmer') {
        payload.farmerDetails = {
          farmName: formData.farmName.trim(),
          farmingExperience: Number(formData.farmingExperience) || 0,
          mainCropsGrown: formData.mainCropsGrown
            ? formData.mainCropsGrown.split(',').map((c) => c.trim()).filter(Boolean)
            : []
        };
      } else if (user.role === 'buyer') {
        payload.buyerDetails = {
          businessName: formData.businessName.trim(),
          businessType: formData.businessType,
          businessLocation: formData.businessLocation.trim(),
          requiredCategories: formData.requiredCategories
            ? formData.requiredCategories.split(',').map((c) => c.trim()).filter(Boolean)
            : []
        };
      } else if (user.role === 'transporter') {
        payload.transporterDetails = {
          companyOrIndividualName: formData.companyOrIndividualName.trim(),
          vehicleType: formData.vehicleType,
          vehicleRegNumber: formData.vehicleRegNumber.trim(),
          vehicleCapacity: formData.vehicleCapacity.trim(),
          operatingLocations: formData.operatingLocations
            ? formData.operatingLocations.split(',').map((l) => l.trim()).filter(Boolean)
            : []
        };
      }

      const res = await userService.updateProfile(payload);
      if (res.success && res.data) {
        updateUser(res.data);
        setAlert({
          type: 'success',
          message: 'Your profile has been updated successfully.'
        });
        setTimeout(() => {
          navigate('/profile');
        }, 1200);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update profile information.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            to="/profile"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Profile
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">Edit Profile Information</h1>
          <p className="text-xs text-slate-500">Update your personal and role-specific details</p>
        </div>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Main Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
        {/* Readonly Security Banner */}
        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              Registered Email (Fixed)
            </span>
            <p className="font-semibold text-slate-700">{user?.email}</p>
          </div>
          <div>
            <span className="text-slate-400 block mb-1 flex items-center gap-1">
              <Lock className="w-3 h-3" />
              System Role (Immutable)
            </span>
            <p className="font-semibold text-slate-700 capitalize">{user?.role} Account</p>
          </div>
        </div>

        {/* Section 1: Personal Contact */}
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            1. Personal & Contact
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name *
              </label>
              <input
                type="text"
                name="fullName"
                required
                value={formData.fullName}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Mobile Number *
              </label>
              <input
                type="text"
                name="phone"
                required
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Geographic Address */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
            2. Location & Address
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                State
              </label>
              <select
                name="state"
                value={formData.state}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                {INDIAN_STATES.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                District
              </label>
              <input
                type="text"
                name="district"
                value={formData.district}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Village / City
              </label>
              <input
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Street / Plot Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Plot or Survey number, Road, Landmark"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Role-Specific Editable Details */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 capitalize">
            3. {user?.role} Operational Information
          </h3>

          {user?.role === 'farmer' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Farm Name
                </label>
                <input
                  type="text"
                  name="farmName"
                  value={formData.farmName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Farming Experience (Years)
                </label>
                <input
                  type="number"
                  min="0"
                  name="farmingExperience"
                  value={formData.farmingExperience}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Main Crops Grown (Comma separated)
                </label>
                <input
                  type="text"
                  name="mainCropsGrown"
                  value={formData.mainCropsGrown}
                  onChange={handleChange}
                  placeholder="Wheat, Rice, Cotton, Soybean"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {user?.role === 'buyer' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Entity Name
                </label>
                <input
                  type="text"
                  name="businessName"
                  value={formData.businessName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Business Type
                </label>
                <select
                  name="businessType"
                  value={formData.businessType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  {BUYER_TYPES.map((bt) => (
                    <option key={bt} value={bt}>
                      {bt}
                    </option>
                  ))}
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Procurement Hub Location
                </label>
                <input
                  type="text"
                  name="businessLocation"
                  value={formData.businessLocation}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Required Crop Categories (Comma separated)
                </label>
                <input
                  type="text"
                  name="requiredCategories"
                  value={formData.requiredCategories}
                  onChange={handleChange}
                  placeholder="Grains, Fresh Vegetables, Pulses"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
          )}

          {user?.role === 'transporter' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Company / Fleet Name
                </label>
                <input
                  type="text"
                  name="companyOrIndividualName"
                  value={formData.companyOrIndividualName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Vehicle Type
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                >
                  {VEHICLE_TYPES.map((vt) => (
                    <option key={vt} value={vt}>
                      {vt}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Registration Number
                </label>
                <input
                  type="text"
                  name="vehicleRegNumber"
                  value={formData.vehicleRegNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Payload Capacity
                </label>
                <input
                  type="text"
                  name="vehicleCapacity"
                  value={formData.vehicleCapacity}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Operating Transport Corridors (Comma separated)
                </label>
                <input
                  type="text"
                  name="operatingLocations"
                  value={formData.operatingLocations}
                  onChange={handleChange}
                  placeholder="Maharashtra, Gujarat, Madhya Pradesh"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
              </div>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <Link
            to="/profile"
            className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving Changes...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
