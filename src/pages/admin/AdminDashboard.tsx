import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import type { BloodRequest } from '../../types/database';
import { 
  AdminDashboardSkeleton,
  AccessDenied,
  DashboardErrorState,
  CriticalAlerts,
  EnhancedStatsGrid,
  SystemHealthIndicator,
  RealTimeIndicator,
  AutoAllocationBanner
} from '../../components/admin/AdminComponents';
import { InventoryChart } from '../../components/charts/InventoryChart';
import { NoticesList } from '../../components/data-display/NoticesList';
import { EnhancedRequestsTable } from '../../components/data-display/EnhancedRequestsTable';
import { AllocationModal } from '../../components/data-display/AllocationModal';
import { RequestDetailModal } from '../../components/data-display/RequestDetailModal';
import { Button } from '../../components/ui/Button';
import { ErrorDisplay } from '../../components/ui/ErrorDisplay';
import { 
  ChartBarIcon,
  ArrowPathIcon,
  ArrowDownTrayIcon,
  BellIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

/**
 * AdminDashboard - Comprehensive administrative dashboard with real-time monitoring
 * 
 * Features:
 * - Real-time data updates
 * - System health monitoring
 * - Critical alerts system
 * - Auto-allocation functionality
 * - Comprehensive statistics
 * - Blood inventory management
 * - Request processing
 * - Performance optimizations
 */
export function AdminDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'inventory' | 'requests' | 'notices'>('overview');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [viewingRequest, setViewingRequest] = useState<BloodRequest | null>(null);
  
  const {
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
    criticalStats
  } = useAdminDashboard();

  // Check admin access
  if (!user) {
    return <AccessDenied />;
  }

  // Handle loading state
  if (loading) {
    return <AdminDashboardSkeleton />;
  }

  // Handle error state
  if (error) {
    return (
      <DashboardErrorState 
        message={error} 
        onRetry={refetchData}
      />
    );
  }

  const { stats, inventoryData, notices, pendingRequests, allRequests } = data;

  // Tab configurations
  const tabs = [
    { 
      id: 'overview' as const, 
      label: 'Overview', 
      icon: ChartBarIcon,
      badge: criticalStats.systemHealth === 'critical' ? criticalStats.urgentRequests.length : undefined
    },
    { 
      id: 'inventory' as const, 
      label: 'Inventory', 
      icon: CheckCircleIcon,
      badge: stats.expiringUnits > 0 ? stats.expiringUnits : undefined
    },
    { 
      id: 'requests' as const, 
      label: 'Requests', 
      icon: ClockIcon,
      badge: stats.pendingRequests > 0 ? stats.pendingRequests : undefined
    },
    { 
      id: 'notices' as const, 
      label: 'Notices', 
      icon: BellIcon,
      badge: notices.length > 0 ? notices.length : undefined
    }
  ];

  // Header Actions
  const handleExportData = () => {
    const exportData = {
      stats,
      timestamp: new Date().toISOString(),
      pendingRequests: pendingRequests.length,
      criticalAlerts: criticalStats
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `admin-dashboard-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Admin Dashboard
              </h1>
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                <p className="text-sm sm:text-lg text-gray-600">
                  Monitor and manage blood bank operations
                </p>
                <RealTimeIndicator 
                  hasRealTimeData={hasRealTimeData} 
                  lastUpdated={lastUpdated} 
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2 sm:space-x-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleExportData}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              >
                <ArrowDownTrayIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Export</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={refetchData}
                className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
              >
                <ArrowPathIcon className="w-4 h-4" />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Critical Alerts */}
        <CriticalAlerts 
          criticalStats={criticalStats} 
          onRefresh={refetchData} 
        />

        {/* System Health Indicator */}
        <div className="mb-6 sm:mb-8">
          <SystemHealthIndicator 
            health={criticalStats.systemHealth} 
            criticalStats={criticalStats} 
          />
        </div>

        {/* Enhanced Stats Grid */}
        <EnhancedStatsGrid stats={stats} loading={loading} />

        {/* Navigation Tabs */}
        <div className="mb-6 sm:mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto scrollbar-hide">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      group inline-flex items-center space-x-1 sm:space-x-2 py-3 sm:py-4 px-2 sm:px-4 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0
                      ${isActive
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'}`} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.label.substring(0, 3)}</span>
                    {tab.badge && (
                      <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="space-y-6 sm:space-y-8">
          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Inventory Chart */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Blood Inventory Distribution
                  </h3>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                      className="text-sm text-gray-500 hover:text-gray-700"
                    >
                      {viewMode === 'grid' ? 'List View' : 'Grid View'}
                    </button>
                  </div>
                </div>
                <div className="h-64 sm:h-80">
                  <InventoryChart 
                    data={inventoryData} 
                  />
                </div>
              </div>

              {/* System Notices */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                  System Notices
                </h3>
                <NoticesList 
                  notices={notices}
                />
              </div>
            </div>
          )}

          {/* Inventory Tab */}
          {activeTab === 'inventory' && (
            <div className="space-y-4 sm:space-y-6">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
                <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-4 sm:mb-6">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Current Inventory
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs sm:text-sm text-gray-500">
                      Total Units: {stats.availableUnits.toLocaleString()}
                    </span>
                  </div>
                </div>
                
                {/* Inventory Chart */}
                <div className="h-64 sm:h-80 lg:h-96 mb-6 sm:mb-8">
                  <InventoryChart 
                    data={inventoryData} 
                  />
                </div>

                {/* Expiring Units Alert */}
                {stats.expiringUnits > 0 && (
                  <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <ExclamationTriangleIcon className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-yellow-800 font-medium">
                        {stats.expiringUnits} units expiring within 7 days
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Requests Tab */}
          {activeTab === 'requests' && (
            <div className="space-y-4 sm:space-y-6">
              {/* Auto-Allocation Banner */}
              <AutoAllocationBanner />

              {/* Requests Table */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                  <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                      Blood Requests Management
                    </h3>
                    <div className="flex items-center space-x-4">
                      <span className="text-xs sm:text-sm text-gray-500">
                        {pendingRequests.length} pending requests
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="p-3 sm:p-6">
                  <div className="overflow-x-auto">
                    <EnhancedRequestsTable
                      requests={allRequests}
                      onApprove={handleApproveRequest}
                      onReject={handleRejectRequest}
                      onFulfill={handleFulfillRequest}
                      onView={setViewingRequest}
                      isAdmin={true}
                      loading={loading}
                      onRefresh={refetchData}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Notices Tab */}
          {activeTab === 'notices' && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">
                All System Notices
              </h3>
              <NoticesList 
                notices={notices}
              />
            </div>
          )}
        </div>

        {/* Allocation Modal */}
        {allocationModalOpen && selectedRequest && (
          <AllocationModal
            request={selectedRequest}
            isOpen={allocationModalOpen}
            onClose={() => {
              setAllocationModalOpen(false);
              setSelectedRequest(null);
            }}
            onSuccess={handleAllocationSuccess}
          />
        )}

        {/* Request Detail Modal */}
        {viewingRequest && (
          <RequestDetailModal
            isOpen={!!viewingRequest}
            onClose={() => setViewingRequest(null)}
            request={viewingRequest}
            onApprove={handleApproveRequest}
            onReject={handleRejectRequest}
            onFulfill={handleFulfillRequest}
            isAdmin={true}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="fixed bottom-4 right-4 max-w-xs sm:max-w-md z-50">
            <ErrorDisplay 
              message={error}
            />
          </div>
        )}
      </div>
    </div>
  );
}
