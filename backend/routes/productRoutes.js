const express = require('express');
const router = express.Router();
const {
  createProduct,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  updateStatus,
  uploadImages
} = require('../controllers/productController');
const { protect, authorize } = require('../middleware/authMiddleware');
const {
  validateProductInput,
  validateStockUpdate,
  validateStatusUpdate
} = require('../middleware/validationMiddleware');
const {
  uploadMultipleImages,
  processUploadedFiles
} = require('../middleware/uploadMiddleware');

// Dedicated image upload route
router.post(
  '/upload',
  protect,
  authorize('farmer'),
  uploadMultipleImages,
  processUploadedFiles,
  uploadImages
);

// Farmer-specific route for retrieving own products
router.get('/my-products', protect, authorize('farmer'), getMyProducts);

// Create product (Farmer only)
router.post(
  '/',
  protect,
  authorize('farmer'),
  validateProductInput,
  createProduct
);

// Get single product details
router.get('/:id', getProductById);

// Update product (Farmer only - owns product)
router.put(
  '/:id',
  protect,
  authorize('farmer'),
  updateProduct
);

// Delete product (Farmer owns product or Admin)
router.delete(
  '/:id',
  protect,
  authorize('farmer', 'admin'),
  deleteProduct
);

// Update stock (Farmer only)
router.patch(
  '/:id/stock',
  protect,
  authorize('farmer'),
  validateStockUpdate,
  updateStock
);

// Update status (Farmer or Admin)
router.patch(
  '/:id/status',
  protect,
  authorize('farmer', 'admin'),
  updateStatus
);

module.exports = router;
