const User = require('../models/User');
const { Product } = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Get Admin Dashboard Summary & Counts
 * @route   GET /api/admin/dashboard
 * @access  Private (Admin only)
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalFarmers,
      totalBuyers,
      totalTransporters,
      totalAdmins,
      activeUsers,
      inactiveUsers,
      recentUsers,
      totalProducts,
      availableProducts
    ] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: 'farmer' }),
      User.countDocuments({ role: 'buyer' }),
      User.countDocuments({ role: 'transporter' }),
      User.countDocuments({ role: 'admin' }),
      User.countDocuments({ isActive: true }),
      User.countDocuments({ isActive: false }),
      User.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .select('fullName email phone role state district isActive isVerified createdAt'),
      Product.countDocuments({}),
      Product.countDocuments({ status: 'available' })
    ]);

    const stats = {
      totalUsers,
      totalFarmers,
      totalBuyers,
      totalTransporters,
      totalAdmins,
      activeUsers,
      inactiveUsers,
      totalProducts,
      availableProducts,
      recentRegistrations: recentUsers
    };

    return successResponse(res, 'Admin dashboard statistics retrieved successfully', stats);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users with search, role filter, status filter, and pagination
 * @route   GET /api/admin/users
 * @access  Private (Admin only)
 */
const getAllUsers = async (req, res, next) => {
  try {
    const {
      search = '',
      role = '',
      status = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filter by role if specified
    if (role && ['farmer', 'buyer', 'transporter', 'admin'].includes(role.toLowerCase())) {
      query.role = role.toLowerCase();
    }

    // Filter by status if specified
    if (status === 'active') {
      query.isActive = true;
    } else if (status === 'inactive') {
      query.isActive = false;
    }

    // Search by name, email, or phone
    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ fullName: regex }, { email: regex }, { phone: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const sortOption = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum)
        .select('-farmerDetails -buyerDetails -transporterDetails'),
      User.countDocuments(query)
    ]);

    return successResponse(res, 'Users retrieved successfully', {
      users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle or update user active status (Activate / Deactivate)
 * @route   PATCH /api/admin/users/:id/status
 * @access  Private (Admin only)
 */
const updateUserStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findById(id);
    if (!user) {
      return errorResponse(res, 'User not found', 404);
    }

    // Prevent admin from deactivating their own account
    if (user._id.toString() === req.user._id.toString()) {
      return errorResponse(
        res,
        'Action forbidden: You cannot deactivate your own administrative account.',
        400
      );
    }

    // If isActive is explicitly provided, use it; otherwise toggle
    user.isActive = typeof isActive === 'boolean' ? isActive : !user.isActive;
    await user.save();

    const actionText = user.isActive ? 'activated' : 'deactivated';
    return successResponse(
      res,
      `User '${user.fullName}' has been ${actionText} successfully.`,
      user
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all product listings across all farmers
 * @route   GET /api/admin/products
 * @access  Private (Admin only)
 */
const getAllProducts = async (req, res, next) => {
  try {
    const {
      search = '',
      category = '',
      status = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    if (category) query.category = category;
    if (status) query.status = status;

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ cropName: regex }, { description: regex }, { pickupLocation: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const sortOption = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('farmerId', 'fullName email phone state district village')
        .sort(sortOption)
        .skip(skip)
        .limit(limitNum),
      Product.countDocuments(query)
    ]);

    return successResponse(res, 'Admin product directory retrieved successfully', {
      products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Deactivate or update product listing status (Admin control)
 * @route   PATCH /api/admin/products/:id/status
 * @access  Private (Admin only)
 */
const updateProductStatusByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const product = await Product.findById(id);
    if (!product) {
      return errorResponse(res, 'Product listing not found', 404);
    }

    if (status) {
      product.status = status;
    } else {
      product.status =
        product.status === 'deactivated_by_admin' ? 'available' : 'deactivated_by_admin';
    }

    await product.save();

    return successResponse(
      res,
      `Listing for "${product.cropName}" status set to "${product.status}" by administrator.`,
      product
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get detailed platform statistics & geographic distribution
 * @route   GET /api/admin/statistics
 * @access  Private (Admin only)
 */
const getStatistics = async (req, res, next) => {
  try {
    const [
      roleDistribution,
      stateDistribution,
      totalCount,
      productCategoryStats,
      totalProductCount
    ] = await Promise.all([
      User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ]),
      User.aggregate([
        {
          $group: {
            _id: '$state',
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      User.countDocuments({}),
      Product.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            totalQuantity: { $sum: '$quantity' }
          }
        },
        { $sort: { count: -1 } }
      ]),
      Product.countDocuments({})
    ]);

    return successResponse(res, 'Platform statistics retrieved successfully', {
      totalUsers: totalCount,
      roleDistribution,
      stateDistribution,
      totalProducts: totalProductCount,
      productCategoryStats
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardStats,
  getAllUsers,
  updateUserStatus,
  getAllProducts,
  updateProductStatusByAdmin,
  getStatistics
};
