import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { RequestForm } from '../../components/forms/RequestForm';
import { createRequest } from '../../lib/api/requests';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';

export const RequestPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleSubmit = async (data: any) => {
    setLoading(true);
    try {
      await createRequest({
        ...data,
        created_by: user?.id || null,
      });
      
      showToast('Blood request submitted successfully!', 'success');
      navigate('/');
    } catch (error) {
      console.error('Error submitting request:', error);
      showToast('Failed to submit request. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Pre-fill form if user is authenticated
  const initialData = user?.profile ? {
    requester_name: user.profile.full_name,
    phone: user.profile.phone || '',
    email: user.email || '',
    city: user.profile.city || '',
    blood_group: user.profile.blood_group || '',
  } : undefined;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Request Blood</h1>
          <p className="text-gray-600">
            Submit a blood request and we'll help connect you with available donors and inventory.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <RequestForm
            onSubmit={handleSubmit}
            loading={loading}
            initialData={initialData}
          />
        </div>

        {/* Important Information */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">Important Information</h3>
          <ul className="space-y-2 text-blue-800 text-sm">
            <li>• All requests are reviewed by our medical team</li>
            <li>• High urgency requests are prioritized</li>
            <li>• You will be contacted within 24 hours for urgent requests</li>
            <li>• For emergencies, please call our hotline: 1-800-BLOOD</li>
          </ul>
        </div>
      </div>
    </div>
  );
};