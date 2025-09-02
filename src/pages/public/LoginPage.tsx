import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LoginForm } from '../../components/forms/LoginForm';
import { signIn } from '../../lib/auth';
import { useToast } from '../../components/ui/Toast';

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (data: { email: string; password: string }) => {
    setLoading(true);
    try {
      await signIn(data.email, data.password);
      showToast('Successfully signed in!', 'success');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Error signing in:', error);
      showToast(error.message || 'Failed to sign in', 'error');
    } finally {
      setLoading(false);
    }
  };

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