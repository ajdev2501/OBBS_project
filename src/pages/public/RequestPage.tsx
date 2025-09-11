import React, { useState } from 'react';
import { 
  HeartIcon, 
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ClockIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { RequestForm } from '../../components/forms/RequestForm';
import { useAuth } from '../../contexts/AuthContext';
import { useRequestPage } from '../../hooks/useRequestPage';
import { 
  UrgencyIndicator, 
  TipsCard, 
  EmergencyContact, 
  ProcessSteps,
  RequestSkeleton 
} from '../../components/ui/RequestComponents';
import { NoticesList } from '../../components/data-display/NoticesList';
import type { BloodGroup } from '../../types/database';

export const RequestPage: React.FC = () => {
  const { user } = useAuth();
  const [selectedUrgency, setSelectedUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  
  const {
    loading,
    notices,
    noticesLoading,
    submitRequest,
    getInitialData,
    urgencyInfo,
    tips
  } = useRequestPage(user);

  // Show loading skeleton while notices are loading
  if (noticesLoading && !notices.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <RequestSkeleton />
        </div>
      </div>
    );
  }

  // Pre-fill form if user is authenticated
  const initialData = getInitialData(user);

  const handleSubmit = async (data: {
    requester_name: string;
    phone: string;
    email: string;
    blood_group: BloodGroup;
    quantity_units: number;
    hospital: string;
    city: string;
    urgency: 'low' | 'medium' | 'high';
  }) => {
    try {
      await submitRequest(data);
    } catch (error) {
      // Error handling is done in the hook
      console.error('Request submission failed:', error);
    }
  };

  const handleUrgencyChange = (urgency: 'low' | 'medium' | 'high') => {
    setSelectedUrgency(urgency);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Header */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-red-100 rounded-full">
              <HeartIcon className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Request Blood</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Submit a blood request and we'll help connect you with available donors and inventory. 
            Our medical team reviews every request to ensure fast, safe delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form Section */}
          <div className="lg:col-span-2 space-y-8">
            {/* Request Form */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                <h2 className="text-2xl font-bold">Blood Request Form</h2>
                <p className="text-red-100 mt-1">Please provide accurate information for faster processing</p>
              </div>
              
              <div className="p-6">
                {user?.profile && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <CheckCircleIcon className="w-5 h-5 text-green-600" />
                      <span className="text-green-800 font-medium">
                        Welcome back, {user.profile.full_name}! Your information has been pre-filled.
                      </span>
                    </div>
                  </div>
                )}
                
                <RequestForm
                  onSubmit={handleSubmit}
                  loading={loading}
                  initialData={initialData}
                />
              </div>
            </div>

            {/* Urgency Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Understanding Urgency Levels</h3>
              <div className="space-y-4">
                {(['high', 'medium', 'low'] as const).map((urgency) => (
                  <div 
                    key={urgency}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedUrgency === urgency ? 'ring-2 ring-red-500 ring-offset-2' : ''
                    }`}
                    onClick={() => handleUrgencyChange(urgency)}
                  >
                    <UrgencyIndicator urgency={urgency} urgencyInfo={urgencyInfo} />
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Notices */}
            {notices.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-blue-900">Important Notices</h3>
                  <p className="text-blue-700 text-sm mt-1">Current updates from blood banks</p>
                </div>
                <div className="p-6">
                  <NoticesList notices={notices.slice(0, 3)} />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Emergency Contact */}
            <EmergencyContact />

            {/* Process Steps */}
            <ProcessSteps />

            {/* Tips Card */}
            <TipsCard tips={tips} />

            {/* Statistics Card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <InformationCircleIcon className="w-6 h-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold text-purple-900">Quick Facts</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between text-purple-800">
                  <span>Average Response Time:</span>
                  <span className="font-semibold">2-6 hours</span>
                </div>
                <div className="flex items-center justify-between text-purple-800">
                  <span>Requests Fulfilled Daily:</span>
                  <span className="font-semibold">50+</span>
                </div>
                <div className="flex items-center justify-between text-purple-800">
                  <span>Success Rate:</span>
                  <span className="font-semibold">98%</span>
                </div>
                <div className="flex items-center justify-between text-purple-800">
                  <span>Available 24/7:</span>
                  <span className="font-semibold">✓ Yes</span>
                </div>
              </div>
            </div>

            {/* Important Information */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <ExclamationTriangleIcon className="w-6 h-6 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-amber-900">Important Reminders</h3>
              </div>
              <ul className="space-y-2 text-amber-800 text-sm">
                <li className="flex items-start space-x-2">
                  <ClockIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>All requests are reviewed by our medical team</span>
                </li>
                <li className="flex items-start space-x-2">
                  <HeartIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>High urgency requests are prioritized</span>
                </li>
                <li className="flex items-start space-x-2">
                  <CheckCircleIcon className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>You will be contacted within 24 hours for urgent requests</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};