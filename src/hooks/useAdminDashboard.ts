import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useRealTimeUpdates } from './useRealTimeUpdates';
import { useToast } from '../components/ui/Toast';
import { getInventoryItems, discardExpiredUnits, getUnitsForAllocation } from '../lib/api/inventory';
import { getRequests, updateRequestStatus, fulfillRequest } from '../lib/api/requests';
import { getAllProfiles } from '../lib/api/profiles';
import { getActiveNotices } from '../lib/api/notices';
import type { BloodRequest, Notice, Profile, InventoryItem } from '../types/database';

interface DashboardStats {
  totalDonors: number;
  availableUnits: number;
  pendingRequests: number;
  expiringUnits: number;
  totalRequests: number;
  fulfilledRequests: number;
  rejectedRequests: number;
  totalInventoryValue: number;
}

interface AdminDashboardData {
  stats: DashboardStats;
  inventoryData: Record<string, number>;
  notices: (Notice & { created_by_profile: { full_name: string } })[];
  pendingRequests: BloodRequest[];
  allRequests: BloodRequest[];
  currentInventory: InventoryItem[];
}

interface UseAdminDashboardReturn {
  // Data state
  data: AdminDashboardData;
  loading: boolean;
  error: string | null;
  
  // UI state
  selectedRequest: BloodRequest | null;
  allocationModalOpen: boolean;
  
  // Actions
  handleApproveRequest: (id: string) => Promise<void>;
  handleRejectRequest: (id: string) => Promise<void>;
  handleFulfillRequest: (request: BloodRequest) => void;
  handleAllocationSuccess: () => void;
  setSelectedRequest: (request: BloodRequest | null) => void;
  setAllocationModalOpen: (open: boolean) => void;
  refetchData: () => Promise<void>;
  
  // Real-time data
  hasRealTimeData: boolean;
  lastUpdated: Date | null;
  
  // Computed values
  criticalStats: {
    expiringSoon: InventoryItem[];
    lowStockBloodGroups: string[];
    urgentRequests: BloodRequest[];
    systemHealth: 'good' | 'warning' | 'critical';
  };
}

export const useAdminDashboard = (): UseAdminDashboardReturn => {
  const { user, role } = useAuth();
  const { showToast } = useToast();
  
  // State management
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // UI state
  const [selectedRequest, setSelectedRequest] = useState<BloodRequest | null>(null);
  const [allocationModalOpen, setAllocationModalOpen] = useState(false);
  
  // Manual data fallbacks
  const [manualRequests, setManualRequests] = useState<BloodRequest[]>([]);
  const [manualInventory, setManualInventory] = useState<InventoryItem[]>([]);
  const [notices, setNotices] = useState<(Notice & { created_by_profile: { full_name: string } })[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  
  // Real-time data hooks
  const { data: realtimeRequests = [], refetch: refetchRequests } = useRealTimeUpdates<BloodRequest>('requests');
  const { data: realtimeInventory = [], refetch: refetchInventory } = useRealTimeUpdates<InventoryItem>('inventory');
  
  // Determine current data source (real-time or manual fallback)
  const currentRequests = realtimeRequests.length > 0 ? realtimeRequests : manualRequests;
  const currentInventory = realtimeInventory.length > 0 ? realtimeInventory : manualInventory;
  const hasRealTimeData = realtimeRequests.length > 0 && realtimeInventory.length > 0;
  
  // Calculate comprehensive dashboard statistics
  const stats = useMemo((): DashboardStats => {
    const donorCount = profiles.filter(p => p.role === 'donor').length;
    const availableCount = currentInventory.filter(item => item.status === 'available').length;
    const pendingCount = currentRequests.filter(req => req.status === 'pending').length;
    const totalCount = currentRequests.length;
    const fulfilledCount = currentRequests.filter(req => req.status === 'fulfilled').length;
    const rejectedCount = currentRequests.filter(req => req.status === 'rejected').length;
    
    // Calculate expiring units (within 7 days)
    const today = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(today.getDate() + 7);
    
    const expiringCount = currentInventory.filter(item => 
      item.status === 'available' && 
      new Date(item.expires_on) <= sevenDaysFromNow
    ).length;
    
    // Calculate total inventory value (assuming 450ml per unit, arbitrary value)
    const totalValue = availableCount * 450; // ml
    
    return {
      totalDonors: donorCount,
      availableUnits: availableCount,
      pendingRequests: pendingCount,
      expiringUnits: expiringCount,
      totalRequests: totalCount,
      fulfilledRequests: fulfilledCount,
      rejectedRequests: rejectedCount,
      totalInventoryValue: totalValue,
    };
  }, [currentRequests, currentInventory, profiles]);
  
  // Calculate inventory data by blood group
  const inventoryData = useMemo((): Record<string, number> => {
    const result: Record<string, number> = {};
    currentInventory.forEach(item => {
      if (item.status === 'available') {
        result[item.blood_group] = (result[item.blood_group] || 0) + 1;
      }
    });
    return result;
  }, [currentInventory]);
  
  // Get pending requests (latest 10)
  const pendingRequests = useMemo(() => {
    return currentRequests
      .filter(req => req.status === 'pending')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10);
  }, [currentRequests]);
  
  // Calculate critical system metrics
  const criticalStats = useMemo(() => {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);
    
    // Items expiring very soon (3 days)
    const expiringSoon = currentInventory.filter(item => 
      item.status === 'available' && 
      new Date(item.expires_on) <= threeDaysFromNow
    );
    
    // Blood groups with low stock (< 5 units)
    const lowStockBloodGroups = Object.entries(inventoryData)
      .filter(([, count]) => count < 5)
      .map(([bloodGroup]) => bloodGroup);
    
    // Urgent requests (high priority and older than 1 day)
    const oneDayAgo = new Date();
    oneDayAgo.setDate(today.getDate() - 1);
    
    const urgentRequests = currentRequests.filter(req => 
      req.status === 'pending' && 
      req.urgency === 'high' && 
      new Date(req.created_at) <= oneDayAgo
    );
    
    // Determine system health
    let systemHealth: 'good' | 'warning' | 'critical' = 'good';
    if (urgentRequests.length > 0 || expiringSoon.length > 10) {
      systemHealth = 'critical';
    } else if (lowStockBloodGroups.length > 2 || stats.expiringUnits > 5) {
      systemHealth = 'warning';
    }
    
    return {
      expiringSoon,
      lowStockBloodGroups,
      urgentRequests,
      systemHealth,
    };
  }, [currentInventory, inventoryData, currentRequests, stats.expiringUnits]);
  
  // Load dashboard data
  const loadDashboardData = useCallback(async () => {
    if (!user || role !== 'admin') return;
    
    try {
      setLoading(true);
      setError(null);
      
      console.log('[AdminDashboard] Loading dashboard data...');
      
      // Load all data in parallel
      const [inventoryItems, allRequests, allProfiles, noticesData] = await Promise.all([
        getInventoryItems(true).catch(() => []),
        getRequests().catch(() => []),
        getAllProfiles().catch(() => []),
        getActiveNotices().catch(() => [])
      ]);
      
      console.log('[AdminDashboard] Data loaded:', {
        inventory: inventoryItems.length,
        requests: allRequests.length,
        profiles: allProfiles.length,
        notices: noticesData.length,
      });
      
      // Update state
      setManualInventory(inventoryItems as InventoryItem[]);
      setManualRequests(allRequests as BloodRequest[]);
      setProfiles(allProfiles as Profile[]);
      setNotices(noticesData as (Notice & { created_by_profile: { full_name: string } })[]);
      setLastUpdated(new Date());
      setDataLoaded(true);
      
      // Auto-discard expired units
      try {
        const discarded = await discardExpiredUnits();
        if (discarded.length > 0) {
          showToast(`${discarded.length} expired units automatically discarded`, 'warning');
          // Reload inventory after discarding
          const updatedInventory = await getInventoryItems(true);
          setManualInventory(updatedInventory as InventoryItem[]);
        }
      } catch (discardError) {
        console.error('Error discarding expired units:', discardError);
      }
      
    } catch (err) {
      console.error('[AdminDashboard] Error loading dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, role, showToast]);
  
  // Initial data load
  useEffect(() => {
    if (user && role === 'admin' && !dataLoaded) {
      loadDashboardData();
    }
  }, [user, role, dataLoaded, loadDashboardData]);
  
  // Handle request approval with auto-allocation
  const handleApproveRequest = useCallback(async (id: string) => {
    try {
      const request = currentRequests.find(req => req.id === id);
      if (!request) {
        showToast('Request not found', 'error');
        return;
      }
      
      console.log('[AdminDashboard] Approving request:', request);
      
      // Check available units
      const availableUnits = await getUnitsForAllocation(request.blood_group, request.quantity_units) as InventoryItem[];
      
      if (availableUnits.length < request.quantity_units) {
        showToast(
          `Insufficient blood units available. Need ${request.quantity_units}, but only ${availableUnits.length} available.`,
          'error'
        );
        return;
      }
      
      // Auto-allocate units (FEFO - First Expired, First Out)
      const selectedUnits = availableUnits.slice(0, request.quantity_units);
      const unitIds = selectedUnits.map(unit => unit.id);
      
      console.log('[AdminDashboard] Auto-allocating units:', unitIds);
      
      // Fulfill the request
      await fulfillRequest(id, unitIds);
      
      showToast(`Request approved and ${request.quantity_units} units automatically allocated`, 'success');
      
      // Refresh data
      refetchRequests();
      refetchInventory();
      setDataLoaded(false); // Trigger data reload
      
    } catch (err) {
      console.error('Error approving request:', err);
      showToast(err instanceof Error ? err.message : 'Failed to approve request', 'error');
    }
  }, [currentRequests, showToast, refetchRequests, refetchInventory]);
  
  // Handle request rejection
  const handleRejectRequest = useCallback(async (id: string) => {
    try {
      await updateRequestStatus(id, 'rejected');
      showToast('Request rejected', 'warning');
      refetchRequests();
    } catch (err) {
      console.error('Error rejecting request:', err);
      showToast(err instanceof Error ? err.message : 'Failed to reject request', 'error');
    }
  }, [showToast, refetchRequests]);
  
  // Handle manual fulfillment (opens allocation modal)
  const handleFulfillRequest = useCallback((request: BloodRequest) => {
    setSelectedRequest(request);
    setAllocationModalOpen(true);
  }, []);
  
  // Handle successful allocation
  const handleAllocationSuccess = useCallback(() => {
    showToast('Request fulfilled successfully', 'success');
    refetchRequests();
    refetchInventory();
    setSelectedRequest(null);
    setAllocationModalOpen(false);
  }, [showToast, refetchRequests, refetchInventory]);
  
  // Refetch all data
  const refetchData = useCallback(async () => {
    setDataLoaded(false);
    await loadDashboardData();
  }, [loadDashboardData]);
  
  // Combine all data
  const data: AdminDashboardData = {
    stats,
    inventoryData,
    notices,
    pendingRequests,
    allRequests: currentRequests,
    currentInventory,
  };
  
  return {
    data,
    loading,
    error,
    selectedRequest,
    allocationModalOpen,
    handleApproveRequest,
    handleRejectRequest,
    handleFulfillRequest,
    handleAllocationSuccess,
    setSelectedRequest,
    setAllocationModalOpen,
    refetchData,
    hasRealTimeData,
    lastUpdated,
    criticalStats,
  };
};
