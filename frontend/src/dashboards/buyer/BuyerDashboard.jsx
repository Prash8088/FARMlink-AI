import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { StatCard } from '../../components/common/StatCard';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';
import { orderService } from '../../services/orderService';
import {
  Building2,
  ShoppingBag,
  Clock,
  CheckCircle,
  Truck,
  Edit,
  UserCheck,
  Search,
  FileText,
  ShieldCheck,
  Sparkles,
  Store,
  ArrowRight,
  TrendingUp,
  MapPin,
  Lock
} from 'lucide-react';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [summary, setSummary] = useState({
    totalOrders: 0,
    pendingCount: 0,
    negotiatingCount: 0,
    acceptedCount: 0,
    confirmedCount: 0,
    completedCount: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBuyerData = async () => {
      try {
        setLoading(true);
        const data = await orderService.getBuyerOrders({ limit: 5 });
        if (data.success) {
          setOrders(data.orders || []);
          if (data.summary) setSummary(data.summary);
        }
      } catch (err) {
        console.error('Failed to load buyer dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBuyerData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/60 text-blue-200 border border-blue-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Building2 className="w-3.5 h-3.5 text-blue-300" />
            <span>Agri Procurement Console • Version 3</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome, {user?.fullName || 'Buyer'}!
          </h2>
          <p className="mt-2 text-sm text-blue-100/90 leading-relaxed">
            Your commercial purchasing console is active for{' '}
            <strong className="text-white">
              {user?.buyerDetails?.businessName || `${user?.fullName}'s Enterprise`}
            </strong>.
            Source directly from certified farmers across India, negotiate prices, and lock verified contracts.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <Link
              to="/marketplace"
              className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl transition-all shadow-md inline-flex items-center gap-2"
            >
              <Store className="w-4 h-4" />
              Browse Fresh Produce Marketplace
            </Link>
            <Link
              to="/dashboard/buyer/orders"
              className="px-4 py-2.5 bg-blue-800/50 hover:bg-blue-800/70 text-blue-100 font-semibold rounded-xl border border-blue-400/30 transition-colors inline-flex items-center gap-1.5"
            >
              <ShoppingBag className="w-4 h-4" />
              My Orders & Negotiations ({summary.totalOrders})
            </Link>
          </div>
        </div>
      </div>

      {/* Primary Stat Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Live Procurement Metrics
          </h3>
          <span className="text-xs text-slate-400 font-medium">Real platform telemetry</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Inquiries"
            value={summary.totalOrders}
            subtext="Lifetime farm purchase requests"
            icon={ShoppingBag}
            color="blue"
          />
          <StatCard
            title="In Negotiation"
            value={summary.pendingCount + summary.negotiatingCount + summary.acceptedCount}
            subtext={`${summary.acceptedCount} ready for confirmation`}
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Confirmed Orders"
            value={summary.confirmedCount}
            subtext="Reserved produce lots in transit"
            icon={Lock}
            color="emerald"
          />
          <StatCard
            title="Total Procurement"
            value={formatCurrency(summary.totalSpent)}
            subtext="Confirmed & completed volume"
            icon={TrendingUp}
            color="purple"
          />
        </div>
      </div>

      {/* Two Column Layout: Recent Orders & Commercial Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Recent Procurement Negotiations
            </h3>
            <Link
              to="/dashboard/buyer/orders"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
            {loading ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center">
                <Store className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No active orders yet</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Explore verified farmer listings on the marketplace and send your first purchase proposal.
                </p>
                <Link
                  to="/marketplace"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  <Store className="w-3.5 h-3.5" />
                  Explore Marketplace
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
                    label: order.status,
                    badge: 'bg-slate-100 text-slate-700'
                  };

                  return (
                    <div
                      key={order._id}
                      className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={
                            order.productId?.images?.[0] ||
                            'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800'
                          }
                          alt="Crop"
                          className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              {order.orderNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusConfig.badge}`}
                            >
                              {statusConfig.label}
                            </span>
                          </div>
                          <h4 className="text-sm font-bold text-slate-900 truncate mt-0.5">
                            {order.productId?.cropName || 'Crop Harvest'}
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            Farmer: {order.farmerId?.fullName} • {formatDate(order.createdAt)}
                          </span>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-sm font-extrabold text-emerald-700 block">
                          {formatCurrency(
                            order.totalAmount ||
                              (order.agreedPrice || order.initialOfferPrice) *
                                (order.agreedQuantity || order.requestedQuantity)
                          )}
                        </span>
                        <Link
                          to={`/dashboard/buyer/orders/${order._id}`}
                          className="text-[11px] font-bold text-blue-600 hover:text-blue-800"
                        >
                          View Thread →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Commercial Specifications (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Enterprise Buyer Profile
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Entity Name
                </span>
                <span className="text-slate-900 font-bold text-sm">
                  {user?.buyerDetails?.businessName || user?.fullName}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Business Model
                </span>
                <span className="text-slate-800 font-semibold">
                  {user?.buyerDetails?.businessType || 'Wholesale Agri Merchant'}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Procurement Hub
                </span>
                <span className="text-slate-800 font-semibold">
                  {user?.district}, {user?.state}
                </span>
              </div>
            </div>

            <Link
              to="/profile/edit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Edit Delivery & Business Details</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
