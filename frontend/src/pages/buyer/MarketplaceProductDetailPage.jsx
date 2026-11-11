import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { marketplaceService } from '../../services/marketplaceService';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { INDIAN_STATES } from '../../utils/constants';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Layers,
  Award,
  Package,
  ShieldCheck,
  Send,
  AlertCircle,
  CheckCircle2,
  TrendingDown,
  User,
  Phone,
  Mail,
  Info,
  Clock,
  ExternalLink
} from 'lucide-react';

export const MarketplaceProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Purchase request form state
  const [requestedQuantity, setRequestedQuantity] = useState('');
  const [initialOfferPrice, setInitialOfferPrice] = useState('');
  const [deliveryLocation, setDeliveryLocation] = useState({
    address: '',
    village: '',
    district: '',
    state: '',
    pincode: ''
  });
  const [buyerMessage, setBuyerMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await marketplaceService.getProductById(id);
        if (data.success && data.product) {
          setProduct(data.product);
          // Pre-fill initial offer price with product list price
          setInitialOfferPrice(data.product.pricePerUnit || '');
        } else {
          setError('Product listing not found');
        }
      } catch (err) {
        console.error('Failed to fetch product details:', err);
        setError(err.response?.data?.message || 'Unable to load product listing.');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  // Pre-fill delivery location from authenticated user profile
  useEffect(() => {
    if (user) {
      setDeliveryLocation({
        address: user.address || '',
        village: user.village || '',
        district: user.district || '',
        state: user.state || '',
        pincode: ''
      });
    }
  }, [user]);

  const handleQuantityChange = (val) => {
    setRequestedQuantity(val);
    setSubmitError('');
  };

  const handlePriceChange = (val) => {
    setInitialOfferPrice(val);
    setSubmitError('');
  };

  const estimatedTotal =
    Number(requestedQuantity) > 0 && Number(initialOfferPrice) > 0
      ? Math.round(Number(requestedQuantity) * Number(initialOfferPrice) * 100) / 100
      : 0;

  const handleSubmitOffer = async (e) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess('');

    if (!user) {
      navigate('/login?redirect=' + encodeURIComponent(`/marketplace/${id}`));
      return;
    }

    if (user.role !== 'buyer') {
      setSubmitError('Only registered buyers can place purchase requests and negotiate prices.');
      return;
    }

    const qty = Number(requestedQuantity);
    const price = Number(initialOfferPrice);

    if (isNaN(qty) || qty <= 0) {
      setSubmitError('Please enter a valid requested quantity greater than 0.');
      return;
    }

    if (qty > product.quantity) {
      setSubmitError(`Requested quantity (${qty} ${product.unit}) exceeds available stock (${product.quantity} ${product.unit}).`);
      return;
    }

    if (isNaN(price) || price <= 0) {
      setSubmitError('Please enter a valid offer price per unit greater than 0.');
      return;
    }

    if (!deliveryLocation.address.trim() || !deliveryLocation.district.trim() || !deliveryLocation.state.trim()) {
      setSubmitError('Please provide a complete delivery address, district, and state.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await orderService.createOrder({
        productId: product._id,
        requestedQuantity: qty,
        initialOfferPrice: price,
        deliveryLocation,
        buyerMessage
      });

      if (res.success && res.order) {
        setSubmitSuccess('Purchase request submitted successfully! Redirecting to negotiation thread...');
        setTimeout(() => {
          navigate(`/dashboard/buyer/orders/${res.order._id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Failed to submit purchase request:', err);
      const msg = err.response?.data?.message || 'Failed to submit purchase request. Please try again.';
      setSubmitError(msg);
      if (err.response?.data?.existingOrderId) {
        setTimeout(() => {
          navigate(`/dashboard/buyer/orders/${err.response.data.existingOrderId}`);
        }, 2000);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-4/3 bg-slate-200 rounded-3xl" />
            <div className="space-y-4">
              <div className="h-10 bg-slate-200 rounded-xl w-3/4" />
              <div className="h-6 bg-slate-200 rounded-md w-1/2" />
              <div className="h-32 bg-slate-100 rounded-2xl" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center">
        <div className="p-4 rounded-full bg-rose-50 text-rose-600 w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Produce Listing Unavailable</h2>
        <p className="text-sm text-slate-500 mb-6">{error || 'This listing might have been removed or sold out.'}</p>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Marketplace
        </Link>
      </div>
    );
  }

  const farmer = product.farmerId || {};
  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800'
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      {/* Back button */}
      <div>
        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Produce Marketplace
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Image Gallery + Crop Details + Farmer Provenance (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Gallery Display */}
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs p-4">
            <div className="relative aspect-16/10 rounded-2xl overflow-hidden bg-slate-100">
              <img
                src={images[activeImageIndex]}
                alt={product.cropName}
                className="w-full h-full object-cover transition-all duration-300"
                onError={(e) => {
                  e.target.src =
                    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800';
                }}
              />
              <span className="absolute top-3 left-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white shadow-sm">
                <Award className="w-3.5 h-3.5" />
                {product.qualityGrade}
              </span>
            </div>

            {/* Thumbnail selector */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all ${
                      activeImageIndex === idx ? 'border-emerald-600 ring-2 ring-emerald-200' : 'border-slate-200 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detailed Crop Specs */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-100">
                  {product.category}
                </span>
                <span className="text-xs text-slate-500 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  Harvested: {formatDate(product.harvestDate)}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                {product.cropName}
              </h1>
            </div>

            {/* Specs Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Available Quantity</span>
                <span className="text-sm font-bold text-slate-800">
                  {product.quantity} {product.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Baseline Asking Price</span>
                <span className="text-sm font-bold text-emerald-700">
                  {formatCurrency(product.pricePerUnit)} / {product.unit}
                </span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Pickup Hub</span>
                <span className="text-sm font-semibold text-slate-800 truncate block">
                  {product.pickupLocation}
                </span>
              </div>
            </div>

            {/* Description */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-2">Harvest & Quality Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Farm Origin & Location */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-emerald-600" />
                Farm Provenance & Mandi Location
              </h3>
              <p className="text-xs text-slate-600">
                {product.pickupLocation}, {product.village ? `${product.village}, ` : ''}{product.district}, {product.state}
              </p>
            </div>
          </div>

          {/* Farmer Profile Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {farmer.profileImage ? (
                <img
                  src={farmer.profileImage}
                  alt={farmer.fullName}
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-400"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-lg">
                  {farmer.fullName ? farmer.fullName.charAt(0) : 'F'}
                </div>
              )}
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-bold text-slate-900">{farmer.fullName || 'Verified Farmer'}</h4>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <p className="text-xs text-slate-500">
                  {farmer.farmerDetails?.farmName || 'Verified Agricultural Producer'} • {farmer.district}, {farmer.state}
                </p>
                {farmer.farmerDetails?.farmingExperience && (
                  <p className="text-[11px] text-emerald-700 font-medium">
                    {farmer.farmerDetails.farmingExperience} years farming experience
                  </p>
                )}
              </div>
            </div>

            <div className="text-right text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-1.5 text-slate-600">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{farmer.phone || 'Direct via platform'}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-600">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{farmer.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Interactive Purchase Request & Negotiation Form (5 cols) */}
        <div className="lg:col-span-5 sticky top-24 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg p-6 sm:p-7">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
              <div>
                <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
                  Wholesale Procurement
                </span>
                <h2 className="text-xl font-bold text-slate-900">Submit Purchase Request</h2>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Current Asking</span>
                <span className="text-lg font-extrabold text-emerald-700">
                  {formatCurrency(product.pricePerUnit)}
                  <span className="text-xs font-medium text-slate-500">/{product.unit}</span>
                </span>
              </div>
            </div>

            {/* Role Guard Info if not logged in as buyer */}
            {user && user.role !== 'buyer' && (
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5 mb-5">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  You are currently logged in as a <strong>{user.role}</strong>. Only buyers can submit purchase offers and negotiate contracts.
                </span>
              </div>
            )}

            {submitError && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 mb-5">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>{submitError}</span>
              </div>
            )}

            {submitSuccess && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5 mb-5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{submitSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSubmitOffer} className="space-y-4">
              {/* Requested Quantity */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-slate-800">
                    Required Quantity ({product.unit}) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-slate-400 font-medium">
                    Stock: {product.quantity} {product.unit}
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    max={product.quantity}
                    step="any"
                    value={requestedQuantity}
                    onChange={(e) => handleQuantityChange(e.target.value)}
                    placeholder={`e.g. 20 (${product.unit})`}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {product.unit}
                  </span>
                </div>
              </div>

              {/* Offer Price / Unit */}
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <label className="font-bold text-slate-800">
                    Your Offer Price / {product.unit} (₹) <span className="text-rose-500">*</span>
                  </label>
                  <span className="text-emerald-700 font-medium text-[11px]">
                    Asking: {formatCurrency(product.pricePerUnit)}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                    ₹
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={initialOfferPrice}
                    onChange={(e) => handlePriceChange(e.target.value)}
                    placeholder="Enter your proposed rate"
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-emerald-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    required
                  />
                </div>
              </div>

              {/* Delivery Location Section */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <span className="text-xs font-bold text-slate-800 block">
                  Delivery Destination <span className="text-rose-500">*</span>
                </span>

                <div>
                  <input
                    type="text"
                    value={deliveryLocation.address}
                    onChange={(e) =>
                      setDeliveryLocation({ ...deliveryLocation, address: e.target.value })
                    }
                    placeholder="Warehouse / Mandi street address *"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={deliveryLocation.district}
                    onChange={(e) =>
                      setDeliveryLocation({ ...deliveryLocation, district: e.target.value })
                    }
                    placeholder="District *"
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-emerald-500"
                    required
                  />
                  <select
                    value={deliveryLocation.state}
                    onChange={(e) =>
                      setDeliveryLocation({ ...deliveryLocation, state: e.target.value })
                    }
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-emerald-500"
                    required
                  >
                    <option value="">Select State *</option>
                    {INDIAN_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Optional Message */}
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  Message to Farmer (Optional)
                </label>
                <textarea
                  rows="2"
                  value={buyerMessage}
                  onChange={(e) => setBuyerMessage(e.target.value)}
                  placeholder="e.g. Need immediate pickup, warehouse inspection details, or packaging requirements..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-emerald-500"
                />
              </div>

              {/* Total Calculation Card */}
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-100 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                    Estimated Order Value
                  </span>
                  <span className="text-xs text-slate-600">
                    {requestedQuantity || 0} {product.unit} × {formatCurrency(initialOfferPrice || 0)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-extrabold text-emerald-800">
                    {formatCurrency(estimatedTotal)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={submitting || (user && user.role !== 'buyer')}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Submitting Offer...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Purchase Request & Start Negotiation</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center text-slate-400">
                Submitting a request initiates a structured negotiation. You can counter or agree on terms before locking the order contract.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
