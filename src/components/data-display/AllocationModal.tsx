import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import { calculateFEFOAllocation } from '../../lib/fefo';
import { fulfillRequest } from '../../lib/api/requests';
import type { BloodRequest, InventoryItem } from '../../types/database';
import { format } from 'date-fns';

interface AllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: BloodRequest | null;
  onSuccess: () => void;
}

export const AllocationModal: React.FC<AllocationModalProps> = ({
  isOpen,
  onClose,
  request,
  onSuccess
}) => {
  const [allocation, setAllocation] = useState<{
    inventoryItems: InventoryItem[];
    totalVolume: number;
    canFulfill: boolean;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fulfilling, setFulfilling] = useState(false);

  useEffect(() => {
    if (isOpen && request) {
      loadAllocation();
    }
    if (!isOpen) {
      setAllocation(null);
    }
  }, [isOpen, request]);

  const loadAllocation = async () => {
    if (!request) return;
    
    setLoading(true);
    try {
      const result = await calculateFEFOAllocation(request.blood_group, request.quantity_units);
      setAllocation(result);
    } catch (error) {
      console.error('Error calculating allocation:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFulfill = async () => {
    if (!request || !allocation || !allocation.canFulfill) return;

    setFulfilling(true);
    try {
      const inventoryIds = allocation.inventoryItems.map(item => item.id);
      await fulfillRequest(request.id, inventoryIds);
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error fulfilling request:', error);
    } finally {
      setFulfilling(false);
    }
  };

  if (!request) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="FEFO Allocation" size="lg">
      <div className="space-y-4">
        {/* Request Details */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Request Details</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Requester:</span>
              <span className="ml-2 font-medium">{request.requester_name}</span>
            </div>
            <div>
              <span className="text-gray-500">Blood Group:</span>
              <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                {request.blood_group}
              </span>
            </div>
            <div>
              <span className="text-gray-500">Quantity:</span>
              <span className="ml-2 font-medium">{request.quantity_units} units</span>
            </div>
            <div>
              <span className="text-gray-500">Hospital:</span>
              <span className="ml-2 font-medium">{request.hospital}</span>
            </div>
          </div>
        </div>

        {/* Allocation Results */}
        {loading ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : allocation ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-gray-900">FEFO Allocation</h4>
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                allocation.canFulfill 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {allocation.canFulfill ? 'Can Fulfill' : 'Insufficient Stock'}
              </div>
            </div>

            {allocation.inventoryItems.length > 0 ? (
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Bag ID
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Volume
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Expires
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                        Location
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {allocation.inventoryItems.map((item) => (
                      <tr key={item.id}>
                        <td className="px-4 py-2 text-sm font-medium text-gray-900">
                          {item.bag_id}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.volume_ml}ml
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {format(new Date(item.expires_on), 'MMM dd, yyyy')}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-900">
                          {item.storage_location}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No matching inventory available
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Total Volume: <span className="font-medium">{allocation.totalVolume}ml</span>
              </div>
              <div className="flex space-x-3">
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleFulfill}
                  loading={fulfilling}
                  disabled={!allocation.canFulfill}
                >
                  Fulfill Request
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Modal>
  );
};