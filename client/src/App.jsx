import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { fetchMe } from './redux/slices/authSlice';

import Navbar from './components/layout/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import PropertiesPage from './pages/properties/PropertiesPage';
import PropertyDetailPage from './pages/properties/PropertyDetailPage';
import PropertyFormPage from './pages/properties/PropertyFormPage';
import MyPropertiesPage from './pages/properties/MyPropertiesPage';
import WishlistPage from './pages/WishlistPage';
import BookingsPage from './pages/BookingsPage';
import EnquiriesPage from './pages/EnquiriesPage';
import AdminPropertiesPage from './pages/admin/AdminPropertiesPage';
import AdminAnalyticsPage from './pages/admin/AdminAnalyticsPage';

function App() {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) dispatch(fetchMe());
  }, [dispatch, token]);

  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* Protected - All authenticated users */}
        <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* Protected - Admin only */}
        <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsersPage /></ProtectedRoute>} />
        <Route path="/admin/properties" element={<ProtectedRoute allowedRoles={['admin']}><AdminPropertiesPage /></ProtectedRoute>} />
        <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalyticsPage /></ProtectedRoute>} />

        {/* Property listings */}
        <Route path="/properties" element={<PropertiesPage />} />
        <Route path="/properties/:id" element={<PropertyDetailPage />} />
        <Route path="/properties/new" element={<ProtectedRoute allowedRoles={['agent', 'admin']}><PropertyFormPage /></ProtectedRoute>} />
        <Route path="/properties/:id/edit" element={<ProtectedRoute allowedRoles={['agent', 'admin']}><PropertyFormPage /></ProtectedRoute>} />
        <Route path="/my-properties" element={<ProtectedRoute allowedRoles={['agent', 'admin']}><MyPropertiesPage /></ProtectedRoute>} />
        <Route path="/agents" element={<div style={{ padding: 48, textAlign: 'center', color: 'var(--text-secondary)' }}>🏗️ Agents page coming in Module 2!</div>} />
        <Route path="/wishlist" element={<ProtectedRoute><WishlistPage /></ProtectedRoute>} />
        <Route path="/bookings" element={<ProtectedRoute><BookingsPage /></ProtectedRoute>} />
        <Route path="/enquiries" element={<ProtectedRoute><EnquiriesPage /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastStyle={{ background: 'var(--bg-card2)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
      />
    </Router>
  );
}

export default App;
