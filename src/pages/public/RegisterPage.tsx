import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../../components/forms/RegisterForm';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, role, loading: authLoading, profileLoaded, signUp } = useAuth();

  // Redirect if already logged in and profile is loaded
  useEffect(() => {
    if (!authLoading && user && profileLoaded) {
      // If user exists but no profile, redirect to profile creation
      if (!user.profile) {
        console.log('[RegisterPage] User authenticated but no profile, redirecting to profile creation');
        navigate('/create-profile', { replace: true });
        return;
      }
      
      // If user has profile, redirect to appropriate dashboard
      let redirectPath = '/';
      if (role === 'admin') {
        redirectPath = '/admin';
      } else if (role === 'donor') {
        redirectPath = '/donor';
      }
      console.log('[RegisterPage] Redirecting authenticated user to:', redirectPath);
      navigate(redirectPath, { replace: true });
    }
  }, [user, role, authLoading, profileLoaded, navigate]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { email, password, ...userData } = data;
      console.log('[RegisterPage] Starting registration for:', email);
      
      await signUp(
        email as string, 
        password as string, 
        userData as { full_name: string; phone?: string; city?: string; blood_group?: string }
      );
      
      console.log('[RegisterPage] Registration successful');
      showToast('Account created successfully! Welcome to the blood bank system.', 'success');
      
      // Don't navigate immediately - let auth context handle it after profile creation
    } catch (error: unknown) {
      console.error('[RegisterPage] Registration error:', error);
      let errorMessage = 'Failed to create account';
      
      if (error instanceof Error) {
        if (error.message.includes('already registered')) {
          errorMessage = 'This email is already registered. Please try logging in instead.';
        } else if (error.message.includes('Database error')) {
          errorMessage = 'Database connection issue. Please try again in a moment.';
        } else {
          errorMessage = error.message;
        }
      }
      
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
            {authLoading ? 'Loading...' : 'Setting up your profile...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Become a Donor</h2>
          <p className="mt-2 text-gray-600">
            Join our community of life-savers
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <RegisterForm onSubmit={handleSubmit} loading={loading} />
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-red-600 hover:text-red-700 font-medium">
              Sign in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};