import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext.new';
import Layout from './components/layout/Layout';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Public pages
import HomePage from './pages/public/HomePage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';
import RequestPage from './pages/public/RequestPage';
import SearchPage from './pages/public/SearchPage';

// Donor pages
import DonorHome from './pages/donor/DonorHome';
import DonorProfile from './pages/donor/DonorProfile';
import DonorHistory from './pages/donor/DonorHistory';
import ScheduleDonation from './pages/donor/ScheduleDonation';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminInventory from './pages/admin/AdminInventory';
import ScheduleConfirmation from './pages/admin/ScheduleConfirmation';

// Route components with role protection
const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  allowedRoles: ('admin' | 'donor')[];
}> = ({ children, allowedRoles }) => {
  const { user, role, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(role as 'admin' | 'donor')) {
    // Redirect based on actual role
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'donor') {
      return <Navigate to="/donor" replace />;
    } else {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, loading, initialized } = useAuth();

  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect authenticated users to their dashboard
  if (user) {
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (role === 'donor') {
      return <Navigate to="/donor" replace />;
    }
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Router>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/request" element={<RequestPage />} />
          <Route path="/search" element={<SearchPage />} />
          
          {/* Auth routes (redirect if already logged in) */}
          <Route 
            path="/login" 
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            } 
          />
          <Route 
            path="/register" 
            element={
              <PublicRoute>
                <RegisterPage />
              </PublicRoute>
            } 
          />

          {/* Donor routes */}
          <Route 
            path="/donor" 
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorHome />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/profile" 
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorProfile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/history" 
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <DonorHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/donor/schedule" 
            element={
              <ProtectedRoute allowedRoles={['donor']}>
                <ScheduleDonation />
              </ProtectedRoute>
            } 
          />

          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/inventory" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminInventory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/schedule" 
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <ScheduleConfirmation />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;
