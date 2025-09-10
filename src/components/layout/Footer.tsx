import React from 'react';
import { HeartIcon } from '@heroicons/react/24/outline';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 mt-auto">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-3">
              <HeartIcon className="w-8 h-8 text-red-600" />
              <span className="text-xl font-bold text-gray-900">BloodBank</span>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed">
              Connecting blood donors with those in need. Saving lives through efficient blood bank management.
            </p>
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="/search" className="text-gray-600 hover:text-red-600 transition-colors">Find Blood</a></li>
              <li><a href="/request" className="text-gray-600 hover:text-red-600 transition-colors">Request Blood</a></li>
              <li><a href="/register" className="text-gray-600 hover:text-red-600 transition-colors">Become a Donor</a></li>
            </ul>
          </div>

          {/* Emergency */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-3">Emergency</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-600">Hotline: </span><span className="font-semibold text-red-600">1-800-BLOOD</span></li>
              <li><span className="text-gray-600">Email: </span><span className="text-red-600">emergency@bloodbank.org</span></li>
            </ul>
          </div>

          {/* Contact */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-3">Contact</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li>123 Medical Center Drive</li>
              <li>Healthcare City, HC 12345</li>
              <li>Phone: (555) 123-4567</li>
              <li>Email: info@bloodbank.org</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-200 mt-6 pt-6 text-center">
          <p className="text-sm text-gray-500">
            © 2025 BloodBank Management System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};