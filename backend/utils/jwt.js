const jwt = require('jsonwebtoken');

const getJwtSecret = () => {
  return process.env.JWT_SECRET || 'farmlink_ai_dev_secret_key_default';
};

const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

const verifyToken = (token) => {
  return jwt.verify(token, getJwtSecret());
};

const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = generateToken(user._id, user.role);

  const cookieExpireDays = parseInt(process.env.COOKIE_EXPIRE, 10) || 7;
  const isProduction = process.env.NODE_ENV === 'production';

  const cookieOptions = {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/'
  };

  // Ensure passwordHash is never returned
  const userObj = user.toObject ? user.toObject() : { ...user };
  delete userObj.passwordHash;

  res.cookie('farmlink_token', token, cookieOptions);

  return res.status(statusCode).json({
    success: true,
    message,
    token,
    user: userObj
  });
};

const clearTokenCookie = (res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('farmlink_token', '', {
    httpOnly: true,
    expires: new Date(0),
    secure: isProduction,
    sameSite: isProduction ? 'strict' : 'lax',
    path: '/'
  });
};

module.exports = {
  generateToken,
  verifyToken,
  sendTokenResponse,
  clearTokenCookie
};
