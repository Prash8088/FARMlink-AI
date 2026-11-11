import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Lock,
  ArrowRight,
  RotateCcw,
  Store,
  AlertCircle,
  FileText,
  User,
  ShieldCheck,
  TrendingUp,
  MapPin
} from 'lucide-react';

export const BuyerOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    pendingCount: 0,
    negotiatingCount: 0,
    acceptedCount: 0,
    confirmedCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await orderService.getBuyerOrders({
        status: activeTab === 'ALL' ? undefined : activeTab
      });
      if (data.success) {
        setOrders(data.orders || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to fetch buyer orders:', err);
      setError(err.response?.data?.message || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [activeTab]);

  const tabs = [
    { key: 'ALL', label: 'All Orders', count: summary.totalOrders },
    { key: 'NEGOTIATING', label: 'Negotiations', count: summary.negotiatingCount + summary.pendingCount + summary.acceptedCount },
    { key: 'CONFIRMED', label: 'Confirmed', count: summary.confirmedCount },
    { key: 'COMPLETED', label: 'Completed', count: summary.completedCount },
    { key: 'CANCELLED', label: 'Cancelled', count: summary.cancelledCount }
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider block">
            Procurement Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Purchase Orders & Negotiations
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track wholesale crop bids, active farmer negotiations, and confirmed procurement contracts.
          </p>
        </div>

        <Link
          to="/marketplace"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-sm hover:shadow-md transition-all self-start sm:self-auto"
        >
          <Store className="w-4 h-4" />
          <span>Browse Produce Marketplace</span>
        </Link>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Requests</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">{summary.totalOrders}</p>
          <span className="text-[11px] text-slate-400">All procurement requests</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">In Negotiation</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-amber-700 mt-2">
            {summary.pendingCount + summary.negotiatingCount + summary.acceptedCount}
          </p>
          <span className="text-[11px] text-slate-400">
            {summary.acceptedCount} ready for confirmation
          </span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Confirmed Orders</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Lock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">{summary.confirmedCount}</p>
          <span className="text-[11px] text-slate-400">Stock reserved & in fulfillment</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Total Spend</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-purple-900 mt-2">
            {formatCurrency(summary.totalSpent)}
          </p>
          <span className="text-[11px] text-slate-400">Confirmed & completed contracts</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto scrollbar-none">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.key
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full ${
                activeTab === tab.key ? 'bg-slate-800 text-slate-200' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-28 bg-white rounded-3xl border border-slate-200 p-5 animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3">
            <ShoppingBag className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-1">No orders found in this category</h3>
          <p className="text-xs text-slate-500 mb-5">
            You don't have any purchase requests with this status. Start by exploring our fresh crop listings.
          </p>
          <Link
            to="/marketplace"
            className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition-colors shadow-sm"
          >
            Explore Agricultural Produce
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const product = order.productId || {};
            const farmer = order.farmerId || {};
            const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
              label: order.status,
              badge: 'bg-slate-100 text-slate-700'
            };

            const isReadyToConfirm = order.status === 'ACCEPTED';

            return (
              <div
                key={order._id}
                className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-5 group"
              >
                <div className="flex items-start gap-4 min-w-0">
                  <img
                    src={
                      product.images?.[0] ||
                      'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800'
                    }
                    alt={product.cropName || 'Crop'}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0 border border-slate-100"
                  />

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[11px] font-mono font-bold text-slate-400">
                        {order.orderNumber}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.badge}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot || 'bg-slate-500'}`} />
                        {statusConfig.label}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        Placed on {formatDate(order.createdAt)}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors truncate">
                      {product.cropName || 'Agricultural Crop'}
                    </h3>

                    <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                      <span className="font-semibold text-slate-700">{farmer.fullName || 'Farmer'}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        {farmer.district}, {farmer.state}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right specs & CTA */}
                <div className="flex items-center justify-between md:justify-end gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                      Contract Value
                    </span>
                    <span className="text-lg font-extrabold text-emerald-700">
                      {formatCurrency(
                        order.totalAmount ||
                          (order.agreedPrice || order.initialOfferPrice) *
                            (order.agreedQuantity || order.requestedQuantity)
                      )}
                    </span>
                    <span className="text-xs text-slate-500 block">
                      {order.agreedQuantity || order.requestedQuantity} {order.unit} @{' '}
                      {formatCurrency(order.agreedPrice || order.initialOfferPrice)}/{order.unit}
                    </span>
                  </div>

                  <Link
                    to={`/dashboard/buyer/orders/${order._id}`}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-xs shrink-0 ${
                      isReadyToConfirm
                        ? 'bg-indigo-600 hover:bg-indigo-700 text-white animate-pulse'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    }`}
                  >
                    <span>{isReadyToConfirm ? 'Confirm Order' : 'View Negotiation'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
