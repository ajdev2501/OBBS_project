import React from 'react';
import { format } from 'date-fns';
import { 
  CheckCircleIcon, 
  ExclamationCircleIcon,
  UserCircleIcon,
  CalendarIcon,
  HeartIcon,
  ShieldCheckIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface EligibilityInfo {
  isEligible: boolean;
  nextEligibleDate: Date | null;
  daysSinceLastDonation: number | null;
  daysUntilEligible: number | null;
}

// Skeleton Components
export const ProfileSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-48 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
      </div>

      {/* Eligibility Status Skeleton */}
      <div className="mb-8 p-6 rounded-lg border bg-gray-100 animate-pulse">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-5 bg-gray-200 rounded w-40 mb-2" />
            <div className="h-4 bg-gray-200 rounded w-64" />
          </div>
        </div>
      </div>

      {/* Stats Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[...Array(3)].map((_, i) => (
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

      {/* Form Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse" />
              <div className="h-10 bg-gray-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Eligibility Status Component
interface EligibilityStatusProps {
  eligibilityInfo: EligibilityInfo;
}

export const EligibilityStatus: React.FC<EligibilityStatusProps> = React.memo(({ eligibilityInfo }) => {
  const { isEligible, nextEligibleDate, daysSinceLastDonation, daysUntilEligible } = eligibilityInfo;

  const getStatusConfig = () => {
    if (isEligible) {
      return {
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        iconColor: 'text-green-600',
        textColor: 'text-green-900',
        subtextColor: 'text-green-700',
        icon: CheckCircleIcon,
        title: 'Eligible to Donate',
        description: 'You can schedule a donation appointment.',
      };
    } else {
      return {
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        iconColor: 'text-yellow-600',
        textColor: 'text-yellow-900',
        subtextColor: 'text-yellow-700',
        icon: ExclamationCircleIcon,
        title: 'Not Currently Eligible',
        description: nextEligibleDate 
          ? `Next eligible date: ${format(nextEligibleDate, 'MMMM dd, yyyy')}`
          : 'Update your last donation date to check eligibility',
      };
    }
  };

  const config = getStatusConfig();
  const IconComponent = config.icon;

  return (
    <div className={`p-6 rounded-xl border ${config.bgColor} ${config.borderColor}`}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg bg-white/70 ${config.iconColor}`}>
          <IconComponent className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className={`font-semibold text-lg ${config.textColor}`}>
            {config.title}
          </h3>
          <p className={`text-sm ${config.subtextColor} mb-3`}>
            {config.description}
          </p>
          
          {/* Additional Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {daysSinceLastDonation !== null && (
              <div className={`flex items-center space-x-2 ${config.subtextColor}`}>
                <CalendarIcon className="w-4 h-4" />
                <span>
                  {daysSinceLastDonation === 0 
                    ? 'Donated today' 
                    : `${daysSinceLastDonation} days since last donation`
                  }
                </span>
              </div>
            )}
            
            {daysUntilEligible !== null && daysUntilEligible > 0 && (
              <div className={`flex items-center space-x-2 ${config.subtextColor}`}>
                <HeartIcon className="w-4 h-4" />
                <span>{daysUntilEligible} days until eligible</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

EligibilityStatus.displayName = 'EligibilityStatus';

// Profile Stats Component
interface ProfileStatsProps {
  profileCompleteness: number;
  missingFields: string[];
  eligibilityInfo: EligibilityInfo;
}

export const ProfileStats: React.FC<ProfileStatsProps> = React.memo(({ 
  profileCompleteness, 
  missingFields, 
  eligibilityInfo 
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
    {/* Profile Completeness */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
          <UserCircleIcon className="w-6 h-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">Profile Complete</p>
          <div className="flex items-center space-x-2">
            <p className="text-2xl font-semibold text-gray-900">{profileCompleteness}%</p>
            <div className="flex-1 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${profileCompleteness}%` }}
              />
            </div>
          </div>
          {missingFields.length > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              Missing: {missingFields.join(', ')}
            </p>
          )}
        </div>
      </div>
    </div>

    {/* Donation Status */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${
          eligibilityInfo.isEligible ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
        }`}>
          <ShieldCheckIcon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Donation Status</p>
          <p className="text-lg font-semibold text-gray-900">
            {eligibilityInfo.isEligible ? 'Eligible' : 'Not Eligible'}
          </p>
          {eligibilityInfo.daysUntilEligible !== null && eligibilityInfo.daysUntilEligible > 0 && (
            <p className="text-xs text-gray-500">
              {eligibilityInfo.daysUntilEligible} days to wait
            </p>
          )}
        </div>
      </div>
    </div>

    {/* Days Since Last Donation */}
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-lg bg-red-50 text-red-600">
          <HeartIcon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Last Donation</p>
          <p className="text-lg font-semibold text-gray-900">
            {eligibilityInfo.daysSinceLastDonation !== null 
              ? `${eligibilityInfo.daysSinceLastDonation} days ago`
              : 'Never'
            }
          </p>
          {eligibilityInfo.nextEligibleDate && (
            <p className="text-xs text-gray-500">
              Next: {format(eligibilityInfo.nextEligibleDate, 'MMM dd')}
            </p>
          )}
        </div>
      </div>
    </div>
  </div>
));

ProfileStats.displayName = 'ProfileStats';

// Profile Tips Component
export const ProfileTips: React.FC = React.memo(() => (
  <div className="mb-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
    <div className="flex items-start space-x-3">
      <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-0.5" />
      <div>
        <h3 className="font-semibold text-blue-900 mb-2">Profile Tips</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
            <span>Complete your profile to get personalized donation recommendations</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
            <span>Keep your last donation date updated to track eligibility accurately</span>
          </li>
          <li className="flex items-start space-x-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
            <span>Enable email notifications to stay informed about donation opportunities</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
));

ProfileTips.displayName = 'ProfileTips';

// Error State Component
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = React.memo(({ message, onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-4">
      <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-semibold text-gray-900 mb-2">Profile Error</h2>
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

// Form Success Message
interface SuccessMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = React.memo(({ message, onDismiss }) => (
  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <CheckCircleIcon className="w-5 h-5 text-green-600" />
        <p className="text-sm font-medium text-green-800">{message}</p>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-green-600 hover:text-green-800 transition-colors"
        >
          ×
        </button>
      )}
    </div>
  </div>
));

SuccessMessage.displayName = 'SuccessMessage';
