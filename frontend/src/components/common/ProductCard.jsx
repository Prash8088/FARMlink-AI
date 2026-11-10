import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  MapPin,
  Calendar,
  Layers,
  Edit,
  Trash2,
  Eye,
  CheckCircle2,
  XCircle,
  Package,
  TrendingUp,
  Sliders,
  ShieldAlert
} from 'lucide-react';

export const ProductCard = ({
  product,
  onQuickStock,
  onToggleStatus,
  onDelete,
  isOwner = true,
  isAdmin = false
}) => {
  const isAvailable = product.status === 'available';
  const isDeactivatedByAdmin = product.status === 'deactivated_by_admin';
  const coverImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800';

  const totalLotValue = (product.quantity || 0) * (product.pricePerUnit || 0);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col overflow-hidden group">
      {/* Card Header & Image */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={product.cropName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800';
          }}
        />

        {/* Status Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {isDeactivatedByAdmin ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-600 text-white shadow-sm">
              <ShieldAlert className="w-3 h-3" />
              Flagged by Admin
            </span>
          ) : isAvailable ? (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-sm">
              <CheckCircle2 className="w-3 h-3" />
              Available
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-white shadow-sm">
              <XCircle className="w-3 h-3" />
              Unavailable / Reserved
            </span>
          )}

          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-white/90 backdrop-blur-xs text-slate-800 shadow-xs">
            {product.category}
          </span>
        </div>

        {/* Quality Grade Badge */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-xl bg-amber-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-sm">
            {product.qualityGrade.split(' ')[0]} {product.qualityGrade.split(' ')[1] || ''}
          </span>
        </div>

        {/* Total Lot Value Banner */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950/80 via-slate-950/40 to-transparent p-3 pt-6 flex items-end justify-between text-white">
          <div>
            <p className="text-[10px] font-medium text-slate-300 uppercase tracking-wider">Price per {product.unit}</p>
            <p className="text-lg font-black text-white leading-tight">
              {formatCurrency(product.pricePerUnit)}
              <span className="text-xs font-normal text-slate-300"> / {product.unit}</span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-medium text-emerald-300 uppercase tracking-wider">Lot Value</p>
            <p className="text-xs font-bold text-emerald-300 font-mono">
              {formatCurrency(totalLotValue)}
            </p>
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
            {product.cropName}
          </h3>

          <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
            {product.description}
          </p>

          {/* Key Metrics */}
          <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
                Available Stock
              </span>
              <p className="font-bold text-slate-800 text-sm mt-0.5">
                {product.quantity} <span className="text-xs font-semibold text-slate-500">{product.unit}</span>
              </p>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] font-medium text-slate-400 block uppercase tracking-wider">
                Harvest Date
              </span>
              <p className="font-semibold text-slate-700 text-xs mt-0.5">
                {formatDate(product.harvestDate)}
              </p>
            </div>
          </div>

          {/* Location & Provenance */}
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
            <MapPin className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
            <span className="truncate">
              {product.village ? `${product.village}, ` : ''}{product.district}, {product.state}
            </span>
          </div>

          {/* Farmer reference if viewed by Admin */}
          {product.farmerId && typeof product.farmerId === 'object' && product.farmerId.fullName && (
            <div className="mt-1 text-[11px] text-slate-400">
              Listed by: <strong className="text-slate-700 font-medium">{product.farmerId.fullName}</strong>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {/* View Details */}
          <Link
            to={`/dashboard/farmer/products/${product._id}`}
            className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            Details
          </Link>

          {isOwner && (
            <>
              {/* Quick Stock Modal Trigger */}
              <button
                type="button"
                onClick={() => onQuickStock(product)}
                className="p-2 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 transition-colors"
                title="Quick Stock Update"
              >
                <Sliders className="w-4 h-4" />
              </button>

              {/* Status Toggle */}
              <button
                type="button"
                onClick={() => onToggleStatus(product)}
                className={`p-2 rounded-xl border transition-colors ${
                  isAvailable
                    ? 'border-slate-200 hover:border-amber-500 hover:bg-amber-50 text-slate-600 hover:text-amber-700'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
                title={isAvailable ? 'Mark Unavailable' : 'Mark Available'}
              >
                {isAvailable ? <XCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              </button>

              {/* Edit */}
              <Link
                to={`/dashboard/farmer/products/${product._id}/edit`}
                className="p-2 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 text-slate-600 hover:text-blue-700 transition-colors"
                title="Edit Listing"
              >
                <Edit className="w-4 h-4" />
              </Link>

              {/* Delete */}
              <button
                type="button"
                onClick={() => onDelete(product)}
                className="p-2 rounded-xl border border-slate-200 hover:border-rose-500 hover:bg-rose-50 text-slate-600 hover:text-rose-700 transition-colors"
                title="Delete Listing"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </>
          )}

          {isAdmin && (
            <button
              type="button"
              onClick={() => onToggleStatus(product)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                isDeactivatedByAdmin
                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              {isDeactivatedByAdmin ? 'Restore Listing' : 'Deactivate Listing'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
