import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Search, Clock, MapPin, User, Check, X, Eye, Plus, Download } from 'lucide-react';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../../components/ui/ErrorDisplay';
import { getUpcomingAppointments, confirmAppointment, updateAppointmentStatus } from '../../lib/api/appointments';
import { createInventoryItem } from '../../lib/api/inventory';
import type { BloodGroup, InventoryStatus, AppointmentStatus } from '../../types/database';

interface Donor {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  blood_group: string;
  date_of_birth?: string;
}

interface ExtendedAppointment {
  id: string;
  donor: Donor;
  donation_center: string;
  appointment_time: string;
  status: AppointmentStatus | 'no_show';
  notes?: string;
}

interface FilterState {
  status: string;
  center: string;
  date: string;
  search: string;
}

interface Stats {
  total: number;
  scheduled: number;
  confirmed: number;
  completed: number;
  cancelled: number;
  no_show: number;
}

export function ScheduleConfirmation() {
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAppointment, setSelectedAppointment] = useState<ExtendedAppointment | null>(null);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [completing, setCompleting] = useState(false);
  
  const [filters, setFilters] = useState<FilterState>({
    status: 'all',
    center: 'all',
    date: 'all',
    search: ''
  });
  
  const [donationData, setDonationData] = useState({
    volume_ml: 450,
    bag_id: '',
    storage_location: '',
    expires_on: '',
    notes: ''
  });

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUpcomingAppointments();
      
      // Transform the data to include extended donor information
      const extendedAppointments: ExtendedAppointment[] = data.map((apt: {
        id: string;
        donor_id: string;
        donor?: {
          full_name?: string;
          phone?: string;
          email?: string;
          blood_group?: string;
          date_of_birth?: string;
        };
        donation_center?: string;
        appointment_date: string;
        appointment_time?: string;
        status: string;
        notes?: string;
      }) => ({
        id: apt.id,
        donor: {
          id: apt.donor_id,
          full_name: apt.donor?.full_name || 'Unknown Donor',
          phone: apt.donor?.phone || '',
          email: apt.donor?.email || '',
          blood_group: apt.donor?.blood_group || 'Unknown',
          date_of_birth: apt.donor?.date_of_birth
        },
        donation_center: apt.donation_center || 'Main Center',
        appointment_time: apt.appointment_date + 'T' + (apt.appointment_time || '09:00:00'),
        status: apt.status as ExtendedAppointment['status'],
        notes: apt.notes || ''
      }));
      
      setAppointments(extendedAppointments);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      await loadAppointments();
    } finally {
      setRefreshing(false);
    }
  };

  const handleStatusUpdate = async (appointmentId: string, newStatus: AppointmentStatus) => {
    try {
      // Only update status if it's a valid AppointmentStatus
      if (['scheduled', 'confirmed', 'completed', 'cancelled'].includes(newStatus)) {
        await updateAppointmentStatus(appointmentId, newStatus);
        
        setAppointments(prev => 
          prev.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: newStatus }
              : apt
          )
        );
      }
    } catch (err) {
      console.error('Error updating appointment status:', err);
      setError('Failed to update appointment status.');
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await confirmAppointment(appointmentId);
      await handleStatusUpdate(appointmentId, 'confirmed');
    } catch (err) {
      console.error('Error confirming appointment:', err);
      setError('Failed to confirm appointment.');
    }
  };

  const handleCompleteAppointment = (appointment: ExtendedAppointment) => {
    setSelectedAppointment(appointment);
    setDonationData({
      volume_ml: 450,
      bag_id: '',
      storage_location: '',
      expires_on: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 35 days from now
      notes: ''
    });
    setCompletionModalOpen(true);
  };

  const handleSubmitCompletion = async () => {
    if (!selectedAppointment) return;
    
    try {
      setCompleting(true);
      
      // Mark as completed first
      await updateAppointmentStatus(selectedAppointment.id, 'completed');
      
      // Add to inventory
      await createInventoryItem({
        blood_group: selectedAppointment.donor.blood_group as BloodGroup,
        volume_ml: donationData.volume_ml,
        bag_id: donationData.bag_id,
        collected_on: new Date().toISOString(),
        expires_on: donationData.expires_on,
        storage_location: donationData.storage_location,
        status: 'available' as InventoryStatus,
        created_by: 'admin' // This should be the actual admin ID
      });
      
      // Update appointment status locally
      await handleStatusUpdate(selectedAppointment.id, 'completed');
      
      setCompletionModalOpen(false);
      setSelectedAppointment(null);
      
    } catch (err) {
      console.error('Error completing appointment:', err);
      setError('Failed to complete appointment and add to inventory.');
    } finally {
      setCompleting(false);
    }
  };

  const getFilteredAppointments = () => {
    return appointments.filter(appointment => {
      const matchesStatus = filters.status === 'all' || appointment.status === filters.status;
      const matchesCenter = filters.center === 'all' || appointment.donation_center === filters.center;
      const matchesSearch = !filters.search || 
        appointment.donor.full_name.toLowerCase().includes(filters.search.toLowerCase()) ||
        appointment.donor.blood_group.toLowerCase().includes(filters.search.toLowerCase()) ||
        appointment.donor.phone.includes(filters.search);
      
      let matchesDate = true;
      if (filters.date !== 'all') {
        const appointmentDate = new Date(appointment.appointment_time);
        const today = new Date();
        
        switch (filters.date) {
          case 'today':
            matchesDate = appointmentDate.toDateString() === today.toDateString();
            break;
          case 'tomorrow': {
            const tomorrow = new Date(today);
            tomorrow.setDate(today.getDate() + 1);
            matchesDate = appointmentDate.toDateString() === tomorrow.toDateString();
            break;
          }
          case 'week': {
            const weekFromNow = new Date(today);
            weekFromNow.setDate(today.getDate() + 7);
            matchesDate = appointmentDate >= today && appointmentDate <= weekFromNow;
            break;
          }
        }
      }
      
      return matchesStatus && matchesCenter && matchesSearch && matchesDate;
    });
  };

  const getStats = (): Stats => {
    const filtered = getFilteredAppointments();
    return {
      total: filtered.length,
      scheduled: filtered.filter(apt => apt.status === 'scheduled').length,
      confirmed: filtered.filter(apt => apt.status === 'confirmed').length,
      completed: filtered.filter(apt => apt.status === 'completed').length,
      cancelled: filtered.filter(apt => apt.status === 'cancelled').length,
      no_show: filtered.filter(apt => apt.status === 'no_show').length,
    };
  };

  const getStatusColor = (status: ExtendedAppointment['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-purple-100 text-purple-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'no_show': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const exportToCSV = () => {
    const filtered = getFilteredAppointments();
    const csvContent = [
      ['Date', 'Time', 'Donor Name', 'Blood Group', 'Phone', 'Email', 'Center', 'Status'].join(','),
      ...filtered.map(apt => [
        new Date(apt.appointment_time).toLocaleDateString(),
        new Date(apt.appointment_time).toLocaleTimeString(),
        apt.donor.full_name,
        apt.donor.blood_group,
        apt.donor.phone,
        apt.donor.email,
        apt.donation_center,
        apt.status
      ].join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const filteredAppointments = getFilteredAppointments();
  const stats = getStats();

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Schedule Confirmation</h1>
              <p className="text-gray-600 mt-1">Manage and confirm donation appointments</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                onClick={handleRefresh}
                loading={refreshing}
                className="text-gray-600"
              >
                <Clock className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                variant="ghost"
                onClick={exportToCSV}
                className="text-gray-600"
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
              <Button
                variant="ghost"
                onClick={() => setShowFilters(!showFilters)}
                className="text-gray-600"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorDisplay
            message={error}
            onRetry={() => setError(null)}
          />
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-sm text-gray-600">Total</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
            <div className="text-sm text-gray-600">Scheduled</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-green-600">{stats.confirmed}</div>
            <div className="text-sm text-gray-600">Confirmed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-purple-600">{stats.completed}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <div className="text-2xl font-bold text-gray-600">{stats.no_show}</div>
            <div className="text-sm text-gray-600">No Show</div>
          </div>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search by name, blood group, phone..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-10"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.status}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">All Statuses</option>
                  <option value="scheduled">Scheduled</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="no_show">No Show</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.date}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, date: e.target.value }))}
                >
                  <option value="all">All Dates</option>
                  <option value="today">Today</option>
                  <option value="tomorrow">Tomorrow</option>
                  <option value="week">This Week</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Center</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={filters.center}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFilters(prev => ({ ...prev, center: e.target.value }))}
                >
                  <option value="all">All Centers</option>
                  <option value="Main Center">Main Center</option>
                  <option value="Downtown Branch">Downtown Branch</option>
                  <option value="North Campus">North Campus</option>
                </select>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <Button
                variant="ghost"
                onClick={() => setFilters({ status: 'all', center: 'all', date: 'all', search: '' })}
              >
                Clear Filters
              </Button>
            </div>
          </div>
        )}

        {/* Appointments Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Appointments ({filteredAppointments.length})
            </h3>
          </div>
          
          {filteredAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600">Try adjusting your filters or check back later.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Donor Information
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Appointment Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredAppointments.map((appointment) => (
                    <tr key={appointment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-blue-600" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {appointment.donor.full_name}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center gap-2">
                              <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                appointment.donor.blood_group.includes('A') ? 'bg-red-100 text-red-800' :
                                appointment.donor.blood_group.includes('B') ? 'bg-blue-100 text-blue-800' :
                                appointment.donor.blood_group.includes('AB') ? 'bg-purple-100 text-purple-800' :
                                'bg-green-100 text-green-800'
                              }`}>
                                {appointment.donor.blood_group}
                              </span>
                              <span>{appointment.donor.phone}</span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center gap-2 mb-1">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            {new Date(appointment.appointment_time).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-2 mb-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            {new Date(appointment.appointment_time).toLocaleTimeString()}
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            {appointment.donation_center}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                          {appointment.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedAppointment(appointment);
                              setDetailModalOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          {appointment.status === 'scheduled' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleConfirmAppointment(appointment.id)}
                            >
                              <Check className="w-4 h-4 mr-1" />
                              Confirm
                            </Button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleCompleteAppointment(appointment)}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Complete
                            </Button>
                          )}
                          {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleStatusUpdate(appointment.id, 'cancelled')}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Detail Modal */}
        <Modal
          isOpen={detailModalOpen}
          onClose={() => setDetailModalOpen(false)}
          title="Appointment Details"
        >
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Donor Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Full Name</label>
                    <p className="text-gray-900">{selectedAppointment.donor.full_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Blood Group</label>
                    <p className="text-gray-900">{selectedAppointment.donor.blood_group}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Phone</label>
                    <p className="text-gray-900">{selectedAppointment.donor.phone}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <p className="text-gray-900">{selectedAppointment.donor.email}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-3">Appointment Information</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Date</label>
                    <p className="text-gray-900">{new Date(selectedAppointment.appointment_time).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Time</label>
                    <p className="text-gray-900">{new Date(selectedAppointment.appointment_time).toLocaleTimeString()}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Center</label>
                    <p className="text-gray-900">{selectedAppointment.donation_center}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Status</label>
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAppointment.status)}`}>
                      {selectedAppointment.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                
                {selectedAppointment.notes && (
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-500 mb-2">Notes</label>
                    <p className="text-gray-900 bg-white p-3 rounded border">{selectedAppointment.notes}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </Modal>

        {/* Completion Modal */}
        <Modal
          isOpen={completionModalOpen}
          onClose={() => setCompletionModalOpen(false)}
          title="Complete Donation"
        >
          {selectedAppointment && (
            <div className="space-y-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{selectedAppointment.donor.full_name}</h4>
                    <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      {selectedAppointment.donor.blood_group}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Volume (mL)"
                  type="number"
                  value={donationData.volume_ml}
                  onChange={(e) => setDonationData(prev => ({ ...prev, volume_ml: parseInt(e.target.value) || 0 }))}
                  min="300"
                  max="500"
                />
                <Input
                  label="Bag ID"
                  value={donationData.bag_id}
                  onChange={(e) => setDonationData(prev => ({ ...prev, bag_id: e.target.value }))}
                  placeholder="e.g., BG-2024-001"
                  required
                />
                <Input
                  label="Storage Location"
                  value={donationData.storage_location}
                  onChange={(e) => setDonationData(prev => ({ ...prev, storage_location: e.target.value }))}
                  placeholder="e.g., Refrigerator A-1"
                  required
                />
                <Input
                  label="Expiry Date"
                  type="date"
                  value={donationData.expires_on}
                  onChange={(e) => setDonationData(prev => ({ ...prev, expires_on: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  value={donationData.notes}
                  onChange={(e) => setDonationData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Any additional notes about the donation..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <Button variant="ghost" onClick={() => setCompletionModalOpen(false)}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleSubmitCompletion}
                  loading={completing}
                  disabled={!donationData.bag_id || !donationData.storage_location || !donationData.expires_on}
                >
                  Complete & Add to Inventory
                </Button>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}

export default ScheduleConfirmation;