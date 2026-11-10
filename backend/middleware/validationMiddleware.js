const { errorResponse } = require('../utils/apiResponse');

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

module.exports = {
  validateRegister,
  validateLogin,
  validateProfileUpdate
};
