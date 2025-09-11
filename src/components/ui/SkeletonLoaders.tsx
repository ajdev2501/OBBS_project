import React from 'react';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface AppointmentSkeletonProps {
  count?: number;
}

export const AppointmentSkeleton: React.FC<AppointmentSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <CalendarIcon className="w-5 h-5 text-gray-300" />
              <div className="h-4 bg-gray-300 rounded w-24"></div>
            </div>
            <div className="h-6 bg-gray-300 rounded-full w-16"></div>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <ClockIcon className="w-4 h-4 text-gray-300" />
              <div className="h-3 bg-gray-300 rounded w-16"></div>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <div className="h-3 bg-gray-300 rounded w-32"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export const FormSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
        <div>
          <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
          <div className="h-10 bg-gray-300 rounded"></div>
        </div>
      </div>
      
      <div>
        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
        <div className="h-10 bg-gray-300 rounded"></div>
      </div>
      
      <div>
        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
        <div className="h-20 bg-gray-300 rounded"></div>
      </div>
      
      <div className="h-12 bg-gray-300 rounded"></div>
    </div>
  );
};
