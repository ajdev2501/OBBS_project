import React, { useEffect, useState } from 'react';
import { StatsCards } from '../../components/data-display/StatsCards';
import { InventoryChart } from '../../components/charts/InventoryChart';
import { RequestsTable } from '../../components/data-display/RequestsTable';
import { AllocationModal } from '../../components/data-display/AllocationModal';
import { getInventoryItems, discardExpiredUnits } from '../../lib/api/inventory';
import { getRequests, updateRequestStatus } from '../../lib/api/requests';
import { getAllProfiles } from '../../lib/api/profiles';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { useToast } from '../../components/ui/Toast';
import type { BloodRequest } from '../../types/database';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalDonors: 0,
    availableUnits: 0,
    pendingRequests: 0,
    expiringUnits: 0,
  });
  const [inventoryData, setInventoryData] = useState<Record<string, number>>({});
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const { showToast } = useToast();

  const { data: requests, refetch: refetchRequests } = useRealTimeUpdates<BloodRequest>('requests');
  const { data: inventory, refetch: refetchInventory } = useRealTimeUpdates('inventory');

  useEffect(() => {
    loadDashboardData();
    discardExpiredItems();
  }, []);

  useEffect(() => {
    calculateStats();
  }, [requests, inventory]);

  const loadDashboardData = async () => {
    try {
      const [inventoryItems, allRequests, profiles] = await Promise.all([
        getInventoryItems(true),
        getRequests(),
        getAllProfiles(),
      ]);

      // Calculate inventory by blood group
      const inventoryByGroup: Record<string, number> = {};
      inventoryItems.forEach(item => {
        if (item.status === 'available') {
          inventoryByGroup[item.blood_group] = (inventoryByGroup[item.blood_group] || 0) + 1;
        }
      });
      setInventoryData(inventoryByGroup);

      // Calculate stats
      const donorCount = profiles.filter(p => p.role === 'donor').length;
      const availableCount = inventoryItems.filter(item => item.status === 'available').length;
      const pendingCount = allRequests.filter(req => req.status === 'pending').length;
      
      const today = new Date();
      const sevenDaysFromNow = new Date();
      sevenDaysFromNow.setDate(today.getDate() + 7);
      
      const expiringCount = inventoryItems.filter(item => 
        item.status === 'available' && 
        new Date(item.expires_on) <= sevenDaysFromNow
      ).length;

      setStats({
        totalDonors: donorCount,
        availableUnits: availableCount,
        pendingRequests: pendingCount,
        expiringUnits: expiringCount,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    }
  };

  const calculateStats = () => {
    const availableCount = inventory.filter((item: any) => item.status === 'available').length;
    const pendingCount = requests.filter(req => req.status === 'pending').length;
    
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    const expiringCount = inventory.filter((item: any) => 
      item.status === 'available' && 
      new Date(item.expires_on) <= sevenDaysFromNow
    ).length;

    setStats(prev => ({
      ...prev,
      availableUnits: availableCount,
      pendingRequests: pendingCount,
      expiringUnits: expiringCount,
    }));
  };

  const discardExpiredItems = async () => {
    try {
      const discarded = await discardExpiredUnits();
      if (discarded.length > 0) {
        showToast(`${discarded.length} expired units automatically discarded`, 'warning');
      }
    } catch (error) {
      console.error('Error discarding expired units:', error);
    }
  };

  const handleApproveRequest = async (id: string) => {
    try {
      await updateRequestStatus(id, 'approved');
      showToast('Request approved successfully', 'success');
      refetchRequests();
    } catch (error) {
      console.error('Error approving request:', error);
      showToast('Failed to approve request', 'error');
    }
  };

  const handleRejectRequest = async (id: string) => {
    try {
      await updateRequestStatus(id, 'rejected');
      showToast('Request rejected', 'warning');
      refetchRequests();
    } catch (error) {
      console.error('Error rejecting request:', error);
      showToast('Failed to reject request', 'error');
    }
  };

  const handleFulfillRequest = (request: BloodRequest) => {
    setSelectedRequest(request);
    setAllocationModalOpen(true);
  };

  const handleAllocationSuccess = () => {
    showToast('Request fulfilled successfully', 'success');
    refetchRequests();
    refetchInventory();
  };

  const pendingRequests = requests.filter(req => req.status === 'pending').slice(0, 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Monitor and manage the blood bank system.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Inventory Chart */}
          <div className="lg:col-span-1">
            <InventoryChart data={inventoryData} />
          </div>

          {/* Recent Notices */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Notices</h3>
              <NoticesList notices={notices.slice(0, 3)} />
            </div>
          </div>
        </div>

        {/* Pending Requests */}
        <div className="mt-8">
          <RequestsTable
            requests={pendingRequests}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onFulfill={handleFulfillRequest}
            isAdmin={true}
          />
        </div>

        {/* Allocation Modal */}
        <AllocationModal
          isOpen={allocationModalOpen}
          onClose={() => setAllocationModalOpen(false)}
          request={selectedRequest}
          onSuccess={handleAllocationSuccess}
        />
      </div>
    </div>
  );
};