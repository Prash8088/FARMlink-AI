const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const { errorResponse } = require('../utils/apiResponse');

/**
 * Protect routes - Verifies JWT from cookie or Authorization header
 */
const protect = async (req, res, next) => {
  let token;

  // Check HTTP-only cookie first
  if (req.cookies && req.cookies.farmlink_token) {
    token = req.cookies.farmlink_token;
  }
  // Check Authorization header fallback: 'Bearer <token>'
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return errorResponse(res, 'Authentication required. Please log in to proceed.', 401);
  }

  try {
    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id);

    if (!user) {
      return errorResponse(res, 'Account no longer exists.', 401);
    }

    if (!user.isActive) {
      return errorResponse(
        res,
        'Your account has been deactivated. Please contact support.',
        403
      );
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return errorResponse(res, 'Session expired. Please log in again.', 401);
    }
    return errorResponse(res, 'Invalid token. Authorization denied.', 401);
  }
};

/**
 * Authorize roles - e.g. authorize('admin'), authorize('farmer', 'admin')
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 'User not authenticated', 401);
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        `Access denied. Role '${req.user.role}' is not authorized for this action.`,
        403
      );
    }

    next();
  };
};

module.exports = {
  protect,
  authorize
};
