import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  UserIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { checkDonorEligibility } from '../../lib/auth';
import { getActiveNotices } from '../../lib/api/notices';
import { getRequests } from '../../lib/api/requests';
import { NoticesList } from '../../components/data-display/NoticesList';
import { format, addDays } from 'date-fns';
import type { Notice, BloodRequest } from '../../types/database';

export const DonorHome: React.FC = () => {
  const { user } = useAuth();
  const [notices, setNotices] = useState<(Notice & { created_by_profile: { full_name: string } })[]>([]);
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [isEligible, setIsEligible] = useState(false);
  const [nextEligibleDate, setNextEligibleDate] = useState<Date | null>(null);

  useEffect(() => {
    loadData();
    checkEligibility();
  }, [user]);

  const loadData = async () => {
    try {
      const [noticesData, requestsData] = await Promise.all([
        getActiveNotices(),
        user?.id ? getRequests(user.id) : Promise.resolve([]),
      ]);
      
      setNotices(noticesData as any);
      setRequests(requestsData as any);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const checkEligibility = () => {
    if (!user?.profile?.last_donation_date) {
      setIsEligible(true);
      return;
    }

    const eligible = checkDonorEligibility(user.profile.last_donation_date);
    setIsEligible(eligible);

    if (!eligible) {
      const lastDonation = new Date(user.profile.last_donation_date);
      const nextEligible = addDays(lastDonation, 90);
      setNextEligibleDate(nextEligible);
    }
  };

  const recentRequests = requests.slice(0, 3);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.profile?.full_name}!
          </h1>
          <p className="text-gray-600 mt-2">
            Thank you for being a life-saver. Here's your donor dashboard.
          </p>
        </div>

        {/* Eligibility Status */}
        <div className={`mb-8 p-6 rounded-lg border ${
          isEligible 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-3">
            {isEligible ? (
              <CheckCircleIcon className="w-6 h-6 text-green-600" />
            ) : (
              <ExclamationCircleIcon className="w-6 h-6 text-yellow-600" />
            )}
            <div>
              <h3 className={`font-semibold ${
                isEligible ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {isEligible ? 'Eligible to Donate' : 'Not Currently Eligible'}
              </h3>
              <p className={`text-sm ${
                isEligible ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {isEligible 
                  ? 'You can schedule a donation appointment.'
                  : `Next eligible date: ${nextEligibleDate ? format(nextEligibleDate, 'MMMM dd, yyyy') : 'Unknown'}`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <Link
                  to="/donor/profile"
                  className="flex items-center p-3 text-left w-full rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <UserIcon className="w-5 h-5 text-gray-500 mr-3" />
                  <span>Update Profile</span>
                </Link>
                <Link
                  to="/donor/schedule"
                  className={`flex items-center p-3 text-left w-full rounded-lg border transition-colors ${
                    isEligible 
                      ? 'border-red-200 hover:bg-red-50 text-red-700'
                      : 'border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                  onClick={(e) => !isEligible && e.preventDefault()}
                >
                  <CalendarIcon className="w-5 h-5 mr-3" />
                  <span>Schedule Donation</span>
                </Link>
                <Link
                  to="/donor/history"
                  className="flex items-center p-3 text-left w-full rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <ClockIcon className="w-5 h-5 text-gray-500 mr-3" />
                  <span>Donation History</span>
                </Link>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Requests */}
            {recentRequests.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Recent Requests</h3>
                  <Link to="/donor/requests" className="text-red-600 hover:text-red-700 text-sm font-medium">
                    View All
                  </Link>
                </div>
                <div className="space-y-3">
                  {recentRequests.map((request) => (
                    <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {request.blood_group} - {request.quantity_units} units
                          </div>
                          <div className="text-sm text-gray-500">
                            {request.hospital}, {request.city}
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          request.status === 'fulfilled' ? 'bg-green-100 text-green-800' :
                          request.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                          request.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {request.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Notices */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Recent Notices</h3>
              </div>
              <NoticesList notices={notices} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};