import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../../components/forms/LoginForm';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { user, role, loading: authLoading, profileLoaded, signIn } = useAuth();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname;

  // Redirect if already logged in and profile is loaded
  useEffect(() => {
    console.log('[LoginPage] Auth state:', { user: !!user, role, authLoading, profileLoaded });
    
    if (!authLoading && user && profileLoaded) {
      let redirectPath = from || '/';
      if (role === 'admin') {
        redirectPath = '/admin';
      } else if (role === 'donor') {
        redirectPath = '/donor';
      }
      
      console.log('[LoginPage] Redirecting to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, role, authLoading, profileLoaded, navigate, from]);

  const handleSubmit = async (data: { email: string; password: string }) => {
    console.log('[LoginPage] Attempting login for:', data.email);
    setLoading(true);
    
    try {
      await signIn(data.email, data.password);
      console.log('[LoginPage] Login successful');
      showToast('Successfully signed in!', 'success');
    } catch (error: unknown) {
      console.error('[LoginPage] Login error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sign in';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state or profile is loading
  if (authLoading || (user && !profileLoaded)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">
            {authLoading ? 'Loading...' : 'Loading your profile...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
          <p className="mt-2 text-gray-600">
            Access your donor account or admin panel
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <LoginForm onSubmit={handleSubmit} loading={loading} />
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link to="/register" className="text-red-600 hover:text-red-700 font-medium">
              Register as a donor
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};