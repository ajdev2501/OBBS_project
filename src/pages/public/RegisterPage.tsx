import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../../components/forms/RegisterForm';
import { useToast } from '../../components/ui/Toast';
import { useAuth } from '../../contexts/AuthContext';

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { user, role, loading: authLoading, signUp } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      let redirectPath = '/';
      if (role === 'admin') {
        redirectPath = '/admin';
      } else if (role === 'donor') {
        redirectPath = '/donor';
      }
      navigate(redirectPath, { replace: true });
    }
  }, [user, role, authLoading, navigate]);

  const handleSubmit = async (data: Record<string, unknown>) => {
    setLoading(true);
    try {
      const { email, password, ...userData } = data;
      await signUp(
        email as string, 
        password as string, 
        userData as { full_name: string; phone?: string; city?: string; blood_group?: string }
      );
      
      showToast('Account created successfully! Please check your email to verify your account.', 'success');
      // Don't navigate immediately - let auth context handle it after email verification
    } catch (error: unknown) {
      console.error('Registration error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create account';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
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