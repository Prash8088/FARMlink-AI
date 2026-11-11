import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import { productService } from '../../services/productService';
import { orderService } from '../../services/orderService';
import { StatCard } from '../../components/common/StatCard';
import { formatDate, formatCurrency } from '../../utils/formatters';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';
import {
  Sprout,
  Package,
  Layers,
  CheckCircle,
  IndianRupee,
  Clock,
  ArrowRight,
  TrendingUp,
  Truck,
  ShieldCheck,
  Edit,
  UserCheck,
  Plus,
  Inbox,
  Lock,
  MapPin
} from 'lucide-react';

export const FarmerDashboard = () => {
  const { user } = useAuth();
  const [productCount, setProductCount] = useState(0);
  const [availableCount, setAvailableCount] = useState(0);

  const [orders, setOrders] = useState([]);
  const [orderSummary, setOrderSummary] = useState({
    totalRequests: 0,
    pendingCount: 0,
    negotiatingCount: 0,
    confirmedCount: 0,
    completedCount: 0,
    totalRevenue: 0
  });
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const [prodRes, orderRes] = await Promise.allSettled([
          productService.getMyProducts({ limit: 1 }),
          orderService.getFarmerOrders({ limit: 5 })
        ]);

        if (prodRes.status === 'fulfilled' && prodRes.value.success && prodRes.value.data?.summary) {
          setProductCount(prodRes.value.data.summary.totalListings);
          setAvailableCount(prodRes.value.data.summary.available);
        }

        if (orderRes.status === 'fulfilled' && orderRes.value.success) {
          setOrders(orderRes.value.orders || []);
          if (orderRes.value.summary) setOrderSummary(orderRes.value.summary);
        }
      } catch (e) {
        console.warn('Could not load farmer dashboard stats', e);
      } finally {
        setLoadingOrders(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-900/60 text-emerald-200 border border-emerald-500/30 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sprout className="w-3.5 h-3.5 text-emerald-300" />
            <span>Farmer Operations Console • Version 3 Active</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Namaste, {user?.fullName || 'Farmer'}!
          </h2>
          <p className="mt-2 text-sm text-emerald-100/90 leading-relaxed">
            Welcome to your direct farm management portal. Your agricultural profile is active for{' '}
            <strong className="text-white">
              {user?.farmerDetails?.farmName || `${user?.village || 'Local'} Farmland`}
            </strong>{' '}
            in {user?.district}, {user?.state}.
          </p>
          <div className="mt-5 flex flex-wrap gap-3 text-xs">
            <Link
              to="/dashboard/farmer/products"
              className="px-4 py-2 bg-white text-emerald-900 font-bold rounded-xl hover:bg-emerald-50 transition-colors shadow-sm inline-flex items-center gap-1.5"
            >
              <Package className="w-4 h-4 text-emerald-700" />
              Manage Produce Listings ({productCount})
            </Link>
            <Link
              to="/dashboard/farmer/orders"
              className="px-4 py-2 bg-emerald-900/60 text-emerald-100 hover:bg-emerald-900/80 font-semibold rounded-xl border border-emerald-400/40 transition-colors inline-flex items-center gap-1.5"
            >
              <Inbox className="w-3.5 h-3.5 text-emerald-300" />
              Incoming Requests ({orderSummary.totalRequests})
            </Link>
            <Link
              to="/dashboard/farmer/products/new"
              className="px-4 py-2 bg-emerald-900/40 text-emerald-100 hover:bg-emerald-900/60 font-semibold rounded-xl border border-emerald-400/30 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5 text-emerald-300" />
              Publish New Crop
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Primary Stat Cards */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
            Marketplace Overview
          </h3>
          <span className="text-xs text-slate-400 font-medium">Real platform telemetry</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Products Listed"
            value={productCount}
            subtext={`${availableCount} currently active for bulk buyers`}
            icon={Package}
            color="emerald"
            badgeText="Catalog"
          />
          <StatCard
            title="In Negotiation"
            value={orderSummary.pendingCount + orderSummary.negotiatingCount}
            subtext={`${orderSummary.pendingCount} new inquiries awaiting response`}
            icon={Clock}
            color="amber"
            badgeText="Action"
          />
          <StatCard
            title="Confirmed Orders"
            value={orderSummary.confirmedCount}
            subtext="Stock reserved for procurement"
            icon={Lock}
            color="blue"
            badgeText="Locked"
          />
          <StatCard
            title="Produce Revenue"
            value={formatCurrency(orderSummary.totalRevenue)}
            subtext="Confirmed & completed crop sales"
            icon={IndianRupee}
            color="emerald"
            badgeText="Gross Sales"
          />
        </div>
      </div>

      {/* Two Column Layout: Incoming Requests & Farm Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Incoming Requests (2 Cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
              Incoming Purchase Inquiries & Bids
            </h3>
            <Link
              to="/dashboard/farmer/orders"
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
            {loadingOrders ? (
              <div className="p-8 text-center text-slate-400 text-xs">Loading incoming inquiries...</div>
            ) : orders.length === 0 ? (
              <div className="p-10 text-center">
                <Inbox className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-800">No incoming buyer requests yet</h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  Keep your produce listings up to date with competitive pricing to attract wholesale buyers.
                </p>
                <Link
                  to="/dashboard/farmer/products/new"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold"
                >
                  <Plus className="w-3.5 h-3.5" />
                  List a New Crop
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {orders.map((order) => {
                  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
                    label: order.status,
                    badge: 'bg-slate-100 text-slate-700'
                  };

                  const isNew = order.status === 'PENDING';

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
                            {order.productId?.cropName || 'Produce Lot'}
                          </h4>
                          <span className="text-[11px] text-slate-500">
                            Buyer: {order.buyerId?.fullName} • {formatDate(order.createdAt)}
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
                          to={`/dashboard/farmer/orders/${order._id}`}
                          className={`text-[11px] font-bold ${
                            isNew ? 'text-amber-700 hover:text-amber-800' : 'text-emerald-700 hover:text-emerald-800'
                          }`}
                        >
                          {isNew ? 'Respond to Bid →' : 'View Thread →'}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Farm Profile Specs (1 Col) */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200/90 p-6 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Farm Provenance Details
            </h3>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Farm Enterprise
                </span>
                <span className="text-slate-900 font-bold text-sm">
                  {user?.farmerDetails?.farmName || `${user?.fullName}'s Farm`}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Location & Mandi Hub
                </span>
                <span className="text-slate-800 font-semibold">
                  {user?.village ? `${user?.village}, ` : ''}{user?.district}, {user?.state}
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-slate-400 block text-[10px] uppercase font-bold">
                  Farming Experience
                </span>
                <span className="text-slate-800 font-semibold">
                  {user?.farmerDetails?.farmingExperience || 10} Years Certified
                </span>
              </div>
            </div>

            <Link
              to="/profile/edit"
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              <span>Update Farm Specifications</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
