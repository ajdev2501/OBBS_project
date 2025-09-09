import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth, type UserRole } from '../contexts/AuthContext.new';
import LoadingSpinner from '../components/ui/LoadingSpinner';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  fallbackPath?: string;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  allowedRoles, 
  fallbackPath = '/' 
}) => {
  const { user, role, loading, initialized } = useAuth();

  // Show loading while initializing
  if (!initialized || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  // Redirect if user doesn't have required role
  if (!user || !allowedRoles.includes(role)) {
    // Determine redirect path based on user role
    let redirectPath = fallbackPath;
    
    if (role === 'admin') {
      redirectPath = '/admin';
    } else if (role === 'donor') {
      redirectPath = '/donor';
    } else {
      redirectPath = '/';
    }
    
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};

export default RoleGuard;
