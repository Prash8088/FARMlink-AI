import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { productService } from '../../services/productService';
import { ProductCard } from '../../components/common/ProductCard';
import { StatCard } from '../../components/common/StatCard';
import { Alert } from '../../components/common/Alert';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import {
  Package,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Sliders,
  TrendingUp,
  X,
  AlertTriangle
} from 'lucide-react';

export const FarmerProductsPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [summary, setSummary] = useState({ totalListings: 0, available: 0, unavailable: 0 });
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [stockModalProduct, setStockModalProduct] = useState(null);
  const [newStockQuantity, setNewStockQuantity] = useState('');
  const [stockUpdating, setStockUpdating] = useState(false);

  const [deleteModalProduct, setDeleteModalProduct] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await productService.getMyProducts({
        search,
        category,
        status,
        sortBy,
        sortOrder,
        page: currentPage,
        limit: 12
      });

      if (res.success && res.data) {
        setProducts(res.data.products);
        setSummary(res.data.summary);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to fetch your product listings'
      });
    } finally {
      setLoading(false);
    }
  }, [search, category, status, sortBy, sortOrder, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handle Quick Stock Update
  const handleOpenStockModal = (product) => {
    setStockModalProduct(product);
    setNewStockQuantity(product.quantity);
  };

  const handleSaveStock = async (e) => {
    e.preventDefault();
    if (!stockModalProduct) return;
    const qty = Number(newStockQuantity);
    if (isNaN(qty) || qty < 0) {
      setAlert({ type: 'error', message: 'Please enter a valid stock quantity (0 or greater).' });
      return;
    }

    try {
      setStockUpdating(true);
      const res = await productService.updateStock(stockModalProduct._id, qty);
      if (res.success) {
        setAlert({ type: 'success', message: res.message || 'Stock updated successfully.' });
        setStockModalProduct(null);
        fetchProducts();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update stock.'
      });
    } finally {
      setStockUpdating(false);
    }
  };

  // Handle Status Toggle (Available / Unavailable)
  const handleToggleStatus = async (product) => {
    const nextStatus = product.status === 'available' ? 'unavailable' : 'available';
    try {
      const res = await productService.updateStatus(product._id, nextStatus);
      if (res.success) {
        setAlert({
          type: 'success',
          message: `Listing for "${product.cropName}" marked as ${nextStatus}.`
        });
        fetchProducts();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to update product status.'
      });
    }
  };

  // Handle Delete Listing
  const handleConfirmDelete = async () => {
    if (!deleteModalProduct) return;
    try {
      setDeleting(true);
      const res = await productService.deleteProduct(deleteModalProduct._id);
      if (res.success) {
        setAlert({
          type: 'success',
          message: res.message || `Listing "${deleteModalProduct.cropName}" was deleted.`
        });
        setDeleteModalProduct(null);
        fetchProducts();
      }
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to delete listing.'
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
              Marketplace Operations
            </span>
            <span className="text-xs text-slate-300">/</span>
            <span className="text-xs text-slate-500 font-medium">Version 2 Active</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            My Produce Listings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Publish harvest batches, manage stock, and maintain direct transparent pricing for buyers.
          </p>
        </div>

        <Link
          to="/dashboard/farmer/products/new"
          className="inline-flex items-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-emerald-600/20 hover:shadow-lg self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Publish New Crop Listing</span>
        </Link>
      </div>

      {alert && (
        <Alert
          type={alert.type}
          message={alert.message}
          onClose={() => setAlert(null)}
        />
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-5">
        <StatCard
          title="Total Crops Listed"
          value={summary.totalListings}
          subtext="Active in your farm catalogue"
          icon={Package}
          color="emerald"
          badgeText="Catalog"
        />
        <StatCard
          title="Active in Marketplace"
          value={summary.available}
          subtext="Discoverable by bulk buyers"
          icon={CheckCircle2}
          color="blue"
          badgeText="Live"
        />
        <StatCard
          title="Unavailable / Reserved"
          value={summary.unavailable}
          subtext="Out of stock or paused"
          icon={XCircle}
          color="amber"
          badgeText="Paused"
        />
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200/90 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          {/* Keyword Search */}
          <div className="lg:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by crop name or keyword..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="available">Available Only</option>
              <option value="unavailable">Unavailable Only</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [sb, so] = e.target.value.split('-');
                setSortBy(sb);
                setSortOrder(so);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="createdAt-desc">Newest First</option>
              <option value="createdAt-asc">Oldest First</option>
              <option value="pricePerUnit-asc">Price: Low to High</option>
              <option value="pricePerUnit-desc">Price: High to Low</option>
              <option value="quantity-desc">Highest Quantity</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Listings Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-medium text-slate-500">Retrieving your farm listings...</p>
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              isOwner={true}
              onQuickStock={handleOpenStockModal}
              onToggleStatus={handleToggleStatus}
              onDelete={setDeleteModalProduct}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 max-w-xl mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No Crop Listings Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            {search || category || status
              ? 'No products match your active search and filter criteria. Try clearing some filters.'
              : 'You haven\'t published any crop listings yet. Add your harvested produce to reach wholesale buyers across India directly.'}
          </p>
          <div className="pt-2">
            {search || category || status ? (
              <button
                onClick={() => {
                  setSearch('');
                  setCategory('');
                  setStatus('');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
              >
                Clear Filters
              </button>
            ) : (
              <Link
                to="/dashboard/farmer/products/new"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Publish First Crop Listing</span>
              </Link>
            )}
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} Total Listings)
          </span>
          <div className="flex gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={currentPage >= pagination.totalPages}
              onClick={() => setCurrentPage((p) => Math.min(pagination.totalPages, p + 1))}
              className="px-3.5 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Quick Stock Modal */}
      {stockModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-slate-900">Update Stock Quantity</h3>
              </div>
              <button
                onClick={() => setStockModalProduct(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStock} className="space-y-4">
              <div>
                <p className="text-xs font-semibold text-slate-800">{stockModalProduct.cropName}</p>
                <p className="text-[11px] text-slate-400">
                  Current: {stockModalProduct.quantity} {stockModalProduct.unit}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Available Quantity ({stockModalProduct.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  value={newStockQuantity}
                  onChange={(e) => setNewStockQuantity(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Setting quantity to 0 will automatically mark the product as unavailable.
                </p>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setStockModalProduct(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={stockUpdating}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors disabled:opacity-60"
                >
                  {stockUpdating ? 'Saving...' : 'Update Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Delete Product Listing?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to permanently remove{' '}
                <strong className="text-slate-800 font-semibold">"{deleteModalProduct.cropName}"</strong>?
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalProduct(null)}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-60"
              >
                {deleting ? 'Deleting...' : 'Yes, Delete Listing'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
