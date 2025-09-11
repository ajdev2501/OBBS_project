import React from 'react';
import { format } from 'date-fns';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { 
  UserIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  BeakerIcon,
  CalendarIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import type { BloodRequest } from '../../types/database';

interface RequestDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: BloodRequest | null;
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onFulfill?: (request: BloodRequest) => void;
  isAdmin?: boolean;
}

export const RequestDetailModal: React.FC<RequestDetailModalProps> = ({
  isOpen,
  onClose,
  request,
  onApprove,
  onReject,
  onFulfill,
  isAdmin = false
}) => {
  if (!request) return null;

  const getStatusConfig = (status: BloodRequest['status']) => {
    const configs = {
      pending: {
        icon: ClockIcon,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        label: 'Pending Review'
      },
      approved: {
        icon: CheckCircleIcon,
        color: 'text-blue-600 bg-blue-50 border-blue-200',
        label: 'Approved'
      },
      fulfilled: {
        icon: CheckCircleIcon,
        color: 'text-green-600 bg-green-50 border-green-200',
        label: 'Fulfilled'
      },
      rejected: {
        icon: XMarkIcon,
        color: 'text-red-600 bg-red-50 border-red-200',
        label: 'Rejected'
      }
    };
    return configs[status];
  };

  const getUrgencyConfig = (urgency: BloodRequest['urgency']) => {
    const configs = {
      low: {
        icon: ClockIcon,
        color: 'text-gray-600 bg-gray-50 border-gray-200',
        label: 'Low Priority'
      },
      medium: {
        icon: ClockIcon,
        color: 'text-yellow-600 bg-yellow-50 border-yellow-200',
        label: 'Medium Priority'
      },
      high: {
        icon: ExclamationTriangleIcon,
        color: 'text-red-600 bg-red-50 border-red-200',
        label: 'High Priority - Urgent'
      }
    };
    return configs[urgency];
  };

  const statusConfig = getStatusConfig(request.status);
  const urgencyConfig = getUrgencyConfig(request.urgency);
  const StatusIcon = statusConfig.icon;
  const UrgencyIcon = urgencyConfig.icon;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Blood Request Details">
      <div className="px-6 py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-50 rounded-lg">
              <BeakerIcon className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Blood Request Details
              </h3>
              <p className="text-sm text-gray-500">
                Request ID: {request.id.slice(0, 8)}...
              </p>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className={`inline-flex items-center px-3 py-1 rounded-lg border ${statusConfig.color}`}>
            <StatusIcon className="w-4 h-4 mr-2" />
            <span className="text-sm font-medium">{statusConfig.label}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Requester Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <UserIcon className="w-5 h-5 mr-2 text-gray-400" />
              Requester Information
            </h4>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <UserIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {request.requester_name}
                  </div>
                  <div className="text-sm text-gray-500">Full Name</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <PhoneIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {request.phone}
                  </div>
                  <div className="text-sm text-gray-500">Phone Number</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <EnvelopeIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {request.email}
                  </div>
                  <div className="text-sm text-gray-500">Email Address</div>
                </div>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <BeakerIcon className="w-5 h-5 mr-2 text-gray-400" />
              Medical Information
            </h4>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <BeakerIcon className="w-5 h-5 text-red-600" />
                  <span className="text-sm text-gray-500">Blood Group</span>
                </div>
                <span className="inline-flex items-center px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full border border-red-200">
                  {request.blood_group}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600" />
                  <span className="text-sm text-gray-500">Quantity Required</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  {request.quantity_units} units
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <UrgencyIcon className="w-5 h-5" />
                  <span className="text-sm text-gray-500">Priority Level</span>
                </div>
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${urgencyConfig.color}`}>
                  {urgencyConfig.label}
                </span>
              </div>
            </div>
          </div>

          {/* Hospital Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <BuildingOffice2Icon className="w-5 h-5 mr-2 text-gray-400" />
              Hospital Information
            </h4>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <BuildingOffice2Icon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {request.hospital}
                  </div>
                  <div className="text-sm text-gray-500">Hospital Name</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <MapPinIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {request.city}
                  </div>
                  <div className="text-sm text-gray-500">City/Location</div>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center">
              <CalendarIcon className="w-5 h-5 mr-2 text-gray-400" />
              Timeline
            </h4>
            
            <div className="bg-gray-50 rounded-lg p-4 space-y-3">
              <div className="flex items-start space-x-3">
                <CalendarIcon className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <div className="text-sm font-medium text-gray-900">
                    {format(new Date(request.created_at), 'MMMM dd, yyyy')}
                  </div>
                  <div className="text-sm text-gray-500">
                    {format(new Date(request.created_at), 'h:mm a')}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">Request Submitted</div>
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                Request Age: {format(new Date(), 'dd')} - {format(new Date(request.created_at), 'dd')} days ago
              </div>
            </div>
          </div>
        </div>

        {/* Request Summary */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h5 className="font-medium text-blue-900 mb-2">Request Summary</h5>
          <p className="text-sm text-blue-800">
            <strong>{request.requester_name}</strong> has requested <strong>{request.quantity_units} units</strong> of{' '}
            <strong>{request.blood_group}</strong> blood for <strong>{request.hospital}</strong> in <strong>{request.city}</strong>.{' '}
            This request has <strong>{request.urgency}</strong> priority and is currently <strong>{request.status}</strong>.
          </p>
        </div>

        {/* Action Buttons */}
        {isAdmin && (
          <div className="mt-6 flex justify-end space-x-3">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Close
            </Button>
            
            {request.status === 'pending' && (
              <>
                <Button
                  variant="danger"
                  onClick={() => {
                    onReject?.(request.id);
                    onClose();
                  }}
                  className="flex items-center space-x-2"
                >
                  <XMarkIcon className="w-4 h-4" />
                  <span>Reject Request</span>
                </Button>
                
                <Button
                  variant="secondary"
                  onClick={() => {
                    onApprove?.(request.id);
                    onClose();
                  }}
                  className="flex items-center space-x-2"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Approve Request</span>
                </Button>
              </>
            )}
            
            {request.status === 'approved' && (
              <Button
                variant="primary"
                onClick={() => {
                  onFulfill?.(request);
                  onClose();
                }}
                className="flex items-center space-x-2"
              >
                <BeakerIcon className="w-4 h-4" />
                <span>Fulfill Request</span>
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};
