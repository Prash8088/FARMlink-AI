import React from 'react';
import { Link } from 'react-router-dom';
import { formatCurrency, formatDate } from '../../utils/formatters';
import {
  MapPin,
  Calendar,
  Layers,
  Award,
  ArrowRight,
  User,
  ShieldCheck,
  TrendingUp,
  Package
} from 'lucide-react';

export const MarketplaceProductCard = ({ product }) => {
  const coverImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800';

  const farmer = product.farmerId || {};

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Cover Image & Badges */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={coverImage}
          alt={product.cropName}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            e.target.src =
              'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&q=80&w=800';
          }}
        />

        {/* Quality Grade Overlay */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-600/95 text-white backdrop-blur-xs shadow-sm">
            <Award className="w-3.5 h-3.5" />
            {product.qualityGrade || 'Grade A'}
          </span>
        </div>

        {/* Category Pill */}
        <div className="absolute bottom-3 left-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-xs font-medium bg-slate-900/80 text-white backdrop-blur-xs">
            <Layers className="w-3 h-3 text-emerald-400" />
            {product.category}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Title & Harvest Date */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-1">
              {product.cropName}
            </h3>
          </div>

          {/* Farmer Provenance */}
          <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-2xl mb-3 border border-slate-100">
            {farmer.profileImage ? (
              <img
                src={farmer.profileImage}
                alt={farmer.fullName}
                className="w-8 h-8 rounded-full object-cover border border-emerald-300"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                {farmer.fullName ? farmer.fullName.charAt(0) : 'F'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <span className="text-xs font-semibold text-slate-800 truncate">
                  {farmer.fullName || 'Verified Farmer'}
                </span>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                {product.village ? `${product.village}, ` : ''}{product.district}, {product.state}
              </p>
            </div>
          </div>

          {/* Quantity & Unit Pricing Row */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-emerald-50/50 rounded-2xl border border-emerald-100/60 mb-4">
            <div>
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Available Lot
              </span>
              <span className="text-sm font-bold text-slate-900 flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-emerald-600" />
                {product.quantity} <span className="text-xs font-medium text-slate-600">{product.unit}</span>
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
                Price / {product.unit}
              </span>
              <span className="text-base font-extrabold text-emerald-700">
                {formatCurrency(product.pricePerUnit)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <Link
          to={`/marketplace/${product._id}`}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm transition-all shadow-sm hover:shadow-md group/btn"
        >
          <span>View Details & Negotiate</span>
          <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
};
