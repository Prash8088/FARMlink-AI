import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { productService } from '../../services/productService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { Alert } from '../../components/common/Alert';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Layers,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  Eye,
  ShieldCheck,
  User,
  Phone,
  Mail,
  Sprout,
  Share2,
  Sliders,
  Sparkles
} from 'lucide-react';

export const ProductDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Quick stock modal
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockInput, setStockInput] = useState('');
  const [updatingStock, setUpdatingStock] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await productService.getProductById(id);
        if (res.success && res.data) {
          setProduct(res.data);
          setStockInput(res.data.quantity);
        }
      } catch (err) {
        setAlert({
          type: 'error',
          message: err.response?.data?.message || 'Failed to retrieve product details.'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    const qty = Number(stockInput);
    if (isNaN(qty) || qty < 0) {
      setAlert({ type: 'error', message: 'Enter a valid non-negative quantity.' });
      return;
    }

    try {
      setUpdatingStock(true);
      const res = await productService.updateStock(product._id, qty);
      if (res.success && res.data) {
        setProduct((prev) => ({ ...prev, quantity: res.data.quantity, status: res.data.status }));
        setShowStockModal(false);
        setAlert({ type: 'success', message: 'Stock updated successfully.' });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update stock.'
      });
    } finally {
      setUpdatingStock(false);
    }
  };

  const handleToggleStatus = async () => {
    const nextStatus = product.status === 'available' ? 'unavailable' : 'available';
    try {
      const res = await productService.updateStatus(product._id, nextStatus);
      if (res.success && res.data) {
        setProduct((prev) => ({ ...prev, status: res.data.status }));
        setAlert({
          type: 'success',
          message: `Product status changed to "${res.data.status}".`
        });
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to toggle status.'
      });
    }
  };

  if (loading) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs font-medium text-slate-500">Loading product inspection view...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="py-16 text-center max-w-md mx-auto space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Product Not Found</h2>
        <p className="text-xs text-slate-500">The crop listing does not exist or may have been removed.</p>
        <Link
          to="/dashboard/farmer/products"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Listings
        </Link>
      </div>
    );
  }

  const isFarmerOwner =
    user && (user._id === product.farmerId?._id || user._id === product.farmerId);
  const images = product.images && product.images.length > 0 ? product.images : [
    'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800'
  ];
  const activeImage = images[selectedImageIndex] || images[0];
  const totalLotValue = (product.quantity || 0) * (product.pricePerUnit || 0);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-12">
      {/* Top Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Listings</span>
        </button>

        {isFarmerOwner && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowStockModal(true)}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-700 hover:text-emerald-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Update Stock</span>
            </button>

            <button
              onClick={handleToggleStatus}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${
                product.status === 'available'
                  ? 'border-amber-200 bg-amber-50 text-amber-800 hover:bg-amber-100'
                  : 'border-emerald-200 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
              }`}
            >
              {product.status === 'available' ? 'Mark Unavailable' : 'Mark Available'}
            </button>

            <Link
              to={`/dashboard/farmer/products/${product._id}/edit`}
              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Listing</span>
            </Link>
          </div>
        )}
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Main Two-Column Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left: Image Gallery */}
        <div className="space-y-4">
          <div className="aspect-4/3 rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-sm relative">
            <img
              src={activeImage}
              alt={product.cropName}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src =
                  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800';
              }}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-white/95 text-slate-800 shadow-sm backdrop-blur-xs">
                {product.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-amber-500 text-slate-950 shadow-sm">
                {product.qualityGrade}
              </span>
            </div>
            <div className="absolute bottom-4 right-4 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2.5 py-1 rounded-xl flex items-center gap-1">
              <Eye className="w-3.5 h-3.5" />
              <span>{product.viewsCount || 0} views</span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-2">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-18 h-18 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImageIndex === idx
                      ? 'border-emerald-600 scale-105 shadow-md'
                      : 'border-slate-200 hover:border-slate-400 opacity-80'
                  }`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Pricing, Specs & Farm Provenance */}
        <div className="space-y-6">
          {/* Title & Status */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              {product.status === 'available' ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Available for Commercial Procurement
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <XCircle className="w-3.5 h-3.5 text-amber-500" />
                  Currently Paused / Reserved
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
              {product.cropName}
            </h1>
            <p className="mt-1 text-xs text-slate-500">
              Harvest Batch Date: {formatDate(product.harvestDate)}
            </p>
          </div>

          {/* Price & Value Banner */}
          <div className="p-6 rounded-3xl bg-slate-900 text-white shadow-md flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">
                Farmer Direct Rate
              </p>
              <p className="text-3xl font-black text-white mt-1">
                {formatCurrency(product.pricePerUnit)}
                <span className="text-sm font-normal text-slate-300"> / {product.unit}</span>
              </p>
            </div>
            <div className="text-right border-l border-slate-800 pl-6">
              <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">
                Total Lot Value
              </p>
              <p className="text-xl font-extrabold text-emerald-400 font-mono mt-1">
                {formatCurrency(totalLotValue)}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {product.quantity} {product.unit} available
              </p>
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-2">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Harvest Description & Quality Specs
            </h3>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
              {product.description}
            </p>
          </div>

          {/* Farm Provenance & Pickup Location */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sprout className="w-4 h-4 text-emerald-600" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Farm Origin & Pickup Coordinates
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Farmer Name</span>
                <p className="font-bold text-slate-900">
                  {product.farmerId?.fullName || 'Verified Farmer'}
                </p>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Farm Location</span>
                <p className="font-semibold text-slate-800">
                  {product.village ? `${product.village}, ` : ''}{product.district}, {product.state}
                </p>
              </div>

              <div className="sm:col-span-2 p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block mb-0.5 font-medium">Farm Gate Landmark</span>
                  <p className="font-bold text-slate-900">{product.pickupLocation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stock Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="text-sm font-bold text-slate-900">Update Stock Quantity</h3>
            <form onSubmit={handleUpdateStock} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Available Quantity ({product.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={stockInput}
                  onChange={(e) => setStockInput(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updatingStock}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold"
                >
                  {updatingStock ? 'Saving...' : 'Save Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
