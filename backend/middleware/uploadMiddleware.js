const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Ensure local uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads', 'products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage for local saving
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const cleanName = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9]/g, '-')
      .toLowerCase();
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${cleanName}-${uniqueSuffix}${ext}`);
  }
});

// File filter: accept only jpeg, jpg, png, webp
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const mimeMatch = allowedTypes.test(file.mimetype.toLowerCase());
  const extMatch = allowedTypes.test(path.extname(file.originalname).toLowerCase());

  if (mimeMatch && extMatch) {
    return cb(null, true);
  }
  cb(
    new Error(
      'Invalid file format. Only JPEG, JPG, PNG, and WEBP image files are allowed.'
    ),
    false
  );
};

// Multer upload instance
const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB per file
  },
  fileFilter
});

/**
 * Middleware to process uploaded files:
 * Uploads to Cloudinary if configured; otherwise serves from local disk storage.
 */
const processUploadedFiles = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return next();
    }

    const imageUrls = [];

    if (isCloudinaryConfigured()) {
      // Upload each file to Cloudinary
      for (const file of req.files) {
        const result = await cloudinary.uploader.upload(file.path, {
          folder: 'farmlink_products',
          resource_type: 'image'
        });
        imageUrls.push(result.secure_url);

        // Remove local file after successful Cloudinary upload
        try {
          fs.unlinkSync(file.path);
        } catch (e) {
          // ignore cleanup errors
        }
      }
    } else {
      // Local storage fallback: construct URL path
      for (const file of req.files) {
        const localUrl = `/uploads/products/${file.filename}`;
        imageUrls.push(localUrl);
      }
    }

    req.uploadedImageUrls = imageUrls;
    next();
  } catch (error) {
    console.error('[Upload Middleware Error]', error);
    next(new Error(`Image upload failed: ${error.message}`));
  }
};

module.exports = {
  uploadMultipleImages: upload.array('images', 5),
  processUploadedFiles
};
