import React, { useState } from 'react';
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
  XMarkIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, role, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const isActiveRoute = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const adminMenuItems = [
    { path: '/admin', label: 'Admin Dashboard', icon: ChartBarIcon },
    { path: '/admin/inventory', label: 'Inventory Management', icon: ClipboardDocumentListIcon },
    { path: '/admin/schedule', label: 'Donation Confirmation', icon: CalendarDaysIcon },
    { path: '/search', label: 'Search Pages', icon: MagnifyingGlassIcon },
  ];

  const donorMenuItems = [
    { path: '/donor', label: 'Donor Home', icon: HeartIcon },
    { path: '/donor/schedule', label: 'Schedule Donation', icon: CalendarDaysIcon },
    { path: '/donor/history', label: 'Donor History', icon: ClockIcon },
    { path: '/request', label: 'Request Blood', icon: DocumentTextIcon },
    { path: '/search', label: 'Search Pages', icon: MagnifyingGlassIcon },
    { path: '/donor/profile', label: 'Donor Profile', icon: UserIcon },
  ];

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <HeartIcon className="w-8 h-8 text-red-600" />
            <span className="text-xl font-bold text-gray-900">BloodBank</span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex items-center space-x-1 flex-1 justify-center">
            {/* Public Links for unauthenticated users */}
            {role === 'public' && (
              <>
                <Link 
                  to="/" 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute('/') && location.pathname === '/' 
                      ? 'bg-red-100 text-red-700' 
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  Home
                </Link>
                <Link 
                  to="/search" 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute('/search') 
                      ? 'bg-red-100 text-red-700' 
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  Search Blood
                </Link>
                <Link 
                  to="/request" 
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute('/request') 
                      ? 'bg-red-100 text-red-700' 
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  Request Blood
                </Link>
              </>
            )}

            {/* Admin Navigation */}
            {role === 'admin' && adminMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute(item.path)
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}

            {/* Donor Navigation */}
            {role === 'donor' && donorMenuItems.map((item) => {
              const IconComponent = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-1 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActiveRoute(item.path)
                      ? 'bg-red-100 text-red-700'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4 flex-shrink-0">
            {user ? (
              <>
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-700">
                  <UserIcon className="w-4 h-4" />
                  <span>{user.email}</span>
                  <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded-full">
                    {role === 'admin' ? 'Administrator' : 'Donor'}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">Sign In</Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">Register</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden ml-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 border-t border-gray-200">
              {/* Public Links for mobile */}
              {role === 'public' && (
                <>
                  <Link 
                    to="/" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    to="/search" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Search Blood
                  </Link>
                  <Link 
                    to="/request" 
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Request Blood
                  </Link>
                </>
              )}

              {/* Admin Links for mobile */}
              {role === 'admin' && adminMenuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* Donor Links for mobile */}
              {role === 'donor' && donorMenuItems.map((item) => {
                const IconComponent = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <IconComponent className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {/* User actions for mobile */}
              {user ? (
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="px-3 py-2">
                    <div className="text-base font-medium text-gray-900">
                      {user.profile?.full_name || user.email}
                    </div>
                    <div className="flex items-center space-x-1 mt-1">
                      <span className="text-sm text-gray-500">Role:</span>
                      <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                        role === 'admin' 
                          ? 'bg-purple-100 text-purple-800' 
                          : role === 'donor'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {role === 'admin' ? 'Administrator' : role === 'donor' ? 'Donor' : 'Public'}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <div className="border-t border-gray-200 pt-3 mt-3 space-y-2">
                  <Link 
                    to="/login"
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link 
                    to="/register"
                    className="block px-3 py-2 rounded-md text-base font-medium bg-red-600 text-white hover:bg-red-700"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
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