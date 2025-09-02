import React, { useState } from 'react';
import { format } from 'date-fns';
import { CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import type { BloodRequest } from '../../types/database';

interface RequestsTableProps {
  requests: BloodRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onFulfill?: (request: BloodRequest) => void;
  onView?: (request: BloodRequest) => void;
  isAdmin?: boolean;
}

export const RequestsTable: React.FC<RequestsTableProps> = ({
  requests,
  onApprove,
  onReject,
  onFulfill,
  onView,
  isAdmin = false
}) => {
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredRequests = requests.filter(request => 
    filterStatus === 'all' || request.status === filterStatus
  );

  const getStatusBadge = (status: BloodRequest['status']) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      fulfilled: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${classes[status]}`}>
        {status}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: BloodRequest['urgency']) => {
    const classes = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${classes[urgency]}`}>
        {urgency}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Blood Requests</h3>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="fulfilled">Fulfilled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requester
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Blood Group
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Hospital
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Urgency
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Created
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm">
                  <div>
                    <div className="font-medium text-gray-900">{request.requester_name}</div>
                    <div className="text-gray-500">{request.phone}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    {request.blood_group}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {request.quantity_units} units
                </td>
                <td className="px-4 py-3 text-sm">
                  <div>
                    <div className="text-gray-900">{request.hospital}</div>
                    <div className="text-gray-500">{request.city}</div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {getUrgencyBadge(request.urgency)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-500">
                  {format(new Date(request.created_at), 'MMM dd, yyyy')}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={EyeIcon}
                        onClick={() => onView?.(request)}
                      />
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            icon={CheckIcon}
                            onClick={() => onApprove?.(request.id)}
                          />
                          <Button
                            variant="danger"
                            size="sm"
                            icon={XMarkIcon}
                            onClick={() => onReject?.(request.id)}
                          />
                        </>
                      )}
                      {request.status === 'approved' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => onFulfill?.(request)}
                        >
                          Fulfill
                        </Button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredRequests.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No requests found.
        </div>
      )}
    </div>
  );
};