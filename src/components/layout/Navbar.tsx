import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HeartIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { signOut } from '../../lib/auth';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, role } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <HeartIcon className="w-8 h-8 text-red-600" />
            <span className="text-xl font-bold text-gray-900">BloodBank</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-red-600 transition-colors">
              Home
            </Link>
            <Link to="/search" className="text-gray-700 hover:text-red-600 transition-colors">
              Search Blood
            </Link>
            <Link to="/request" className="text-gray-700 hover:text-red-600 transition-colors">
              Request Blood
            </Link>

            {role === 'donor' && (
              <>
                <Link to="/donor" className="text-gray-700 hover:text-red-600 transition-colors">
                  Dashboard
                </Link>
                <Link to="/donor/profile" className="text-gray-700 hover:text-red-600 transition-colors">
                  Profile
                </Link>
              </>
            )}

            {role === 'admin' && (
              <>
                <Link to="/admin" className="text-gray-700 hover:text-red-600 transition-colors">
                  Admin Panel
                </Link>
                <Link to="/admin/inventory" className="text-gray-700 hover:text-red-600 transition-colors">
                  Inventory
                </Link>
              </>
            )}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <div className="hidden sm:block">
                  <span className="text-sm text-gray-700">
                    {user.profile?.full_name || user.email}
                  </span>
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    {role}
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};