import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

// Layouts
import { PublicLayout } from '../layouts/PublicLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';
import { ProtectedRoute } from '../components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { AboutPage } from '../pages/public/AboutPage';
import { FeaturesPage } from '../pages/public/FeaturesPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { NotFoundPage } from '../pages/public/NotFoundPage';

// Common Authenticated Pages
import { ProfilePage } from '../pages/common/ProfilePage';
import { EditProfilePage } from '../pages/common/EditProfilePage';
import { SettingsPage } from '../pages/common/SettingsPage';
import { OrderDetailPage } from '../pages/common/OrderDetailPage';

// Dashboards
import { FarmerDashboard } from '../dashboards/farmer/FarmerDashboard';
import { BuyerDashboard } from '../dashboards/buyer/BuyerDashboard';
import { TransporterDashboard } from '../dashboards/transporter/TransporterDashboard';
import { AdminDashboard } from '../dashboards/admin/AdminDashboard';

// Version 2 Farmer Marketplace Pages
import { FarmerProductsPage } from '../pages/farmer/FarmerProductsPage';
import { AddProductPage } from '../pages/farmer/AddProductPage';
import { EditProductPage } from '../pages/farmer/EditProductPage';
import { ProductDetailPage } from '../pages/farmer/ProductDetailPage';

// Version 3 Buyer Marketplace & Orders Pages
import { MarketplacePage } from '../pages/buyer/MarketplacePage';
import { MarketplaceProductDetailPage } from '../pages/buyer/MarketplaceProductDetailPage';
import { BuyerOrdersPage } from '../pages/buyer/BuyerOrdersPage';
import { FarmerOrdersPage } from '../pages/farmer/FarmerOrdersPage';
import { AdminOrdersPage } from '../pages/admin/AdminOrdersPage';

// Helper component to redirect /dashboard to role-specific dashboard
const DashboardRedirect = () => {
  const { user, getRoleDashboardPath } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getRoleDashboardPath(user.role)} replace />;
};

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages with PublicLayout (Navbar + Footer) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Marketplace Discovery (Version 3) */}
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/marketplace/:id" element={<MarketplaceProductDetailPage />} />
        {/* Public Product Inspection */}
        <Route path="/products/:id" element={<ProductDetailPage />} />
      </Route>

      {/* Authenticated Dashboard Pages with DashboardLayout (Sidebar + Topbar) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Smart Index /dashboard */}
        <Route path="/dashboard" element={<DashboardRedirect />} />

        {/* Farmer Dashboard & Marketplace (Version 2 & 3) */}
        <Route
          path="/dashboard/farmer"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/farmer/products"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/farmer/products/new"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <AddProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/farmer/products/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <EditProductPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/farmer/products/:id"
          element={
            <ProtectedRoute allowedRoles={['farmer', 'admin', 'buyer', 'transporter']}>
              <ProductDetailPage />
            </ProtectedRoute>
          }
        />
        {/* Farmer Incoming Orders & Negotiations */}
        <Route
          path="/dashboard/farmer/orders"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/farmer/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['farmer', 'admin']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Buyer Dashboard & Orders (Version 3) */}
        <Route
          path="/dashboard/buyer"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/buyer/orders"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/buyer/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['buyer', 'admin']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Transporter Dashboard */}
        <Route
          path="/dashboard/transporter"
          element={
            <ProtectedRoute allowedRoles={['transporter']}>
              <TransporterDashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard & Orders Audit */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/orders"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/admin/orders/:id"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />

        {/* Common Profile & Settings Pages */}
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Catch-all 404 */}
      <Route element={<PublicLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};
