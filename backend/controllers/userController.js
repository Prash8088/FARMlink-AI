const User = require('../models/User');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Get user profile
 * @route   GET /api/users/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User profile not found.', 404);
    }
    return successResponse(res, 'Profile retrieved successfully', user);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update user profile (Permitted fields only)
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return errorResponse(res, 'User profile not found.', 404);
    }

    const {
      fullName,
      phone,
      address,
      state,
      district,
      village,
      profileImage,
      farmerDetails,
      buyerDetails,
      transporterDetails
    } = req.body;

    // Update common allowed fields if provided
    if (fullName !== undefined) user.fullName = fullName.trim();
    if (phone !== undefined) user.phone = phone.trim();
    if (address !== undefined) user.address = address.trim();
    if (state !== undefined) user.state = state.trim();
    if (district !== undefined) user.district = district.trim();
    if (village !== undefined) user.village = village.trim();
    if (profileImage !== undefined) user.profileImage = profileImage;

    // Update role-specific allowed details based on user's actual role
    if (user.role === 'farmer' && farmerDetails && typeof farmerDetails === 'object') {
      if (farmerDetails.farmName !== undefined) {
        user.farmerDetails.farmName = farmerDetails.farmName.trim();
      }
      if (farmerDetails.farmLocation !== undefined) {
        user.farmerDetails.farmLocation = farmerDetails.farmLocation.trim();
      }
      if (farmerDetails.farmingExperience !== undefined) {
        user.farmerDetails.farmingExperience = Number(farmerDetails.farmingExperience) || 0;
      }
      if (Array.isArray(farmerDetails.mainCropsGrown)) {
        user.farmerDetails.mainCropsGrown = farmerDetails.mainCropsGrown
          .map((c) => String(c).trim())
          .filter(Boolean);
      }
    } else if (user.role === 'buyer' && buyerDetails && typeof buyerDetails === 'object') {
      if (buyerDetails.businessName !== undefined) {
        user.buyerDetails.businessName = buyerDetails.businessName.trim();
      }
      if (buyerDetails.businessType !== undefined) {
        user.buyerDetails.businessType = buyerDetails.businessType.trim();
      }
      if (buyerDetails.businessLocation !== undefined) {
        user.buyerDetails.businessLocation = buyerDetails.businessLocation.trim();
      }
      if (Array.isArray(buyerDetails.requiredCategories)) {
        user.buyerDetails.requiredCategories = buyerDetails.requiredCategories
          .map((c) => String(c).trim())
          .filter(Boolean);
      }
    } else if (
      user.role === 'transporter' &&
      transporterDetails &&
      typeof transporterDetails === 'object'
    ) {
      if (transporterDetails.companyOrIndividualName !== undefined) {
        user.transporterDetails.companyOrIndividualName =
          transporterDetails.companyOrIndividualName.trim();
      }
      if (transporterDetails.vehicleType !== undefined) {
        user.transporterDetails.vehicleType = transporterDetails.vehicleType.trim();
      }
      if (transporterDetails.vehicleRegNumber !== undefined) {
        user.transporterDetails.vehicleRegNumber = transporterDetails.vehicleRegNumber.trim();
      }
      if (transporterDetails.vehicleCapacity !== undefined) {
        user.transporterDetails.vehicleCapacity = transporterDetails.vehicleCapacity.trim();
      }
      if (Array.isArray(transporterDetails.operatingLocations)) {
        user.transporterDetails.operatingLocations = transporterDetails.operatingLocations
          .map((loc) => String(loc).trim())
          .filter(Boolean);
      }
    }

    const updatedUser = await user.save();

    return successResponse(
      res,
      'Your profile has been updated successfully.',
      updatedUser
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile
};
