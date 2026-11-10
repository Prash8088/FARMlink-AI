import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { productService } from '../../services/productService';
import { ImageUploadPreview } from '../../components/common/ImageUploadPreview';
import { Alert } from '../../components/common/Alert';
import { PRODUCT_CATEGORIES, QUALITY_GRADES, MEASUREMENT_UNITS, INDIAN_STATES } from '../../utils/constants';
import { formatCurrency } from '../../utils/formatters';
import {
  ArrowLeft,
  Save,
  Trash2,
  Package,
  Calendar,
  MapPin,
  Sparkles,
  CheckCircle2,
  Lock
} from 'lucide-react';

export const EditProductPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const [formData, setFormData] = useState({
    cropName: '',
    category: PRODUCT_CATEGORIES[0],
    description: '',
    images: [],
    quantity: '',
    unit: 'quintal',
    pricePerUnit: '',
    qualityGrade: QUALITY_GRADES[0],
    harvestDate: '',
    pickupLocation: '',
    state: '',
    district: '',
    village: '',
    status: 'available'
  });

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getProductById(id);
        if (res.success && res.data) {
          const p = res.data;
          // Check ownership
          const farmerId = typeof p.farmerId === 'object' ? p.farmerId._id : p.farmerId;
          if (farmerId !== user?._id && user?.role !== 'admin') {
            setAlert({
              type: 'error',
              message: 'Access denied: You can only edit your own crop listings.'
            });
            return;
          }

          setFormData({
            cropName: p.cropName || '',
            category: p.category || PRODUCT_CATEGORIES[0],
            description: p.description || '',
            images: p.images || [],
            quantity: p.quantity !== undefined ? p.quantity : '',
            unit: p.unit || 'quintal',
            pricePerUnit: p.pricePerUnit !== undefined ? p.pricePerUnit : '',
            qualityGrade: p.qualityGrade || QUALITY_GRADES[0],
            harvestDate: p.harvestDate ? new Date(p.harvestDate).toISOString().split('T')[0] : '',
            pickupLocation: p.pickupLocation || '',
            state: p.state || '',
            district: p.district || '',
            village: p.village || '',
            status: p.status || 'available'
          });
        }
      } catch (err) {
        setAlert({
          type: 'error',
          message: err.response?.data?.message || 'Failed to load product details.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, user]);

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
  };

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
    if (formData.quantity === undefined || Number(formData.quantity) < 0) {
      errors.quantity = 'Quantity cannot be negative';
    }
    if (formData.pricePerUnit === undefined || Number(formData.pricePerUnit) <= 0) {
      errors.pricePerUnit = 'Price per unit must be greater than 0';
    }
    if (!formData.pickupLocation.trim()) errors.pickupLocation = 'Farm pickup location is required';
    if (!formData.state.trim()) errors.state = 'State is required';
    if (!formData.district.trim()) errors.district = 'District is required';
    if (!formData.village.trim()) errors.village = 'Village or city is required';
    if (!formData.images || formData.images.length === 0) {
      errors.images = 'At least one crop photograph is required';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      setAlert({ type: 'error', message: 'Please correct the highlighted form errors.' });
      return;
    }

    try {
      setSaving(true);
      const res = await productService.updateProduct(id, formData);
      if (res.success) {
        setAlert({ type: 'success', message: 'Product listing updated successfully!' });
        setTimeout(() => {
          navigate('/dashboard/farmer/products');
        }, 1200);
      }
    } catch (err) {
      const resp = err.response?.data;
      if (resp?.errors) {
        setFieldErrors(resp.errors);
      }
      setAlert({
        type: 'error',
        message: resp?.message || err.message || 'Failed to update product listing.'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-slate-500">Loading product details...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div>
        <Link
          to="/dashboard/farmer/products"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Produce Listings
        </Link>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Edit Produce Listing
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Modify batch specs, adjust available stock, or pause marketplace visibility.
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
        {/* Main Fields (2 Cols) */}
        <div className="lg:col-span-2 space-y-6 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm">
          {/* Section 1: Identification */}
          <div>
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              1. Crop Classification
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
                  className={`w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 ${
                    fieldErrors.cropName ? 'border-rose-400 bg-rose-50/20' : 'border-slate-200'
                  }`}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
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
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
                  >
                    {QUALITY_GRADES.map((grade) => (
                      <option key={grade} value={grade}>
                        {grade}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Marketplace Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold capitalize"
                  >
                    <option value="available">Available (Public)</option>
                    <option value="unavailable">Unavailable (Paused)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Detailed Description *
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Crop Photographs */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              2. Crop Photographs (Max 5)
            </h3>
            <ImageUploadPreview
              images={formData.images}
              onChange={handleImagesChange}
              maxImages={5}
            />
          </div>

          {/* Section 3: Quantity & Price */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              3. Inventory & Pricing
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Quantity Available *
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Unit
                </label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
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
                <input
                  type="number"
                  min="0"
                  step="any"
                  name="pricePerUnit"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold"
                />
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
                className="w-full sm:w-1/2 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Section 4: Location */}
          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
              4. Farm Pickup Location
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  State
                </label>
                <select
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
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
                  District
                </label>
                <input
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Village / City
                </label>
                <input
                  type="text"
                  name="village"
                  value={formData.village}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pickup Landmark / Address
                </label>
                <input
                  type="text"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Summary Card */}
        <div className="space-y-6">
          <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-md space-y-4 sticky top-24">
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400">
              Lot Valuation
            </h3>

            <div className="p-4 rounded-2xl bg-white/10 border border-white/10 space-y-2">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Available</span>
                <span className="font-bold text-white">{numQuantity} {formData.unit}</span>
              </div>
              <div className="flex justify-between text-xs text-slate-300">
                <span>Rate</span>
                <span className="font-bold text-white">{formatCurrency(numPrice)} / {formData.unit}</span>
              </div>
              <div className="pt-2 border-t border-white/10 flex justify-between items-baseline">
                <span className="text-xs text-emerald-300 font-semibold">Total Estimated Lot Value</span>
                <span className="text-lg font-black text-white">{formatCurrency(totalEstimatedValue)}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Saving Updates...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </>
              )}
            </button>

            <Link
              to="/dashboard/farmer/products"
              className="block w-full py-2.5 text-center text-xs font-semibold text-slate-400 hover:text-white transition-colors"
            >
              Cancel & Return
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
};
