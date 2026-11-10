const { errorResponse } = require('../utils/apiResponse');

/**
 * 404 Not Found Handler
 */
const notFound = (req, res, next) => {
  errorResponse(res, `Route not found: ${req.originalUrl}`, 404);
};

/**
 * Global Error Handler
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';
  let errors = null;

  // Handle Mongoose duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    const value = err.keyValue ? err.keyValue[field] : '';
    message = `Duplicate value: '${value}' already exists for ${field}. Please use another value.`;
    errors = { [field]: `${field} is already registered` };
  }

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 422;
    errors = {};
    for (const key of Object.keys(err.errors)) {
      errors[key] = err.errors[key].message;
    }
    message = 'Validation error occurred';
  }

  // Handle Mongoose bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Resource not found with id: ${err.value}`;
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid authentication token';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Authentication token has expired';
  }

  console.error(`[API Error] ${req.method} ${req.originalUrl} - ${message}`);
  if (process.env.NODE_ENV !== 'production' && err.stack) {
    console.error(err.stack);
  }

  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = {
  notFound,
  errorHandler
};
