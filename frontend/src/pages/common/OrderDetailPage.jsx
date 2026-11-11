import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderService } from '../../services/orderService';
import { useAuth } from '../../hooks/useAuth';
import { NegotiationThread } from '../../components/orders/NegotiationThread';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';
import {
  ArrowLeft,
  Package,
  MapPin,
  Calendar,
  Layers,
  Award,
  Phone,
  Mail,
  User,
  ShieldCheck,
  AlertCircle,
  Truck,
  FileText
} from 'lucide-react';

export const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await orderService.getOrderById(id);
      if (data.success && data.order) {
        setOrder(data.order);
      } else {
        setError('Order not found');
      }
    } catch (err) {
      console.error('Failed to fetch order details:', err);
      setError(err.response?.data?.message || 'Unable to load order details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrder();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-slate-200 rounded-lg w-1/4" />
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-4 h-96 bg-slate-100 rounded-3xl" />
            <div className="lg:col-span-8 h-96 bg-slate-100 rounded-3xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center">
        <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 mb-2">Order Not Accessible</h2>
        <p className="text-xs text-slate-500 mb-6">{error || 'This order does not exist or you do not have permission to view it.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-semibold text-xs"
        >
          Go Back
        </button>
      </div>
    );
  }

  const isBuyer = user?.role === 'buyer';
  const isFarmer = user?.role === 'farmer';
  const product = order.productId || {};
  const counterparty = isBuyer ? order.farmerId : order.buyerId;
  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    badge: 'bg-slate-100 text-slate-700'
  };

  const backLink = isBuyer
    ? '/dashboard/buyer/orders'
    : isFarmer
    ? '/dashboard/farmer/orders'
    : '/dashboard/admin/orders';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      {/* Back button */}
      <div>
        <Link
          to={backLink}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-emerald-700 bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-xs transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {isBuyer ? 'My Purchase Orders' : isFarmer ? 'Incoming Requests' : 'All Orders'}
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Order Summary & Produce Lot Info (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Produce Card */}
          <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs p-5 space-y-4">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Contract Agricultural Produce
            </span>

            <div className="flex gap-4">
              <img
                src={
                  product.images?.[0] ||
                  'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800'
                }
                alt={product.cropName}
                className="w-20 h-20 rounded-2xl object-cover shrink-0 border border-slate-200"
              />
              <div className="min-w-0">
                <span className="text-xs font-semibold text-emerald-700 block">
                  {product.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 truncate">
                  {product.cropName}
                </h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 mt-1">
                  <Award className="w-3.5 h-3.5 text-emerald-600" />
                  {product.qualityGrade || 'Grade A'}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Lot:</span>
                <span className="font-bold text-slate-800">
                  {order.requestedQuantity} {order.unit}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Initial Offer:</span>
                <span className="font-bold text-slate-800">
                  {formatCurrency(order.initialOfferPrice)} / {order.unit}
                </span>
              </div>
              {order.agreedPrice && (
                <div className="flex justify-between pt-1 border-t border-slate-200 text-emerald-800 font-extrabold">
                  <span>Agreed Terms:</span>
                  <span>
                    {order.agreedQuantity} {order.unit} @ {formatCurrency(order.agreedPrice)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Delivery Destination */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              Delivery Destination
            </span>

            <p className="text-xs text-slate-800 font-semibold leading-relaxed">
              {order.deliveryLocation?.address}
            </p>
            <p className="text-xs text-slate-500">
              {order.deliveryLocation?.village ? `${order.deliveryLocation.village}, ` : ''}
              {order.deliveryLocation?.district}, {order.deliveryLocation?.state}{' '}
              {order.deliveryLocation?.pincode ? `- ${order.deliveryLocation.pincode}` : ''}
            </p>

            {order.buyerMessage && (
              <div className="pt-2 border-t border-slate-100">
                <span className="text-[10px] font-bold text-slate-400 uppercase block">
                  Buyer Instructions
                </span>
                <p className="text-xs text-slate-600 italic mt-0.5">
                  "{order.buyerMessage}"
                </p>
              </div>
            )}
          </div>

          {/* Counterparty Profile */}
          <div className="bg-white rounded-3xl border border-slate-200/90 p-5 shadow-xs space-y-3">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {isBuyer ? 'Agricultural Producer (Farmer)' : 'Procurement Partner (Buyer)'}
            </span>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm">
                {counterparty?.fullName?.charAt(0) || 'U'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold text-slate-900 truncate">
                    {counterparty?.fullName}
                  </h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                </div>
                <p className="text-[11px] text-slate-500 truncate">
                  {counterparty?.district}, {counterparty?.state}
                </p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{counterparty?.phone || 'Direct platform message'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{counterparty?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Negotiation Thread (8 cols) */}
        <div className="lg:col-span-8">
          <NegotiationThread
            order={order}
            onOrderUpdated={(updated) => setOrder(updated)}
            currentUser={user}
          />
        </div>
      </div>
    </div>
  );
};
