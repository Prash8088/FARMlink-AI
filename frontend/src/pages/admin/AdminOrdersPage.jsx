import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';
import {
  FileText,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  Lock,
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Eye,
  ShieldAlert
} from 'lucide-react';

export const AdminOrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    pendingCount: 0,
    negotiatingCount: 0,
    acceptedCount: 0,
    confirmedCount: 0,
    completedCount: 0,
    cancelledCount: 0,
    grossMarketplaceVolume: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await orderService.getAdminOrders({
        status: statusFilter === 'ALL' ? undefined : statusFilter,
        search: search.trim() || undefined
      });
      if (data.success) {
        setOrders(data.orders || []);
        if (data.summary) setSummary(data.summary);
      }
    } catch (err) {
      console.error('Failed to load admin orders:', err);
      setError(err.response?.data?.message || 'Unable to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchOrders();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div>
        <span className="text-xs font-bold text-purple-600 uppercase tracking-wider block">
          Platform Governance
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Marketplace Orders & Contracts Audit
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Monitor all farmer-to-buyer transactions, negotiations, and locked contracts platform-wide.
        </p>
      </div>

      {/* Telemetry Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Total Orders</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">{summary.totalOrders}</p>
          <span className="text-[11px] text-slate-400">Negotiations & contracts</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Confirmed Contracts</span>
          <p className="text-2xl font-extrabold text-emerald-700 mt-1">{summary.confirmedCount}</p>
          <span className="text-[11px] text-slate-400">Stock reserved</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Completed</span>
          <p className="text-2xl font-extrabold text-green-700 mt-1">{summary.completedCount}</p>
          <span className="text-[11px] text-slate-400">Successfully delivered</span>
        </div>

        <div className="p-4 bg-white rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-xs font-bold text-slate-500 block">Gross Volume</span>
          <p className="text-2xl font-extrabold text-purple-900 mt-1">
            {formatCurrency(summary.grossMarketplaceVolume)}
          </p>
          <span className="text-[11px] text-slate-400">Confirmed transaction value</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by order number (e.g. ORD-)..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-purple-500 focus:outline-hidden"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Filter Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800"
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="NEGOTIATING">Negotiating</option>
            <option value="ACCEPTED">Terms Agreed</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Orders Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Order ID & Date</th>
                <th className="py-3.5 px-4">Produce</th>
                <th className="py-3.5 px-4">Farmer</th>
                <th className="py-3.5 px-4">Buyer</th>
                <th className="py-3.5 px-4">Contract Terms</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    Loading platform orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-slate-400">
                    No orders match your filter criteria.
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
                    label: order.status,
                    badge: 'bg-slate-100 text-slate-700'
                  };

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-4 font-mono font-bold text-slate-800">
                        {order.orderNumber}
                        <span className="block text-[11px] font-sans font-normal text-slate-400">
                          {formatDate(order.createdAt)}
                        </span>
                      </td>
                      <td className="py-4 px-4 font-bold text-slate-900">
                        {order.productId?.cropName || 'Produce Lot'}
                        <span className="block text-[11px] font-normal text-slate-500">
                          {order.productId?.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {order.farmerId?.fullName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {order.farmerId?.district}, {order.farmerId?.state}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-slate-800 block">
                          {order.buyerId?.fullName}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {order.buyerId?.district}, {order.buyerId?.state}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-extrabold text-emerald-700 block">
                          {formatCurrency(
                            order.totalAmount ||
                              (order.agreedPrice || order.initialOfferPrice) *
                                (order.agreedQuantity || order.requestedQuantity)
                          )}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {order.agreedQuantity || order.requestedQuantity} {order.unit} @{' '}
                          {formatCurrency(order.agreedPrice || order.initialOfferPrice)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${statusConfig.badge}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dot || 'bg-slate-500'}`} />
                          {statusConfig.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link
                          to={`/dashboard/admin/orders/${order._id}`}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Audit</span>
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
