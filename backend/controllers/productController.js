const { Product } = require('../models/Product');
const { successResponse, errorResponse } = require('../utils/apiResponse');

/**
 * @desc    Create a new agricultural product listing
 * @route   POST /api/products
 * @access  Private (Farmer only)
 */
const createProduct = async (req, res, next) => {
  try {
    const {
      cropName,
      category,
      description,
      images,
      quantity,
      unit,
      pricePerUnit,
      qualityGrade,
      harvestDate,
      pickupLocation,
      state,
      district,
      village
    } = req.body;

    const product = await Product.create({
      farmerId: req.user._id,
      cropName: cropName.trim(),
      category,
      description: description.trim(),
      images: Array.isArray(images) ? images : [images],
      quantity: Number(quantity),
      unit: unit.toLowerCase(),
      pricePerUnit: Number(pricePerUnit),
      qualityGrade,
      harvestDate: new Date(harvestDate),
      pickupLocation: pickupLocation.trim(),
      state: state.trim(),
      district: district.trim(),
      village: village.trim(),
      status: 'available',
      isActive: true
    });

    const populatedProduct = await Product.findById(product._id).populate(
      'farmerId',
      'fullName phone email state district village farmerDetails'
    );

    return successResponse(
      res,
      `Product listing for "${product.cropName}" created successfully!`,
      populatedProduct,
      201
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all products listed by the logged-in farmer
 * @route   GET /api/products/my-products
 * @access  Private (Farmer only)
 */
const getMyProducts = async (req, res, next) => {
  try {
    const {
      search = '',
      category = '',
      status = '',
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = { farmerId: req.user._id };

    if (category) {
      query.category = category;
    }

    if (status) {
      query.status = status;
    }

    if (search.trim()) {
      const regex = new RegExp(search.trim(), 'i');
      query.$or = [{ cropName: regex }, { description: regex }];
    }

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
    const skip = (pageNum - 1) * limitNum;

    const sortOption = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

    const [products, total, totalAvailable, totalUnavailable] = await Promise.all([
      Product.find(query).sort(sortOption).skip(skip).limit(limitNum),
      Product.countDocuments(query),
      Product.countDocuments({ farmerId: req.user._id, status: 'available' }),
      Product.countDocuments({ farmerId: req.user._id, status: 'unavailable' })
    ]);

    return successResponse(res, 'Farmer listings retrieved successfully', {
      products,
      summary: {
        totalListings: total,
        available: totalAvailable,
        unavailable: totalUnavailable
      },
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum) || 1
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product details by ID
 * @route   GET /api/products/:id
 * @access  Public / Private
 */
const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      'farmerId',
      'fullName phone email state district village farmerDetails'
    );

    if (!product) {
      return errorResponse(res, 'Product listing not found', 404);
    }

    // Increment views count asynchronously
    product.viewsCount = (product.viewsCount || 0) + 1;
    await product.save({ validateBeforeSave: false });

    return successResponse(res, 'Product retrieved successfully', product);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update existing product listing
 * @route   PUT /api/products/:id
 * @access  Private (Farmer only - must own product)
 */
const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    // Authorization check: ensure farmer owns this product
    if (product.farmerId.toString() !== req.user._id.toString()) {
      return errorResponse(
        res,
        'Access denied: You do not have permission to modify another farmer\'s product listing.',
        403
      );
    }

    const {
      cropName,
      category,
      description,
      images,
      quantity,
      unit,
      pricePerUnit,
      qualityGrade,
      harvestDate,
      pickupLocation,
      state,
      district,
      village,
      status
    } = req.body;

    if (cropName !== undefined) product.cropName = cropName.trim();
    if (category !== undefined) product.category = category;
    if (description !== undefined) product.description = description.trim();
    if (images !== undefined) product.images = Array.isArray(images) ? images : [images];
    if (quantity !== undefined) product.quantity = Number(quantity);
    if (unit !== undefined) product.unit = unit.toLowerCase();
    if (pricePerUnit !== undefined) product.pricePerUnit = Number(pricePerUnit);
    if (qualityGrade !== undefined) product.qualityGrade = qualityGrade;
    if (harvestDate !== undefined) product.harvestDate = new Date(harvestDate);
    if (pickupLocation !== undefined) product.pickupLocation = pickupLocation.trim();
    if (state !== undefined) product.state = state.trim();
    if (district !== undefined) product.district = district.trim();
    if (village !== undefined) product.village = village.trim();
    if (status !== undefined && ['available', 'unavailable'].includes(status)) {
      product.status = status;
    }

    const updatedProduct = await product.save();

    const populated = await Product.findById(updatedProduct._id).populate(
      'farmerId',
      'fullName phone email state district village farmerDetails'
    );

    return successResponse(
      res,
      `Listing for "${updatedProduct.cropName}" updated successfully.`,
      populated
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete a product listing
 * @route   DELETE /api/products/:id
 * @access  Private (Farmer only - must own product)
 */
const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    // Ownership check
    if (
      product.farmerId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return errorResponse(
        res,
        'Access denied: You do not have permission to delete this product listing.',
        403
      );
    }

    const cropName = product.cropName;
    await Product.findByIdAndDelete(req.params.id);

    return successResponse(res, `Product listing "${cropName}" deleted successfully.`);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update stock / available quantity of a product
 * @route   PATCH /api/products/:id/stock
 * @access  Private (Farmer only - must own product)
 */
const updateStock = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    if (product.farmerId.toString() !== req.user._id.toString()) {
      return errorResponse(
        res,
        'Access denied: You cannot modify stock for another farmer\'s listing.',
        403
      );
    }

    const { quantity } = req.body;
    product.quantity = Number(quantity);

    // Auto mark as unavailable if quantity is 0
    if (product.quantity === 0) {
      product.status = 'unavailable';
    }

    await product.save();

    return successResponse(
      res,
      `Stock updated to ${product.quantity} ${product.unit} for "${product.cropName}".`,
      product
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Toggle or update product availability status
 * @route   PATCH /api/products/:id/status
 * @access  Private (Farmer - must own product, or Admin)
 */
const updateStatus = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return errorResponse(res, 'Product not found', 404);
    }

    // Allow owning farmer or platform admin
    const isOwner = product.farmerId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return errorResponse(
        res,
        'Access denied: You cannot change status for this product.',
        403
      );
    }

    const { status } = req.body;
    if (status) {
      product.status = status;
    } else {
      // Toggle if not explicitly passed
      product.status = product.status === 'available' ? 'unavailable' : 'available';
    }

    await product.save();

    return successResponse(
      res,
      `Product status changed to "${product.status}".`,
      product
    );
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Handle multiple image uploads
 * @route   POST /api/products/upload
 * @access  Private (Farmer only)
 */
const uploadImages = async (req, res, next) => {
  try {
    const urls = req.uploadedImageUrls || [];
    if (urls.length === 0) {
      return errorResponse(res, 'No image files were uploaded', 400);
    }

    return successResponse(res, 'Images uploaded successfully', { urls });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProduct,
  getMyProducts,
  getProductById,
  updateProduct,
  deleteProduct,
  updateStock,
  updateStatus,
  uploadImages
};
