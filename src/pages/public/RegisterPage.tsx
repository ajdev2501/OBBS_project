import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { RegisterForm } from '../../components/forms/RegisterForm';
import { signUp } from '../../lib/auth';
import { useToast } from '../../components/ui/Toast';

export const RegisterPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      const { email, password, ...userData } = data;
      const result = await signUp(email, password, userData);
      
      if (result.user) {
        showToast('Account created successfully!', 'success');
        
        // Small delay to ensure auth state is updated
        setTimeout(() => {
          navigate('/donor');
        }, 100);
      } else {
        showToast('Please check your email to confirm your account.', 'warning');
        navigate('/login');
      }
    } catch (error: any) {
      console.error('Error registering:', error);
      showToast(error.message || 'Failed to create account', 'error');
    } finally {
      setLoading(false);
    }
  };

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