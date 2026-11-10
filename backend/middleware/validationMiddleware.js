const { errorResponse } = require('../utils/apiResponse');
const { PRODUCT_CATEGORIES, QUALITY_GRADES, MEASUREMENT_UNITS } = require('../models/Product');

// Email regex
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Phone regex: 10-15 digits, allows leading +
const phoneRegex = /^(\+?\d{1,4}[- ]?)?\d{10}$/;

/**
 * Validate registration input
 */
const validateRegister = (req, res, next) => {
  const {
    fullName,
    email,
    phone,
    password,
    confirmPassword,
    role,
    state,
    district,
    village
  } = req.body;

  const errors = {};

  if (!fullName || typeof fullName !== 'string' || fullName.trim().length < 2) {
    errors.fullName = 'Full name is required (minimum 2 characters)';
  }

  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'A valid email address is required';
  }

  if (!phone || !phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'A valid 10-digit mobile number is required';
  }

  if (!password || password.length < 8) {
    errors.password = 'Password must be at least 8 characters long';
  } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
    errors.password = 'Password must contain at least one uppercase letter, one lowercase letter, and one number';
  }

  if (!confirmPassword) {
    errors.confirmPassword = 'Password confirmation is required';
  } else if (password !== confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  // Strictly disallow 'admin' in public registration
  const allowedPublicRoles = ['farmer', 'buyer', 'transporter'];
  if (!role || !allowedPublicRoles.includes(role.toLowerCase())) {
    errors.role = 'Role must be one of: farmer, buyer, or transporter';
  }

  if (!state || typeof state !== 'string' || state.trim().length === 0) {
    errors.state = 'State is required';
  }

  if (!district || typeof district !== 'string' || district.trim().length === 0) {
    errors.district = 'District is required';
  }

  if (!village || typeof village !== 'string' || village.trim().length === 0) {
    errors.village = 'Village or city is required';
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse(res, 'Validation failed. Please correct the fields.', 422, errors);
  }

  // Sanitize body role
  req.body.role = role.toLowerCase();
  next();
};

/**
 * Validate login input
 */
const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  const errors = {};

  if (!email || !emailRegex.test(email.trim())) {
    errors.email = 'A valid email address is required';
  }

  if (!password || password.trim().length === 0) {
    errors.password = 'Password is required';
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse(res, 'Validation failed. Please correct the fields.', 422, errors);
  }

  next();
};

/**
 * Validate and sanitize profile update
 */
const validateProfileUpdate = (req, res, next) => {
  const disallowedFields = ['role', 'isActive', 'isVerified', 'passwordHash', '_id', 'email'];
  const errors = {};

  for (const field of disallowedFields) {
    if (req.body[field] !== undefined) {
      errors[field] = `Modifying '${field}' is not permitted`;
    }
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse(res, 'Security error: Unauthorized field modification attempt.', 403, errors);
  }

  if (req.body.phone && !phoneRegex.test(req.body.phone.replace(/[\s-]/g, ''))) {
    errors.phone = 'Invalid phone number format';
    return errorResponse(res, 'Validation failed', 422, errors);
  }

  next();
};

/**
 * Validate product creation input
 */
const validateProductInput = (req, res, next) => {
  const {
    cropName,
    category,
    description,
    quantity,
    unit,
    pricePerUnit,
    qualityGrade,
    harvestDate,
    pickupLocation,
    state,
    district,
    village,
    images
  } = req.body;

  const errors = {};

  if (!cropName || typeof cropName !== 'string' || cropName.trim().length < 2) {
    errors.cropName = 'Crop name is required (minimum 2 characters)';
  }

  if (!category || !PRODUCT_CATEGORIES.includes(category)) {
    errors.category = `Valid category is required (${PRODUCT_CATEGORIES.join(', ')})`;
  }

  if (!description || typeof description !== 'string' || description.trim().length < 10) {
    errors.description = 'Detailed description is required (minimum 10 characters)';
  }

  const numQuantity = Number(quantity);
  if (quantity === undefined || isNaN(numQuantity) || numQuantity <= 0) {
    errors.quantity = 'Available quantity must be a positive number greater than 0';
  }

  if (!unit || !MEASUREMENT_UNITS.includes(unit.toLowerCase())) {
    errors.unit = `Unit must be one of: ${MEASUREMENT_UNITS.join(', ')}`;
  }

  const numPrice = Number(pricePerUnit);
  if (pricePerUnit === undefined || isNaN(numPrice) || numPrice <= 0) {
    errors.pricePerUnit = 'Price per unit must be a positive number greater than 0';
  }

  if (!qualityGrade || !QUALITY_GRADES.includes(qualityGrade)) {
    errors.qualityGrade = `Quality grade must be one of: ${QUALITY_GRADES.join(', ')}`;
  }

  if (!harvestDate || isNaN(new Date(harvestDate).getTime())) {
    errors.harvestDate = 'A valid harvest date is required';
  }

  if (!pickupLocation || typeof pickupLocation !== 'string' || pickupLocation.trim().length === 0) {
    errors.pickupLocation = 'Farm pickup location is required';
  }

  if (!state || typeof state !== 'string' || state.trim().length === 0) {
    errors.state = 'State is required';
  }

  if (!district || typeof district !== 'string' || district.trim().length === 0) {
    errors.district = 'District is required';
  }

  if (!village || typeof village !== 'string' || village.trim().length === 0) {
    errors.village = 'Village or city is required';
  }

  // Combine images from body and/or uploaded files
  let allImages = [];
  if (req.uploadedImageUrls && req.uploadedImageUrls.length > 0) {
    allImages = allImages.concat(req.uploadedImageUrls);
  }
  if (images) {
    if (Array.isArray(images)) {
      allImages = allImages.concat(images);
    } else if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) allImages = allImages.concat(parsed);
        else allImages.push(images);
      } catch (e) {
        allImages.push(images);
      }
    }
  }

  allImages = allImages.filter(Boolean);

  if (allImages.length === 0) {
    errors.images = 'At least one product image is required';
  } else {
    req.body.images = allImages;
  }

  if (Object.keys(errors).length > 0) {
    return errorResponse(res, 'Validation failed. Please correct product details.', 422, errors);
  }

  // Normalize fields
  req.body.quantity = numQuantity;
  req.body.pricePerUnit = numPrice;
  req.body.unit = unit.toLowerCase();
  next();
};

/**
 * Validate stock update
 */
const validateStockUpdate = (req, res, next) => {
  const { quantity } = req.body;
  const numQuantity = Number(quantity);

  if (quantity === undefined || isNaN(numQuantity) || numQuantity < 0) {
    return errorResponse(res, 'Quantity must be a non-negative number (0 or higher)', 422, {
      quantity: 'Invalid quantity'
    });
  }

  req.body.quantity = numQuantity;
  next();
};

/**
 * Validate status update
 */
const validateStatusUpdate = (req, res, next) => {
  const { status } = req.body;
  const allowedStatuses = ['available', 'unavailable', 'deactivated_by_admin'];

  if (!status || !allowedStatuses.includes(status)) {
    return errorResponse(res, `Status must be one of: ${allowedStatuses.join(', ')}`, 422, {
      status: 'Invalid status'
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validateProductInput,
  validateStockUpdate,
  validateStatusUpdate
};
