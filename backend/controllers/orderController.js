const { Order, ORDER_STATUSES, NEGOTIATION_STATUSES } = require('../models/Order');
const { Product } = require('../models/Product');
const User = require('../models/User');

/**
 * @desc    Create purchase request / initial offer (Buyer only)
 * @route   POST /api/orders
 * @access  Private (Buyer)
 */
const createOrder = async (req, res, next) => {
  try {
    const {
      productId,
      requestedQuantity,
      initialOfferPrice,
      deliveryLocation,
      buyerMessage
    } = req.body;

    // Validate product existence & availability
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Agricultural product not found'
      });
    }

    if (!product.isActive || product.status === 'deactivated_by_admin') {
      return res.status(400).json({
        success: false,
        message: 'This product listing is no longer active on the marketplace'
      });
    }

    if (product.status === 'unavailable' || product.quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'This product is currently out of stock'
      });
    }

    const numQuantity = Number(requestedQuantity);
    const numPrice = Number(initialOfferPrice);

    if (isNaN(numQuantity) || numQuantity <= 0) {
      return res.status(422).json({
        success: false,
        message: 'Requested quantity must be a positive number'
      });
    }

    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(422).json({
        success: false,
        message: 'Initial offer price must be a positive number'
      });
    }

    // Validate requested quantity does not exceed currently available stock
    if (numQuantity > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity (${numQuantity} ${product.unit}) exceeds available stock (${product.quantity} ${product.unit})`
      });
    }

    // Prevent farmer ordering their own crop
    if (product.farmerId.toString() === req.user._id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'Farmers cannot create purchase requests for their own products'
      });
    }

    // Validate delivery location
    if (!deliveryLocation || !deliveryLocation.address || !deliveryLocation.district || !deliveryLocation.state) {
      return res.status(422).json({
        success: false,
        message: 'Complete delivery location (address, district, state) is required'
      });
    }

    // Check for duplicate active requests from this buyer for the same product
    const existingActiveOrder = await Order.findOne({
      buyerId: req.user._id,
      productId: product._id,
      status: { $in: ['PENDING', 'NEGOTIATING', 'ACCEPTED'] }
    });

    if (existingActiveOrder) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active negotiation for this crop listing.',
        existingOrderId: existingActiveOrder._id,
        existingOrderNumber: existingActiveOrder.orderNumber
      });
    }

    // Build initial offer item
    const initialOffer = {
      senderId: req.user._id,
      senderRole: 'buyer',
      offeredPrice: numPrice,
      offeredQuantity: numQuantity,
      message: (buyerMessage || '').trim() || 'Initial purchase request',
      status: 'pending'
    };

    const order = await Order.create({
      buyerId: req.user._id,
      farmerId: product.farmerId,
      productId: product._id,
      requestedQuantity: numQuantity,
      initialOfferPrice: numPrice,
      unit: product.unit,
      deliveryLocation: {
        address: deliveryLocation.address.trim(),
        village: (deliveryLocation.village || '').trim(),
        district: deliveryLocation.district.trim(),
        state: deliveryLocation.state.trim(),
        pincode: (deliveryLocation.pincode || '').trim()
      },
      buyerMessage: (buyerMessage || '').trim(),
      status: 'PENDING',
      negotiationStatus: 'BUYER_OFFER',
      offers: [initialOffer]
    });

    const populatedOrder = await Order.findById(order._id)
      .populate('farmerId', 'fullName email phone state district village')
      .populate('buyerId', 'fullName email phone state district village')
      .populate('productId', 'cropName category images unit pricePerUnit quantity qualityGrade');

    res.status(201).json({
      success: true,
      message: 'Purchase request submitted successfully. The farmer will be notified.',
      order: populatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders for authenticated buyer
 * @route   GET /api/orders/buyer
 * @access  Private (Buyer)
 */
const getBuyerOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { buyerId: req.user._id };

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));

    const [orders, total, allBuyerOrders] = await Promise.all([
      Order.find(query)
        .populate('farmerId', 'fullName email phone state district village')
        .populate('productId', 'cropName category images unit pricePerUnit quantity qualityGrade')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Order.countDocuments(query),
      Order.find({ buyerId: req.user._id }).select('status agreedPrice agreedQuantity totalAmount').lean()
    ]);

    // Compute metrics
    const summary = {
      totalOrders: allBuyerOrders.length,
      pendingCount: allBuyerOrders.filter((o) => o.status === 'PENDING').length,
      negotiatingCount: allBuyerOrders.filter((o) => o.status === 'NEGOTIATING').length,
      acceptedCount: allBuyerOrders.filter((o) => o.status === 'ACCEPTED').length,
      confirmedCount: allBuyerOrders.filter((o) => o.status === 'CONFIRMED').length,
      completedCount: allBuyerOrders.filter((o) => o.status === 'COMPLETED').length,
      cancelledCount: allBuyerOrders.filter((o) => o.status === 'CANCELLED').length,
      totalSpent: allBuyerOrders
        .filter((o) => ['CONFIRMED', 'COMPLETED'].includes(o.status))
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      summary,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get incoming orders/requests for authenticated farmer
 * @route   GET /api/orders/farmer
 * @access  Private (Farmer)
 */
const getFarmerOrders = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = { farmerId: req.user._id };

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));

    const [orders, total, allFarmerOrders] = await Promise.all([
      Order.find(query)
        .populate('buyerId', 'fullName email phone state district village')
        .populate('productId', 'cropName category images unit pricePerUnit quantity qualityGrade')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Order.countDocuments(query),
      Order.find({ farmerId: req.user._id }).select('status agreedPrice agreedQuantity totalAmount').lean()
    ]);

    // Compute metrics
    const summary = {
      totalRequests: allFarmerOrders.length,
      pendingCount: allFarmerOrders.filter((o) => o.status === 'PENDING').length,
      negotiatingCount: allFarmerOrders.filter((o) => o.status === 'NEGOTIATING').length,
      acceptedCount: allFarmerOrders.filter((o) => o.status === 'ACCEPTED').length,
      confirmedCount: allFarmerOrders.filter((o) => o.status === 'CONFIRMED').length,
      completedCount: allFarmerOrders.filter((o) => o.status === 'COMPLETED').length,
      cancelledCount: allFarmerOrders.filter((o) => o.status === 'CANCELLED').length,
      totalRevenue: allFarmerOrders
        .filter((o) => ['CONFIRMED', 'COMPLETED'].includes(o.status))
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      summary,
      orders
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get order details by ID with full negotiation history
 * @route   GET /api/orders/:id
 * @access  Private (Buyer, Farmer involved or Admin)
 */
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('buyerId', 'fullName email phone state district village profileImage')
      .populate('farmerId', 'fullName email phone state district village profileImage')
      .populate('productId', 'cropName category images unit pricePerUnit quantity qualityGrade harvestDate pickupLocation state district village')
      .populate('offers.senderId', 'fullName role profileImage')
      .populate('cancelledBy', 'fullName role');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const userId = req.user._id.toString();
    const isBuyer = order.buyerId._id.toString() === userId;
    const isFarmer = order.farmerId._id.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isFarmer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Submit a counter-offer in an active negotiation
 * @route   POST /api/orders/:id/offers
 * @access  Private (Buyer or Farmer involved)
 */
const submitCounterOffer = async (req, res, next) => {
  try {
    const { offeredPrice, offeredQuantity, message } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const userId = req.user._id.toString();
    const isBuyer = order.buyerId.toString() === userId;
    const isFarmer = order.farmerId.toString() === userId;

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not a party to this order negotiation'
      });
    }

    // Check order state allows negotiation
    if (['CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot submit counter-offer on an order with status ${order.status}`
      });
    }

    const numPrice = Number(offeredPrice);
    const numQty = Number(offeredQuantity);

    if (isNaN(numPrice) || numPrice <= 0) {
      return res.status(422).json({
        success: false,
        message: 'Offered price must be a positive number'
      });
    }

    if (isNaN(numQty) || numQty <= 0) {
      return res.status(422).json({
        success: false,
        message: 'Offered quantity must be a positive number'
      });
    }

    // Check available stock on the product
    const product = await Product.findById(order.productId);
    if (!product || !product.isActive || product.status === 'deactivated_by_admin') {
      return res.status(400).json({
        success: false,
        message: 'Product listing is no longer active'
      });
    }

    if (numQty > product.quantity) {
      return res.status(400).json({
        success: false,
        message: `Offered quantity (${numQty} ${product.unit}) exceeds currently available stock (${product.quantity} ${product.unit})`
      });
    }

    const senderRole = isFarmer ? 'farmer' : 'buyer';

    // Mark previous pending offers as countered
    order.offers.forEach((o) => {
      if (o.status === 'pending') {
        o.status = 'countered';
      }
    });

    // Add new counter-offer
    order.offers.push({
      senderId: req.user._id,
      senderRole,
      offeredPrice: numPrice,
      offeredQuantity: numQty,
      message: (message || '').trim(),
      status: 'pending'
    });

    order.status = 'NEGOTIATING';
    order.negotiationStatus = senderRole === 'farmer' ? 'FARMER_COUNTER' : 'BUYER_COUNTER';

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('buyerId', 'fullName email phone')
      .populate('farmerId', 'fullName email phone')
      .populate('productId', 'cropName category images unit pricePerUnit quantity qualityGrade')
      .populate('offers.senderId', 'fullName role');

    res.status(200).json({
      success: true,
      message: 'Counter-offer submitted successfully',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Accept or reject a specific offer in negotiation
 * @route   PATCH /api/orders/:id/offers/:offerId/respond
 * @access  Private (Buyer or Farmer receiving the offer)
 */
const respondToOffer = async (req, res, next) => {
  try {
    const { action, message } = req.body; // action: 'accept' | 'reject'

    if (!['accept', 'reject'].includes(action)) {
      return res.status(422).json({
        success: false,
        message: 'Action must be either "accept" or "reject"'
      });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const userId = req.user._id.toString();
    const isBuyer = order.buyerId.toString() === userId;
    const isFarmer = order.farmerId.toString() === userId;

    if (!isBuyer && !isFarmer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to respond to offers on this order'
      });
    }

    if (['CONFIRMED', 'CANCELLED', 'REJECTED', 'COMPLETED'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot respond to offers on an order with status ${order.status}`
      });
    }

    const targetOffer = order.offers.id(req.params.offerId);
    if (!targetOffer) {
      return res.status(404).json({
        success: false,
        message: 'Target offer not found in this order'
      });
    }

    if (targetOffer.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `This offer is already marked as ${targetOffer.status}`
      });
    }

    // Crucial security check: User cannot accept/reject their OWN offer!
    if (targetOffer.senderId.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'You cannot accept or reject your own offer. Awaiting counterparty response.'
      });
    }

    if (action === 'reject') {
      targetOffer.status = 'rejected';
      order.status = 'REJECTED';
      order.negotiationStatus = 'REJECTED';
      if (message) {
        order.cancellationReason = message.trim();
      }
    } else if (action === 'accept') {
      targetOffer.status = 'accepted';

      // Verify stock is still sufficient before agreeing
      const product = await Product.findById(order.productId);
      if (!product || product.quantity < targetOffer.offeredQuantity) {
        return res.status(400).json({
          success: false,
          message: 'Cannot accept offer: Available stock has decreased below the offered quantity.'
        });
      }

      order.agreedPrice = targetOffer.offeredPrice;
      order.agreedQuantity = targetOffer.offeredQuantity;
      order.totalAmount = Math.round(targetOffer.offeredPrice * targetOffer.offeredQuantity * 100) / 100;
      order.status = 'ACCEPTED';
      order.negotiationStatus = 'AGREED';
    }

    await order.save();

    const updatedOrder = await Order.findById(order._id)
      .populate('buyerId', 'fullName email phone state district village')
      .populate('farmerId', 'fullName email phone state district village')
      .populate('productId', 'cropName category images unit pricePerUnit quantity qualityGrade')
      .populate('offers.senderId', 'fullName role');

    res.status(200).json({
      success: true,
      message: action === 'accept'
        ? 'Offer accepted! Terms are agreed. The buyer can now confirm the order contract.'
        : 'Offer rejected. Negotiation has been closed.',
      order: updatedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Explicitly confirm an agreed order and atomically reserve stock (Buyer only)
 * @route   PATCH /api/orders/:id/confirm
 * @access  Private (Buyer)
 */
const confirmOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only the buyer can confirm the agreed contract
    if (order.buyerId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Only the buyer can confirm an agreed order'
      });
    }

    if (order.status === 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: 'This order has already been confirmed'
      });
    }

    if (order.status !== 'ACCEPTED') {
      return res.status(400).json({
        success: false,
        message: `Order cannot be confirmed. Negotiation terms must be accepted first (Current status: ${order.status})`
      });
    }

    if (!order.agreedQuantity || !order.agreedPrice) {
      return res.status(400).json({
        success: false,
        message: 'Agreed quantity and agreed price must be finalized before confirming'
      });
    }

    // ATOMIC STOCK DEDUCTION / RESERVATION
    // Ensure product stock >= agreedQuantity atomically to prevent race conditions & overselling
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: order.productId,
        quantity: { $gte: order.agreedQuantity },
        isActive: true,
        status: { $ne: 'deactivated_by_admin' }
      },
      {
        $inc: { quantity: -order.agreedQuantity }
      },
      { new: true }
    );

    if (!updatedProduct) {
      return res.status(400).json({
        success: false,
        message: `Order confirmation failed: Insufficient product stock available. Another order may have reserved the requested quantity.`
      });
    }

    // If remaining quantity drops to 0, toggle availability status to 'unavailable'
    if (updatedProduct.quantity === 0) {
      await Product.findByIdAndUpdate(order.productId, { status: 'unavailable' });
    }

    order.status = 'CONFIRMED';
    order.confirmedAt = new Date();
    await order.save();

    const confirmedOrder = await Order.findById(order._id)
      .populate('buyerId', 'fullName email phone state district village')
      .populate('farmerId', 'fullName email phone state district village')
      .populate('productId', 'cropName category images unit pricePerUnit quantity qualityGrade')
      .populate('offers.senderId', 'fullName role');

    res.status(200).json({
      success: true,
      message: 'Order confirmed successfully! Stock reserved atomically.',
      order: confirmedOrder,
      remainingStock: updatedProduct.quantity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Cancel order (Buyer, Farmer, or Admin). Restores product stock if confirmed!
 * @route   PATCH /api/orders/:id/cancel
 * @access  Private (Buyer, Farmer, or Admin)
 */
const cancelOrder = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const userId = req.user._id.toString();
    const isBuyer = order.buyerId.toString() === userId;
    const isFarmer = order.farmerId.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isFarmer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to cancel this order'
      });
    }

    if (order.status === 'CANCELLED') {
      return res.status(400).json({
        success: false,
        message: 'Order has already been cancelled'
      });
    }

    if (order.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'Completed orders cannot be cancelled'
      });
    }

    const wasConfirmed = order.status === 'CONFIRMED';

    // ATOMIC STOCK RESTORATION
    // If order was CONFIRMED, restore deducted stock back to the product
    if (wasConfirmed && order.agreedQuantity > 0) {
      await Product.findByIdAndUpdate(order.productId, {
        $inc: { quantity: order.agreedQuantity },
        status: 'available'
      });
    }

    order.status = 'CANCELLED';
    order.negotiationStatus = 'CANCELLED';
    order.cancelledAt = new Date();
    order.cancelledBy = req.user._id;
    order.cancellationReason = (reason || '').trim() || 'Cancelled by user';

    await order.save();

    const cancelledOrder = await Order.findById(order._id)
      .populate('buyerId', 'fullName email phone')
      .populate('farmerId', 'fullName email phone')
      .populate('productId', 'cropName category images unit pricePerUnit quantity qualityGrade')
      .populate('cancelledBy', 'fullName role');

    res.status(200).json({
      success: true,
      message: wasConfirmed
        ? 'Order cancelled successfully. Stock has been restored to the farmer product listing.'
        : 'Order cancelled successfully.',
      order: cancelledOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark order as completed after delivery (Farmer, Buyer, or Admin)
 * @route   PATCH /api/orders/:id/complete
 * @access  Private (Farmer, Buyer, or Admin)
 */
const completeOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const userId = req.user._id.toString();
    const isBuyer = order.buyerId.toString() === userId;
    const isFarmer = order.farmerId.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isBuyer && !isFarmer && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: You are not authorized to complete this order'
      });
    }

    if (order.status !== 'CONFIRMED') {
      return res.status(400).json({
        success: false,
        message: `Only confirmed orders can be marked as completed (Current status: ${order.status})`
      });
    }

    order.status = 'COMPLETED';
    order.completedAt = new Date();
    await order.save();

    const completedOrder = await Order.findById(order._id)
      .populate('buyerId', 'fullName email phone')
      .populate('farmerId', 'fullName email phone')
      .populate('productId', 'cropName category images unit pricePerUnit quantity qualityGrade');

    res.status(200).json({
      success: true,
      message: 'Order marked as completed successfully',
      order: completedOrder
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all orders platform-wide (Admin only)
 * @route   GET /api/admin/orders
 * @access  Private (Admin)
 */
const getAdminOrders = async (req, res, next) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status && status !== 'ALL') {
      query.status = status.toUpperCase();
    }

    if (search && search.trim()) {
      query.orderNumber = new RegExp(search.trim(), 'i');
    }

    const skip = (Math.max(1, parseInt(page, 10)) - 1) * Math.max(1, parseInt(limit, 10));

    const [orders, total, allOrders] = await Promise.all([
      Order.find(query)
        .populate('buyerId', 'fullName email phone state district')
        .populate('farmerId', 'fullName email phone state district')
        .populate('productId', 'cropName category unit pricePerUnit quantity')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit, 10))
        .lean(),
      Order.countDocuments(query),
      Order.find({}).select('status totalAmount').lean()
    ]);

    const summary = {
      totalOrders: allOrders.length,
      pendingCount: allOrders.filter((o) => o.status === 'PENDING').length,
      negotiatingCount: allOrders.filter((o) => o.status === 'NEGOTIATING').length,
      acceptedCount: allOrders.filter((o) => o.status === 'ACCEPTED').length,
      confirmedCount: allOrders.filter((o) => o.status === 'CONFIRMED').length,
      completedCount: allOrders.filter((o) => o.status === 'COMPLETED').length,
      cancelledCount: allOrders.filter((o) => o.status === 'CANCELLED').length,
      grossMarketplaceVolume: allOrders
        .filter((o) => ['CONFIRMED', 'COMPLETED'].includes(o.status))
        .reduce((sum, o) => sum + (o.totalAmount || 0), 0)
    };

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      summary,
      orders
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getBuyerOrders,
  getFarmerOrders,
  getOrderById,
  submitCounterOffer,
  respondToOffer,
  confirmOrder,
  cancelOrder,
  completeOrder,
  getAdminOrders
};
