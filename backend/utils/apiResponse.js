/**
 * Standardized API Response Helpers
 */

const successResponse = (res, message, data = null, statusCode = 200) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data })
  };
  return res.status(statusCode).json(response);
};

const errorResponse = (res, message, statusCode = 400, errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors !== null && { errors })
  };
  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};
