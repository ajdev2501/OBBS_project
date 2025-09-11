import React from 'react';
import { Link } from 'react-router-dom';
import { 
  CalendarIcon, 
  UserIcon, 
  ClockIcon, 
  CheckCircleIcon,
  ExclamationCircleIcon,
  HeartIcon,
  DocumentTextIcon,
  TrophyIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { useDonorHome } from '../../hooks/useDonorHome';
import { StatsCard, QuickActionCard, DashboardSkeleton } from '../../components/ui/DashboardComponents';
import { NoticesList } from '../../components/data-display/NoticesList';
import { format } from 'date-fns';
import type { BloodRequest, Appointment } from '../../types/database';

export const DonorHome: React.FC = () => {
  const { user } = useAuth();
  
  const {
    isEligible,
    nextEligibleDate,
    stats,
    recentRequests,
    recentNotices,
    upcomingAppointments,
    loading,
    error,
    refreshData
  } = useDonorHome(user?.id, user?.profile?.last_donation_date || null);

  // Loading state
  if (loading && !recentRequests.length && !recentNotices.length) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DashboardSkeleton />
        </div>
      </div>
    );
  }

  // Helper function to get status badge for requests
  const getRequestStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
      approved: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Approved' },
      fulfilled: { bg: 'bg-green-100', text: 'text-green-800', label: 'Fulfilled' },
      rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        {config.label}
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back, {user?.profile?.full_name}! 👋
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Thank you for being a life-saver. Here's your donor dashboard.
              </p>
            </div>
            {error && (
              <button
                onClick={refreshData}
                className="flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span>Retry</span>
              </button>
            )}
          </div>
        </div>

        {/* Error Banner */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <ExclamationCircleIcon className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Enhanced Eligibility Status */}
        <div className={`mb-8 p-6 rounded-xl border-2 transition-all duration-200 ${
          isEligible 
            ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-100' 
            : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-yellow-100'
        } shadow-lg`}>
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-full ${isEligible ? 'bg-green-100' : 'bg-yellow-100'}`}>
              {isEligible ? (
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              ) : (
                <ExclamationCircleIcon className="w-8 h-8 text-yellow-600" />
              )}
            </div>
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${
                isEligible ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {isEligible ? '✓ Eligible to Donate' : '⚠ Not Currently Eligible'}
              </h3>
              <p className={`text-sm mt-1 ${
                isEligible ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {isEligible 
                  ? 'You can schedule a donation appointment. Every donation saves lives!'
                  : `You'll be eligible to donate again on ${nextEligibleDate ? format(nextEligibleDate, 'MMMM dd, yyyy') : 'Unknown date'}`
                }
              </p>
              {!isEligible && (
                <p className="text-xs mt-1 text-yellow-600">
                  Regular donors must wait 90 days between donations for safety.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatsCard
              title="Total Requests"
              value={stats.totalRequests}
              subtitle="Blood requests made"
              icon={DocumentTextIcon}
              color="blue"
            />
            <StatsCard
              title="Completed Donations"
              value={stats.completedDonations}
              subtitle="Times you've donated"
              icon={HeartIcon}
              color="red"
            />
            <StatsCard
              title="Lives Saved"
              value={stats.completedDonations * 3}
              subtitle="Potential lives impacted"
              icon={TrophyIcon}
              color="green"
            />
            <StatsCard
              title="Upcoming Appointments"
              value={stats.upcomingAppointments}
              subtitle="Scheduled donations"
              icon={CalendarIcon}
              color="purple"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-gray-600 text-sm mt-1">Manage your donor profile</p>
              </div>
              <div className="p-6 space-y-4">
                <QuickActionCard
                  title="Update Profile"
                  description="Keep your information current"
                  icon={UserIcon}
                  href="/donor/profile"
                  color="gray"
                />
                <QuickActionCard
                  title="Schedule Donation"
                  description={isEligible ? "Book your next appointment" : "You're not eligible yet"}
                  icon={CalendarIcon}
                  href="/donor/schedule"
                  disabled={!isEligible}
                  color="red"
                />
                <QuickActionCard
                  title="Donation History"
                  description="View your past contributions"
                  icon={ClockIcon}
                  href="/donor/history"
                  color="blue"
                />
              </div>
            </div>

            {/* Upcoming Appointments */}
            {upcomingAppointments.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-blue-900">Upcoming Appointments</h3>
                  <p className="text-blue-700 text-sm mt-1">Your scheduled donations</p>
                </div>
                <div className="p-6 space-y-4">
                  {upcomingAppointments.map((appointment: Appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-4 h-4 text-gray-500" />
                          <span className="font-medium text-gray-900">
                            {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <span className="text-xs text-blue-600 font-medium">
                          {appointment.appointment_time}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{appointment.donation_center}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Requests */}
            {recentRequests.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-red-900">Your Recent Requests</h3>
                      <p className="text-red-700 text-sm mt-1">Blood requests you've made</p>
                    </div>
                    <Link 
                      to="/search" 
                      className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                    >
                      Make Request
                    </Link>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {recentRequests.map((request: BloodRequest) => (
                      <div key={request.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                              <span className="text-red-700 font-semibold text-sm">{request.blood_group}</span>
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">
                                {request.quantity_units} {request.quantity_units === 1 ? 'unit' : 'units'} needed
                              </div>
                              <div className="text-sm text-gray-500">
                                {request.hospital}, {request.city}
                              </div>
                            </div>
                          </div>
                          {getRequestStatusBadge(request.status)}
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>Urgency: {request.urgency}</span>
                          <span>{format(new Date(request.created_at), 'MMM dd, yyyy')}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Recent Notices */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-purple-900">Recent Notices</h3>
                <p className="text-purple-700 text-sm mt-1">Important updates from blood banks</p>
              </div>
              <div className="p-6">
                <NoticesList notices={recentNotices} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};