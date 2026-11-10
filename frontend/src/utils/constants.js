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
