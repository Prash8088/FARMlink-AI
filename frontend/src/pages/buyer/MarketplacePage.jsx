import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { marketplaceService } from '../../services/marketplaceService';
import { MarketplaceProductCard } from '../../components/marketplace/MarketplaceProductCard';
import { PRODUCT_CATEGORIES, QUALITY_GRADES, INDIAN_STATES } from '../../utils/constants';
import {
  Search,
  Filter,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Store,
  Layers,
  MapPin,
  TrendingDown,
  TrendingUp,
  Clock,
  Sparkles,
  AlertCircle
} from 'lucide-react';

export const MarketplacePage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, currentPage: 1, count: 0 });

  // Filters state
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(searchParams.get('category') || 'All');
  const [state, setState] = useState(searchParams.get('state') || '');
  const [district, setDistrict] = useState(searchParams.get('district') || '');
  const [qualityGrade, setQualityGrade] = useState(searchParams.get('qualityGrade') || 'All');
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '');
  const [minQuantity, setMinQuantity] = useState(searchParams.get('minQuantity') || '');
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'newest');
  const [page, setPage] = useState(parseInt(searchParams.get('page'), 10) || 1);

  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const params = {
        page,
        limit: 12,
        sortBy
      };

      if (searchTerm.trim()) params.search = searchTerm.trim();
      if (category && category !== 'All') params.category = category;
      if (state.trim()) params.state = state.trim();
      if (district.trim()) params.district = district.trim();
      if (qualityGrade && qualityGrade !== 'All') params.qualityGrade = qualityGrade;
      if (minPrice !== '') params.minPrice = minPrice;
      if (maxPrice !== '') params.maxPrice = maxPrice;
      if (minQuantity !== '') params.minQuantity = minQuantity;

      const data = await marketplaceService.getProducts(params);
      if (data.success) {
        setProducts(data.products || []);
        setMeta({
          total: data.total,
          totalPages: data.totalPages,
          currentPage: data.currentPage,
          count: data.count
        });
      }
    } catch (err) {
      console.error('Failed to load marketplace products:', err);
      setError(err.response?.data?.message || 'Unable to connect to marketplace listings. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [page, sortBy, category, state, district, qualityGrade, minPrice, maxPrice, minQuantity, searchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Synchronize URL query params
  const updateUrlParams = (newParams) => {
    const updated = new URLSearchParams(searchParams);
    Object.entries(newParams).forEach(([k, v]) => {
      if (v === '' || v === 'All' || v === null || v === undefined) {
        updated.delete(k);
      } else {
        updated.set(k, v);
      }
    });
    setSearchParams(updated);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    updateUrlParams({ search: searchTerm, page: 1 });
  };

  const handleCategoryClick = (cat) => {
    setCategory(cat);
    setPage(1);
    updateUrlParams({ category: cat, page: 1 });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    setCategory('All');
    setState('');
    setDistrict('');
    setQualityGrade('All');
    setMinPrice('');
    setMaxPrice('');
    setMinQuantity('');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  const hasActiveFilters =
    searchTerm ||
    category !== 'All' ||
    state ||
    district ||
    qualityGrade !== 'All' ||
    minPrice ||
    maxPrice ||
    minQuantity ||
    sortBy !== 'newest';

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Top Banner / Marketplace Header */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-900 via-teal-800 to-slate-900 text-white p-8 sm:p-10 shadow-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.15),transparent_50%)]" />
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold backdrop-blur-sm border border-emerald-500/30 mb-4">
            <Store className="w-3.5 h-3.5" />
            Direct Farmer Sourcing
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Direct Agricultural Produce Marketplace
          </h1>
          <p className="mt-3 text-slate-300 text-base sm:text-lg">
            Discover verified crop harvests directly from local farmers. Negotiate wholesale rates, review quality grades, and secure contracts transparently.
          </p>

          {/* Search bar inside banner */}
          <form onSubmit={handleSearchSubmit} className="mt-6 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search crops (e.g. Sharbati Wheat, Onions, Soyabean, Nashik)..."
                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-white text-slate-900 placeholder:text-slate-400 text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-400 shadow-md"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              Find Harvests
            </button>
          </form>
        </div>
      </div>

      {/* Category Pills Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleCategoryClick('All')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold shrink-0 transition-all ${
            category === 'All'
              ? 'bg-emerald-700 text-white shadow-sm'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          All Categories
        </button>
        {PRODUCT_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-4 py-2 rounded-2xl text-xs font-semibold shrink-0 transition-all ${
              category === cat
                ? 'bg-emerald-700 text-white shadow-sm'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Controls Bar: Sort, Filter Trigger, Results Count */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-semibold text-slate-800">
            {loading ? 'Searching produce...' : `${meta.total} verified lots available`}
          </span>
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
          {/* Sorting */}
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
                updateUrlParams({ sortBy: e.target.value, page: 1 });
              }}
              className="bg-slate-50 border border-slate-200 text-slate-800 text-xs font-medium rounded-xl px-3 py-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="newest">Newest Listings</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="quantity_desc">Largest Stock</option>
            </select>
          </div>

          {/* Toggle Filter Drawer on Mobile / Expand Inline */}
          <button
            onClick={() => setFilterDrawerOpen(!filterDrawerOpen)}
            className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
              filterDrawerOpen
                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            Detailed Filters
          </button>
        </div>
      </div>

      {/* Expanded Filter Panel */}
      {filterDrawerOpen && (
        <div className="bg-slate-50/90 rounded-3xl border border-slate-200 p-6 transition-all duration-300">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* State Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">State</label>
              <select
                value={state}
                onChange={(e) => {
                  setState(e.target.value);
                  setPage(1);
                  updateUrlParams({ state: e.target.value, page: 1 });
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-emerald-500"
              >
                <option value="">All States</option>
                {INDIAN_STATES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">District</label>
              <input
                type="text"
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                onBlur={() => {
                  setPage(1);
                  updateUrlParams({ district, page: 1 });
                }}
                placeholder="e.g. Nashik, Sehore, Indore"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-emerald-500"
              />
            </div>

            {/* Quality Grade Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Quality Grade</label>
              <select
                value={qualityGrade}
                onChange={(e) => {
                  setQualityGrade(e.target.value);
                  setPage(1);
                  updateUrlParams({ qualityGrade: e.target.value, page: 1 });
                }}
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-emerald-500"
              >
                <option value="All">All Quality Grades</option>
                {QUALITY_GRADES.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Min Quantity Filter */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Min. Available Stock</label>
              <input
                type="number"
                value={minQuantity}
                onChange={(e) => setMinQuantity(e.target.value)}
                onBlur={() => {
                  setPage(1);
                  updateUrlParams({ minQuantity, page: 1 });
                }}
                placeholder="e.g. 20 (units)"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-emerald-500"
              />
            </div>

            {/* Min Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Min Price (₹)</label>
              <input
                type="number"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                onBlur={() => {
                  setPage(1);
                  updateUrlParams({ minPrice, page: 1 });
                }}
                placeholder="0"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-emerald-500"
              />
            </div>

            {/* Max Price */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">Max Price (₹)</label>
              <input
                type="number"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                onBlur={() => {
                  setPage(1);
                  updateUrlParams({ maxPrice, page: 1 });
                }}
                placeholder="e.g. 5000"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center gap-3 text-rose-800 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl border border-slate-200 overflow-hidden animate-pulse">
              <div className="aspect-16/10 bg-slate-200" />
              <div className="p-5 space-y-3">
                <div className="h-5 bg-slate-200 rounded-md w-3/4" />
                <div className="h-10 bg-slate-100 rounded-xl" />
                <div className="h-12 bg-slate-100 rounded-xl" />
                <div className="h-10 bg-slate-200 rounded-2xl" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Store className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">No agricultural listings found</h3>
          <p className="text-sm text-slate-500 mb-6">
            We couldn't find any active crop listings matching your search or filters. Try adjusting your parameters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Clear All Filters
          </button>
        </div>
      ) : (
        /* Products Grid */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <MarketplaceProductCard key={product._id} product={product} />
          ))}
        </div>
      )}

      {/* Pagination Bar */}
      {!loading && meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={page <= 1}
            onClick={() => {
              setPage((p) => Math.max(1, p - 1));
              updateUrlParams({ page: page - 1 });
            }}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-slate-700 px-4">
            Page {meta.currentPage} of {meta.totalPages}
          </span>

          <button
            disabled={page >= meta.totalPages}
            onClick={() => {
              setPage((p) => Math.min(meta.totalPages, p + 1));
              updateUrlParams({ page: page + 1 });
            }}
            className="p-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
