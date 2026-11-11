const path = require('path');
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const productRoutes = require('./routes/productRoutes');
const marketplaceRoutes = require('./routes/marketplaceRoutes');
const orderRoutes = require('./routes/orderRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');
const { apiLimiter } = require('./middleware/rateLimiter');

const app = express();

// Connect to MongoDB
connectDB();

// Security HTTP headers
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' }
  })
);

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Body parsers
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

// Cookie parser
app.use(cookieParser());

// Static uploads serving for uploaded product images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// CORS configuration
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173'
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
        return callback(null, true);
      }
      return callback(new Error('CORS policy: Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  })
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'FARMlink AI API',
    version: '3.0.0',
    environment: process.env.NODE_ENV || 'development',
    modules: [
      'Foundation & RBAC (V1)',
      'Farmer Marketplace (V2)',
      'Buyer Marketplace, Price Negotiation & Orders (V3)'
    ]
  });
});

// Apply API rate limiting
app.use('/api', apiLimiter);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/products', productRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/orders', orderRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`===============================================`);
    console.log(` FARMlink AI Server (v2.0) running in ${process.env.NODE_ENV || 'development'} mode`);
    console.log(` Port: ${PORT}`);
    console.log(` Health: http://localhost:${PORT}/api/health`);
    console.log(`===============================================`);
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (err) => {
    console.error(`[Unhandled Rejection] ${err.message}`);
  });
}

module.exports = app;
