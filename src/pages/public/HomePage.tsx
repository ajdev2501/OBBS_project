import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HeartIcon, UserGroupIcon, BuildingOffice2Icon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { SearchForm } from '../../components/forms/SearchForm';
import { NoticesList } from '../../components/data-display/NoticesList';
import { getActiveNotices } from '../../lib/api/notices';
import { getAvailability } from '../../lib/api/inventory';
import type { Notice } from '../../types/database';

export const HomePage: React.FC = () => {
  const [notices, setNotices] = useState<(Notice & { created_by_profile: { full_name: string } })[]>([]);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    try {
      const data = await getActiveNotices();
      setNotices(data as any);
    } catch (error) {
      console.error('Error loading notices:', error);
    }
  };

  const handleSearch = async (filters: any) => {
    setLoading(true);
    try {
      const results = await getAvailability(filters.blood_group, filters.city);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-red-600 to-red-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Save Lives Through
              <span className="block text-red-200">Blood Donation</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100">
              Connect donors with patients in need. Every donation counts.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="secondary" className="bg-white text-red-600 hover:bg-gray-100">
                  Become a Donor
                </Button>
              </Link>
              <Link to="/request">
                <Button size="lg" variant="ghost" className="text-white border-white hover:bg-red-600">
                  Request Blood
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <section className="mb-12">
          <SearchForm onSearch={handleSearch} loading={loading} />
          
          {searchResults && (
            <div className="mt-6 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Search Results</h3>
              {Object.keys(searchResults).length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(searchResults).map(([bloodGroup, cities]: [string, any]) => (
                    <div key={bloodGroup} className="text-center p-4 border border-gray-200 rounded-lg">
                      <div className="text-lg font-semibold text-red-600 mb-2">{bloodGroup}</div>
                      <div className="text-2xl font-bold text-gray-900">
                        {Object.values(cities).reduce((sum: number, count: any) => sum + count, 0)}
                      </div>
                      <div className="text-sm text-gray-500">units available</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No blood units found matching your criteria.</p>
              )}
            </div>
          )}
        </section>

        {/* Stats Section */}
        <section className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <HeartIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">10,000+</h3>
              <p className="text-gray-600">Lives Saved</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <UserGroupIcon className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">5,000+</h3>
              <p className="text-gray-600">Active Donors</p>
            </div>
            <div className="text-center p-6 bg-white rounded-lg shadow-sm border border-gray-200">
              <BuildingOffice2Icon className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">100+</h3>
              <p className="text-gray-600">Partner Hospitals</p>
            </div>
          </div>
        </section>

        {/* Notices Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recent Notices</h2>
            <Link to="/notices" className="text-red-600 hover:text-red-700 font-medium">
              View All
            </Link>
          </div>
          <NoticesList notices={notices} />
        </section>
      </div>
    </div>
  );
};