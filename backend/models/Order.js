const mongoose = require('mongoose');

const ORDER_STATUSES = [
  'PENDING',
  'NEGOTIATING',
  'ACCEPTED',
  'CONFIRMED',
  'REJECTED',
  'CANCELLED',
  'COMPLETED'
];

const NEGOTIATION_STATUSES = [
  'BUYER_OFFER',
  'FARMER_COUNTER',
  'BUYER_COUNTER',
  'AGREED',
  'REJECTED',
  'CANCELLED'
];

const offerSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Sender ID is required']
    },
    senderRole: {
      type: String,
      enum: ['buyer', 'farmer'],
      required: [true, 'Sender role is required']
    },
    offeredPrice: {
      type: Number,
      required: [true, 'Offered price is required'],
      min: [0.01, 'Offered price must be greater than zero']
    },
    offeredQuantity: {
      type: Number,
      required: [true, 'Offered quantity is required'],
      min: [0.01, 'Offered quantity must be greater than zero']
    },
    message: {
      type: String,
      trim: true,
      maxlength: [1000, 'Message cannot exceed 1000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: ['pending', 'countered', 'accepted', 'rejected'],
      default: 'pending'
    },
    expiresAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
      index: true
    },
    buyerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Buyer ID is required'],
      index: true
    },
    farmerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer ID is required'],
      index: true
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true
    },
    requestedQuantity: {
      type: Number,
      required: [true, 'Requested quantity is required'],
      min: [0.01, 'Requested quantity must be greater than zero']
    },
    agreedQuantity: {
      type: Number,
      default: null
    },
    initialOfferPrice: {
      type: Number,
      required: [true, 'Initial offer price is required'],
      min: [0.01, 'Initial offer price must be greater than zero']
    },
    agreedPrice: {
      type: Number,
      default: null
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      required: [true, 'Measurement unit is required'],
      default: 'quintal'
    },
    deliveryLocation: {
      address: {
        type: String,
        required: [true, 'Delivery address is required'],
        trim: true
      },
      village: {
        type: String,
        trim: true,
        default: ''
      },
      district: {
        type: String,
        required: [true, 'Delivery district is required'],
        trim: true
      },
      state: {
        type: String,
        required: [true, 'Delivery state is required'],
        trim: true
      },
      pincode: {
        type: String,
        trim: true,
        default: ''
      }
    },
    buyerMessage: {
      type: String,
      trim: true,
      maxlength: [1000, 'Buyer message cannot exceed 1000 characters'],
      default: ''
    },
    status: {
      type: String,
      enum: {
        values: ORDER_STATUSES,
        message: '{VALUE} is not a valid order status'
      },
      default: 'PENDING',
      index: true
    },
    negotiationStatus: {
      type: String,
      enum: {
        values: NEGOTIATION_STATUSES,
        message: '{VALUE} is not a valid negotiation status'
      },
      default: 'BUYER_OFFER',
      index: true
    },
    offers: [offerSchema],
    confirmedAt: {
      type: Date
    },
    cancelledAt: {
      type: Date
    },
    cancellationReason: {
      type: String,
      trim: true,
      default: ''
    },
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    completedAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

// Pre-save hook to generate unique orderNumber if not present
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString().slice(-6);
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    this.orderNumber = `ORD-${timestamp}-${randomSuffix}`;
  }
  next();
});

// Indexes for fast lookups
orderSchema.index({ buyerId: 1, createdAt: -1 });
orderSchema.index({ farmerId: 1, createdAt: -1 });
orderSchema.index({ productId: 1, status: 1 });

const Order = mongoose.model('Order', orderSchema);

module.exports = {
  Order,
  ORDER_STATUSES,
  NEGOTIATION_STATUSES
};
