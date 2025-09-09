import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getRoleBasedRedirectPath } from '../lib/auth';

export const useAuthRedirect = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (loading) return;

    // If user is authenticated and on login/register page, redirect based on role
    if (user && (location.pathname === '/login' || location.pathname === '/register')) {
      const redirectPath = getRoleBasedRedirectPath(role);
      navigate(redirectPath, { replace: true });
      return;
    }

    // If user is not authenticated and trying to access protected routes
    if (!user && !isPublicRoute(location.pathname)) {
      navigate('/login', { 
        replace: true, 
        state: { from: location.pathname } 
      });
      return;
    }

    // If user has wrong role for current route
    if (user && !hasAccessToRoute(location.pathname, role)) {
      const redirectPath = getRoleBasedRedirectPath(role);
      navigate(redirectPath, { replace: true });
    }
  }, [user, role, loading, location.pathname, navigate]);
};

const isPublicRoute = (pathname: string): boolean => {
  const publicRoutes = ['/', '/search', '/request', '/login', '/register'];
  return publicRoutes.includes(pathname);
};

const hasAccessToRoute = (pathname: string, role: 'public' | 'donor' | 'admin'): boolean => {
  // Admin routes
  if (pathname.startsWith('/admin')) {
    return role === 'admin';
  }

  // Donor routes
  if (pathname.startsWith('/donor')) {
    return role === 'donor';
  }

  // Public routes are accessible to everyone
  if (isPublicRoute(pathname)) {
    return true;
  }

  return false;
};
