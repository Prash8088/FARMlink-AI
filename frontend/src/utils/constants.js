export const ROLES = {
  FARMER: 'farmer',
  BUYER: 'buyer',
  TRANSPORTER: 'transporter',
  ADMIN: 'admin'
};

export const ROLE_LABELS = {
  farmer: 'Farmer',
  buyer: 'Agro Buyer',
  transporter: 'Transporter',
  admin: 'Administrator'
};

export const ROLE_COLORS = {
  farmer: {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-800'
  },
  buyer: {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-800'
  },
  transporter: {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-800'
  },
  admin: {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badge: 'bg-purple-100 text-purple-800'
  }
};

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi NCR',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal'
];

export const BUYER_TYPES = [
  'Wholesale Distributor',
  'Retail Supermarket Chain',
  'Food Processing Enterprise',
  'Institutional Caterer / Hotelier',
  'Agricultural Exporter',
  'Local Mandi Commission Agent'
];

export const PRODUCT_CATEGORIES = [
  'Grains & Cereals',
  'Pulses & Lentils',
  'Oilseeds',
  'Fresh Vegetables',
  'Horticulture & Fruits',
  'Spices & Condiments',
  'Cash Crops',
  'Other'
];

export const CROP_CATEGORIES = PRODUCT_CATEGORIES;

export const QUALITY_GRADES = [
  'Grade A (Premium)',
  'Grade B (Standard)',
  'Grade C (Fair/Processing)'
];

export const MEASUREMENT_UNITS = [
  { value: 'quintal', label: 'Quintal (100 kg)', abbr: 'qtl' },
  { value: 'kg', label: 'Kilogram (kg)', abbr: 'kg' },
  { value: 'ton', label: 'Metric Ton (1,000 kg)', abbr: 'MT' }
];

export const VEHICLE_TYPES = [
  'Mini Truck (1-2 MT)',
  'Light Commercial Vehicle (LCV - 3.5 MT)',
  'Medium Duty Truck (6-10 MT)',
  'Heavy Multi-Axle Truck (16-25 MT)',
  'Refrigerated Cold Chain Container',
  'Open High-Deck Tractor Trailer'
];

export const ORDER_STATUS_CONFIG = {
  PENDING: {
    label: 'Pending Response',
    badge: 'bg-amber-100 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
    description: 'Purchase request sent. Awaiting farmer response.'
  },
  NEGOTIATING: {
    label: 'In Negotiation',
    badge: 'bg-blue-100 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
    description: 'Counter-offers in progress between parties.'
  },
  ACCEPTED: {
    label: 'Terms Agreed',
    badge: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    dot: 'bg-indigo-500',
    description: 'Price and quantity agreed. Ready for buyer confirmation.'
  },
  CONFIRMED: {
    label: 'Order Confirmed',
    badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
    description: 'Order confirmed! Stock atomically reserved.'
  },
  COMPLETED: {
    label: 'Completed',
    badge: 'bg-green-100 text-green-800 border-green-200',
    dot: 'bg-green-600',
    description: 'Consignment fulfilled and marked completed.'
  },
  REJECTED: {
    label: 'Declined',
    badge: 'bg-red-100 text-red-800 border-red-200',
    dot: 'bg-red-500',
    description: 'Negotiation rejected and closed.'
  },
  CANCELLED: {
    label: 'Cancelled',
    badge: 'bg-slate-100 text-slate-700 border-slate-300',
    dot: 'bg-slate-500',
    description: 'Order cancelled. Reserved stock restored.'
  }
};

