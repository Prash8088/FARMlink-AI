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

// Dashboards
import { FarmerDashboard } from '../dashboards/farmer/FarmerDashboard';
import { BuyerDashboard } from '../dashboards/buyer/BuyerDashboard';
import { TransporterDashboard } from '../dashboards/transporter/TransporterDashboard';
import { AdminDashboard } from '../dashboards/admin/AdminDashboard';

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

        {/* Farmer Dashboard */}
        <Route
          path="/dashboard/farmer"
          element={
            <ProtectedRoute allowedRoles={['farmer']}>
              <FarmerDashboard />
            </ProtectedRoute>
          }
        />

        {/* Buyer Dashboard */}
        <Route
          path="/dashboard/buyer"
          element={
            <ProtectedRoute allowedRoles={['buyer']}>
              <BuyerDashboard />
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

        {/* Admin Dashboard */}
        <Route
          path="/dashboard/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
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
