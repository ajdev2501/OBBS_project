import React from 'react';
import { 
  MagnifyingGlassIcon,
  HeartIcon,
  MapPinIcon,
  ChartBarIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  BeakerIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Types
interface SearchStats {
  totalUnits: number;
  totalCities: number;
  totalBloodGroups: number;
  mostAvailableBloodGroup: string | null;
  mostAvailableCity: string | null;
}

interface FormattedResult {
  bloodGroup: string;
  cities: Array<{ city: string; count: number }>;
  totalUnits: number;
}

// Skeleton Components
export const SearchSkeleton: React.FC = () => (
  <div className="min-h-screen bg-gray-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded w-64 mb-4 animate-pulse" />
        <div className="h-4 bg-gray-200 rounded w-96 animate-pulse" />
      </div>

      {/* Search Form Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-16 animate-pulse" />
            <div className="h-10 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex items-end">
            <div className="h-10 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6 animate-pulse" />
        <div className="space-y-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="border border-gray-200 rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded w-16 mb-3 animate-pulse" />
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="bg-gray-50 rounded-lg p-3">
                    <div className="h-4 bg-gray-200 rounded w-16 mx-auto mb-2 animate-pulse" />
                    <div className="h-6 bg-gray-200 rounded w-8 mx-auto mb-1 animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded w-10 mx-auto animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// Search Stats Component
interface SearchStatsProps {
  stats: SearchStats;
  loading?: boolean;
}

export const SearchStatsCards: React.FC<SearchStatsProps> = React.memo(({ stats, loading = false }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-lg bg-red-50 text-red-600">
          <BeakerIcon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Total Units</p>
          <p className="text-2xl font-semibold text-gray-900">
            {loading ? '...' : stats.totalUnits.toLocaleString()}
          </p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
          <MapPinIcon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Cities</p>
          <p className="text-2xl font-semibold text-gray-900">
            {loading ? '...' : stats.totalCities}
          </p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-lg bg-green-50 text-green-600">
          <HeartIcon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Blood Groups</p>
          <p className="text-2xl font-semibold text-gray-900">
            {loading ? '...' : stats.totalBloodGroups}
          </p>
        </div>
      </div>
    </div>

    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center">
        <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
          <ChartBarIcon className="w-6 h-6" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-gray-500">Most Available</p>
          <p className="text-lg font-semibold text-gray-900">
            {loading ? '...' : (stats.mostAvailableBloodGroup || 'N/A')}
          </p>
        </div>
      </div>
    </div>
  </div>
));

SearchStatsCards.displayName = 'SearchStatsCards';

// Blood Group Result Card
interface BloodGroupCardProps {
  result: FormattedResult;
}

export const BloodGroupCard: React.FC<BloodGroupCardProps> = React.memo(({ result }) => (
  <div className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-red-50 rounded-lg">
          <HeartIcon className="w-5 h-5 text-red-600" />
        </div>
        <h4 className="text-xl font-bold text-red-600">{result.bloodGroup}</h4>
      </div>
      <div className="text-right">
        <div className="text-2xl font-bold text-gray-900">{result.totalUnits}</div>
        <div className="text-sm text-gray-500">total units</div>
      </div>
    </div>
    
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
      {result.cities.map(({ city, count }) => (
        <div key={city} className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 text-center hover:from-red-50 hover:to-pink-50 transition-colors">
          <div className="flex items-center justify-center space-x-1 mb-2">
            <MapPinIcon className="w-4 h-4 text-gray-600" />
            <div className="font-semibold text-gray-900 text-sm">{city}</div>
          </div>
          <div className="text-2xl font-bold text-red-600">{count}</div>
          <div className="text-xs text-gray-500">unit{count !== 1 ? 's' : ''}</div>
        </div>
      ))}
    </div>
  </div>
));

BloodGroupCard.displayName = 'BloodGroupCard';

// Empty Results Component
interface EmptyResultsProps {
  hasSearched: boolean;
  onClearSearch?: () => void;
}

export const EmptyResults: React.FC<EmptyResultsProps> = React.memo(({ hasSearched, onClearSearch }) => (
  <div className="text-center py-12">
    <div className="mb-6">
      <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
        <MagnifyingGlassIcon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">
        {hasSearched ? 'No blood units found' : 'Start your search'}
      </h3>
      <p className="text-gray-500 max-w-md mx-auto">
        {hasSearched 
          ? 'No blood units match your search criteria. Try adjusting your filters or searching in a different area.'
          : 'Use the search form above to find available blood units in your area.'
        }
      </p>
    </div>
    
    {hasSearched && onClearSearch && (
      <button
        onClick={onClearSearch}
        className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
      >
        <ArrowPathIcon className="w-4 h-4" />
        <span>New Search</span>
      </button>
    )}
  </div>
));

EmptyResults.displayName = 'EmptyResults';

// Error State Component
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = React.memo(({ message, onRetry }) => (
  <div className="text-center py-12">
    <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-gray-900 mb-2">Search Error</h3>
    <p className="text-gray-600 mb-6 max-w-md mx-auto">{message}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center space-x-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
    >
      <ArrowPathIcon className="w-4 h-4" />
      <span>Try Again</span>
    </button>
  </div>
));

ErrorState.displayName = 'ErrorState';

// Search Tips Component
export const SearchTips: React.FC = React.memo(() => (
  <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
    <div className="flex items-start space-x-3">
      <InformationCircleIcon className="w-6 h-6 text-blue-600 mt-0.5" />
      <div>
        <h3 className="font-semibold text-blue-900 mb-3">Search Tips</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span>Search by blood group to see availability across all cities</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span>Search by city to see all blood groups available in that area</span>
            </div>
          </div>
          <div className="space-y-2 text-sm text-blue-800">
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span>Results show real-time availability from blood banks</span>
            </div>
            <div className="flex items-start space-x-2">
              <span className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
              <span>Contact blood banks directly for urgent requirements</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

SearchTips.displayName = 'SearchTips';

// Loading Results Component
export const LoadingResults: React.FC = React.memo(() => (
  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-red-50 rounded-full mb-4">
          <ClockIcon className="w-6 h-6 text-red-600 animate-pulse" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Searching...</h3>
        <p className="text-gray-500">Finding available blood units in your area</p>
        <div className="mt-4">
          <div className="w-32 h-1 bg-gray-200 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-red-600 rounded-full animate-pulse" style={{ width: '60%' }} />
          </div>
        </div>
      </div>
    </div>
  </div>
));

LoadingResults.displayName = 'LoadingResults';

// Quick Stats Component
interface QuickStatsProps {
  stats: SearchStats;
}

export const QuickStats: React.FC<QuickStatsProps> = React.memo(({ stats }) => {
  if (stats.totalUnits === 0) return null;

  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6 mb-6">
      <div className="flex items-center space-x-2 mb-3">
        <ChartBarIcon className="w-5 h-5 text-red-600" />
        <h3 className="font-semibold text-red-900">Search Summary</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.totalUnits}</div>
          <div className="text-red-700">Total Units</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.totalCities}</div>
          <div className="text-red-700">Cities</div>
        </div>
        {stats.mostAvailableBloodGroup && (
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.mostAvailableBloodGroup}</div>
            <div className="text-red-700">Most Available</div>
          </div>
        )}
        {stats.mostAvailableCity && (
          <div className="text-center">
            <div className="text-lg font-bold text-red-600">{stats.mostAvailableCity}</div>
            <div className="text-red-700">Top City</div>
          </div>
        )}
      </div>
    </div>
  );
});

QuickStats.displayName = 'QuickStats';
