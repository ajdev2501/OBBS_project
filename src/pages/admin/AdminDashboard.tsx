import React, { useEffect, useState, useCallback } from 'react';
import { StatsCards } from '../../components/data-display/StatsCards';
import { InventoryChart } from '../../components/charts/InventoryChart';
import { RequestsTable } from '../../components/data-display/RequestsTable';
import { AllocationModal } from '../../components/data-display/AllocationModal';
import { getInventoryItems, discardExpiredUnits, createInventoryItem } from '../../lib/api/inventory';
import { getRequests, updateRequestStatus, createRequest } from '../../lib/api/requests';
import { getAllProfiles } from '../../lib/api/profiles';
import { getActiveNotices } from '../../lib/api/notices';
import { useRealTimeUpdates } from '../../hooks/useRealTimeUpdates';
import { NoticesList } from '../../components/data-display/NoticesList';
import { useToast } from '../../components/ui/Toast';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { BloodRequest, Notice, Profile, InventoryItem } from '../../types/database';

export const AdminDashboard: React.FC = () => {
  const { user, role, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    totalDonors: 0,
    availableUnits: 0,
    pendingRequests: 0,
    expiringUnits: 0,
  });
  const [inventoryData, setInventoryData] = useState<Record<string, number>>({});
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  const [notices, setNotices] = useState<(Notice & { created_by_profile: { full_name: string } })[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false); // Add this to prevent infinite loading
  const { showToast } = useToast();

  const { data: requests = [], refetch: refetchRequests } = useRealTimeUpdates<BloodRequest>('requests');
  const { data: inventory = [], refetch: refetchInventory } = useRealTimeUpdates<InventoryItem>('inventory');

  // State for manually loaded data (fallback when real-time fails)
  const [manualRequests, setManualRequests] = useState<BloodRequest[]>([]);
  const [manualInventory, setManualInventory] = useState<InventoryItem[]>([]);

  // Use manual data if real-time data is empty, otherwise use real-time data
  const currentRequests = requests.length > 0 ? requests : manualRequests;
  const currentInventory = inventory.length > 0 ? inventory : manualInventory;

  const calculateStats = useCallback(() => {
    const availableCount = currentInventory.filter((item: InventoryItem) => item.status === 'available').length;
    const pendingCount = currentRequests.filter(req => req.status === 'pending').length;
    
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    const expiringCount = currentInventory.filter((item: InventoryItem) => 
      item.status === 'available' && 
      new Date(item.expires_on) <= sevenDaysFromNow
    ).length;

    console.log('[AdminDashboard] Calculating stats with current data:', {
      availableCount,
      pendingCount,
      expiringCount,
      inventoryLength: currentInventory.length,
      requestsLength: currentRequests.length,
    });

    setStats(prev => ({
      ...prev,
      availableUnits: availableCount,
      pendingRequests: pendingCount,
      expiringUnits: expiringCount,
    }));
  }, [currentRequests, currentInventory]);

  const loadDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[AdminDashboard] Loading dashboard data...');
      
      // Load data with more detailed error handling
      let inventoryItems: InventoryItem[] = [];
      let allRequests: BloodRequest[] = [];
      let profiles: Profile[] = [];
      let noticesData: (Notice & { created_by_profile: { full_name: string } })[] = [];
      
      try {
        inventoryItems = await getInventoryItems(true) as InventoryItem[];
        console.log('[AdminDashboard] Inventory loaded:', inventoryItems?.length || 0);
      } catch (err) {
        console.error('[AdminDashboard] Error loading inventory:', err);
        inventoryItems = [];
      }
      
      try {
        allRequests = await getRequests() as BloodRequest[];
        console.log('[AdminDashboard] Requests loaded:', allRequests?.length || 0);
      } catch (err) {
        console.error('[AdminDashboard] Error loading requests:', err);
        allRequests = [];
      }
      
      try {
        profiles = await getAllProfiles() as Profile[];
        console.log('[AdminDashboard] Profiles loaded:', profiles?.length || 0);
      } catch (err) {
        console.error('[AdminDashboard] Error loading profiles:', err);
        profiles = [];
      }
      
      try {
        noticesData = await getActiveNotices() as (Notice & { created_by_profile: { full_name: string } })[];
        console.log('[AdminDashboard] Notices loaded:', noticesData?.length || 0);
      } catch (err) {
        console.error('[AdminDashboard] Error loading notices:', err);
        noticesData = [];
      }

      console.log('[AdminDashboard] Data loaded summary:', {
        inventory: inventoryItems?.length || 0,
        requests: allRequests?.length || 0,
        profiles: profiles?.length || 0,
        notices: noticesData?.length || 0,
      });

      setNotices(noticesData);

      // Set manual fallback data
      setManualRequests(allRequests);
      setManualInventory(inventoryItems);

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

      console.log('[AdminDashboard] Stats calculated:', {
        totalDonors: donorCount,
        availableUnits: availableCount,
        pendingRequests: pendingCount,
        expiringUnits: expiringCount,
      });
      
      setDataLoaded(true); // Mark data as loaded
    } catch (error) {
      console.error('[AdminDashboard] Error loading dashboard data:', error);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies to prevent infinite loop

  useEffect(() => {
    console.log('[AdminDashboard] Auth state:', { user: !!user, role, authLoading, dataLoaded });
    
    // Only load data once when auth is ready and user is admin
    if (!authLoading && user && role === 'admin' && !dataLoaded) {
      console.log('[AdminDashboard] Loading data for the first time');
      
      const initializeData = async () => {
        await loadDashboardData();
        try {
          const discarded = await discardExpiredUnits();
          if (discarded.length > 0) {
            showToast(`${discarded.length} expired units automatically discarded`, 'warning');
          }
        } catch (error) {
          console.error('Error discarding expired units:', error);
        }
      };
      
      initializeData();
    }
  }, [user, role, authLoading, dataLoaded, loadDashboardData, showToast]);

  useEffect(() => {
    if (currentRequests.length > 0 || currentInventory.length > 0) {
      calculateStats();
    }
  }, [calculateStats, currentRequests, currentInventory]);

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

  const createSampleData = useCallback(async () => {
    try {
      setLoading(true);
      showToast('Creating sample data...', 'success');
      
      // Create sample blood requests using the existing API
      const sampleRequests = [
        {
          requester_name: 'John Smith',
          phone: '+1-555-0101',
          email: 'john.smith@email.com',
          blood_group: 'A+' as const,
          quantity_units: 2,
          hospital: 'City General Hospital',
          city: 'New York',
          urgency: 'high' as const,
          status: 'pending' as const,
          created_by: null,
        },
        {
          requester_name: 'Maria Garcia',
          phone: '+1-555-0102',
          email: 'maria.garcia@email.com',
          blood_group: 'O-' as const,
          quantity_units: 1,
          hospital: 'St. Mary Medical Center',
          city: 'Los Angeles',
          urgency: 'high' as const,
          status: 'pending' as const,
          created_by: null,
        },
        {
          requester_name: 'David Johnson',
          phone: '+1-555-0103',
          email: 'david.johnson@email.com',
          blood_group: 'B+' as const,
          quantity_units: 3,
          hospital: 'Memorial Hospital',
          city: 'Chicago',
          urgency: 'medium' as const,
          status: 'pending' as const,
          created_by: null,
        },
        {
          requester_name: 'Sarah Wilson',
          phone: '+1-555-0104',
          email: 'sarah.wilson@email.com',
          blood_group: 'AB+' as const,
          quantity_units: 1,
          hospital: 'Regional Medical Center',
          city: 'Houston',
          urgency: 'low' as const,
          status: 'approved' as const,
          created_by: null,
        },
        {
          requester_name: 'Mike Brown',
          phone: '+1-555-0105',
          email: 'mike.brown@email.com',
          blood_group: 'O+' as const,
          quantity_units: 2,
          hospital: 'University Hospital',
          city: 'Phoenix',
          urgency: 'medium' as const,
          status: 'pending' as const,
          created_by: null,
        },
        {
          requester_name: 'Lisa Davis',
          phone: '+1-555-0106',
          email: 'lisa.davis@email.com',
          blood_group: 'A-' as const,
          quantity_units: 1,
          hospital: 'Children\'s Hospital',
          city: 'Philadelphia',
          urgency: 'high' as const,
          status: 'pending' as const,
          created_by: null,
        }
      ];

      // Import and use the createRequest function
      let created = 0;
      for (const request of sampleRequests) {
        try {
          await createRequest(request);
          created++;
        } catch (err) {
          console.error('Error creating request:', err);
        }
      }

      showToast(`${created} sample blood requests created successfully!`, 'success');
      
      // Now try to create some inventory items (these need the current user as created_by)
      if (user) {
        try {
          const inventoryItems = [
            {
              blood_group: 'A+' as const,
              bag_id: 'BAG001' + Date.now(),
              volume_ml: 450,
              storage_location: 'Section-A-1',
              collected_on: '2024-09-01',
              expires_on: '2025-03-01', // 6 months from collection
              status: 'available' as const,
              created_by: user.id,
            },
            {
              blood_group: 'O-' as const,
              bag_id: 'BAG002' + Date.now(),
              volume_ml: 450,
              storage_location: 'Section-O-1',
              collected_on: '2024-09-02',
              expires_on: '2025-03-02',
              status: 'available' as const,
              created_by: user.id,
            },
            {
              blood_group: 'B+' as const,
              bag_id: 'BAG003' + Date.now(),
              volume_ml: 450,
              storage_location: 'Section-B-1',
              collected_on: '2024-09-03',
              expires_on: '2025-03-03',
              status: 'available' as const,
              created_by: user.id,
            },
            {
              blood_group: 'AB+' as const,
              bag_id: 'BAG004' + Date.now(),
              volume_ml: 450,
              storage_location: 'Section-AB-1',
              collected_on: '2024-09-04',
              expires_on: '2025-03-04',
              status: 'available' as const,
              created_by: user.id,
            },
            {
              blood_group: 'O+' as const,
              bag_id: 'BAG005' + Date.now(),
              volume_ml: 450,
              storage_location: 'Section-O-2',
              collected_on: '2024-09-05',
              expires_on: '2025-03-05',
              status: 'available' as const,
              created_by: user.id,
            }
          ];

          let inventoryCreated = 0;
          for (const item of inventoryItems) {
            try {
              await createInventoryItem(item);
              inventoryCreated++;
            } catch (err) {
              console.error('Error creating inventory item:', err);
            }
          }
          
          if (inventoryCreated > 0) {
            showToast(`${inventoryCreated} inventory items created successfully!`, 'success');
          }
        } catch (err) {
          console.error('Error creating inventory:', err);
        }
      }

      refetchRequests();
      refetchInventory();
      
      // Reload dashboard data manually
      setDataLoaded(false); // Reset to trigger reload
    } catch (error) {
      console.error('Error creating sample data:', error);
      showToast('Failed to create some sample data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast, refetchRequests, refetchInventory, user]);

  // Add debug functions to test each API
  const testAPIs = useCallback(async () => {
    console.log('=== Testing APIs individually ===');
    console.log('Supabase client:', { 
      url: import.meta.env.VITE_SUPABASE_URL,
      hasAnonKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY 
    });
    
    try {
      console.log('Testing basic supabase connection...');
      const { data, error } = await supabase.from('profiles').select('count').limit(1);
      console.log('Basic connection test:', { data, error });
    } catch (err) {
      console.error('Basic connection error:', err);
    }
    
    try {
      console.log('Testing inventory API...');
      const inv = await getInventoryItems(true);
      console.log('Inventory result:', inv);
    } catch (err) {
      console.error('Inventory API error:', err);
    }
    
    try {
      console.log('Testing requests API...');
      const req = await getRequests();
      console.log('Requests result:', req);
    } catch (err) {
      console.error('Requests API error:', err);
    }
    
    try {
      console.log('Testing profiles API...');
      const prof = await getAllProfiles();
      console.log('Profiles result:', prof);
    } catch (err) {
      console.error('Profiles API error:', err);
    }
    
    try {
      console.log('Testing notices API...');
      const not = await getActiveNotices();
      console.log('Notices result:', not);
    } catch (err) {
      console.error('Notices API error:', err);
    }
    
    console.log('=== API testing complete ===');
  }, []);

  const pendingRequests = currentRequests.filter(req => req.status === 'pending').slice(0, 10);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Authenticating...' : 'Loading dashboard...'}
          </p>
        </div>
      </div>
    );
  }

  // Add authentication check
  if (!user || role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Access Denied</div>
          <div className="text-gray-600">You need admin privileges to access this page.</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg font-medium mb-2">Error loading dashboard</div>
          <div className="text-gray-600 mb-4">{error}</div>
          <button 
            onClick={loadDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Monitor and manage the blood bank system in real-time.
              </p>
            </div>
            {/* Test Data Button */}
            <div className="flex space-x-4">
              <button
                onClick={testAPIs}
                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm"
              >
                Test APIs
              </button>
              <button
                onClick={createSampleData}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {loading ? 'Creating...' : 'Add Sample Data'}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <StatsCards stats={stats} />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Inventory Chart - Takes 2 columns on large screens */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Blood Inventory Overview</h3>
                <div className="text-sm text-gray-500">
                  Total: {stats.availableUnits} units available
                </div>
              </div>
              <InventoryChart data={inventoryData} />
            </div>
          </div>

          {/* Recent Notices */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Recent Notices</h3>
                <span className="text-sm text-gray-500">{notices.length} active</span>
              </div>
              {notices.length > 0 ? (
                <NoticesList notices={notices.slice(0, 3)} />
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <div className="text-sm">No active notices</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Pending Blood Requests */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Pending Blood Requests</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {pendingRequests.length} requests awaiting approval or fulfillment
                </p>
              </div>
              <div className="text-sm text-gray-500">
                Showing latest {Math.min(pendingRequests.length, 10)} requests
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {pendingRequests.length > 0 ? (
              <RequestsTable
                requests={pendingRequests}
                onApprove={handleApproveRequest}
                onReject={handleRejectRequest}
                onFulfill={handleFulfillRequest}
                isAdmin={true}
              />
            ) : (
              <div className="text-center text-gray-500 py-12">
                <div className="text-lg font-medium">No pending requests</div>
                <div className="text-sm mt-1">All blood requests have been processed</div>
              </div>
            )}
          </div>
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