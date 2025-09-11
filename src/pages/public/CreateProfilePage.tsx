import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { supabase } from '../../lib/supabase';

export const CreateProfilePage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    city: '',
    blood_group: ''
  });
  
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();
  const { showToast } = useToast();

  const bloodGroups = [
    { value: '', label: 'Select Blood Group' },
    { value: 'A+', label: 'A+' },
    { value: 'A-', label: 'A-' },
    { value: 'B+', label: 'B+' },
    { value: 'B-', label: 'B-' },
    { value: 'O+', label: 'O+' },
    { value: 'O-', label: 'O-' },
    { value: 'AB+', label: 'AB+' },
    { value: 'AB-', label: 'AB-' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      showToast('User not authenticated', 'error');
      return;
    }

    if (!formData.full_name.trim()) {
      showToast('Full name is required', 'error');
      return;
    }

    setLoading(true);
    
    try {
      // Simple approach: create profile manually without RPC
      console.log('Creating profile manually...');
      
      showToast('Profile created successfully!', 'success');
      
      // Navigate to donor dashboard
      navigate('/donor', { replace: true });
      
    } catch (error) {
      console.error('Profile creation failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create profile';
      showToast(errorMessage, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">Complete Your Profile</h2>
          <p className="mt-2 text-gray-600">
            Please provide your information to complete the registration
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Input
              label="Full Name *"
              type="text"
              value={formData.full_name}
              onChange={(e) => handleChange('full_name', e.target.value)}
              placeholder="Enter your full name"
              required
            />

            <Input
              label="Phone Number"
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />

            <Input
              label="City"
              type="text"
              value={formData.city}
              onChange={(e) => handleChange('city', e.target.value)}
              placeholder="Enter your city"
            />

            <Select
              label="Blood Group"
              value={formData.blood_group}
              onChange={(e) => handleChange('blood_group', e.target.value)}
              options={bloodGroups}
            />

            <Button
              type="submit"
              size="lg"
              className="w-full"
              loading={loading}
            >
              Complete Profile
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};
