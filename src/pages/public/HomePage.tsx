import { useEffect, useState, useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { 
  HeartIcon, 
  UserGroupIcon, 
  BuildingOffice2Icon, 
  ClockIcon,
  MapPinIcon,
  ShieldCheckIcon,
  BellIcon,
  ArrowRightIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { SearchForm } from '../../components/forms/SearchForm';
import { NoticesList } from '../../components/data-display/NoticesList';
import { ErrorDisplay } from '../../components/ui/ErrorDisplay';
import { getActiveNotices } from '../../lib/api/notices';
import { getAvailability } from '../../lib/api/inventory';
import { useAuth } from '../../contexts/AuthContext';
import type { Notice, BloodGroup } from '../../types/database';

interface SearchResult {
  [bloodGroup: string]: {
    [city: string]: number;
  };
}

interface HomePageStats {
  totalDonors: number;
  totalDonations: number;
  partnersCount: number;
  livesSaved: number;
  emergencyRequests: number;
  bloodUnitsAvailable: number;
}

interface SearchQuery {
  bloodGroup?: string;
  location?: string;
  urgency?: string;
}

export function HomePage() {
  const [notices, setNotices] = useState<(Notice & { created_by_profile: { full_name: string } })[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [stats, setStats] = useState<HomePageStats>({
    totalDonors: 0,
    totalDonations: 0,
    partnersCount: 0,
    livesSaved: 0,
    emergencyRequests: 0,
    bloodUnitsAvailable: 0
  });
  const [lastSearchQuery, setLastSearchQuery] = useState<SearchQuery | null>(null);
  
  const { role, user, loading: authLoading, profileLoaded } = useAuth();

  // Enhanced API integration functions
  const loadNotices = async () => {
    try {
      const data = await getActiveNotices();
      setNotices(data || []);
    } catch (error) {
      console.error('Error loading notices:', error);
    }
  };

  const loadStats = async () => {
    try {
      // Simulate loading stats from API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStats({
        totalDonors: 5247,
        totalDonations: 12453,
        partnersCount: 127,
        livesSaved: 15672,
        emergencyRequests: 3,
        bloodUnitsAvailable: 1847
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  const handleSearch = async (filters: { blood_group?: string; city?: string }) => {
    setLoading(true);
    setSearchError(null);
    setLastSearchQuery({ bloodGroup: filters.blood_group, location: filters.city });
    
    try {
      const results = await getAvailability(filters.blood_group as BloodGroup, filters.city);
      setSearchResults(results);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchError('Search failed. Please try again.');
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  // Memoized computations for better performance
  const totalAvailableUnits = useMemo(() => {
    if (!searchResults) return 0;
    return Object.values(searchResults).reduce((sum: number, cities: Record<string, number>) => {
      if (typeof cities === 'object' && cities !== null) {
        return sum + Object.values(cities).reduce((citySum: number, count: number) => citySum + count, 0);
      }
      return sum;
    }, 0);
  }, [searchResults]);

  const isSearchActive = useMemo(() => {
    return lastSearchQuery && (lastSearchQuery.bloodGroup || lastSearchQuery.location);
  }, [lastSearchQuery]);

  useEffect(() => {
    // Only load data if we're staying on this page (public user)
    if (!user || role === 'public') {
      loadNotices();
      loadStats();
    }
  }, [user, role]);

  // Auto-refresh data every 5 minutes
  useEffect(() => {
    if (!user || role === 'public') {
      const interval = setInterval(() => {
        loadNotices();
        loadStats();
      }, 5 * 60 * 1000); // 5 minutes

      return () => clearInterval(interval);
    }
  }, [user, role]);

  // Wait for auth to complete before redirecting to prevent hooks error
  if (authLoading || (user && !profileLoaded)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    );
  }

  // Redirect authenticated users to their respective dashboards
  if (user && profileLoaded) {
    // If user exists but no profile, redirect to profile creation
    // Only redirect if we're certain the profile couldn't be created/loaded
    if (!user.profile) {
      console.log('[HomePage] User has no profile after loading, redirecting to create-profile');
      return <Navigate to="/create-profile" replace />;
    }
    
    // If user has profile, redirect to appropriate dashboard
    if (role === 'admin') {
      return <Navigate to="/admin" replace />;
    }
    
    if (role === 'donor') {
      return <Navigate to="/donor" replace />;
    }
  }

  // Show loading while profile is being fetched/created
  if (user && !profileLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Setting up your account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Enhanced Hero Section */}
      <section className="relative bg-gradient-to-br from-red-600 via-red-700 to-red-800 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-white bg-opacity-5" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: '60px 60px'
          }} />
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="text-center">
            {/* Emergency Alert Banner */}
            {stats.emergencyRequests > 0 && (
              <div className="inline-flex items-center px-4 py-2 bg-yellow-500 text-yellow-900 rounded-full text-sm font-medium mb-6 animate-pulse">
                <ClockIcon className="w-4 h-4 mr-2" />
                {stats.emergencyRequests} urgent blood requests need immediate attention
              </div>
            )}
            
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              Save Lives Through
              <span className="block bg-gradient-to-r from-red-200 to-pink-200 bg-clip-text text-transparent">
                Blood Donation
              </span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-red-100 max-w-3xl mx-auto leading-relaxed">
              Connect donors with patients in need. Every donation counts. Join our community of heroes saving lives every day.
            </p>
            
            {/* Enhanced CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Link to="/register">
                <Button size="lg" variant="secondary" className=" text-red-600 bg-white hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                  <HeartIcon className="w-5 h-5 mr-2 text-red-600" />
                  <span className=' text-red-600'>
                    Become a Donor 
                  </span>
                </Button>
          
              </Link>
              <Link to="/request">
                <Button size="lg" variant="ghost" className="text-white border-white hover:bg-red-600 shadow-lg hover:shadow-xl transition-all duration-300">
                  <ShieldCheckIcon className="w-5 h-5 mr-2" />
                  Request Blood
                </Button>
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold">{stats.totalDonors.toLocaleString()}</div>
                <div className="text-red-200 text-sm">Active Donors</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold">{stats.livesSaved.toLocaleString()}</div>
                <div className="text-red-200 text-sm">Lives Saved</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold">{stats.bloodUnitsAvailable}</div>
                <div className="text-red-200 text-sm">Units Available</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="text-2xl font-bold">24/7</div>
                <div className="text-red-200 text-sm">Emergency Support</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Search Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Find Blood Availability</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Search for available blood units in your area. Real-time data from partner hospitals and blood banks.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 lg:p-8">
            <SearchForm onSearch={handleSearch} loading={loading} />
            
            {/* Search Error Display */}
            {searchError && (
              <div className="mt-6">
                <ErrorDisplay
                  message={searchError || 'An error occurred'}
                  onRetry={() => lastSearchQuery && handleSearch({ 
                    blood_group: lastSearchQuery.bloodGroup, 
                    city: lastSearchQuery.location 
                  })}
                />
              </div>
            )}
            
            {/* Enhanced Search Results */}
            {searchResults && (
              <div className="mt-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">Search Results</h3>
                  {isSearchActive && (
                    <div className="flex items-center text-sm text-gray-500">
                      <ClockIcon className="w-4 h-4 mr-1" />
                      Updated {new Date().toLocaleTimeString()}
                    </div>
                  )}
                </div>
                
                {searchResults && Object.keys(searchResults).length > 0 ? (
                  <>
                    {/* Summary Card */}
                    <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-6 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-lg font-semibold text-gray-900">Total Available</h4>
                          <p className="text-sm text-gray-600">Across all blood groups and locations</p>
                        </div>
                        <div className="text-3xl font-bold text-blue-600">
                          {totalAvailableUnits} units
                        </div>
                      </div>
                    </div>
                    
                    {/* Results Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {searchResults && Object.entries(searchResults).map(([bloodGroup, cities]: [string, Record<string, number>]) => (
                        <div key={bloodGroup} className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="text-center">
                            <div className={`text-lg font-semibold mb-2 ${
                              bloodGroup.includes('A') ? 'text-red-600' :
                              bloodGroup.includes('B') ? 'text-blue-600' :
                              bloodGroup.includes('AB') ? 'text-purple-600' :
                              'text-green-600'
                            }`}>
                              {bloodGroup}
                            </div>
                            <div className="text-2xl font-bold text-gray-900">
                              {Object.values(cities).reduce((sum: number, count: number) => sum + count, 0)}
                            </div>
                            <div className="text-sm text-gray-500">units available</div>
                            {Object.keys(cities).length > 1 && (
                              <div className="text-xs text-gray-400 mt-1">
                                {Object.keys(cities).length} locations
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <MapPinIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h4 className="text-lg font-medium text-gray-900 mb-2">No Results Found</h4>
                    <p className="text-gray-500 mb-4">No blood units found matching your criteria.</p>
                    <Button 
                      variant="primary" 
                      onClick={() => setSearchResults(null)}
                      className="text-sm"
                    >
                      Try Different Search
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Enhanced Statistics Section */}
        <section className="mb-12">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Impact</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Together, we're making a difference in saving lives across communities.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <HeartIcon className="w-8 h-8 text-red-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.livesSaved.toLocaleString()}</h3>
                <p className="text-gray-600 font-medium">Lives Saved</p>
                <p className="text-sm text-gray-500 mt-2">Since our inception</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <UserGroupIcon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">{stats.totalDonors.toLocaleString()}</h3>
                <p className="text-gray-600 font-medium">Active Donors</p>
                <p className="text-sm text-gray-500 mt-2">Ready to help</p>
              </div>
            </div>
            
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-green-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <div className="relative text-center p-8 bg-white rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BuildingOffice2Icon className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-2">100+</h3>
                <p className="text-gray-600 font-medium">Partner Hospitals</p>
                <p className="text-sm text-gray-500 mt-2">Nationwide network</p>
              </div>
            </div>
          </div>
          
          {/* Additional Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
              <div className="text-2xl font-bold text-orange-600">{stats.bloodUnitsAvailable}</div>
              <div className="text-sm text-orange-700">Units Available</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{stats.emergencyRequests}</div>
              <div className="text-sm text-purple-700">Emergency Requests</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-teal-50 to-teal-100 rounded-lg border border-teal-200">
              <div className="text-2xl font-bold text-teal-600">24/7</div>
              <div className="text-sm text-teal-700">Support Available</div>
            </div>
            <div className="text-center p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg border border-indigo-200">
              <div className="text-2xl font-bold text-indigo-600">95%</div>
              <div className="text-sm text-indigo-700">Success Rate</div>
            </div>
          </div>
        </section>

        {/* Enhanced Notices Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Latest Updates</h2>
              <p className="text-gray-600">Stay informed about blood donation campaigns and urgent needs.</p>
            </div>
            <Link 
              to="/notices" 
              className="inline-flex items-center px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-medium transition-colors duration-200"
            >
              View All
              <ArrowRightIcon className="w-4 h-4 ml-2" />
            </Link>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
            <NoticesList notices={notices} />
            
            {notices.length === 0 && (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BellIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Recent Notices</h3>
                <p className="text-gray-500">Check back later for updates and announcements.</p>
              </div>
            )}
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl p-8 lg:p-12 border border-red-100">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Ready to Save Lives?</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Join thousands of heroes who are making a difference. Your donation can save up to three lives.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button size="lg" variant="primary" className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <HeartIcon className="w-5 h-5 mr-2" />
                  Start Donating Today
                </Button>
              </Link>
              <Link to="/search">
                <Button size="lg" variant="secondary" className="shadow-lg hover:shadow-xl transition-all duration-300">
                  <MagnifyingGlassIcon className="w-5 h-5 mr-2" />
                  Find Blood Near You
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};