import React from 'react';
import { 
  ExclamationTriangleIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  BellIcon,
  BeakerIcon,
  UsersIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import { LoadingSpinner } from '../ui/LoadingSpinner';

// Types
interface DashboardStats {
  totalDonors: number;
  availableUnits: number;
  pendingRequests: number;
  expiringUnits: number;
  totalRequests: number;
  fulfilledRequests: number;
  rejectedRequests: number;
  totalInventoryValue: number;
}

interface CriticalStats {
  expiringSoon: Array<{ 
    id: string; 
    expires_on: string; 
    blood_group: string; 
    status: string; 
  }>;
  lowStockBloodGroups: string[];
  urgentRequests: Array<{ 
    id: string; 
    created_at: string; 
    blood_group: string; 
    urgency: string; 
    status: string; 
  }>;
  systemHealth: 'good' | 'warning' | 'critical';
}

// Skeleton Components
export const AdminDashboardSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Skeleton */}
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
      </div>

      {/* Stats Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

      {/* Main Content Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
          <div className="h-64 bg-gray-100 rounded animate-pulse" />
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="h-6 bg-gray-200 rounded w-32 mb-6 animate-pulse" />
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-100 rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </div>
);

// System Health Indicator
interface SystemHealthProps {
  health: 'good' | 'warning' | 'critical';
  criticalStats: CriticalStats;
}

export const SystemHealthIndicator: React.FC<SystemHealthProps> = React.memo(({ health, criticalStats }) => {
  const config = {
    good: {
      color: 'bg-green-50 border-green-200 text-green-800',
      icon: CheckCircleIcon,
      iconColor: 'text-green-600',
      title: 'System Healthy',
      message: 'All systems operating normally'
    },
    warning: {
      color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: ExclamationTriangleIcon,
      iconColor: 'text-yellow-600',
      title: 'System Warnings',
      message: 'Some issues require attention'
    },
    critical: {
      color: 'bg-red-50 border-red-200 text-red-800',
      icon: XCircleIcon,
      iconColor: 'text-red-600',
      title: 'Critical Issues',
      message: 'Immediate attention required'
    }
  };

  const { color, icon: Icon, iconColor, title, message } = config[health];

  return (
    <div className={`rounded-xl border p-6 ${color}`}>
      <div className="flex items-start space-x-4">
        <div className={`p-2 rounded-lg bg-white/70 ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-2">{title}</h3>
          <p className="text-sm mb-4">{message}</p>
          
          {/* Critical Issues */}
          {health !== 'good' && (
            <div className="space-y-2 text-sm">
              {criticalStats.urgentRequests.length > 0 && (
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>{criticalStats.urgentRequests.length} urgent requests pending</span>
                </div>
              )}
              {criticalStats.expiringSoon.length > 0 && (
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>{criticalStats.expiringSoon.length} units expiring soon</span>
                </div>
              )}
              {criticalStats.lowStockBloodGroups.length > 0 && (
                <div className="flex items-center space-x-2">
                  <BeakerIcon className="w-4 h-4" />
                  <span>{criticalStats.lowStockBloodGroups.length} blood groups low stock</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});

SystemHealthIndicator.displayName = 'SystemHealthIndicator';

// Enhanced Stats Card
interface EnhancedStatsCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  value: number | string;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  iconColor: string;
  iconBg: string;
  loading?: boolean;
}

export const EnhancedStatsCard: React.FC<EnhancedStatsCardProps> = React.memo(({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend, 
  iconColor, 
  iconBg, 
  loading = false 
}) => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className="flex items-center space-x-4">
        <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">
            {loading ? <LoadingSpinner size="sm" /> : value}
          </p>
          {subtitle && (
            <p className="text-xs text-gray-400 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      
      {trend && (
        <div className={`flex items-center text-sm ${
          trend.isPositive ? 'text-green-600' : 'text-red-600'
        }`}>
          <span className={trend.isPositive ? '↗' : '↘'} />
          <span className="ml-1">{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  </div>
));

EnhancedStatsCard.displayName = 'EnhancedStatsCard';

// Real-time Data Indicator
interface RealTimeIndicatorProps {
  hasRealTimeData: boolean;
  lastUpdated: Date | null;
}

export const RealTimeIndicator: React.FC<RealTimeIndicatorProps> = React.memo(({ 
  hasRealTimeData, 
  lastUpdated 
}) => (
  <div className="flex items-center space-x-2 text-sm">
    <div className={`w-2 h-2 rounded-full ${hasRealTimeData ? 'bg-green-500' : 'bg-yellow-500'}`} />
    <span className="text-gray-600">
      {hasRealTimeData ? 'Real-time' : 'Manual'} data
    </span>
    {lastUpdated && (
      <span className="text-gray-400">
        • Updated {lastUpdated.toLocaleTimeString()}
      </span>
    )}
  </div>
));

RealTimeIndicator.displayName = 'RealTimeIndicator';

// Critical Alerts Component
interface CriticalAlertsProps {
  criticalStats: CriticalStats;
  onRefresh: () => void;
}

export const CriticalAlerts: React.FC<CriticalAlertsProps> = React.memo(({ criticalStats, onRefresh }) => {
  const hasAlerts = criticalStats.urgentRequests.length > 0 || 
                   criticalStats.expiringSoon.length > 0 || 
                   criticalStats.lowStockBloodGroups.length > 0;

  if (!hasAlerts) return null;

  return (
    <div className="mb-8 bg-orange-50 border border-orange-200 rounded-xl p-6">
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <BellIcon className="w-6 h-6 text-orange-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-orange-900 mb-3">Critical Alerts</h3>
            <div className="space-y-2 text-sm text-orange-800">
              {criticalStats.urgentRequests.length > 0 && (
                <div className="flex items-center space-x-2">
                  <ClockIcon className="w-4 h-4" />
                  <span>
                    <strong>{criticalStats.urgentRequests.length}</strong> urgent requests 
                    pending for more than 24 hours
                  </span>
                </div>
              )}
              {criticalStats.expiringSoon.length > 0 && (
                <div className="flex items-center space-x-2">
                  <CalendarIcon className="w-4 h-4" />
                  <span>
                    <strong>{criticalStats.expiringSoon.length}</strong> blood units 
                    expiring within 3 days
                  </span>
                </div>
              )}
              {criticalStats.lowStockBloodGroups.length > 0 && (
                <div className="flex items-center space-x-2">
                  <BeakerIcon className="w-4 h-4" />
                  <span>
                    Low stock alert for blood groups: <strong>{criticalStats.lowStockBloodGroups.join(', ')}</strong>
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={onRefresh}
          className="flex items-center space-x-1 bg-orange-100 text-orange-700 px-3 py-1 rounded-lg hover:bg-orange-200 transition-colors text-sm"
        >
          <ArrowPathIcon className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>
    </div>
  );
});

CriticalAlerts.displayName = 'CriticalAlerts';

// Access Denied Component
export const AccessDenied: React.FC = React.memo(() => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-4">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
        <ShieldCheckIcon className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2>
      <p className="text-gray-600 mb-6">
        You need administrator privileges to access this page. Please contact your system administrator.
      </p>
      <button
        onClick={() => window.history.back()}
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
      >
        Go Back
      </button>
    </div>
  </div>
));

AccessDenied.displayName = 'AccessDenied';

// Error State Component
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const DashboardErrorState: React.FC<ErrorStateProps> = React.memo(({ message, onRetry }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center max-w-md mx-auto px-4">
      <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-6" />
      <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard Error</h2>
      <p className="text-gray-600 mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
      >
        <ArrowPathIcon className="w-5 h-5 inline mr-2" />
        Retry
      </button>
    </div>
  </div>
));

DashboardErrorState.displayName = 'DashboardErrorState';

// Loading State Component
interface LoadingStateProps {
  message?: string;
}

export const DashboardLoadingState: React.FC<LoadingStateProps> = React.memo(({ 
  message = 'Loading dashboard...' 
}) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  </div>
));

DashboardLoadingState.displayName = 'DashboardLoadingState';

// Enhanced Stats Grid
interface EnhancedStatsGridProps {
  stats: DashboardStats;
  loading?: boolean;
}

export const EnhancedStatsGrid: React.FC<EnhancedStatsGridProps> = React.memo(({ stats, loading = false }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <EnhancedStatsCard
      icon={UsersIcon}
      title="Total Donors"
      value={stats.totalDonors.toLocaleString()}
      subtitle="Registered users"
      iconColor="text-blue-600"
      iconBg="bg-blue-50"
      loading={loading}
    />
    <EnhancedStatsCard
      icon={BeakerIcon}
      title="Available Units"
      value={stats.availableUnits.toLocaleString()}
      subtitle={`${(stats.totalInventoryValue / 1000).toFixed(1)}L total`}
      iconColor="text-green-600"
      iconBg="bg-green-50"
      loading={loading}
    />
    <EnhancedStatsCard
      icon={ClockIcon}
      title="Pending Requests"
      value={stats.pendingRequests.toLocaleString()}
      subtitle={`${stats.totalRequests} total requests`}
      iconColor="text-yellow-600"
      iconBg="bg-yellow-50"
      loading={loading}
    />
    <EnhancedStatsCard
      icon={ExclamationTriangleIcon}
      title="Expiring Soon"
      value={stats.expiringUnits.toLocaleString()}
      subtitle="Within 7 days"
      iconColor="text-red-600"
      iconBg="bg-red-50"
      loading={loading}
    />
  </div>
));

EnhancedStatsGrid.displayName = 'EnhancedStatsGrid';

// Auto-Allocation Info Banner
export const AutoAllocationBanner: React.FC = React.memo(() => (
  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl">
    <div className="flex items-start space-x-3">
      <div className="p-1 bg-blue-100 rounded-lg">
        <ChartBarIcon className="w-5 h-5 text-blue-600" />
      </div>
      <div className="text-blue-800 text-sm">
        <div className="font-semibold mb-1">Auto-Allocation System</div>
        <div>
          When you approve a request, the system automatically allocates available blood units 
          using FEFO (First Expired, First Out) algorithm and marks the request as fulfilled.
        </div>
      </div>
    </div>
  </div>
));

AutoAllocationBanner.displayName = 'AutoAllocationBanner';
