import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { Alert } from '../../components/common/Alert';
import { INDIAN_STATES, BUYER_TYPES, VEHICLE_TYPES, CROP_CATEGORIES } from '../../utils/constants';
import {
  Sprout,
  Building2,
  Truck,
  Mail,
  Lock,
  Phone,
  User,
  MapPin,
  Check,
  ArrowRight,
  ShieldAlert,
  Eye,
  EyeOff
} from 'lucide-react';

export const RegisterPage = () => {
  const { register, isAuthenticated, user, getRoleDashboardPath } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Selected role tab: farmer | buyer | transporter
  const [selectedRole, setSelectedRole] = useState('farmer');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    state: 'Maharashtra',
    district: '',
    village: '',
    address: '',
    // Farmer specific
    farmName: '',
    farmingExperience: '',
    mainCropsGrown: '',
    // Buyer specific
    businessName: '',
    businessType: 'Wholesale Distributor',
    businessLocation: '',
    requiredCategories: [],
    // Transporter specific
    companyOrIndividualName: '',
    vehicleType: 'Medium Duty Truck (6-10 MT)',
    vehicleRegNumber: '',
    vehicleCapacity: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(getRoleDashboardPath(user.role), { replace: true });
    }
    const params = new URLSearchParams(location.search);
    const roleParam = params.get('role');
    if (roleParam && ['farmer', 'buyer', 'transporter'].includes(roleParam.toLowerCase())) {
      setSelectedRole(roleParam.toLowerCase());
    }
  }, [isAuthenticated, user, navigate, location, getRoleDashboardPath]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (errorMessage) setErrorMessage('');
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.fullName.trim()) errors.fullName = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      errors.email = 'Enter a valid email address';
    }

    const cleanPhone = formData.phone.replace(/[\s-]/g, '');
    if (!cleanPhone) {
      errors.phone = 'Mobile number is required';
    } else if (!/^\+?\d{10,14}$/.test(cleanPhone)) {
      errors.phone = 'Enter a valid 10-digit mobile number';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      errors.password = 'Must have uppercase, lowercase and numbers';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.district.trim()) errors.district = 'District is required';
    if (!formData.village.trim()) errors.village = 'Village or city is required';

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!validateForm()) return;

    try {
      setLoading(true);

      // Build payload based on role
      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
        role: selectedRole,
        state: formData.state.trim(),
        district: formData.district.trim(),
        village: formData.village.trim(),
        address: formData.address.trim()
      };

      if (selectedRole === 'farmer') {
        payload.farmerDetails = {
          farmName: formData.farmName.trim(),
          farmingExperience: Number(formData.farmingExperience) || 0,
          mainCropsGrown: formData.mainCropsGrown
            ? formData.mainCropsGrown.split(',').map((c) => c.trim()).filter(Boolean)
            : []
        };
      } else if (selectedRole === 'buyer') {
        payload.buyerDetails = {
          businessName: formData.businessName.trim(),
          businessType: formData.businessType,
          businessLocation: formData.businessLocation.trim(),
          requiredCategories: formData.requiredCategories
        };
      } else if (selectedRole === 'transporter') {
        payload.transporterDetails = {
          companyOrIndividualName: formData.companyOrIndividualName.trim(),
          vehicleType: formData.vehicleType,
          vehicleRegNumber: formData.vehicleRegNumber.trim(),
          vehicleCapacity: formData.vehicleCapacity.trim()
        };
      }

      const registeredUser = await register(payload);
      navigate(getRoleDashboardPath(registeredUser.role), { replace: true });
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        setFieldErrors(resp.errors);
      }
      setErrorMessage(resp?.message || err.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <Link to="/" className="inline-flex items-center gap-2 mb-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-emerald-400 flex items-center justify-center text-white shadow-md shadow-emerald-600/20">
            <Sprout className="w-7 h-7" />
          </div>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Create Your FARMlink AI Account
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500">
          Join thousands of agricultural producers, wholesale buyers, and logistics providers.
        </p>
      </div>

      {/* Role Selector Tabs */}
      <div className="bg-slate-200/80 p-1.5 rounded-2xl grid grid-cols-3 gap-1 mb-8 shadow-inner">
        <button
          type="button"
          onClick={() => setSelectedRole('farmer')}
          className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            selectedRole === 'farmer'
              ? 'bg-white text-emerald-800 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Sprout className="w-4 h-4 text-emerald-600" />
          <span>Farmer</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole('buyer')}
          className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            selectedRole === 'buyer'
              ? 'bg-white text-blue-800 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-blue-600" />
          <span>Agri Buyer</span>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole('transporter')}
          className={`py-3 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            selectedRole === 'transporter'
              ? 'bg-white text-amber-800 shadow-md scale-[1.01]'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Truck className="w-4 h-4 text-amber-600" />
          <span>Transporter</span>
        </button>
      </div>

      {/* Registration Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/90 shadow-sm space-y-6">
        {errorMessage && (
          <Alert
            type="error"
            message={errorMessage}
            onClose={() => setErrorMessage('')}
          />
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Basic Credentials */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              1. Account Identification
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Full Name *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Ramesh Patel"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                      fieldErrors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                </div>
                {fieldErrors.fullName && (
                  <p className="mt-1 text-xs text-rose-500">{fieldErrors.fullName}</p>
                )}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ramesh@example.com"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                      fieldErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-rose-500">{fieldErrors.email}</p>
                )}
              </div>

              {/* Mobile Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Mobile Number (10 digits) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+91 98765 43210"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                      fieldErrors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                </div>
                {fieldErrors.phone && (
                  <p className="mt-1 text-xs text-rose-500">{fieldErrors.phone}</p>
                )}
              </div>

              {/* Selected Role Readonly indicator */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Designated Role
                </label>
                <div className="py-2 px-3 bg-slate-100 rounded-xl text-xs font-bold text-slate-800 capitalize flex items-center justify-between border border-slate-200">
                  <span>{selectedRole} Account</span>
                  <span className="text-[10px] text-emerald-600 font-semibold">Change above</span>
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Password (8+ chars) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-9 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                      fieldErrors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-rose-500">{fieldErrors.password}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500 ${
                      fieldErrors.confirmPassword ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                    }`}
                  />
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-500">{fieldErrors.confirmPassword}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Location Information */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              2. Geographic Location
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* State */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  State *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* District */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  District *
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Pune, Ludhiana"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 ${
                    fieldErrors.district ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.district && (
                  <p className="mt-1 text-xs text-rose-500">{fieldErrors.district}</p>
                )}
              </div>

              {/* Village or City */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Village or City *
                </label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="e.g. Baramati"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 ${
                    fieldErrors.village ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.village && (
                  <p className="mt-1 text-xs text-rose-500">{fieldErrors.village}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Street / Plot / Land Address (Optional)
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Plot/Survey No., Road, Landmark"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 3: Role Specific Details */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              3. {selectedRole === 'farmer' ? 'Farm & Crop Details' : selectedRole === 'buyer' ? 'Commercial Business Details' : 'Fleet & Logistics Details'}
            </h3>

            {selectedRole === 'farmer' && (
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
                    placeholder="e.g. Green Valley Agro"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Farming Experience (Years)
                  </label>
                  <input
                    type="number"
                    name="farmingExperience"
                    min="0"
                    value={formData.farmingExperience}
                    onChange={handleChange}
                    placeholder="e.g. 10"
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
                    placeholder="e.g. Wheat, Basmati Rice, Mustard, Sugarcane"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}

            {selectedRole === 'buyer' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Business / Entity Name
                  </label>
                  <input
                    type="text"
                    name="businessName"
                    value={formData.businessName}
                    onChange={handleChange}
                    placeholder="e.g. Apex Fresh Foods Pvt Ltd"
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
                    Business Procurement Location / Mandi
                  </label>
                  <input
                    type="text"
                    name="businessLocation"
                    value={formData.businessLocation}
                    onChange={handleChange}
                    placeholder="e.g. Vashi APMC Terminal & Central Warehouse"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}

            {selectedRole === 'transporter' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Company or Fleet Operator Name
                  </label>
                  <input
                    type="text"
                    name="companyOrIndividualName"
                    value={formData.companyOrIndividualName}
                    onChange={handleChange}
                    placeholder="e.g. Kisan Logistics Lines"
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
                    Vehicle Registration Number
                  </label>
                  <input
                    type="text"
                    name="vehicleRegNumber"
                    value={formData.vehicleRegNumber}
                    onChange={handleChange}
                    placeholder="e.g. MH-12-AB-1234"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
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
                    placeholder="e.g. 8 Metric Tonnes"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold shadow-md shadow-emerald-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Creating {selectedRole} account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration & Access Console</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="font-bold text-emerald-600 hover:text-emerald-700">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
