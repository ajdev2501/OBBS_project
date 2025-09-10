import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingPage } from '../ui/LoadingSpinner';

interface AdminGuardProps {
  children: React.ReactNode;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children }) => {
  const { user, role, loading, initialized, profileLoaded } = useAuth();

  console.log('[AdminGuard] Current state:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    role,
    loading, 
    initialized,
    profileLoaded
  });

  // Wait for initialization and profile loading
  if (!initialized || loading || (user && !profileLoaded)) {
    console.log('[AdminGuard] Still loading, showing loading page...');
    return <LoadingPage />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('[AdminGuard] No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Redirect to appropriate page if not admin
  if (role !== 'admin') {
    console.log('[AdminGuard] User is not admin, redirecting to appropriate page');
    if (role === 'donor') {
      return <Navigate to="/donor" replace />;
    }
    return <Navigate to="/" replace />;
  }

  console.log('[AdminGuard] Admin user authenticated, rendering admin content');
  return <>{children}</>;
};
