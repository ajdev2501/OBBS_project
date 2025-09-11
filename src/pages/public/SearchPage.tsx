import React from 'react';
import { SearchForm } from '../../components/forms/SearchForm';
import { useSearchPage } from '../../hooks/useSearchPage';
import {
  SearchSkeleton,
  SearchStatsCards,
  BloodGroupCard,
  EmptyResults,
  ErrorState,
  SearchTips,
  LoadingResults,
  QuickStats
} from '../../components/search/SearchComponents';

export const SearchPage: React.FC = () => {
  const {
    results,
    loading,
    error,
    hasSearched,
    handleSearch,
    clearResults,
    retry,
    searchStats,
    isEmptyResults,
    formattedResults,
  } = useSearchPage();

  if (loading && !hasSearched) {
    return <SearchSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Blood Availability</h1>
          <p className="text-gray-600">Find available blood units in your area.</p>
        </div>

        {/* Search Tips */}
        <SearchTips />

        {/* Search Form */}
        <SearchForm onSearch={handleSearch} loading={loading} />

        {/* Search Results */}
        {error && (
          <div className="mt-8">
            <ErrorState message={error} onRetry={retry} />
          </div>
        )}

        {loading && hasSearched && (
          <div className="mt-8">
            <LoadingResults />
          </div>
        )}

        {results && !loading && !error && (
          <div className="mt-8">
            {/* Quick Stats */}
            <QuickStats stats={searchStats} />

            {/* Stats Cards */}
            {searchStats.totalUnits > 0 && (
              <SearchStatsCards stats={searchStats} />
            )}

            {/* Results */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">
                Available Blood Units
                {searchStats.totalUnits > 0 && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    ({searchStats.totalUnits} total units found)
                  </span>
                )}
              </h3>
              
              {isEmptyResults ? (
                <EmptyResults hasSearched={hasSearched} onClearSearch={clearResults} />
              ) : (
                <div className="space-y-6">
                  {formattedResults.map((result) => (
                    <BloodGroupCard key={result.bloodGroup} result={result} />
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {!hasSearched && !loading && !error && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <EmptyResults hasSearched={false} />
          </div>
        )}
      </div>
    </div>
  );
};