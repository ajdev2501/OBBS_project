import React from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  HeartIcon, 
  CalendarIcon, 
  BeakerIcon, 
  TrophyIcon 
} from '@heroicons/react/24/outline';
import { useDonorHistory } from '../../hooks/useDonorHistory';
import {
  HistorySkeleton,
  StatsCard,
  DonationCard,
  AppointmentCard,
  EmptyState,
  AchievementCard,
  ErrorState
} from '../../components/history/HistoryComponents';
import { Button } from '../../components/ui/Button';

export const DonorHistory: React.FC = () => {
  const navigate = useNavigate();
  const {
    donations,
    appointments,
    stats,
    loading,
    error,
    refetch,
    calculateLivesSaved,
    getUnitsFromVolume,
    getVolumeInLiters,
  } = useDonorHistory();

  if (loading) {
    return <HistorySkeleton />;
  }

  if (error) {
    return <ErrorState message={error} onRetry={refetch} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Donation History</h1>
          <p className="text-gray-600 mt-2">
            Track your donation journey and impact.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatsCard
            icon={HeartIcon}
            title="Total Donations"
            value={stats.totalDonations}
            iconColor="text-red-600"
            iconBg="bg-red-50"
          />
          <StatsCard
            icon={BeakerIcon}
            title="Total Volume"
            value={`${stats.totalVolume}ml`}
            subtitle={`${getUnitsFromVolume(stats.totalVolume)} units`}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatsCard
            icon={TrophyIcon}
            title="Lives Saved"
            value={calculateLivesSaved(stats.totalVolume)}
            subtitle="Potential impact"
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatsCard
            icon={CalendarIcon}
            title="Last Donation"
            value={
              stats.lastDonation 
                ? format(new Date(stats.lastDonation), 'MMM dd, yyyy')
                : 'Never'
            }
            iconColor="text-yellow-600"
            iconBg="bg-yellow-50"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Donation History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Donation History</h3>
            </div>
            <div className="p-6">
              {donations.length > 0 ? (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <DonationCard key={donation.id} donation={donation} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={HeartIcon}
                  title="No donations recorded yet"
                  description="Your first donation will appear here once completed."
                  action={
                    <Button
                      onClick={() => navigate('/donor/schedule')}
                      className="bg-red-600 text-white hover:bg-red-700"
                    >
                      Schedule Donation
                    </Button>
                  }
                />
              )}
            </div>
          </div>

          {/* Appointment History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Appointment History</h3>
            </div>
            <div className="p-6">
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <AppointmentCard key={appointment.id} appointment={appointment} />
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={CalendarIcon}
                  title="No appointments found"
                  description="Schedule your first appointment to get started with blood donation."
                  action={
                    <Button
                      onClick={() => navigate('/donor/schedule')}
                      className="bg-blue-600 text-white hover:bg-blue-700"
                    >
                      Schedule Appointment
                    </Button>
                  }
                />
              )}
            </div>
          </div>
        </div>

        {/* Achievement Section */}
        <AchievementCard
          stats={stats}
          calculateLivesSaved={calculateLivesSaved}
          getUnitsFromVolume={getUnitsFromVolume}
          getVolumeInLiters={getVolumeInLiters}
        />
      </div>
    </div>
  );
};
