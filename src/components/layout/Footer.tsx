import { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  PhoneIcon, 
  EnvelopeIcon, 
  MapPinIcon,
  ClockIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  GlobeAltIcon,
  ArrowTopRightOnSquareIcon
} from '@heroicons/react/24/outline';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { user, role } = useAuth();
  const [stats, setStats] = useState({
    activeDonors: 0,
    unitsAvailable: 0,
    livesSaved: 0,
    systemOnline: true
  });
  const [loading, setLoading] = useState(true);
  
  // Base quick links
  const allQuickLinks = [
    { href: '/search', label: 'Find Blood', icon: ShieldCheckIcon },
    { href: '/request', label: 'Request Blood', icon: HeartIcon },
    { href: '/register', label: 'Become a Donor', icon: UserGroupIcon, showWhenLoggedOut: true },
    { href: '/login', label: 'Sign In', icon: GlobeAltIcon, showWhenLoggedOut: true },
  ];

  // Filter quick links based on authentication status
  const quickLinks = allQuickLinks.filter(link => {
    // If user is logged in (admin or donor), hide "Become a Donor" and "Sign In" options
    if (user && (role === 'admin' || role === 'donor') && link.showWhenLoggedOut) {
      return false;
    }
    return true;
  });

  // Load real statistics from database
  useEffect(() => {
    const loadStats = async () => {
      try {
        // Get active donors count
        const { count: donorsCount } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true })
          .eq('role', 'donor');

        // Get available blood units from inventory
        const { data: inventory } = await supabase
          .from('inventory')
          .select('units_available');
        
        const totalUnits = inventory?.length || 0;

        // Get total donations to calculate lives saved (assume 1 donation = 3 lives saved)
        const { count: donationsCount } = await supabase
          .from('donations')
          .select('*', { count: 'exact', head: true });

        setStats({
          activeDonors: donorsCount || 0,
          unitsAvailable: totalUnits,
          livesSaved: (donationsCount || 0) * 3,
          systemOnline: true
        });
      } catch (error) {
        console.error('Error loading footer stats:', error);
        setStats({
          activeDonors: 0,
          unitsAvailable: 0,
          livesSaved: 0,
          systemOnline: false
        });
      } finally {
        setLoading(false);
      }
    };

    loadStats();
    
    // Refresh stats every 10 minutes
    const interval = setInterval(loadStats, 10 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <footer className="bg-gradient-to-b from-gray-50 to-gray-100 border-t border-gray-200 mt-auto">
      {/* Main Footer Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Enhanced Brand Section */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-3 mb-4">
              <div className="relative">
                <HeartIcon className="w-10 h-10 text-red-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold text-gray-900">BloodBank</span>
                <div className="text-sm text-gray-500">Management System</div>
              </div>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed mb-4">
              Connecting blood donors with those in need. Saving lives through efficient blood bank management and real-time availability tracking.
            </p>
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <ClockIcon className="w-4 h-4" />
                <span>24/7 Service</span>
              </div>
              <div className="flex items-center space-x-1">
                <ShieldCheckIcon className="w-4 h-4" />
                <span>Verified</span>
              </div>
            </div>
          </div>

          {/* Enhanced Quick Links */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <GlobeAltIcon className="w-5 h-5 text-red-600" />
              <span>Quick Actions</span>
            </h3>
            <ul className="space-y-3">
              {quickLinks.map((link, index) => {
                const IconComponent = link.icon;
                return (
                  <li key={index}>
                    <a 
                      href={link.href} 
                      className="flex items-center space-x-3 text-sm text-gray-600 hover:text-red-600 transition-colors duration-200 group"
                    >
                      <IconComponent className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                      <span>{link.label}</span>
                      <ArrowTopRightOnSquareIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Enhanced Emergency Section */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <HeartIcon className="w-5 h-5 text-red-600" />
              <span>Emergency Contact</span>
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-red-800">24/7 Emergency</span>
                </div>
                <div className="text-lg font-bold text-red-600">1-800-BLOOD-1</div>
                <div className="text-xs text-red-600">Immediate blood needs</div>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <div className="flex items-center space-x-2">
                  <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                  <span>emergency@bloodbank.org</span>
                </div>
                <div className="text-xs text-gray-500">Average response: &lt; 5 minutes</div>
              </div>
            </div>
          </div>

          {/* Enhanced Contact Information */}
          <div className="lg:col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <MapPinIcon className="w-5 h-5 text-red-600" />
              <span>Contact Info</span>
            </h3>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="font-medium">Main Headquarters</div>
                  <div>123 Medical Center Drive</div>
                  <div>Healthcare City, HC 12345</div>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <PhoneIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="font-medium">General: </span>
                  <a href="tel:5551234567" className="text-red-600 hover:text-red-700">(555) 123-4567</a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <EnvelopeIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="font-medium">Info: </span>
                  <a href="mailto:info@bloodbank.org" className="text-red-600 hover:text-red-700">info@bloodbank.org</a>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <ClockIcon className="w-4 h-4 text-gray-400" />
                <div>
                  <span className="font-medium">Hours: </span>
                  <span>24/7 Emergency Service</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Bottom Section */}
      <div className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <p>© {currentYear} BloodBank Management System. All rights reserved.</p>
              <div className="hidden md:flex items-center space-x-1">
                <span>•</span>
                <span>Saving lives since 2020</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="flex items-center space-x-6 text-sm">
              <div className={`flex items-center space-x-2 ${stats.systemOnline ? 'text-green-600' : 'text-red-600'}`}>
                <div className={`w-2 h-2 rounded-full ${stats.systemOnline ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <span className="font-medium">{stats.systemOnline ? 'System Online' : 'System Offline'}</span>
              </div>
              <div className="text-gray-500">
                <span className="font-medium text-gray-900">{loading ? '...' : stats.activeDonors.toLocaleString()}</span> active donors
              </div>
              <div className="text-gray-500">
                <span className="font-medium text-gray-900">{loading ? '...' : stats.unitsAvailable.toLocaleString()}</span> units available
              </div>
            </div>

            {/* Legal Links */}
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <a href="/privacy" className="hover:text-red-600 transition-colors duration-200">Privacy Policy</a>
              <span>•</span>
              <a href="/terms" className="hover:text-red-600 transition-colors duration-200">Terms of Service</a>
              <span>•</span>
              <a href="/accessibility" className="hover:text-red-600 transition-colors duration-200">Accessibility</a>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="md:hidden mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-center space-x-6 text-sm">
              <div className="text-center">
                <div className="font-bold text-gray-900">{loading ? '...' : stats.activeDonors.toLocaleString()}</div>
                <div className="text-gray-500">Active Donors</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{loading ? '...' : stats.livesSaved.toLocaleString()}</div>
                <div className="text-gray-500">Lives Saved</div>
              </div>
              <div className="text-center">
                <div className="font-bold text-gray-900">{loading ? '...' : stats.unitsAvailable.toLocaleString()}</div>
                <div className="text-gray-500">Units Available</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};