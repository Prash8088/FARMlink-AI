import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { productService } from '../../services/productService';
import { ImageUploadPreview } from '../../components/common/ImageUploadPreview';
import { Alert } from '../../components/common/Alert';
import { PRODUCT_CATEGORIES, QUALITY_GRADES, MEASUREMENT_UNITS, INDIAN_STATES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import {
  ArrowLeft,
  Package,
  Calendar,
  MapPin,
  IndianRupee,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info
} from 'lucide-react';

export const AddProductPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cropName: '',
    category: PRODUCT_CATEGORIES[0],
    description: '',
    images: [],
    quantity: '',
    unit: 'quintal',
    pricePerUnit: '',
    qualityGrade: QUALITY_GRADES[0],
    harvestDate: new Date().toISOString().split('T')[0],
    pickupLocation: user?.address || (user?.farmerDetails?.farmName ? `${user.farmerDetails.farmName} Gate` : ''),
    state: user?.state || 'Maharashtra',
    district: user?.district || '',
    village: user?.village || ''
  });

  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
    if (alert) setAlert(null);
  };

  const handleImagesChange = (newImages) => {
    setFormData((prev) => ({ ...prev, images: newImages }));
    if (fieldErrors.images) {
      setFieldErrors((prev) => ({ ...prev, images: undefined }));
    }
  };

  // Live calculation of estimated total lot value
  const numQuantity = Number(formData.quantity) || 0;
  const numPrice = Number(formData.pricePerUnit) || 0;
  const totalEstimatedValue = numQuantity * numPrice;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);

    const errors = {};
    if (!formData.cropName.trim()) errors.cropName = 'Crop name is required';
    if (!formData.description.trim() || formData.description.trim().length < 10) {
      errors.description = 'Please write a descriptive summary (at least 10 characters)';
    }
    if (!formData.quantity || Number(formData.quantity) <= 0) {
      errors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.pricePerUnit || Number(formData.pricePerUnit) <= 0) {
      errors.pricePerUnit = 'Price per unit must be greater than 0';
    }
    if (!formData.pickupLocation.trim()) errors.pickupLocation = 'Farm pickup location is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.district.trim()) errors.district = 'District is required';
    if (!formData.village.trim()) errors.village = 'Village or city is required';
    if (!formData.images || formData.images.length === 0) {
      errors.images = 'Please upload or provide at least one crop photograph';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setAlert({ type: 'error', message: 'Please correct the highlighted form errors.' });
      return;
    }

    try {
      setLoading(true);
      const res = await productService.createProduct(formData);
      if (res.success) {
        navigate('/dashboard/farmer/products', {
          state: { successMessage: `Product "${formData.cropName}" published successfully!` }
        });
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        setFieldErrors(resp.errors);
      }
      setAlert({
        type: 'error',
        message: resp?.message || err.message || 'Failed to publish crop listing.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Breadcrumb Header */}
      <div>
        <Link
          to="/dashboard/farmer/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Produce Listings
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Publish New Crop Listing
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Add your harvest to the direct marketplace with quality grade, photos, and transparent pricing.
        </p>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form Fields (2 Cols) */}
        <div className="lg:col-span-2 space-y-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          {/* Section 1: Basic Crop Specs */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              1. Crop Identification & Classification
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Crop Name & Variety *
                </label>
                <input
                  type="text"
                  name="cropName"
                  value={formData.cropName}
                  onChange={handleChange}
                  placeholder="e.g. Sharbati Golden Wheat, Thompson Seedless Grapes, Nashik Red Onions"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 ${
                    fieldErrors.cropName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.cropName && (
                  <p className="mt-1 text-xs text-rose-500">{fieldErrors.cropName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {PRODUCT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Quality Grade *
                  </label>
                  <select
                    name="qualityGrade"
                    value={formData.qualityGrade}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                  >
                    {QUALITY_GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Description & Crop Characteristics *
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe cultivation method (organic/standard), moisture percentage, grain size, packaging status, and quality attributes..."
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-xs focus:ring-2 focus:ring-emerald-500 ${
                    fieldErrors.description ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.description && (
                  <p className="mt-1 text-xs text-rose-500">{fieldErrors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Crop Photographs (Multiple Image Upload) */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              2. Crop Photographs & Inspection Images *
            </h3>
            <p className="text-[11px] text-slate-500 mb-3">
              Add clear pictures of your harvest, grain/produce sample, and packaging condition to build buyer trust.
            </p>

            <ImageUploadPreview
              images={formData.images}
              onChange={handleImagesChange}
              maxImages={5}
            />
            {fieldErrors.images && (
              <p className="mt-2 text-xs text-rose-500">{fieldErrors.images}</p>
            )}
          </div>

          {/* Section 3: Quantity, Pricing & Harvest Date */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              3. Quantity, Unit Pricing & Harvest Date
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Available Quantity *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  placeholder="e.g. 100"
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 ${
                    fieldErrors.quantity ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
                {fieldErrors.quantity && (
                  <p className="mt-1 text-xs text-rose-500">{fieldErrors.quantity}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Unit *
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500"
                >
                  {MEASUREMENT_UNITS.map((u) => (
                    <option key={u.value} value={u.value}>
                      {u.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Price per Unit (₹) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <span className="text-xs font-bold">₹</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    name="pricePerUnit"
                    value={formData.pricePerUnit}
                    onChange={handleChange}
                    placeholder="e.g. 2500"
                    className={`w-full pl-7 pr-3 py-2.5 bg-slate-50 border rounded-xl text-sm font-semibold focus:ring-2 focus:ring-emerald-500 ${
                      fieldErrors.pricePerUnit ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                    }`}
                  />
                </div>
                {fieldErrors.pricePerUnit && (
                  <p className="mt-1 text-xs text-rose-500">{fieldErrors.pricePerUnit}</p>
                )}
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Harvest Date *
              </label>
              <input
                type="date"
                name="harvestDate"
                value={formData.harvestDate}
                onChange={handleChange}
                className="w-full sm:w-1/2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Section 4: Farm Pickup Location */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              4. Farm Pickup Coordinates & Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  State *
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                >
                  {INDIAN_STATES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  District *
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="e.g. Mehsana"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs ${
                    fieldErrors.district ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Village / City *
                </label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  placeholder="e.g. Kadi"
                  className={`w-full px-3 py-2 bg-slate-50 border rounded-xl text-xs ${
                    fieldErrors.village ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Exact Pickup Landmark / Farm Gate Address *
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  placeholder="e.g. Survey No. 42, Near Cooperative Mandi Yard, Dindori Road"
                  className={`w-full px-3.5 py-2 bg-slate-50 border rounded-xl text-xs ${
                    fieldErrors.pickupLocation ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Revenue Summary & Publication Card (1 Col) */}
        <div className="space-y-6">
          <div className="bg-gradient-to-br from-emerald-900 to-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4 sticky top-24">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold uppercase tracking-wider">Lot Value Summary</h3>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Quantity</span>
                <span className="font-bold text-white">
                  {numQuantity} {formData.unit}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Rate per {formData.unit}</span>
                <span className="font-bold text-white">
                  {formatCurrency(numPrice)}
                </span>
              </div>
              <div className="pt-2 border-t border-white/10 flex items-baseline justify-between">
                <span className="text-xs font-semibold text-emerald-300">Estimated Lot Realization</span>
                <span className="text-xl font-extrabold text-white">
                  {formatCurrency(totalEstimatedValue)}
                </span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-emerald-100/80">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Zero commission deducted by brokers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Instant visibility to registered wholesale buyers</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>Direct farm-gate pickup by certified fleet</span>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10 space-y-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                    <span>Publishing Listing...</span>
                  </>
                ) : (
                  <span>Publish Produce Listing</span>
                )}
              </button>

              <Link
                to="/dashboard/farmer/products"
                className="block w-full py-2.5 text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
              >
                Discard & Return
              </Link>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
