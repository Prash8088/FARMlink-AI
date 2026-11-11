const express = require('express');
const router = express.Router();
const {
  getMarketplaceProducts,
  getMarketplaceProductById,
  getMarketplaceFilters
} = require('../controllers/marketplaceController');
const { protect } = require('../middleware/authMiddleware');

// Public/Authenticated access to active marketplace
router.get('/products', protect, getMarketplaceProducts);
router.get('/products/:id', protect, getMarketplaceProductById);
router.get('/filters', protect, getMarketplaceFilters);

module.exports = router;
