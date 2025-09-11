import React from 'react';
import { 
  ExclamationTriangleIcon, 
  ClockIcon, 
  CheckCircleIcon,
  InformationCircleIcon,
  PhoneIcon,
  HeartIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface UrgencyIndicatorProps {
  urgency: 'low' | 'medium' | 'high';
  urgencyInfo: {
    [key in 'low' | 'medium' | 'high']: {
      color: string;
      description: string;
      estimatedTime: string;
    };
  };
}

export const UrgencyIndicator: React.FC<UrgencyIndicatorProps> = ({ urgency, urgencyInfo }) => {
  const config = urgencyInfo[urgency];
  const icons = {
    low: CheckCircleIcon,
    medium: ClockIcon,
    high: ExclamationTriangleIcon
  };
  
  const IconComponent = icons[urgency];

  return (
    <div className={`p-4 rounded-lg border ${config.color}`}>
      <div className="flex items-start space-x-3">
        <IconComponent className="w-6 h-6 mt-0.5 flex-shrink-0" />
        <div>
          <h4 className="font-semibold capitalize">{urgency} Priority</h4>
          <p className="text-sm mt-1">{config.description}</p>
          <p className="text-xs font-medium mt-2">
            Estimated Response: {config.estimatedTime}
          </p>
        </div>
      </div>
    </div>
  );
};

interface TipsCardProps {
  tips: string[];
}

export const TipsCard: React.FC<TipsCardProps> = ({ tips }) => {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-blue-100 rounded-lg">
          <InformationCircleIcon className="w-6 h-6 text-blue-600" />
        </div>
        <h3 className="text-lg font-semibold text-blue-900">Helpful Tips</h3>
      </div>
      <ul className="space-y-2">
        {tips.map((tip, index) => (
          <li key={index} className="flex items-start space-x-2 text-blue-800 text-sm">
            <span className="text-blue-400 mt-1">•</span>
            <span>{tip}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export const EmergencyContact: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="p-2 bg-red-100 rounded-lg">
          <PhoneIcon className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="text-lg font-semibold text-red-900">Emergency Contact</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <span className="text-red-800 font-medium">24/7 Hotline:</span>
          <a 
            href="tel:1-800-BLOOD" 
            className="text-red-600 font-bold text-lg hover:text-red-800 transition-colors"
          >
            1-800-BLOOD
          </a>
        </div>
        <p className="text-red-700 text-sm">
          For life-threatening emergencies requiring immediate blood transfusion, 
          call our hotline for priority assistance.
        </p>
      </div>
    </div>
  );
};

export const ProcessSteps: React.FC = () => {
  const steps = [
    {
      number: '1',
      title: 'Submit Request',
      description: 'Fill out the form with accurate information',
      icon: InformationCircleIcon,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      number: '2',
      title: 'Medical Review',
      description: 'Our team reviews and validates the request',
      icon: CheckCircleIcon,
      color: 'bg-green-100 text-green-600'
    },
    {
      number: '3',
      title: 'Donor Matching',
      description: 'We match with available donors and inventory',
      icon: UserGroupIcon,
      color: 'bg-purple-100 text-purple-600'
    },
    {
      number: '4',
      title: 'Fulfillment',
      description: 'Blood is prepared and delivered to hospital',
      icon: HeartIcon,
      color: 'bg-red-100 text-red-600'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">How It Works</h3>
      <div className="space-y-6">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center`}>
                <step.icon className="w-5 h-5" />
              </div>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">{step.title}</h4>
              <p className="text-sm text-gray-600 mt-1">{step.description}</p>
            </div>
            {index < steps.length - 1 && (
              <div className="absolute left-5 mt-10 w-px h-6 bg-gray-200" style={{ marginLeft: '20px' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export const RequestSkeleton: React.FC = () => {
  return (
    <div className="animate-pulse space-y-8">
      {/* Header skeleton */}
      <div>
        <div className="h-8 bg-gray-300 rounded w-48 mb-4"></div>
        <div className="h-4 bg-gray-300 rounded w-96"></div>
      </div>

      {/* Form skeleton */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i}>
              <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
        <div className="mt-6 h-12 bg-gray-300 rounded"></div>
      </div>

      {/* Info cards skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="bg-gray-100 rounded-xl p-6">
            <div className="h-6 bg-gray-300 rounded w-32 mb-4"></div>
            <div className="space-y-2">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-4 bg-gray-300 rounded w-full"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
