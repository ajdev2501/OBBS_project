import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingPage } from '../ui/LoadingSpinner';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('public' | 'donor' | 'admin')[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { role, loading, user, initialized, profileLoaded } = useAuth();

  // Show loading while initializing or loading profile
  if (!initialized || loading || (user && !profileLoaded)) {
    return <LoadingPage />;
  }

  // If user doesn't have profile, they might need to complete registration
  if (user && !user.profile) {
    return <Navigate to="/register" replace />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect to appropriate page based on user's role
    let redirectPath = '/';
    if (role === 'admin') {
      redirectPath = '/admin';
    } else if (role === 'donor') {
      redirectPath = '/donor';
    }
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};