import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingPage } from '../ui/LoadingSpinner';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { user, loading, initialized } = useAuth();
  const location = useLocation();

  console.log('[AuthGuard] Current state:', { 
    hasUser: !!user, 
    userEmail: user?.email,
    loading, 
    initialized,
    pathname: location.pathname
  });

  // Wait for initialization
  if (!initialized) {
    console.log('[AuthGuard] Not initialized, showing loading...');
    return <LoadingPage />;
  }

  // Show loading during auth operations
  if (loading) {
    console.log('[AuthGuard] Loading, showing loading page...');
    return <LoadingPage />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log('[AuthGuard] No user, redirecting to login from:', location.pathname);
    return <Navigate to="/login" state={{ from: { pathname: location.pathname } }} replace />;
  }

  console.log('[AuthGuard] User authenticated, rendering children for:', user.email);
  return <>{children}</>;
};