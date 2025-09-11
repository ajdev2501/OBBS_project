import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  HeartIcon, 
  UserIcon, 
  MagnifyingGlassIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  ClockIcon,
  DocumentTextIcon,
  Bars3Icon,
  XMarkIcon,
  BellIcon,
  ShieldCheckIcon,
  CogIcon,
  MegaphoneIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';
import { getActiveNotices } from '../../lib/api/notices';
import { getUpcomingAppointments } from '../../lib/api/appointments';

export const Navbar = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [notifications, setNotifications] = useState(0);

  // Enhanced scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Load real notifications from database
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user || role === 'public') return;
      
      try {
        let count = 0;
        
        if (role === 'admin') {
          // Load admin notifications: new requests, urgent needs, system alerts
          const [notices, appointments] = await Promise.all([
            getActiveNotices(),
            getUpcomingAppointments()
          ]);
          
          // Count all notices and appointments for admin
          count = (notices?.length || 0) + (appointments?.length || 0);
        } else if (role === 'donor') {
          // Load donor notifications: appointment confirmations, donation reminders
          const appointments = await getUpcomingAppointments();
          // Count all appointments for the donor
          count = appointments?.length || 0;
        }
        
        setNotifications(count);
      } catch (error) {
        console.error('Error loading notifications:', error);
        setNotifications(0);
      }
    };

    loadNotifications();
    
    // Refresh notifications every 5 minutes
    const interval = setInterval(loadNotifications, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, role]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActiveRoute = (path: string) => {
    // Exact match for root paths
    if (path === '/' || path === '/donor' || path === '/admin') {
      return location.pathname === path;
    }
    
    // For other paths, check if it starts with the path
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const adminMenuItems = [
    { 
      path: '/admin', 
      label: 'Dashboard', 
      icon: ChartBarIcon,
      description: 'Overview & Analytics'
    },
    { 
      path: '/admin/inventory', 
      label: 'Inventory', 
      icon: ClipboardDocumentListIcon,
      description: 'Blood Stock Management'
    },
    { 
      path: '/admin/notices', 
      label: 'Notices', 
      icon: MegaphoneIcon,
      description: 'System Announcements'
    },
    { 
      path: '/admin/schedule', 
      label: 'Appointments', 
      icon: CalendarDaysIcon,
      description: 'Donation Scheduling'
    },
    { 
      path: '/search', 
      label: 'Search', 
      icon: MagnifyingGlassIcon,
      description: 'Find Blood Availability'
    },
  ];

  const donorMenuItems = [
    { 
      path: '/donor', 
      label: 'Dashboard', 
      icon: HeartIcon,
      description: 'Your Donation Overview'
    },
    { 
      path: '/donor/schedule', 
      label: 'Schedule', 
      icon: CalendarDaysIcon,
      description: 'Book Appointment'
    },
    { 
      path: '/donor/history', 
      label: 'History', 
      icon: ClockIcon,
      description: 'Past Donations'
    },
    { 
      path: '/request', 
      label: 'Request', 
      icon: DocumentTextIcon,
      description: 'Blood Requests'
    },
    { 
      path: '/search', 
      label: 'Search', 
      icon: MagnifyingGlassIcon,
      description: 'Find Blood Banks'
    },
    { 
      path: '/donor/profile', 
      label: 'Profile', 
      icon: UserIcon,
      description: 'Personal Information'
    },
  ];

  return (
    <nav className={`bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50 transition-all duration-300 ${
      scrolled ? 'backdrop-blur-md bg-white/95 shadow-md' : ''
    }`}>
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Enhanced Logo */}
          <Link to="/" className="flex items-center space-x-3 flex-shrink-0 group">
            <div className="relative">
              <HeartIcon className="w-8 h-8 text-red-600 transition-transform group-hover:scale-110" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-gray-900">BloodBank</span>
              <span className="text-xs text-gray-500 leading-none">Management System</span>
            </div>
          </Link>

          {/* Enhanced Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {/* Public Links for unauthenticated users */}
            {role === 'public' && (
              <>
                <Link 
                  to="/" 
                  className={`group px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute('/') && location.pathname === '/' 
                      ? 'bg-red-100 text-red-700 shadow-sm' 
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <HeartIcon className="w-4 h-4" />
                    <span>Home</span>
                  </span>
                </Link>
                <Link 
                  to="/search" 
                  className={`group px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute('/search') 
                      ? 'bg-red-100 text-red-700 shadow-sm' 
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <MagnifyingGlassIcon className="w-4 h-4" />
                    <span>Search Blood</span>
                  </span>
                </Link>
                <Link 
                  to="/request" 
                  className={`group px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActiveRoute('/request') 
                      ? 'bg-red-100 text-red-700 shadow-sm' 
                      : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <span className="flex items-center space-x-1">
                    <ShieldCheckIcon className="w-4 h-4" />
                    <span>Request Blood</span>
                  </span>
                </Link>
              </>
            )}

            {/* Enhanced Admin Navigation */}
            {role === 'admin' && adminMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.path} className="relative group">
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveRoute(item.path)
                        ? 'bg-red-100 text-red-700 shadow-sm'
                        : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.description}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              );
            })}

            {/* Enhanced Donor Navigation */}
            {role === 'donor' && donorMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <div key={item.path} className="relative group">
                  <Link
                    to={item.path}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      isActiveRoute(item.path)
                        ? 'bg-red-100 text-red-700 shadow-sm'
                        : 'text-gray-700 hover:text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                  {/* Tooltip */}
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                    {item.description}
                    <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45"></div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Enhanced User Menu */}
          <div className="flex items-center space-x-3 flex-shrink-0">
            {user ? (
              <>
                {/* Notifications Bell */}
                {(role === 'admin' || role === 'donor') && (
                  <div className="relative">
                    <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200">
                      <BellIcon className="w-5 h-5" />
                      {notifications > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse">
                          {notifications}
                        </span>
                      )}
                    </button>
                  </div>
                )}

                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                    <UserIcon className="w-4 h-4 text-white" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 truncate max-w-32">
                      {user.profile?.full_name || user.email}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      role === 'admin' 
                        ? 'bg-purple-100 text-purple-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {role === 'admin' ? 'Administrator' : 'Donor'}
                    </span>
                  </div>
                </div>

                {/* Sign Out Button */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleSignOut}
                  className="text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all duration-200"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="text-gray-700 hover:text-red-600 hover:bg-red-50 border border-gray-200 hover:border-red-200 transition-all duration-200"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button 
                    variant="primary" 
                    size="sm"
                    className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-md hover:shadow-lg transition-all duration-200"
                  >
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Enhanced Mobile menu button */}
          <div className="lg:hidden ml-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <>
                  <Bars3Icon className="w-6 h-6" />
                  {notifications > 0 && user && (
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Enhanced Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200 bg-gray-50/50 backdrop-blur-sm">
              {/* Emergency Banner for Mobile */}
              {user && (
                <div className="mb-4 p-3 bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-red-800">Blood Bank System</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">Saving lives through efficient management</p>
                </div>
              )}

              {/* Public Links for mobile */}
              {role === 'public' && (
                <>
                  <Link 
                    to="/" 
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <HeartIcon className="w-5 h-5" />
                    <span>Home</span>
                  </Link>
                  <Link 
                    to="/search" 
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <MagnifyingGlassIcon className="w-5 h-5" />
                    <span>Search Blood</span>
                  </Link>
                  <Link 
                    to="/request" 
                    className="flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <ShieldCheckIcon className="w-5 h-5" />
                    <span>Request Blood</span>
                  </Link>
                </>
              )}

              {/* Enhanced Admin Links for mobile */}
              {role === 'admin' && adminMenuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5" />
                      <div>
                        <span className="block">{item.label}</span>
                        <span className="text-xs text-gray-500">{item.description}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Enhanced Donor Links for mobile */}
              {role === 'donor' && donorMenuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center justify-between px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-3">
                      <IconComponent className="w-5 h-5" />
                      <div>
                        <span className="block">{item.label}</span>
                        <span className="text-xs text-gray-500">{item.description}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}

              {/* Enhanced User actions for mobile */}
              {user ? (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-3 py-3 bg-white rounded-lg border border-gray-200 mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full flex items-center justify-center">
                        <UserIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="text-base font-medium text-gray-900">
                          {user.profile?.full_name || user.email}
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                            role === 'admin' 
                              ? 'bg-purple-100 text-purple-800' 
                              : role === 'donor'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {role === 'admin' ? 'Administrator' : role === 'donor' ? 'Donor' : 'Public'}
                          </span>
                          {notifications > 0 && (
                            <span className="flex items-center space-x-1">
                              <BellIcon className="w-3 h-3 text-red-500" />
                              <span className="text-xs text-red-600">{notifications} notifications</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center space-x-3 w-full px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-all duration-200"
                  >
                    <CogIcon className="w-5 h-5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                  <Link 
                    to="/login"
                    className="block px-3 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register"
                    className="block px-3 py-3 rounded-lg text-base font-medium bg-gradient-to-r from-red-600 to-red-700 text-white hover:from-red-700 hover:to-red-800 transition-all duration-200"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register as Donor
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};