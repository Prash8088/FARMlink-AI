const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllProducts,
  updateProductStatusByAdmin,
  getStatistics
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

// All routes require authentication and admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/products', getAllProducts);
router.patch('/products/:id/status', updateProductStatusByAdmin);
router.get('/statistics', getStatistics);

module.exports = router;
