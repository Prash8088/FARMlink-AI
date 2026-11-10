const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendTokenResponse, clearTokenCookie } = require('../utils/jwt');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Register a new user (Farmer, Buyer, Transporter)
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const {
      fullName,
      email,
      phone,
      password,
      role,
      state,
      district,
      village,
      address,
      profileImage,
      farmerDetails,
      buyerDetails,
      transporterDetails
    } = req.body;

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return errorResponse(
        res,
        'An account with this email address already exists. Please log in or use another email.',
        409,
        { email: 'Email address is already in use' }
      );
    }

    // Hash password with salt rounds = 12
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(password, salt);

    // Build user object
    const newUserData = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      passwordHash,
      role: role.toLowerCase(),
      state: state.trim(),
      district: district.trim(),
      village: village.trim(),
      address: address ? address.trim() : '',
      profileImage: profileImage || '',
      isActive: true,
      isVerified: false
    };

    // Attach role-specific initial details if provided
    if (role === 'farmer' && farmerDetails) {
      newUserData.farmerDetails = farmerDetails;
    } else if (role === 'buyer' && buyerDetails) {
      newUserData.buyerDetails = buyerDetails;
    } else if (role === 'transporter' && transporterDetails) {
      newUserData.transporterDetails = transporterDetails;
    }

    const user = await User.create(newUserData);

    return sendTokenResponse(
      user,
      201,
      res,
      `Welcome to FARMlink AI, ${user.fullName}! Your ${user.role} account has been registered successfully.`
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login user with email and password
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Explicitly include passwordHash using select
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+passwordHash');

    if (!user) {
      return errorResponse(res, 'Invalid email or password. Please verify your credentials.', 401);
    }

    // Verify password
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return errorResponse(res, 'Invalid email or password. Please verify your credentials.', 401);
    }

    // Verify account active status
    if (!user.isActive) {
      return errorResponse(
        res,
        'Your account has been deactivated by administrator. Please contact support.',
        403
      );
    }

    return sendTokenResponse(user, 200, res, `Login successful. Welcome back, ${user.fullName}!`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Log out user and clear cookie
 * @route   POST /api/auth/logout
 * @access  Public
 */
const logout = async (req, res, next) => {
  try {
    clearTokenCookie(res);
    return successResponse(res, 'You have been logged out successfully.');
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current logged in user
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User account not found.', 404);
    }
    return successResponse(res, 'Current user retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe
};
