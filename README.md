# FARMlink AI – Intelligent Agricultural Marketplace
## Version 2: Farmer Marketplace Module & Production Foundation

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-green.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-teal.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)
[![Version](https://img.shields.io/badge/FARMlink%20AI-v2.0.0-emerald.svg)](https://github.com)

---

### 1. Project Overview

**FARMlink AI** is a production-style, intelligent agricultural technology platform connecting Indian farmers directly with commercial bulk buyers and certified logistics transporters on one unified platform.

By eliminating predatory middlemen, FARMlink AI restores price transparency, guarantees origin provenance for buyers, and optimizes freight transport directly from farm gates.

- **Version 1 (Completed)**: Core Foundation, Authentication (JWT in HTTP-only Cookie + Bearer), Role-Based Access Control (`farmer`, `buyer`, `transporter`, `admin`), User Profile Management, and 4 Role Dashboards.
- **Version 2 (Active & Complete)**: **Farmer Marketplace Module** — enables authenticated farmers to create, publish, manage, edit, stock-control, and delete agricultural produce listings with multi-image uploads (Cloudinary + local static fallback) and admin directory governance.

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
  - MongoDB (Local / MongoDB Atlas)
  - Mongoose 8 ODM with embedded schemas, compound indexes, and text search

---

### 3. Version 2 Features: Farmer Marketplace Module

1. **Add Product Listing**:
   - Crop name, variety, and standard agricultural category (*Grains & Cereals, Pulses & Lentils, Oilseeds, Fresh Vegetables, Horticulture & Fruits, Spices, Cash Crops*).
   - Rich harvest description.
   - Multiple crop inspection photographs (supported via drag-and-drop file upload or image URLs).
   - Available quantity and unit (`kg`, `quintal`, `ton`).
   - Price per unit in INR (₹) with real-time lot valuation calculator ($Quantity \times Price$).
   - Quality grade classification (*Grade A Premium, Grade B Standard, Grade C Fair/Processing*).
   - Harvest date picker.
   - Farm pickup landmark, state, district, and village coordinates (auto-filled from farmer profile).
2. **Product Management**:
   - Dedicated farmer produce catalogue (`/dashboard/farmer/products`).
   - Quick stock adjustment with numeric modal stepper.
   - Instant status toggle between `Available` (live to buyers) and `Unavailable` (paused/reserved).
   - Edit product specs (`/dashboard/farmer/products/:id/edit`).
   - Delete product with safety confirmation modal.
   - Search by crop name/description, filter by category/status, and sort by price, quantity, or date.
3. **Image Upload (Dual-Mode Cloud/Local)**:
   - Multer validation: rejects non-image formats; limits files to 5MB and 5 images per product.
   - Cloudinary integration: when `CLOUDINARY_*` credentials are set in `.env`, images upload to Cloudinary.
   - Local fallback: when Cloudinary is unconfigured or in offline development, images are saved in `backend/uploads/products/` and served statically via Express (`/uploads/products/*`).
   - URLs are stored in MongoDB; raw image binaries are never stored inside MongoDB documents.
4. **Product Detail View**:
   - Public and authenticated inspection page (`/dashboard/farmer/products/:id` & `/products/:id`).
   - Interactive image carousel/thumbnail selector.
   - Farm origin & provenance card (farmer name, phone, district, state, pickup gate landmark).
   - Views counter incremented automatically on each inspection.
5. **Admin Marketplace Directory**:
   - Master product table in Admin Console (`/dashboard/admin?tab=products`).
   - View all listings across all farmers in India.
   - Search by crop or location, filter by category and status.
   - Deactivate inappropriate listings (`deactivated_by_admin`) or restore them with one click.
   - Category-wise crop distribution telemetry in statistics.

---

### 4. Database Schema

#### A. User Schema (`models/User.js`)
Stores authentication, credentials, and role-specific subdocuments (`farmerDetails`, `buyerDetails`, `transporterDetails`).

#### B. Product Schema (`models/Product.js`)
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
  description: { type: String, required: true, trim: true },
  images: { type: [String], required: true }, // Array of hosted URLs (Cloudinary / local)
  quantity: { type: Number, required: true, min: 0 },
  unit: { type: String, required: true, enum: ['kg', 'quintal', 'ton'], default: 'quintal' },
  pricePerUnit: { type: Number, required: true, min: 0 },
  qualityGrade: {
    type: String,
    required: true,
    enum: ['Grade A (Premium)', 'Grade B (Standard)', 'Grade C (Fair/Processing)']
  },
  harvestDate: { type: Date, required: true },
  pickupLocation: { type: String, required: true, trim: true },
  state: { type: String, required: true, trim: true },
  district: { type: String, required: true, trim: true },
  village: { type: String, required: true, trim: true },
  status: {
    type: String,
    enum: ['available', 'unavailable', 'deactivated_by_admin'],
    default: 'available',
    index: true
  },
  isActive: { type: Boolean, default: true, index: true },
  viewsCount: { type: Number, default: 0 },
  createdAt: Date,
  updatedAt: Date
}
```

---

### 5. Backend REST API Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register Farmer, Buyer, or Transporter (Admin restricted).
- `POST /api/auth/login` — Sign in, set HTTP-only cookie, and return JWT.
- `POST /api/auth/logout` — Invalidate session and clear auth cookie.
- `GET /api/auth/me` — Return current authenticated user.

#### User Profile (`/api/users`)
- `GET /api/users/profile` — Retrieve full profile of logged-in user.
- `PUT /api/users/profile` — Update permitted profile fields (role/status protected).

#### Product Marketplace (`/api/products`) — *Version 2*
- `POST /api/products` — Create a crop listing (Farmer only).
- `GET /api/products/my-products` — Get listings created by the logged-in farmer (Farmer only).
- `GET /api/products/:id` — Get product inspection details and increment view count (Public/Auth).
- `PUT /api/products/:id` — Update listing details (Farmer must own product).
- `DELETE /api/products/:id` — Delete listing (Farmer must own product, or Admin).
- `PATCH /api/products/:id/stock` — Update available quantity (Farmer only).
- `PATCH /api/products/:id/status` — Toggle available/unavailable status (Farmer or Admin).
- `POST /api/products/upload` — Upload multiple image files (Multer + Cloudinary/local fallback).

#### Admin Operations (`/api/admin`)
- `GET /api/admin/dashboard` — Platform telemetry (Users, Farmers, Buyers, Transporters, Products, Active counts).
- `GET /api/admin/users` — Searchable & filterable user directory.
- `PATCH /api/admin/users/:id/status` — Activate or deactivate user accounts.
- `GET /api/admin/products` — Master directory of all farmer listings across India (*Version 2*).
- `PATCH /api/admin/products/:id/status` — Deactivate inappropriate listings (*Version 2*).
- `GET /api/admin/statistics` — State and product category distribution analytics.

---

### 6. Environment Configuration (`backend/.env`)

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGODB_URI=mongodb://127.0.0.1:27017/farmlink_ai
JWT_SECRET=farmlink_ai_super_secret_jwt_key_2026_secure_random
JWT_EXPIRE=7d
COOKIE_EXPIRE=7

# Default Administrator Seed Credentials
ADMIN_NAME=Platform Administrator
ADMIN_EMAIL=admin@farmlink.ai
ADMIN_PASSWORD=Admin@FarmLink2026!
ADMIN_PHONE=+919876543210
ADMIN_STATE=Karnataka
ADMIN_DISTRICT=Bengaluru Urban
ADMIN_VILLAGE=Bengaluru Central

# Cloudinary Image Storage (Optional - Falls back to local disk storage if not set)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### 7. Step-by-Step Execution Guide

#### Step 1: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

#### Step 2: Seed Database
```bash
# Seed default Admin and sample accounts
cd backend
node scripts/seedAdmin.js

# Seed sample crop listings (Wheat, Mustard, Onions, Grapes)
node scripts/seedProducts.js
```

#### Step 3: Run Automated Test Suites
```bash
cd backend

# Run Version 1 Test Suite (14 tests)
node scripts/testApis.js

# Run Version 2 Marketplace Test Suite (17 tests)
node scripts/testMarketplaceApis.js
```

#### Step 4: Run Application
```bash
# Terminal 1: Backend Server (Port 5000)
cd backend
npm start

# Terminal 2: Frontend Dev Server (Port 5173)
cd frontend
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

### 8. Demo User Credentials

| Role | Email Address | Password | Portal Features |
| :--- | :--- | :--- | :--- |
| **Farmer (Ramesh Patel)** | `farmer.ramesh@farmlink.ai` | `Password123!` | Create & manage produce listings, update stock, upload crop photos |
| **Farmer (Kavita Sundaram)**| `farmer.kavita@farmlink.ai` | `Password123!` | Manage onion & table grape listings, adjust rates |
| **Agri Buyer (Ananya Sharma)**| `buyer.ananya@farmlink.ai` | `Password123!` | Inspect farm produce provenance, commercial specs |
| **Transporter (Vikram Singh)**| `transporter.vikram@farmlink.ai` | `Password123!` | Fleet profile, vehicle capacities |
| **Administrator** | `admin@farmlink.ai` | `Admin@FarmLink2026!` | Master user directory & all-farmer product moderation |

---

### 9. Postman Testing Guide

1. **Farmer Login**:
   - `POST http://localhost:5000/api/auth/login`
   - Body: `{"email": "farmer.ramesh@farmlink.ai", "password": "Password123!"}`
   - Save returned `token`.
2. **Create Crop Listing (`POST /api/products`)**:
   - Header: `Authorization: Bearer <FARMER_TOKEN>`
   - Body:
     ```json
     {
       "cropName": "Organic Basmati Rice 1121",
       "category": "Grains & Cereals",
       "description": "Extra-long grain aromatic basmati rice. Sun-dried and aged 12 months.",
       "quantity": 150,
       "unit": "quintal",
       "pricePerUnit": 4200,
       "qualityGrade": "Grade A (Premium)",
       "harvestDate": "2026-10-30",
       "pickupLocation": "Gate 1, Golden Field Farm, Highway Rd",
       "state": "Gujarat",
       "district": "Mehsana",
       "village": "Kadi",
       "images": ["https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=800"]
     }
     ```
3. **Get Farmer's Listings (`GET /api/products/my-products`)**:
   - Header: `Authorization: Bearer <FARMER_TOKEN>`
4. **Update Available Stock (`PATCH /api/products/:id/stock`)**:
   - Header: `Authorization: Bearer <FARMER_TOKEN>`
   - Body: `{"quantity": 120}`
5. **Admin Moderate Listing (`PATCH /api/admin/products/:id/status`)**:
   - Header: `Authorization: Bearer <ADMIN_TOKEN>`
   - Body: `{"status": "deactivated_by_admin"}`

---

### 10. Version 3 Roadmap

- **Direct Buyer Contracting & RFQs**: Buyers can initiate escrow-backed purchase agreements for listed crops.
- **ML Crop Price Forecasting**: Machine learning models predicting mandi crop rates over a 30-day horizon.
- **Smart Logistics Dispatch**: Automated vehicle load matching and digital e-Waybill generation.
- **AI Buyer Matching**: Intelligent matchmaking connecting growers with institutional bulk procurement buyers.
