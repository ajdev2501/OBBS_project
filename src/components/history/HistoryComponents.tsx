import React from 'react';
import { format } from 'date-fns';
import { 
  HeartIcon, 
  CalendarIcon, 
  BeakerIcon, 
  MapPinIcon,
  TrophyIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import type { Donation, Appointment, AppointmentStatus } from '../../types/database';

// Skeleton Components
export const HistorySkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-gray-100 animate-pulse">
                <div className="w-6 h-6 bg-gray-200 rounded" />
              </div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2 animate-pulse" />
                <div className="h-6 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="h-6 bg-gray-200 rounded w-32 animate-pulse" />
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="border border-gray-200 rounded-lg p-4">
                    <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// Stats Card Component
interface StatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: string | number;
  subtitle?: string;
  iconColor: string;
  iconBg: string;
}

export const StatsCard: React.FC<StatsCardProps> = React.memo(({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  iconColor, 
  iconBg 
}) => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center">
      <div className={`p-3 rounded-lg ${iconBg} ${iconColor}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="ml-4">
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-2xl font-semibold text-gray-900">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-1">{subtitle}</p>}
      </div>
    </div>
  </div>
));

StatsCard.displayName = 'StatsCard';

// Status Badge Component
interface StatusBadgeProps {
  status: AppointmentStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = React.memo(({ status }) => {
  const config: Record<AppointmentStatus, {
    className: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
  }> = {
    scheduled: {
      className: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      icon: ClockIcon,
      label: 'Scheduled'
    },
    confirmed: {
      className: 'bg-blue-100 text-blue-800 border-blue-200',
      icon: CheckCircleIcon,
      label: 'Confirmed'
    },
    completed: {
      className: 'bg-green-100 text-green-800 border-green-200',
      icon: CheckCircleIcon,
      label: 'Completed'
    },
    cancelled: {
      className: 'bg-red-100 text-red-800 border-red-200',
      icon: ExclamationTriangleIcon,
      label: 'Cancelled'
    },
  };

  const { className, icon: Icon, label } = config[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${className}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </span>
  );
});

StatusBadge.displayName = 'StatusBadge';

// Donation Card Component
interface DonationCardProps {
  donation: Donation & {
    appointment?: Pick<Appointment, 'donation_center'>;
  };
}

export const DonationCard: React.FC<DonationCardProps> = React.memo(({ donation }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:border-red-300 hover:shadow-sm transition-all">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-red-50 rounded-lg">
          <HeartIcon className="w-5 h-5 text-red-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {format(new Date(donation.donation_date), 'MMM dd, yyyy')}
          </p>
          <p className="text-sm text-gray-500">
            {format(new Date(donation.donation_date), 'h:mm a')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <span className="text-lg font-semibold text-red-600">
          {donation.volume_ml}ml
        </span>
        <p className="text-xs text-gray-500">
          {Math.floor(donation.volume_ml / 450)} unit{Math.floor(donation.volume_ml / 450) !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
    
    {donation.appointment && (
      <div className="flex items-center space-x-2 text-sm text-gray-600 mb-2">
        <MapPinIcon className="w-4 h-4" />
        <span>{donation.appointment.donation_center}</span>
      </div>
    )}
    
    {donation.bag_id && (
      <div className="flex items-center justify-between text-xs text-gray-500 bg-gray-50 rounded px-2 py-1">
        <span>Bag ID: {donation.bag_id}</span>
        <BeakerIcon className="w-3 h-3" />
      </div>
    )}
  </div>
));

DonationCard.displayName = 'DonationCard';

// Appointment Card Component
interface AppointmentCardProps {
  appointment: Appointment;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = React.memo(({ appointment }) => (
  <div className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 hover:shadow-sm transition-all">
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          <CalendarIcon className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <p className="font-medium text-gray-900">
            {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
          </p>
          <p className="text-sm text-gray-500">{appointment.appointment_time}</p>
        </div>
      </div>
      <StatusBadge status={appointment.status} />
    </div>
    
    <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
      <MapPinIcon className="w-4 h-4" />
      <span>{appointment.donation_center}</span>
    </div>
    
    {appointment.notes && (
      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-700">
        <p className="font-medium text-gray-900 mb-1">Notes:</p>
        <p>{appointment.notes}</p>
      </div>
    )}
  </div>
));

AppointmentCard.displayName = 'AppointmentCard';

// Empty State Component
interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = React.memo(({ 
  icon: Icon, 
  title, 
  description, 
  action 
}) => (
  <div className="text-center py-12">
    <Icon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-500 mb-6">{description}</p>
    {action}
  </div>
));

EmptyState.displayName = 'EmptyState';

// Achievement Card Component
interface AchievementCardProps {
  stats: {
    totalDonations: number;
    totalVolume: number;
  };
  calculateLivesSaved: (volume: number) => number;
  getUnitsFromVolume: (volume: number) => number;
  getVolumeInLiters: (volume: number) => string;
}

export const AchievementCard: React.FC<AchievementCardProps> = React.memo(({ 
  stats, 
  calculateLivesSaved, 
  getUnitsFromVolume, 
  getVolumeInLiters 
}) => {
  if (stats.totalDonations === 0) return null;

  const livesSaved = calculateLivesSaved(stats.totalVolume);
  const units = getUnitsFromVolume(stats.totalVolume);
  const volumeInLiters = getVolumeInLiters(stats.totalVolume);

  return (
    <div className="mt-8 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl border border-red-200 p-8 text-center">
      <div className="mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
          <TrophyIcon className="w-8 h-8 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You, Life Saver!</h3>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Your <span className="font-bold text-red-600">{stats.totalDonations}</span> donation
          {stats.totalDonations > 1 ? 's have' : ' has'} potentially saved up to{' '}
          <span className="font-bold text-red-600 text-xl">{livesSaved} lives</span>.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/70 rounded-lg p-4 border border-red-100">
          <div className="text-2xl font-bold text-red-600">{units}</div>
          <div className="text-sm font-medium text-gray-600">Units Donated</div>
        </div>
        <div className="bg-white/70 rounded-lg p-4 border border-red-100">
          <div className="text-2xl font-bold text-red-600">{volumeInLiters}L</div>
          <div className="text-sm font-medium text-gray-600">Total Volume</div>
        </div>
        <div className="bg-white/70 rounded-lg p-4 border border-red-100">
          <div className="text-2xl font-bold text-red-600">{livesSaved}</div>
          <div className="text-sm font-medium text-gray-600">Lives Impacted</div>
        </div>
      </div>
    </div>
  );
});

AchievementCard.displayName = 'AchievementCard';

// Error State Component
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = React.memo(({ message, onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-4">
      <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Something went wrong</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
));

ErrorState.displayName = 'ErrorState';
