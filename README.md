# FARMlink AI – Intelligent Agricultural Marketplace
## Version 3: Buyer Marketplace, Price Negotiation & Order Management

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-green.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-teal.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Version](https://img.shields.io/badge/FARMlink%20AI-v3.0.0-emerald.svg)](https://github.com)

---

### 1. Project Overview

**FARMlink AI** is a production-style, intelligent agricultural technology platform connecting Indian farmers directly with commercial bulk buyers and certified logistics transporters on one unified platform.

By eliminating predatory middlemen, FARMlink AI restores price transparency, guarantees origin provenance for buyers, and optimizes freight transport directly from farm gates.

- **Version 1 (Completed)**: Core Foundation, Authentication (JWT in HTTP-only Cookie + Bearer), Role-Based Access Control (`farmer`, `buyer`, `transporter`, `admin`), User Profile Management, and 4 Role Dashboards.
- **Version 2 (Completed)**: **Farmer Marketplace Module** — enables authenticated farmers to create, publish, manage, edit, stock-control, and delete agricultural produce listings with multi-image uploads (Cloudinary + local static fallback) and admin directory governance.
- **Version 3 (Active & Complete)**: **Buyer Marketplace, Price Negotiation & Order Management** — enables buyers to discover active produce, submit purchase requests, engage in structured bidirectional price/quantity negotiations with farmers, review complete audit trails, and confirm orders with **atomic stock reservation** and automatic restoration upon cancellation.

---

### 2. Technology Stack

- **Frontend**:
  - React.js 18 with Vite
  - Tailwind CSS 3.4 (Custom agricultural palette)
  - React Router DOM v6
  - Axios with interceptors, credentials & multipart form support
  - Lucide React iconography
- **Backend**:
  - Node.js & Express.js REST API
  - JWT (JSON Web Tokens) with HTTP-only Cookies and Bearer Authorization
  - bcryptjs (12 salt rounds for password hashing)
  - Multer & Cloudinary (dual-mode image storage with local fallback)
  - Express middleware: `helmet`, `morgan`, `cors`, `cookie-parser`, `express-rate-limit`
- **Database**:
  - MongoDB (Local `127.0.0.1:27017` / MongoDB Atlas)
  - Mongoose 8 ODM with embedded schemas, compound indexes, atomic update operators (`$inc`, `$gte`), and text search

---

### 3. Version 3 Features

#### A. Buyer Marketplace (`/marketplace`)
- **Active Produce Feed**: Queries only active, available listings with stock $> 0$.
- **Full-Text & Keyword Search**: Search across crop name, category, description, district, and state.
- **Filter Bar & Detailed Filter Drawer**:
  - Filter by agricultural category (Grains, Pulses, Oilseeds, Vegetables, Fruits, Spices, Cash Crops).
  - Filter by Indian State and District.
  - Filter by Quality Grade (*Grade A Premium, Grade B Standard, Grade C Fair*).
  - Filter by Minimum Available Stock.
  - Filter by Price Range (Min/Max ₹).
- **Multi-Sort Options**: Sort by Newest Listings, Price: Low to High, Price: High to Low, or Largest Available Stock.
- **Marketplace Cards**: Cover photo, quality grade badge, crop name, farmer name, farm location, available stock with unit, asking rate, and instant "View Details & Negotiate" action.

#### B. Product Detail & Purchase Request (`/marketplace/:id`)
- **Multi-Image Photo Gallery**: Carousel and thumbnail selector.
- **Detailed Specifications**: Crop variety, harvest date, pickup hub, quality grade, lot description, and farm provenance.
- **Farmer Profile Card**: Direct provenance details, experience, mandi hub, phone, and email.
- **Interactive Procurement Request Form**:
  - Required quantity input with automatic validation ($Quantity \le AvailableStock$).
  - Offer price per unit (defaults to asking price, editable for negotiation).
  - Live order value calculator: $Quantity \times OfferPrice = TotalAmount$.
  - Delivery location (pre-filled from buyer profile: street address, district, state, pincode).
  - Optional instructions/message to farmer.

#### C. Structured Price & Quantity Negotiation
1. **Initial Bid**: Buyer submits a purchase request with quantity, proposed price per unit, delivery location, and message. Order status initializes to `PENDING` with negotiation status `BUYER_OFFER`.
2. **Farmer Notification & Counter-Offer**: The farmer receives the bid on their dashboard (`/dashboard/farmer/orders`). The farmer can **accept**, **reject**, or submit a **counter-offer** with a revised price, quantity, and justification message (`POST /api/orders/:id/offers`). Order status moves to `NEGOTIATING`.
3. **Buyer Counter-Offer**: The buyer can review the farmer's proposal and either accept, reject, or submit a counter-counter offer.
4. **Negotiation Audit Timeline**: Every offer and counter-offer is preserved in the order's `offers` array with sender ID, role, price, quantity, timestamp, and status.
5. **Mutual Agreement**: When either party accepts an offer, the agreed price and agreed quantity are locked into `agreedPrice`, `agreedQuantity`, `totalAmount`, and the order status advances to `ACCEPTED` (`negotiationStatus: 'AGREED'`).
6. **Security & Anti-Self-Acceptance**: Users cannot accept or reject their own offers; only the counterparty can respond. Third-party users receive `403 Forbidden`.

#### D. Atomic Stock Reservation & Order Lifecycle
- **Explicit Buyer Confirmation (`PATCH /api/orders/:id/confirm`)**:
  - An agreed contract is not confirmed until the buyer explicitly confirms it.
  - Uses an atomic check-and-decrement operation:
    ```javascript
    Product.findOneAndUpdate(
      { _id: order.productId, quantity: { $gte: order.agreedQuantity } },
      { $inc: { quantity: -order.agreedQuantity } },
      { new: true }
    );
    ```
  - **Overselling Prevention**: If another order consumed the stock in the meantime, confirmation is safely rejected. If remaining stock hits 0, product availability is toggled to `unavailable`.
  - Order status advances to `CONFIRMED`.
- **Atomic Stock Restoration upon Cancellation (`PATCH /api/orders/:id/cancel`)**:
  - If a `CONFIRMED` order is cancelled by the buyer, farmer, or admin, the reserved stock is atomically restored to the product listing:
    ```javascript
    Product.findByIdAndUpdate(order.productId, {
      $inc: { quantity: order.agreedQuantity },
      status: 'available'
    });
    ```
- **Order Completion (`PATCH /api/orders/:id/complete`)**:
  - Once the consignment is delivered and verified at the warehouse, order status moves to `COMPLETED`.

#### E. Dashboards & Console Extensions
- **Buyer Dashboard (`/dashboard/buyer`)**: Live procurement metrics (Total Orders, In Negotiation, Confirmed, Total Spend), recent purchase orders table, and direct "Browse Marketplace" banner.
- **Buyer Orders Page (`/dashboard/buyer/orders`)**: Filter by status (All, Negotiations, Confirmed, Completed, Cancelled) with direct links to the negotiation thread.
- **Farmer Dashboard (`/dashboard/farmer`)**: Live sales metrics, incoming purchase bids, confirmed orders, and total produce revenue.
- **Farmer Orders Page (`/dashboard/farmer/orders`)**: Dedicated console for incoming purchase requests with quick "Review & Respond" actions.
- **Admin Orders & Audit (`/dashboard/admin/orders`)**: Platform-wide transaction audit, search by `orderNumber`, status filters, and telemetry.

---

### 4. Database Models

#### A. User Schema (`backend/models/User.js`)
Stores authentication, credentials, and role-specific subdocuments (`farmerDetails`, `buyerDetails`, `transporterDetails`).

#### B. Product Schema (`backend/models/Product.js`)
```javascript
{
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  cropName: { type: String, required: true, trim: true },
  category: {
    type: String,
    required: true,
    enum: [
      'Grains & Cereals', 'Pulses & Lentils', 'Oilseeds', 'Fresh Vegetables',
      'Horticulture & Fruits', 'Spices & Condiments', 'Cash Crops', 'Other'
    ],
    index: true
  },
  description: { type: String, required: true },
  images: { type: [String], required: true },
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, enum: ['kg', 'quintal', 'ton'], default: 'quintal' },
  pricePerUnit: { type: Number, required: true, min: 0 },
  qualityGrade: {
    type: String,
    required: true,
    enum: ['Grade A (Premium)', 'Grade B (Standard)', 'Grade C (Fair/Processing)'],
    default: 'Grade A (Premium)'
  },
  harvestDate: { type: Date, required: true },
  pickupLocation: { type: String, required: true },
  state: { type: String, required: true },
  district: { type: String, required: true },
  village: { type: String, required: true },
  status: { type: String, enum: ['available', 'unavailable', 'deactivated_by_admin'], default: 'available', index: true },
  isActive: { type: Boolean, default: true, index: true },
  viewsCount: { type: Number, default: 0 }
}
```

#### C. Order & Negotiation Schema (`backend/models/Order.js`)
```javascript
{
  orderNumber: { type: String, unique: true, index: true }, // Auto-generated: ORD-XXXXXX-XXXX
  buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
  requestedQuantity: { type: Number, required: true, min: 0.01 },
  agreedQuantity: { type: Number, default: null },
  initialOfferPrice: { type: Number, required: true, min: 0.01 },
  agreedPrice: { type: Number, default: null },
  totalAmount: { type: Number, default: 0 },
  unit: { type: String, required: true, default: 'quintal' },
  deliveryLocation: {
    address: { type: String, required: true },
    village: { type: String },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String }
  },
  buyerMessage: { type: String, default: '' },
  status: {
    type: String,
    enum: ['PENDING', 'NEGOTIATING', 'ACCEPTED', 'CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED'],
    default: 'PENDING',
    index: true
  },
  negotiationStatus: {
    type: String,
    enum: ['BUYER_OFFER', 'FARMER_COUNTER', 'BUYER_COUNTER', 'AGREED', 'REJECTED', 'CANCELLED'],
    default: 'BUYER_OFFER',
    index: true
  },
  offers: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      senderRole: { type: String, enum: ['buyer', 'farmer'], required: true },
      offeredPrice: { type: Number, required: true },
      offeredQuantity: { type: Number, required: true },
      message: { type: String, default: '' },
      status: { type: String, enum: ['pending', 'countered', 'accepted', 'rejected'], default: 'pending' },
      createdAt: { type: Date, default: Date.now }
    }
  ],
  confirmedAt: { type: Date },
  cancelledAt: { type: Date },
  cancellationReason: { type: String, default: '' },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  completedAt: { type: Date }
}
```

---

### 5. API Reference

#### A. Buyer Marketplace Endpoints (`/api/marketplace`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/marketplace/products` | Authenticated | Browse active produce with search, filters (category, state, district, price, quantity), sorting, and pagination |
| `GET` | `/api/marketplace/products/:id` | Authenticated | Single product details with farmer contact and provenance |
| `GET` | `/api/marketplace/filters` | Authenticated | Distinct filter options (categories, states, districts, price ranges) |

#### B. Order & Negotiation Endpoints (`/api/orders`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/orders` | Buyer only | Submit purchase request & initial offer |
| `GET` | `/api/orders/buyer` | Buyer only | Get all purchase orders and negotiation threads for buyer |
| `GET` | `/api/orders/farmer` | Farmer only | Get incoming purchase requests and negotiations for farmer |
| `GET` | `/api/orders/:id` | Buyer / Farmer / Admin | Get full order details and complete negotiation history |
| `POST` | `/api/orders/:id/offers` | Buyer / Farmer | Submit counter-offer in active negotiation |
| `PATCH` | `/api/orders/:id/offers/:offerId/respond` | Counterparty only | Accept (`accept`) or decline (`reject`) an offer |
| `PATCH` | `/api/orders/:id/confirm` | Buyer only | **Confirm agreed order & atomically reserve stock** |
| `PATCH` | `/api/orders/:id/cancel` | Buyer / Farmer / Admin | Cancel order (**atomically restores stock if confirmed**) |
| `PATCH` | `/api/orders/:id/complete` | Buyer / Farmer / Admin | Mark order as fulfilled and completed |

#### C. Admin Governance (`/api/admin`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/admin/orders` | Admin only | Audit all platform transactions and contracts |
| `GET` | `/api/admin/dashboard` | Admin only | Platform counts (users, products, orders, volume) |
| `GET` | `/api/admin/products` | Admin only | View all listings across all farmers |
| `PATCH` | `/api/admin/products/:id/status` | Admin only | Deactivate or restore inappropriate listings |

---

### 6. Automated Testing & Verification

FARMlink AI features an automated test suite across all modules:

```bash
# 1. Run Version 3 Buyer Marketplace, Negotiation & Atomic Stock Tests (20 Tests)
node backend/scripts/testV3OrdersApis.js

# 2. Run Version 2 Farmer Marketplace & Stock Tests (17 Tests)
node backend/scripts/testMarketplaceApis.js

# 3. Run Version 1 Foundation, Auth & RBAC Tests (14 Tests)
node backend/scripts/testApis.js
```

All 51 automated backend test scenarios run and pass with 100% success rate.

---

### 7. Seed Credentials for Local Testing

| Role | Email | Password | Details |
|---|---|---|---|
| **Admin** | `admin@farmlink.ai` | `Admin@FarmLink2026!` | Platform administrator |
| **Farmer (Ramesh)** | `farmer.ramesh@farmlink.ai` | `Password123!` | Organic farmer in Mehsana, Gujarat |
| **Farmer (Kavita)** | `farmer.kavita@farmlink.ai` | `Password123!` | Grape & Onion farmer in Nashik, Maharashtra |
| **Buyer (Ananya)** | `buyer.ananya@farmlink.ai` | `Password123!` | Wholesale Distributor in Bhopal, MP |
| **Transporter (Vikram)** | `transporter.vikram@farmlink.ai` | `Password123!` | Fleet owner in Indore, MP |

To re-seed test users or products:
```bash
node backend/scripts/seedAdmin.js
node backend/scripts/seedProducts.js
```

---

### 8. Running the Application

```bash
# Start Backend (Port 5000)
cd backend
npm run dev

# Start Frontend (Port 5173)
cd frontend
npm run dev
```

Open `http://localhost:5173` in your browser.

---

### 9. Postman Collection

Import `FARMlink-AI-v3.postman_collection.json` into Postman to test all endpoints with pre-configured requests, JWT bearer tokens, and automated variables.
