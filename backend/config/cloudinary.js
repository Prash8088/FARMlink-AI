const cloudinary = require('cloudinary').v2;

const isCloudinaryConfigured = () => {
  return (
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET &&
    process.env.CLOUDINARY_CLOUD_NAME !== 'your_cloud_name'
  );
};

if (isCloudinaryConfigured()) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  console.log('[Cloudinary] Configured successfully with cloud:', process.env.CLOUDINARY_CLOUD_NAME);
} else {
  console.log('[Upload] Cloudinary credentials not set or incomplete; local disk storage active for product images.');
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured
};
