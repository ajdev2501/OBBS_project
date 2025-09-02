import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { LoadingPage } from '../ui/LoadingSpinner';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: ('public' | 'donor' | 'admin')[];
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ children, allowedRoles }) => {
  const { role, loading } = useAuth();

  if (loading) {
    return <LoadingPage />;
  }

  if (!allowedRoles.includes(role)) {
    // Redirect based on role
    if (role === 'admin') return <Navigate to="/admin" replace />;
    if (role === 'donor') return <Navigate to="/donor" replace />;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};