import React from 'react';
import { 
  UserGroupIcon, 
  BeakerIcon, 
  ClockIcon, 
  ExclamationTriangleIcon 
} from '@heroicons/react/24/outline';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: 'red' | 'blue' | 'green' | 'yellow';
  change?: {
    value: string;
    type: 'increase' | 'decrease';
  };
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon: Icon, color, change }) => {
  const colorClasses = {
    red: 'bg-red-50 text-red-600 border-red-200',
    blue: 'bg-blue-50 text-blue-600 border-blue-200',
    green: 'bg-green-50 text-green-600 border-green-200',
    yellow: 'bg-yellow-50 text-yellow-600 border-yellow-200',
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-semibold text-gray-900">{value}</p>
          {change && (
            <p className={`text-sm ${
              change.type === 'increase' ? 'text-green-600' : 'text-red-600'
            }`}>
              {change.type === 'increase' ? '↗' : '↘'} {change.value}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

interface StatsCardsProps {
  stats: {
    totalDonors: number;
    availableUnits: number;
    pendingRequests: number;
    expiringUnits: number;
  };
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatsCard
        title="Total Donors"
        value={stats.totalDonors}
        icon={UserGroupIcon}
        color="blue"
      />
      <StatsCard
        title="Available Units"
        value={stats.availableUnits}
        icon={BeakerIcon}
        color="green"
      />
      <StatsCard
        title="Pending Requests"
        value={stats.pendingRequests}
        icon={ClockIcon}
        color="yellow"
      />
      <StatsCard
        title="Expiring Soon"
        value={stats.expiringUnits}
        icon={ExclamationTriangleIcon}
        color="red"
      />
    </div>
  );
};