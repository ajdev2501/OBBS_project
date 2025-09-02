import React, { useState } from 'react';
import { format } from 'date-fns';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { getExpiryPriority } from '../../lib/fefo';
import type { InventoryItem } from '../../types/database';

interface InventoryTableProps {
  items: (InventoryItem & { created_by_profile: { full_name: string } })[];
  onEdit?: (item: InventoryItem) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export const InventoryTable: React.FC<InventoryTableProps> = ({
  items,
  onEdit,
  onDelete,
  isAdmin = false
}) => {
  const [sortField, setSortField] = useState<keyof InventoryItem>('expires_on');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const handleSort = (field: keyof InventoryItem) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredItems = items.filter(item => 
    filterStatus === 'all' || item.status === filterStatus
  );

  const sortedItems = [...filteredItems].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    if (aValue < bValue) return -1 * direction;
    if (aValue > bValue) return 1 * direction;
    return 0;
  });

  const getStatusBadge = (status: InventoryItem['status']) => {
    const classes = {
      available: 'bg-green-100 text-green-800',
      reserved: 'bg-yellow-100 text-yellow-800',
      fulfilled: 'bg-blue-100 text-blue-800',
      discarded: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${classes[status]}`}>
        {status}
      </span>
    );
  };

  const getExpiryBadge = (expiryDate: string) => {
    const priority = getExpiryPriority(expiryDate);
    const classes = {
      critical: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      normal: 'bg-green-100 text-green-800',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${classes[priority]}`}>
        {format(new Date(expiryDate), 'MMM dd, yyyy')}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Blood Inventory</h3>
          {isAdmin && (
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <option value="all">All Status</option>
              <option value="available">Available</option>
              <option value="reserved">Reserved</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="discarded">Discarded</option>
            </select>
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('bag_id')}
              >
                Bag ID
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('blood_group')}
              >
                Blood Group
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('volume_ml')}
              >
                Volume (ml)
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('expires_on')}
              >
                Expires On
              </th>
              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('status')}
              >
                Status
              </th>
              {isAdmin && (
                <>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Storage Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedItems.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {item.bag_id}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    {item.blood_group}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {item.volume_ml}ml
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {getExpiryBadge(item.expires_on)}
                </td>
                <td className="px-4 py-3 text-sm text-gray-900">
                  {getStatusBadge(item.status)}
                </td>
                {isAdmin && (
                  <>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {item.storage_location}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          icon={PencilIcon}
                          onClick={() => onEdit?.(item)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          icon={TrashIcon}
                          onClick={() => onDelete?.(item.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {sortedItems.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No inventory items found.
        </div>
      )}
    </div>
  );
};