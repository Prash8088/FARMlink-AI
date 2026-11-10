const mongoose = require('mongoose');

const PRODUCT_CATEGORIES = [
  'Grains & Cereals',
  'Pulses & Lentils',
  'Oilseeds',
  'Fresh Vegetables',
  'Horticulture & Fruits',
  'Spices & Condiments',
  'Cash Crops',
  'Other'
];

const QUALITY_GRADES = [
  'Grade A (Premium)',
  'Grade B (Standard)',
  'Grade C (Fair/Processing)'
];

const MEASUREMENT_UNITS = ['kg', 'quintal', 'ton'];

const productSchema = new mongoose.Schema(
  {
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID reference is required'],
      index: true
    },
    cropName: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      minlength: [2, 'Crop name must be at least 2 characters'],
      maxlength: [100, 'Crop name cannot exceed 100 characters']
    },
    category: {
      type: String,
      required: [true, 'Crop category is required'],
      enum: {
        values: PRODUCT_CATEGORIES,
        message: '{VALUE} is not a valid agricultural category'
      },
      index: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [2500, 'Description cannot exceed 2500 characters']
    },
    images: {
      type: [String],
      required: [true, 'At least one product image URL is required'],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: 'At least one crop image is required'
      }
    },
    quantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Quantity cannot be negative']
    },
    unit: {
      type: String,
      required: [true, 'Measurement unit is required'],
      enum: {
        values: MEASUREMENT_UNITS,
        message: '{VALUE} is not a valid unit. Use kg, quintal, or ton.'
      },
      default: 'quintal'
    },
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative']
    },
    qualityGrade: {
      type: String,
      required: [true, 'Quality grade is required'],
      enum: {
        values: QUALITY_GRADES,
        message: '{VALUE} is not a valid quality grade'
      },
      default: 'Grade A (Premium)'
    },
    harvestDate: {
      type: Date,
      required: [true, 'Harvest date is required']
    },
    pickupLocation: {
      type: String,
      required: [true, 'Pickup location is required'],
      trim: true
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true
    },
    district: {
      type: String,
      required: [true, 'District is required'],
      trim: true
    },
    village: {
      type: String,
      required: [true, 'Village or city is required'],
      trim: true
    },
    status: {
      type: String,
      enum: ['available', 'unavailable', 'deactivated_by_admin'],
      default: 'available',
      index: true
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true
    },
    viewsCount: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

// Compound text index for search
productSchema.index({
  cropName: 'text',
  description: 'text',
  category: 'text'
});

const Product = mongoose.model('Product', productSchema);

module.exports = {
  Product,
  PRODUCT_CATEGORIES,
  QUALITY_GRADES,
  MEASUREMENT_UNITS
};
