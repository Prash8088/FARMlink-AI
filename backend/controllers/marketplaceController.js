const { Product, PRODUCT_CATEGORIES } = require('../models/Product');
const User = require('../models/User');

/**
 * @desc    Get active, available marketplace products with search, filter, sort & pagination
 * @route   GET /api/marketplace/products
 * @access  Private (Buyer / All authenticated users)
 */
const getMarketplaceProducts = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.max(1, Math.min(50, parseInt(req.query.limit, 10) || 12));
    const skip = (page - 1) * limit;

    const {
      search,
      category,
      state,
      district,
      minPrice,
      maxPrice,
      minQuantity,
      qualityGrade,
      sortBy
    } = req.query;

    // Base query: Only active, available products with stock > 0
    const query = {
      isActive: true,
      status: 'available',
      quantity: { $gt: 0 }
    };

    // Text / keyword search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { cropName: searchRegex },
        { category: searchRegex },
        { description: searchRegex },
        { district: searchRegex },
        { state: searchRegex },
        { village: searchRegex }
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // State filter
    if (state && state.trim()) {
      query.state = new RegExp(`^${state.trim()}$`, 'i');
    }

    // District filter
    if (district && district.trim()) {
      query.district = new RegExp(district.trim(), 'i');
    }

    // Quality Grade filter
    if (qualityGrade && qualityGrade !== 'All') {
      query.qualityGrade = qualityGrade;
    }

    // Price range filters
    if (minPrice !== undefined && minPrice !== '' || maxPrice !== undefined && maxPrice !== '') {
      query.pricePerUnit = {};
      if (minPrice !== undefined && minPrice !== '') {
        const parsedMin = Number(minPrice);
        if (!isNaN(parsedMin)) query.pricePerUnit.$gte = parsedMin;
      }
      if (maxPrice !== undefined && maxPrice !== '') {
        const parsedMax = Number(maxPrice);
        if (!isNaN(parsedMax)) query.pricePerUnit.$lte = parsedMax;
      }
    }

    // Minimum Quantity filter
    if (minQuantity !== undefined && minQuantity !== '') {
      const parsedQty = Number(minQuantity);
      if (!isNaN(parsedQty) && parsedQty > 0) {
        query.quantity.$gte = parsedQty;
      }
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sortBy === 'price_asc') {
      sortOptions = { pricePerUnit: 1 };
    } else if (sortBy === 'price_desc') {
      sortOptions = { pricePerUnit: -1 };
    } else if (sortBy === 'quantity_desc') {
      sortOptions = { quantity: -1 };
    } else if (sortBy === 'oldest') {
      sortOptions = { createdAt: 1 };
    }

    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('farmerId', 'fullName email phone state district village profileImage')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Product.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit) || 1;

    res.status(200).json({
      success: true,
      count: products.length,
      total,
      totalPages,
      currentPage: page,
      limit,
      products
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single product details with farmer information for marketplace
 * @route   GET /api/marketplace/products/:id
 * @access  Private / Public
 */
const getMarketplaceProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('farmerId', 'fullName email phone state district village profileImage createdAt')
      .lean();

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product listing not found'
      });
    }

    // Increment view count asynchronously
    Product.findByIdAndUpdate(req.params.id, { $inc: { viewsCount: 1 } }).exec();

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get distinct filter options (categories, states, districts) for marketplace
 * @route   GET /api/marketplace/filters
 * @access  Private / Public
 */
const getMarketplaceFilters = async (req, res, next) => {
  try {
    const activeProducts = await Product.find({
      isActive: true,
      status: 'available',
      quantity: { $gt: 0 }
    }).select('category state district pricePerUnit').lean();

    const categories = [...new Set(activeProducts.map((p) => p.category))].filter(Boolean);
    const states = [...new Set(activeProducts.map((p) => p.state))].filter(Boolean).sort();
    const districts = [...new Set(activeProducts.map((p) => p.district))].filter(Boolean).sort();

    const prices = activeProducts.map((p) => p.pricePerUnit);
    const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 10000;

    res.status(200).json({
      success: true,
      categories: categories.length > 0 ? categories : PRODUCT_CATEGORIES,
      states,
      districts,
      priceRange: { min: minPrice, max: maxPrice }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMarketplaceProducts,
  getMarketplaceProductById,
  getMarketplaceFilters
};
