import React, { useState, useMemo } from 'react';
import { format, formatDistanceToNow, isAfter, subHours } from 'date-fns';
import { 
  CheckIcon, 
  XMarkIcon, 
  EyeIcon, 
  MagnifyingGlassIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  PhoneIcon,
  EnvelopeIcon,
  BuildingOffice2Icon,
  MapPinIcon,
  BeakerIcon,
  UserIcon,
  CalendarIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { LoadingSpinner } from '../ui/LoadingSpinner';
import type { BloodRequest } from '../../types/database';

interface EnhancedRequestsTableProps {
  requests: BloodRequest[];
  onApprove?: (id: string) => void;
  onReject?: (id: string) => void;
  onFulfill?: (request: BloodRequest) => void;
  onView?: (request: BloodRequest) => void;
  isAdmin?: boolean;
  loading?: boolean;
  onRefresh?: () => void;
}

type SortField = 'created_at' | 'urgency' | 'blood_group' | 'quantity_units' | 'hospital';
type SortOrder = 'asc' | 'desc';

interface FilterState {
  status: string;
  urgency: string;
  bloodGroup: string;
  search: string;
  dateRange: string;
}

export const EnhancedRequestsTable: React.FC<EnhancedRequestsTableProps> = ({
  requests,
  onApprove,
  onReject,
  onFulfill,
  onView,
  isAdmin = false,
  loading = false,
  onRefresh
}) => {
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    urgency: 'all',
    bloodGroup: 'all',
    search: '',
    dateRange: 'all'
  });
  
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced filtering and sorting
  const filteredAndSortedRequests = useMemo(() => {
    let filtered = requests;

    // Apply filters
    if (filters.status !== 'all') {
      filtered = filtered.filter(req => req.status === filters.status);
    }
    
    if (filters.urgency !== 'all') {
      filtered = filtered.filter(req => req.urgency === filters.urgency);
    }
    
    if (filters.bloodGroup !== 'all') {
      filtered = filtered.filter(req => req.blood_group === filters.bloodGroup);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(req => 
        req.requester_name.toLowerCase().includes(searchLower) ||
        req.phone.includes(filters.search) ||
        req.email.toLowerCase().includes(searchLower) ||
        req.hospital.toLowerCase().includes(searchLower) ||
        req.city.toLowerCase().includes(searchLower)
      );
    }
    
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const filterDate = {
        'today': new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        'week': subHours(now, 24 * 7),
        'month': subHours(now, 24 * 30),
      }[filters.dateRange];
      
      if (filterDate) {
        filtered = filtered.filter(req => isAfter(new Date(req.created_at), filterDate));
      }
    }

    // Apply sorting
    return filtered.sort((a, b) => {
      let aValue: string | number | Date = a[sortField];
      let bValue: string | number | Date = b[sortField];
      
      if (sortField === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortField === 'urgency') {
        const urgencyOrder = { 'high': 3, 'medium': 2, 'low': 1 } as const;
        aValue = urgencyOrder[aValue as keyof typeof urgencyOrder];
        bValue = urgencyOrder[bValue as keyof typeof urgencyOrder];
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }, [requests, filters, sortField, sortOrder]);

  // Statistics
  const stats = useMemo(() => {
    const pending = requests.filter(r => r.status === 'pending');
    const urgent = requests.filter(r => r.urgency === 'high' && r.status === 'pending');
    const overdue = requests.filter(r => 
      r.status === 'pending' && 
      isAfter(new Date(), subHours(new Date(r.created_at), -24))
    );
    
    return {
      total: requests.length,
      pending: pending.length,
      urgent: urgent.length,
      overdue: overdue.length,
      approved: requests.filter(r => r.status === 'approved').length,
      fulfilled: requests.filter(r => r.status === 'fulfilled').length,
      rejected: requests.filter(r => r.status === 'rejected').length
    };
  }, [requests]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleSelectAll = () => {
    if (selectedRequests.size === filteredAndSortedRequests.length && filteredAndSortedRequests.length > 0) {
      setSelectedRequests(new Set());
    } else {
      setSelectedRequests(new Set(filteredAndSortedRequests.map(r => r.id)));
    }
  };

  const handleSelectRequest = (id: string) => {
    const newSelected = new Set(selectedRequests);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedRequests(newSelected);
  };

  // Action handlers with debugging
  const handleApproveClick = async (id: string) => {
    try {
      console.log('Approving request:', id, 'Function available:', !!onApprove);
      if (onApprove) {
        await onApprove(id);
      }
    } catch (error) {
      console.error('Error approving request:', error);
    }
  };

  const handleRejectClick = async (id: string) => {
    try {
      console.log('Rejecting request:', id, 'Function available:', !!onReject);
      if (onReject) {
        await onReject(id);
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    }
  };

  const handleFulfillClick = (request: BloodRequest) => {
    try {
      console.log('Fulfilling request:', request.id, 'Function available:', !!onFulfill);
      if (onFulfill) {
        onFulfill(request);
      }
    } catch (error) {
      console.error('Error fulfilling request:', error);
    }
  };

  const handleViewClick = (request: BloodRequest) => {
    try {
      console.log('Viewing request:', request.id, 'Function available:', !!onView);
      if (onView) {
        onView(request);
      }
    } catch (error) {
      console.error('Error viewing request:', error);
    }
  };

  const handleBulkApprove = async () => {
    if (selectedRequests.size === 0 || !onApprove) return;
    
    try {
      for (const id of selectedRequests) {
        const request = requests.find(r => r.id === id);
        if (request?.status === 'pending') {
          console.log('Bulk approving request:', id);
          await onApprove(id);
        }
      }
      setSelectedRequests(new Set());
    } catch (error) {
      console.error('Error in bulk approve:', error);
    }
  };

  const handleBulkReject = async () => {
    if (selectedRequests.size === 0 || !onReject) return;
    
    try {
      for (const id of selectedRequests) {
        const request = requests.find(r => r.id === id);
        if (request?.status === 'pending') {
          console.log('Bulk rejecting request:', id);
          await onReject(id);
        }
      }
      setSelectedRequests(new Set());
    } catch (error) {
      console.error('Error in bulk reject:', error);
    }
  };

  const getStatusBadge = (status: BloodRequest['status']) => {
    const classes = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-blue-100 text-blue-800 border-blue-200',
      fulfilled: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full border ${classes[status]}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getUrgencyBadge = (urgency: BloodRequest['urgency']) => {
    const classes = {
      low: 'bg-gray-100 text-gray-800 border-gray-200',
      medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      high: 'bg-red-100 text-red-800 border-red-200',
    };

    const icons = {
      low: null,
      medium: <ClockIcon className="w-3 h-3 mr-1" />,
      high: <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
    };

    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs rounded-full border ${classes[urgency]}`}>
        {icons[urgency]}
        {urgency.charAt(0).toUpperCase() + urgency.slice(1)}
      </span>
    );
  };

  const getTimeAgo = (date: string) => {
    const requestDate = new Date(date);
    const isOverdue = isAfter(new Date(), subHours(requestDate, -24));
    
    return (
      <div className={`text-sm ${isOverdue ? 'text-red-600' : 'text-gray-500'}`}>
        <div className="flex items-center">
          {isOverdue && <ExclamationTriangleIcon className="w-4 h-4 mr-1" />}
          {formatDistanceToNow(requestDate)} ago
        </div>
        <div className="text-xs text-gray-400">
          {format(requestDate, 'MMM dd, yyyy HH:mm')}
        </div>
      </div>
    );
  };

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header with Statistics */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Blood Requests Management
            </h3>
            
            {/* Statistics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                <div className="text-xs text-gray-500">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <div className="text-xs text-gray-500">Pending</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.urgent}</div>
                <div className="text-xs text-gray-500">Urgent</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.overdue}</div>
                <div className="text-xs text-gray-500">Overdue</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.approved}</div>
                <div className="text-xs text-gray-500">Approved</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.fulfilled}</div>
                <div className="text-xs text-gray-500">Fulfilled</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-xs text-gray-500">Rejected</div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center space-x-2"
            >
              <FunnelIcon className="w-4 h-4" />
              <span>Filters</span>
            </Button>
            
            {onRefresh && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
                className="flex items-center space-x-2"
                disabled={loading}
              >
                {loading ? (
                  <LoadingSpinner size="sm" />
                ) : (
                  <ArrowPathIcon className="w-4 h-4" />
                )}
                <span>Refresh</span>
              </Button>
            )}
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Search */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                <div className="relative">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Name, phone, email..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="fulfilled">Fulfilled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              {/* Urgency Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                <select
                  value={filters.urgency}
                  onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Urgency</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>

              {/* Blood Group Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  value={filters.bloodGroup}
                  onChange={(e) => setFilters(prev => ({ ...prev, bloodGroup: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="all">All Groups</option>
                  {bloodGroups.map(group => (
                    <option key={group} value={group}>{group}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFilters({
                  status: 'all',
                  urgency: 'all',
                  bloodGroup: 'all',
                  search: '',
                  dateRange: 'all'
                })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Bulk Actions */}
        {isAdmin && selectedRequests.size > 0 && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg flex items-center justify-between">
            <span className="text-sm text-blue-800">
              {selectedRequests.size} requests selected
            </span>
            <div className="flex space-x-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleBulkApprove}
                className="flex items-center space-x-1"
              >
                <CheckIcon className="w-4 h-4" />
                <span>Approve Selected</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={handleBulkReject}
                className="flex items-center space-x-1"
              >
                <XMarkIcon className="w-4 h-4" />
                <span>Reject Selected</span>
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            Showing {filteredAndSortedRequests.length} of {requests.length} requests
          </span>
          <span>
            Sorted by {sortField.replace('_', ' ')} ({sortOrder})
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              {isAdmin && (
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={selectedRequests.size === filteredAndSortedRequests.length && filteredAndSortedRequests.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                </th>
              )}
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('created_at')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <CalendarIcon className="w-4 h-4" />
                  <span>Request Time</span>
                  <ArrowsUpDownIcon className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <div className="flex items-center space-x-1">
                  <UserIcon className="w-4 h-4" />
                  <span>Requester</span>
                </div>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('blood_group')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <BeakerIcon className="w-4 h-4" />
                  <span>Blood & Quantity</span>
                  <ArrowsUpDownIcon className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('hospital')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <BuildingOffice2Icon className="w-4 h-4" />
                  <span>Hospital & Location</span>
                  <ArrowsUpDownIcon className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                <button
                  onClick={() => handleSort('urgency')}
                  className="flex items-center space-x-1 hover:text-gray-700"
                >
                  <ExclamationTriangleIcon className="w-4 h-4" />
                  <span>Urgency</span>
                  <ArrowsUpDownIcon className="w-3 h-3" />
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              {isAdmin && (
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAndSortedRequests.map((request) => (
              <tr key={request.id} className="hover:bg-gray-50">
                {isAdmin && (
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selectedRequests.has(request.id)}
                      onChange={() => handleSelectRequest(request.id)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                  </td>
                )}
                <td className="px-4 py-3 text-sm">
                  {getTimeAgo(request.created_at)}
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900">{request.requester_name}</div>
                    <div className="flex items-center text-gray-500 text-xs">
                      <PhoneIcon className="w-3 h-3 mr-1" />
                      {request.phone}
                    </div>
                    <div className="flex items-center text-gray-500 text-xs">
                      <EnvelopeIcon className="w-3 h-3 mr-1" />
                      {request.email}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="space-y-2">
                    <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full border border-red-200">
                      <BeakerIcon className="w-3 h-3 mr-1" />
                      {request.blood_group}
                    </span>
                    <div className="text-gray-900 font-medium">
                      {request.quantity_units} units
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  <div className="space-y-1">
                    <div className="flex items-center text-gray-900">
                      <BuildingOffice2Icon className="w-3 h-3 mr-1" />
                      {request.hospital}
                    </div>
                    <div className="flex items-center text-gray-500 text-xs">
                      <MapPinIcon className="w-3 h-3 mr-1" />
                      {request.city}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {getUrgencyBadge(request.urgency)}
                </td>
                <td className="px-4 py-3 text-sm">
                  {getStatusBadge(request.status)}
                </td>
                {isAdmin && (
                  <td className="px-4 py-3 text-sm">
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewClick(request)}
                        className="p-1 hover:bg-gray-100"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </Button>
                      {request.status === 'pending' && (
                        <>
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleApproveClick(request.id)}
                            className="p-1 hover:bg-blue-100"
                            title="Approve Request"
                          >
                            <CheckIcon className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleRejectClick(request.id)}
                            className="p-1 hover:bg-red-100"
                            title="Reject Request"
                          >
                            <XMarkIcon className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                      {request.status === 'approved' && (
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => handleFulfillClick(request)}
                          className="text-xs px-2 py-1 hover:bg-red-700"
                          title="Fulfill Request"
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

      {/* Empty State */}
      {filteredAndSortedRequests.length === 0 && !loading && (
        <div className="p-12 text-center">
          <BeakerIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No requests found</h3>
          <p className="text-gray-500">
            {filters.search || filters.status !== 'all' || filters.urgency !== 'all' || filters.bloodGroup !== 'all'
              ? 'Try adjusting your filters to see more results.'
              : 'No blood requests have been submitted yet.'
            }
          </p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-500">Loading requests...</p>
        </div>
      )}
    </div>
  );
};