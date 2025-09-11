import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Layout } from './components/layout/Layout';
import { AuthGuard } from './components/layout/AuthGuard';
import { RoleGuard } from './components/layout/RoleGuard';
import { AdminGuard } from './components/layout/AdminGuard';
import { Toast, useToast } from './components/ui/Toast';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// Public Pages
import { HomePage } from './pages/public/HomePage';
import { SearchPage } from './pages/public/SearchPage';
import { RequestPage } from './pages/public/RequestPage';
import { LoginPage } from './pages/public/LoginPage';
import { RegisterPage } from './pages/public/RegisterPage';
import { CreateProfilePage } from './pages/public/CreateProfilePage';

// Donor Pages
import { DonorHome } from './pages/donor/DonorHome';
import { DonorProfile } from './pages/donor/DonorProfile';
import { ScheduleDonation } from './pages/donor/ScheduleDonation';
import { DonorHistory } from './pages/donor/DonorHistory';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminInventory } from './pages/admin/AdminInventory';
import ScheduleConfirmation from './pages/admin/ScheduleConfirmation';

function AppContent() {
  const { toast, hideToast } = useToast();
  const { initialized, loading } = useAuth();

  // Show loading spinner until auth is initialized and not loading to prevent route flashing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Layout><HomePage /></Layout>} />
        <Route path="/search" element={<Layout><SearchPage /></Layout>} />
        <Route path="/request" element={<Layout><RequestPage /></Layout>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/create-profile" element={<CreateProfilePage />} />

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
          <AdminGuard>
            <Layout><AdminDashboard /></Layout>
          </AdminGuard>
        } />
        <Route path="/admin/inventory" element={
          <AdminGuard>
            <Layout><AdminInventory /></Layout>
          </AdminGuard>
        } />
        <Route path="/admin/schedule" element={
          <AdminGuard>
            <Layout><ScheduleConfirmation /></Layout>
          </AdminGuard>
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