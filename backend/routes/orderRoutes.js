const express = require('express');
const router = express.Router();
const {
  createOrder,
  getBuyerOrders,
  getFarmerOrders,
  getOrderById,
  submitCounterOffer,
  respondToOffer,
  confirmOrder,
  cancelOrder,
  completeOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/authMiddleware');

// Buyer creates initial purchase request
router.post('/', protect, authorize('buyer'), createOrder);

// Role-specific order listings
router.get('/buyer', protect, authorize('buyer'), getBuyerOrders);
router.get('/farmer', protect, authorize('farmer'), getFarmerOrders);

// Single order details & negotiation thread
router.get('/:id', protect, getOrderById);

// Submit counter-offer in active negotiation
router.post('/:id/offers', protect, submitCounterOffer);

// Respond to counter-offer (Accept or Reject)
router.patch('/:id/offers/:offerId/respond', protect, respondToOffer);

// Explicit order confirmation by Buyer (atomically reserves stock)
router.patch('/:id/confirm', protect, authorize('buyer'), confirmOrder);

// Cancel order (Buyer, Farmer, Admin; restores stock if confirmed)
router.patch('/:id/cancel', protect, cancelOrder);

// Mark order as completed
router.patch('/:id/complete', protect, completeOrder);

module.exports = router;
