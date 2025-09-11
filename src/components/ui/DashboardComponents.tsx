import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'gray';
  trend?: {
    value: number;
    label: string;
    isPositive: boolean;
  };
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  trend
}) => {
  const colorClasses = {
    red: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-600',
      text: 'text-red-900',
      accent: 'text-red-600'
    },
    blue: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-600',
      text: 'text-blue-900',
      accent: 'text-blue-600'
    },
    green: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      icon: 'text-green-600',
      text: 'text-green-900',
      accent: 'text-green-600'
    },
    yellow: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      icon: 'text-yellow-600',
      text: 'text-yellow-900',
      accent: 'text-yellow-600'
    },
    purple: {
      bg: 'bg-purple-50',
      border: 'border-purple-200',
      icon: 'text-purple-600',
      text: 'text-purple-900',
      accent: 'text-purple-600'
    },
    gray: {
      bg: 'bg-gray-50',
      border: 'border-gray-200',
      icon: 'text-gray-600',
      text: 'text-gray-900',
      accent: 'text-gray-600'
    }
  };

  const classes = colorClasses[color];

  return (
    <div className={`${classes.bg} ${classes.border} border rounded-xl p-6 transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${classes.bg} border ${classes.border}`}>
              <Icon className={`w-6 h-6 ${classes.icon}`} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">{title}</p>
              <p className={`text-2xl font-bold ${classes.text}`}>{value}</p>
              {subtitle && (
                <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
              )}
            </div>
          </div>
          {trend && (
            <div className="mt-3 flex items-center space-x-1">
              <span className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend.isPositive ? '↗' : '↘'} {trend.value}%
              </span>
              <span className="text-xs text-gray-500">{trend.label}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface QuickActionCardProps {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  disabled?: boolean;
  color: 'red' | 'blue' | 'green' | 'gray';
  onClick?: () => void;
}

export const QuickActionCard: React.FC<QuickActionCardProps> = ({
  title,
  description,
  icon: Icon,
  href,
  disabled = false,
  color,
  onClick
}) => {
  const colorClasses = {
    red: disabled 
      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
      : 'border-red-200 hover:bg-red-50 hover:border-red-300 text-red-700 group-hover:text-red-800',
    blue: disabled 
      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
      : 'border-blue-200 hover:bg-blue-50 hover:border-blue-300 text-blue-700 group-hover:text-blue-800',
    green: disabled 
      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
      : 'border-green-200 hover:bg-green-50 hover:border-green-300 text-green-700 group-hover:text-green-800',
    gray: disabled 
      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
      : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 group-hover:text-gray-800'
  };

  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      return;
    }
    if (onClick) {
      onClick();
    }
  };

  const content = (
    <div className={`block p-6 border rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:shadow-md ${colorClasses[color]}`}>
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-lg ${disabled ? 'bg-gray-100' : 'bg-white'} shadow-sm`}>
          <Icon className={`w-6 h-6 ${disabled ? 'text-gray-400' : ''}`} />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-lg mb-1">{title}</h3>
          <p className="text-sm opacity-80">{description}</p>
        </div>
      </div>
    </div>
  );

  if (disabled) {
    return <div className="group">{content}</div>;
  }

  return (
    <a href={href} className="group" onClick={handleClick}>
      {content}
    </a>
  );
};

interface DashboardSkeletonProps {
  showStats?: boolean;
  showActions?: boolean;
  showContent?: boolean;
}

export const DashboardSkeleton: React.FC<DashboardSkeletonProps> = ({
  showStats = true,
  showActions = true,
  showContent = true
}) => {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header skeleton */}
      <div>
        <div className="h-8 bg-gray-300 rounded w-64 mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-96"></div>
      </div>

      {/* Eligibility skeleton */}
      <div className="p-6 bg-gray-100 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-6 h-6 bg-gray-300 rounded"></div>
          <div>
            <div className="h-5 bg-gray-300 rounded w-32 mb-1"></div>
            <div className="h-4 bg-gray-300 rounded w-48"></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Stats skeleton */}
        {showStats && (
          <div className="lg:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                    <div>
                      <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                      <div className="h-6 bg-gray-300 rounded w-8"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions skeleton */}
        {showActions && (
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg p-6">
              <div className="h-5 bg-gray-300 rounded w-24 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-gray-300 rounded"></div>
                      <div className="h-4 bg-gray-300 rounded w-24"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Content skeleton */}
        {showContent && (
          <div className="lg:col-span-2 space-y-6">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-6">
                <div className="h-5 bg-gray-300 rounded w-32 mb-4"></div>
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, j) => (
                    <div key={j} className="border border-gray-200 rounded-lg p-4">
                      <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
                      <div className="h-3 bg-gray-300 rounded w-3/4"></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
