import React, { useState } from 'react';
import { formatCurrency, formatDateTime } from '../../utils/formatters';
import { ORDER_STATUS_CONFIG } from '../../utils/constants';
import { orderService } from '../../services/orderService';
import {
  MessageSquare,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  Send,
  Lock,
  Package,
  RotateCcw,
  AlertCircle,
  Truck,
  Award,
  ShieldCheck,
  User,
  Calendar
} from 'lucide-react';

export const NegotiationThread = ({ order, onOrderUpdated, currentUser }) => {
  const [counterPrice, setCounterPrice] = useState('');
  const [counterQty, setCounterQty] = useState('');
  const [counterMessage, setCounterMessage] = useState('');
  const [showCounterForm, setShowCounterForm] = useState(false);

  const [loadingAction, setLoadingAction] = useState(false);
  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const isBuyer = order.buyerId?._id === currentUser?._id;
  const isFarmer = order.farmerId?._id === currentUser?._id;

  const statusConfig = ORDER_STATUS_CONFIG[order.status] || {
    label: order.status,
    badge: 'bg-slate-100 text-slate-800'
  };

  const offers = order.offers || [];
  const latestOffer = offers.length > 0 ? offers[offers.length - 1] : null;
  const isLatestFromMe = latestOffer?.senderId?._id === currentUser?._id || latestOffer?.senderId === currentUser?._id;
  const isAwaitingMyResponse =
    (order.status === 'PENDING' || order.status === 'NEGOTIATING') &&
    latestOffer &&
    !isLatestFromMe &&
    latestOffer.status === 'pending';

  // Handle Accept Offer
  const handleAcceptOffer = async () => {
    if (!latestOffer) return;
    try {
      setLoadingAction(true);
      setActionError('');
      const res = await orderService.respondToOffer(order._id, latestOffer._id, 'accept');
      if (res.success) {
        setActionSuccess('Offer accepted! Terms are now agreed.');
        onOrderUpdated(res.order);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to accept offer');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Reject Offer
  const handleRejectOffer = async () => {
    if (!latestOffer) return;
    if (!window.confirm('Are you sure you want to decline this offer and close negotiation?')) return;
    try {
      setLoadingAction(true);
      setActionError('');
      const res = await orderService.respondToOffer(order._id, latestOffer._id, 'reject');
      if (res.success) {
        setActionSuccess('Offer declined.');
        onOrderUpdated(res.order);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to decline offer');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Submit Counter-Offer
  const handleSubmitCounter = async (e) => {
    e.preventDefault();
    const price = Number(counterPrice);
    const qty = Number(counterQty || order.requestedQuantity);

    if (isNaN(price) || price <= 0) {
      setActionError('Please enter a valid counter price per unit.');
      return;
    }
    if (isNaN(qty) || qty <= 0) {
      setActionError('Please enter a valid counter quantity.');
      return;
    }

    try {
      setLoadingAction(true);
      setActionError('');
      const res = await orderService.submitCounterOffer(order._id, {
        offeredPrice: price,
        offeredQuantity: qty,
        message: counterMessage
      });
      if (res.success) {
        setActionSuccess('Counter-offer submitted successfully!');
        setShowCounterForm(false);
        setCounterPrice('');
        setCounterMessage('');
        onOrderUpdated(res.order);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to submit counter-offer');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Buyer Order Confirmation (Atomic Stock Reservation)
  const handleConfirmOrder = async () => {
    if (!window.confirm(`Confirm order contract for ${order.agreedQuantity} ${order.unit} at ${formatCurrency(order.agreedPrice)}/${order.unit}? Total: ${formatCurrency(order.totalAmount)}`)) {
      return;
    }
    try {
      setLoadingAction(true);
      setActionError('');
      const res = await orderService.confirmOrder(order._id);
      if (res.success) {
        setActionSuccess('🎉 Order Confirmed! Stock reserved atomically.');
        onOrderUpdated(res.order);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to confirm order.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Cancel Order
  const handleCancelOrder = async () => {
    const reason = window.prompt('Please enter a cancellation reason:');
    if (reason === null) return;
    try {
      setLoadingAction(true);
      setActionError('');
      const res = await orderService.cancelOrder(order._id, reason);
      if (res.success) {
        setActionSuccess('Order cancelled successfully.');
        onOrderUpdated(res.order);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to cancel order');
    } finally {
      setLoadingAction(false);
    }
  };

  // Handle Mark Completed
  const handleCompleteOrder = async () => {
    if (!window.confirm('Mark this order as fulfilled and completed?')) return;
    try {
      setLoadingAction(true);
      setActionError('');
      const res = await orderService.completeOrder(order._id);
      if (res.success) {
        setActionSuccess('Order marked as completed!');
        onOrderUpdated(res.order);
      }
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to complete order');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs">
      {/* Thread Header */}
      <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">
              {order.orderNumber}
            </span>
            <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${statusConfig.badge}`}>
              <span className={`w-2 h-2 rounded-full ${statusConfig.dot || 'bg-slate-500'}`} />
              {statusConfig.label}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900">
            Price Negotiation & Audit Thread
          </h2>
        </div>

        <div className="text-right">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            {order.status === 'CONFIRMED' || order.status === 'ACCEPTED' || order.status === 'COMPLETED'
              ? 'Agreed Order Amount'
              : 'Current Proposed Amount'}
          </span>
          <span className="text-2xl font-extrabold text-emerald-700">
            {formatCurrency(
              order.totalAmount ||
                (latestOffer ? latestOffer.offeredPrice * latestOffer.offeredQuantity : 0)
            )}
          </span>
          <span className="text-xs text-slate-500 block">
            {order.agreedQuantity || order.requestedQuantity} {order.unit} @{' '}
            {formatCurrency(order.agreedPrice || (latestOffer ? latestOffer.offeredPrice : order.initialOfferPrice))}/
            {order.unit}
          </span>
        </div>
      </div>

      {/* Notifications / Alerts */}
      {actionError && (
        <div className="m-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="m-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* State Milestone Banners */}
      {order.status === 'ACCEPTED' && (
        <div className="mx-6 mt-6 p-5 rounded-3xl bg-indigo-50 border border-indigo-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-indigo-950">Terms Successfully Agreed!</h4>
                <p className="text-xs text-indigo-700 mt-0.5">
                  Both parties have agreed on <strong>{order.agreedQuantity} {order.unit}</strong> at{' '}
                  <strong>{formatCurrency(order.agreedPrice)} / {order.unit}</strong> (Total: {formatCurrency(order.totalAmount)}).
                </p>
                {isBuyer ? (
                  <p className="text-xs text-indigo-900 font-semibold mt-1">
                    👉 Click "Confirm Order & Reserve Stock" to officially lock your procurement contract.
                  </p>
                ) : (
                  <p className="text-xs text-indigo-800 mt-1">
                    Waiting for the buyer to confirm the contract and reserve stock.
                  </p>
                )}
              </div>
            </div>

            {isBuyer && (
              <button
                onClick={handleConfirmOrder}
                disabled={loadingAction}
                className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
              >
                <Lock className="w-4 h-4" />
                <span>Confirm Order & Reserve Stock</span>
              </button>
            )}
          </div>
        </div>
      )}

      {order.status === 'CONFIRMED' && (
        <div className="mx-6 mt-6 p-5 rounded-3xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-emerald-600 text-white shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-950">Order Confirmed & Stock Reserved</h4>
              <p className="text-xs text-emerald-700 mt-0.5">
                The farmer's produce lot has been atomically deducted from available inventory.
              </p>
              {order.confirmedAt && (
                <p className="text-[11px] text-emerald-600 mt-0.5">
                  Confirmed on {formatDateTime(order.confirmedAt)}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCompleteOrder}
              disabled={loadingAction}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Mark Completed
            </button>
            <button
              onClick={handleCancelOrder}
              disabled={loadingAction}
              className="px-3.5 py-2 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
            >
              Cancel Order
            </button>
          </div>
        </div>
      )}

      {order.status === 'COMPLETED' && (
        <div className="mx-6 mt-6 p-4 rounded-3xl bg-green-50 border border-green-200 flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-green-600 text-white shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-green-950">Consignment Fulfilled & Completed</h4>
            <p className="text-xs text-green-700">
              Completed on {formatDateTime(order.completedAt || order.updatedAt)}
            </p>
          </div>
        </div>
      )}

      {order.status === 'CANCELLED' && (
        <div className="mx-6 mt-6 p-4 rounded-3xl bg-slate-100 border border-slate-200 text-slate-700 text-xs">
          <p className="font-bold text-slate-800">Order Cancelled</p>
          <p className="mt-0.5">
            Reason: {order.cancellationReason || 'Cancelled by participant'} • Date: {formatDateTime(order.cancelledAt)}
          </p>
        </div>
      )}

      {/* Offers Timeline */}
      <div className="p-6 space-y-6">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
          <MessageSquare className="w-3.5 h-3.5" />
          Negotiation History ({offers.length} entries)
        </h3>

        <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-200">
          {offers.map((offer, idx) => {
            const isOfferBuyer = offer.senderRole === 'buyer';
            const isCurrentSender = offer.senderId?._id === currentUser?._id || offer.senderId === currentUser?._id;

            return (
              <div key={offer._id || idx} className="relative">
                {/* Dot */}
                <div
                  className={`absolute -left-6 top-2 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold shadow-xs ${
                    isOfferBuyer ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'
                  }`}
                >
                  {isOfferBuyer ? 'B' : 'F'}
                </div>

                {/* Offer Card */}
                <div
                  className={`p-4 rounded-2xl border transition-all ${
                    isCurrentSender
                      ? 'bg-slate-50/70 border-slate-200 ml-2'
                      : 'bg-white border-slate-200 shadow-xs mr-2'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-800">
                        {isCurrentSender
                          ? 'You'
                          : offer.senderRole === 'buyer'
                          ? order.buyerId?.fullName || 'Buyer'
                          : order.farmerId?.fullName || 'Farmer'}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          isOfferBuyer
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isOfferBuyer ? 'Buyer Offer' : 'Farmer Counter-Offer'}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDateTime(offer.createdAt)}
                    </span>
                  </div>

                  {/* Offer Numbers */}
                  <div className="flex flex-wrap items-center gap-4 py-2 px-3 bg-white rounded-xl border border-slate-100 mb-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] font-semibold block uppercase">
                        Offered Rate
                      </span>
                      <span className="text-sm font-extrabold text-emerald-700">
                        {formatCurrency(offer.offeredPrice)} / {order.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 text-[10px] font-semibold block uppercase">
                        Quantity
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {offer.offeredQuantity} {order.unit}
                      </span>
                    </div>

                    <div className="ml-auto text-right">
                      <span className="text-slate-400 text-[10px] font-semibold block uppercase">
                        Lot Total
                      </span>
                      <span className="text-sm font-bold text-slate-900">
                        {formatCurrency(offer.offeredPrice * offer.offeredQuantity)}
                      </span>
                    </div>
                  </div>

                  {/* Message */}
                  {offer.message && (
                    <p className="text-xs text-slate-600 bg-slate-100/60 p-2.5 rounded-xl italic">
                      "{offer.message}"
                    </p>
                  )}

                  {/* Status Badge */}
                  <div className="mt-2 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        offer.status === 'accepted'
                          ? 'bg-emerald-100 text-emerald-800'
                          : offer.status === 'countered'
                          ? 'bg-slate-100 text-slate-500'
                          : offer.status === 'rejected'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {offer.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Action Footer for Active Negotiations */}
      {(order.status === 'PENDING' || order.status === 'NEGOTIATING') && (
        <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
          {/* Action Bar when awaiting response */}
          {isAwaitingMyResponse ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-600">
                <span>The counterparty submitted an offer. Would you like to accept, counter, or decline?</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={handleAcceptOffer}
                  disabled={loadingAction}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Accept Offer
                </button>
                <button
                  onClick={() => setShowCounterForm(!showCounterForm)}
                  disabled={loadingAction}
                  className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-sm flex items-center gap-1.5 transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Submit Counter-Offer
                </button>
                <button
                  onClick={handleRejectOffer}
                  disabled={loadingAction}
                  className="px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-semibold text-xs transition-colors"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Decline
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-slate-500 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-500" />
                Waiting for counterparty response on your latest offer.
              </span>
              <button
                onClick={() => setShowCounterForm(!showCounterForm)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline"
              >
                {showCounterForm ? 'Close form' : 'Revise your offer'}
              </button>
            </div>
          )}

          {/* Inline Counter-Offer Form */}
          {showCounterForm && (
            <form onSubmit={handleSubmitCounter} className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3 mt-3">
              <h4 className="text-xs font-bold text-slate-900">Propose New Terms</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Offered Price / {order.unit} (₹)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={counterPrice}
                    onChange={(e) => setCounterPrice(e.target.value)}
                    placeholder="Enter rate (e.g. 3100)"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-emerald-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    Offered Quantity ({order.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="any"
                    value={counterQty || order.requestedQuantity}
                    onChange={(e) => setCounterQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-900 focus:ring-emerald-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Message / Justification
                </label>
                <input
                  type="text"
                  value={counterMessage}
                  onChange={(e) => setCounterMessage(e.target.value)}
                  placeholder="e.g. Can do Rs 3050 with prompt pickup and direct mandi payment..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCounterForm(false)}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loadingAction}
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                >
                  Send Counter-Offer
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
};
