import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/layout/AuthGuard';
import { RoleGuard } from './components/layout/RoleGuard';
import { Toast, useToast } from './components/ui/Toast';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { SearchPage } from './pages/public/SearchPage';
import { RequestPage } from './pages/public/RequestPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';

// Donor Pages
import { DonorHome } from './pages/donor/DonorHome';
import { DonorProfile } from './pages/donor/DonorProfile';
import { ScheduleDonation } from './pages/donor/ScheduleDonation';
import { DonorHistory } from './pages/donor/DonorHistory';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminInventory } from './pages/admin/AdminInventory';
import { ScheduleConfirmation } from './pages/admin/ScheduleConfirmation';

function AppContent() {
  const { toast, hideToast } = useToast();

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/search" element={<Layout><SearchPage /></Layout>} />
        <Route path="/request" element={<Layout><RequestPage /></Layout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Donor Routes */}
        <Route path="/donor" element={
          <AuthGuard>
            <RoleGuard allowedRoles={['donor']}>
              <Layout><DonorHome /></Layout>
            </RoleGuard>
          </AuthGuard>
        } />
        <Route path="/donor/profile" element={
          <AuthGuard>
            <RoleGuard allowedRoles={['donor']}>
              <Layout><DonorProfile /></Layout>
            </RoleGuard>
          </AuthGuard>
        } />
        <Route path="/donor/schedule" element={
          <AuthGuard>
            <RoleGuard allowedRoles={['donor']}>
              <Layout><ScheduleDonation /></Layout>
            </RoleGuard>
          </AuthGuard>
        } />
        <Route path="/donor/history" element={
          <AuthGuard>
            <RoleGuard allowedRoles={['donor']}>
              <Layout><DonorHistory /></Layout>
            </RoleGuard>
          </AuthGuard>
        } />

        {/* Admin Routes */}
        <Route path="/admin" element={
          <AuthGuard>
            <RoleGuard allowedRoles={['admin']}>
              <Layout><AdminDashboard /></Layout>
            </RoleGuard>
          </AuthGuard>
        } />
        <Route path="/admin/inventory" element={
          <AuthGuard>
            <RoleGuard allowedRoles={['admin']}>
              <Layout><AdminInventory /></Layout>
            </RoleGuard>
          </AuthGuard>
        } />
        <Route path="/admin/schedule" element={
          <AuthGuard>
            <RoleGuard allowedRoles={['admin']}>
              <Layout><ScheduleConfirmation /></Layout>
            </RoleGuard>
          </AuthGuard>
        } />
      </Routes>

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;