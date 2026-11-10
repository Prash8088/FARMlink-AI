# FARMlink AI – Intelligent Agricultural Marketplace
## Version 1: Foundation, Authentication & Role-Based Dashboards

[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express-4.21-lightgrey.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-green.svg)](https://www.mongodb.com/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-teal.svg)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-6.0-purple.svg)](https://vitejs.dev/)

---

### 1. Project Overview

**FARMlink AI** is a production-style, intelligent agricultural technology platform that bridges Indian farmers directly with commercial bulk buyers and certified logistics transporters on one unified platform.

By eliminating predatory middlemen and unverified intermediaries, FARMlink AI restores price transparency, guarantees genuine origin provenance for buyers, and increases freight utilization for transport providers.

> **Version 1 Scope Notice:**  
> Version 1 focuses strictly on the core architectural foundation: **Role-Based Access Control (RBAC)**, **Authentication**, **Multi-Role User Profiles**, **Four Independent Dashboards**, and **Administrator User Management**. Future modules (AI buyer matching, ML crop price prediction, and marketplace listings) will be introduced in subsequent versions.

---

### 2. Technology Stack

- **Frontend**:
  - React.js 18 with Vite
  - Tailwind CSS 3.4
  - React Router DOM v6
  - Axios with interceptors & credential handling
  - Lucide React iconography
- **Backend**:
  - Node.js & Express.js REST API
  - JWT (JSON Web Tokens) with HTTP-only Cookie and Bearer Authorization
  - bcryptjs (12 salt rounds for password hashing)
  - Express middleware: `helmet`, `morgan`, `cors`, `cookie-parser`, `express-rate-limit`
- **Database**:
  - MongoDB (Local / MongoDB Atlas)
  - Mongoose 8 ODM with embedded schemas and indexing
- **Security**:
  - Strict input sanitization & mass-assignment guards
  - Admin-only routes guarded on the backend
  - Public registration disallows selecting the Admin role
  - Brute-force rate limiting on auth routes
  - Passwords excluded by default (`select: false`)

---

### 3. User Roles & Capabilities

| Role | Public Registration? | Dashboard Route | Key Version 1 Capabilities |
| :--- | :--- | :--- | :--- |
| **Farmer** | Yes (`/register?role=farmer`) | `/dashboard/farmer` | Manage farm specs, crops grown, view baseline stats, view upcoming marketplace actions (produce listings, AI price forecasting) |
| **Agri Buyer** | Yes (`/register?role=buyer`) | `/dashboard/buyer` | Manage commercial procurement details, target categories, view baseline purchase orders, view upcoming RFQ tools |
| **Transporter** | Yes (`/register?role=transporter`) | `/dashboard/transporter` | Manage vehicle registration, capacity, operating corridors, view baseline delivery stats, view upcoming load requests |
| **Admin** | **No** (Controlled Seed Only) | `/dashboard/admin` | Live system overview, total user metrics, recent signups, searchable/filterable user directory, instant account activation/deactivation |

---

### 4. Folder Structure

```text
FARMlink-AI/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection logic
│   ├── controllers/
│   │   ├── authController.js     # Register, Login, Logout, getMe
│   │   ├── userController.js     # Get & Update profile
│   │   └── adminController.js    # Stats, User listing, Status toggle
│   ├── middleware/
│   │   ├── authMiddleware.js     # verifyToken & authorize('role')
│   │   ├── validationMiddleware.js # Input checks & mass-assignment guard
│   │   ├── rateLimiter.js        # Auth and API rate limiters
│   │   └── errorMiddleware.js    # 404 & global exception handler
│   ├── models/
│   │   └── User.js               # Unified Mongoose schema with role subdocs
│   ├── routes/
│   │   ├── authRoutes.js         # /api/auth/*
│   │   ├── userRoutes.js         # /api/users/*
│   │   └── adminRoutes.js        # /api/admin/*
│   ├── scripts/
│   │   ├── seedAdmin.js          # Secure admin and demo account seeder
│   │   └── testApis.js           # 14-point automated test suite
│   ├── utils/
│   │   ├── apiResponse.js        # Centralized JSON response helpers
│   │   ├── jwt.js                # Token signer & cookie helper
│   │   └── logger.js             # Formatted terminal logger
│   ├── server.js                 # Express server bootstrap
│   ├── package.json
│   ├── .env.example
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   └── common/           # Navbar, Sidebar, Footer, StatCard, Badge, Alert, ProtectedRoute
│   │   ├── context/
│   │   │   └── AuthContext.jsx   # Global session state & auth methods
│   │   ├── dashboards/
│   │   │   ├── farmer/FarmerDashboard.jsx
│   │   │   ├── buyer/BuyerDashboard.jsx
│   │   │   ├── transporter/TransporterDashboard.jsx
│   │   │   └── admin/AdminDashboard.jsx
│   │   ├── hooks/
│   │   │   └── useAuth.js
│   │   ├── layouts/
│   │   │   ├── PublicLayout.jsx  # Landing, About, Features, Auth layout
│   │   │   └── DashboardLayout.jsx # Responsive sidebar + topbar layout
│   │   ├── pages/
│   │   │   ├── public/           # LandingPage, AboutPage, FeaturesPage, LoginPage, RegisterPage, NotFoundPage
│   │   │   └── common/           # ProfilePage, EditProfilePage, SettingsPage
│   │   ├── routes/
│   │   │   └── AppRoutes.jsx     # Route definitions and RBAC guards
│   │   ├── services/
│   │   │   ├── api.js            # Axios client with interceptors
│   │   │   ├── authService.js
│   │   │   ├── userService.js
│   │   │   └── adminService.js
│   │   ├── utils/
│   │   │   ├── constants.js      # States, Categories, Vehicles, Roles
│   │   │   └── formatters.js     # Currency, dates, string helpers
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js            # API proxy configuration
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

### 5. Database Schema (`models/User.js`)

```javascript
{
  fullName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, index: true },
  phone: { type: String, required: true, trim: true },
  passwordHash: { type: String, required: true, select: false },
  role: { type: String, enum: ['farmer', 'buyer', 'transporter', 'admin'], default: 'farmer', index: true },
  profileImage: { type: String, default: '' },
  address: { type: String, default: '' },
  state: { type: String, required: true },
  district: { type: String, required: true },
  village: { type: String, required: true },
  
  // Embedded role-specific subdocuments:
  farmerDetails: {
    farmName: String,
    farmLocation: String,
    farmingExperience: Number,
    mainCropsGrown: [String]
  },
  buyerDetails: {
    businessName: String,
    businessType: String,
    businessLocation: String,
    requiredCategories: [String]
  },
  transporterDetails: {
    companyOrIndividualName: String,
    vehicleType: String,
    vehicleRegNumber: String,
    vehicleCapacity: String,
    operatingLocations: [String]
  },
  
  isActive: { type: Boolean, default: true, index: true },
  isVerified: { type: Boolean, default: false },
  createdAt: Date,
  updatedAt: Date
}
```

---

### 6. Backend API Endpoints

#### Authentication (`/api/auth`)
- `POST /api/auth/register` — Public registration for Farmer, Buyer, or Transporter (Rejects Admin).
- `POST /api/auth/login` — Sign in with email and password. Sets HTTP-only cookie and returns JWT.
- `POST /api/auth/logout` — Clears authentication cookie.
- `GET /api/auth/me` — Retrieves current authenticated session user.

#### User Profile (`/api/users`)
- `GET /api/users/profile` — Retrieves the logged-in user's full profile.
- `PUT /api/users/profile` — Updates permitted profile details. Rejects attempts to alter `role`, `isActive`, `isVerified`, or `passwordHash`.

#### Administration (`/api/admin`)
- `GET /api/admin/dashboard` — Live count of total users, farmers, buyers, transporters, active/inactive counts, and recent sign-ups.
- `GET /api/admin/users` — Paginated user directory with search (`?search=`), role filter (`?role=`), and status filter (`?status=`).
- `PATCH /api/admin/users/:id/status` — Toggles or sets user `isActive` flag. Prevents admin self-deactivation.
- `GET /api/admin/statistics` — State distribution and role composition aggregations.

---

### 7. Environment Configuration (`backend/.env`)

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
```

---

### 8. Installation & Execution Instructions

#### Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally on port 27017 OR a MongoDB Atlas connection string in `backend/.env`

#### Step 1: Install Dependencies
```bash
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

#### Step 2: Seed Admin & Demo Accounts
Run the seed script from the backend folder:
```bash
cd backend
npm run seed
```

#### Step 3: Run the Automated API Test Suite
Run the 14-point test suite to verify all routes and RBAC guards:
```bash
node scripts/testApis.js
```

#### Step 4: Start the Backend Server
```bash
cd backend
npm start
# Output: FARMlink AI Server running on http://localhost:5000
```

#### Step 5: Start the Frontend Application
In a separate terminal:
```bash
cd frontend
npm run dev
# Output: Local: http://localhost:5173/
```

Open your browser at **`http://localhost:5173`**.

---

### 9. Demo Login Credentials

For quick evaluation, click the demo buttons on the `/login` page or use these credentials:

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@farmlink.ai` | `Admin@FarmLink2026!` |
| **Farmer** | `farmer.ramesh@farmlink.ai` | `Password123!` |
| **Agri Buyer** | `buyer.ananya@farmlink.ai` | `Password123!` |
| **Transporter** | `transporter.vikram@farmlink.ai` | `Password123!` |

---

### 10. Postman Testing Guide

1. **Login**:
   - `POST http://localhost:5000/api/auth/login`
   - Body: `{"email": "admin@farmlink.ai", "password": "Admin@FarmLink2026!"}`
   - Save the returned `token` from the response JSON.
2. **Access Protected Route**:
   - Set Header: `Authorization: Bearer <token>`
   - `GET http://localhost:5000/api/admin/dashboard`
3. **Register New Farmer**:
   - `POST http://localhost:5000/api/auth/register`
   - Body:
     ```json
     {
       "fullName": "Kishan Lal",
       "email": "kishan@example.com",
       "phone": "+919876543299",
       "password": "Password123!",
       "confirmPassword": "Password123!",
       "role": "farmer",
       "state": "Rajasthan",
       "district": "Jaipur",
       "village": "Amer",
       "farmerDetails": {
         "farmName": "Lal Agro",
         "farmingExperience": 8,
         "mainCropsGrown": ["Bajra", "Mustard"]
       }
     }
     ```
4. **Deactivate User**:
   - `PATCH http://localhost:5000/api/admin/users/<USER_ID>/status`
   - Header: `Authorization: Bearer <ADMIN_TOKEN>`
   - Body: `{"isActive": false}`

---

### 11. Known Limitations & Next Version Roadmap

- **Version 1 Scope**: Focused strictly on Foundation, Authentication, Role Dashboards, Profile Management, and Admin Directory. Transaction data shows actual zero values and is clearly marked as upcoming in Version 2.
- **Version 2 (Planned)**:
  - Direct agricultural crop listings (Crop catalog, image uploads, price per quintal).
  - Machine Learning Crop Price Prediction based on historical mandi data.
  - Direct transporter booking and digital waybill generation.
- **Version 3 (Planned)**:
  - AI-Powered Buyer Matchmaker (recommending top institutional buyers).
  - Farmer Profit Calculator with input cost and market realization simulations.
  - Smart route optimization for multi-farm logistics collection.
