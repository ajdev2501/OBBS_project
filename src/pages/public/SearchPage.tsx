import React, { useState } from 'react';
import { SearchForm } from '../../components/forms/SearchForm';
import { getAvailability } from '../../lib/api/inventory';

export const SearchPage: React.FC = () => {
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (filters: any) => {
    setLoading(true);
    try {
      const data = await getAvailability(filters.blood_group, filters.city);
      setResults(data);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Search Blood Availability</h1>
          <p className="text-gray-600">Find available blood units in your area.</p>
        </div>

        <SearchForm onSearch={handleSearch} loading={loading} />

        {results && (
          <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Available Blood Units</h3>
            
            {Object.keys(results).length > 0 ? (
              <div className="space-y-6">
                {Object.entries(results).map(([bloodGroup, cities]: [string, any]) => (
                  <div key={bloodGroup} className="border border-gray-200 rounded-lg p-4">
                    <h4 className="text-lg font-semibold text-red-600 mb-3">{bloodGroup}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {Object.entries(cities).map(([city, count]: [string, any]) => (
                        <div key={city} className="bg-gray-50 rounded-lg p-3 text-center">
                          <div className="font-semibold text-gray-900">{city}</div>
                          <div className="text-2xl font-bold text-red-600">{count}</div>
                          <div className="text-sm text-gray-500">units</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">
                No blood units found matching your search criteria.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};