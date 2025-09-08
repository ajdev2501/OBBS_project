import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { CheckIcon, XMarkIcon, CalendarIcon, UserIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Input } from '../../components/ui/Input';
import { useToast } from '../../components/ui/Toast';
import { getUpcomingAppointments, confirmAppointment, updateAppointmentStatus } from '../../lib/api/appointments';
import { completeDonation } from '../../lib/api/donations';
import { createInventoryItem } from '../../lib/api/inventory';
import { useAuth } from '../../contexts/AuthContext';
import type { Appointment } from '../../types/database';

export const ScheduleConfirmation: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [completionModalOpen, setCompletionModalOpen] = useState(false);
  const [donationData, setDonationData] = useState({
    volume_ml: 450,
    bag_id: '',
    storage_location: '',
    expires_on: '',
  });
  const [completing, setCompleting] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      const data = await getUpcomingAppointments();
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
      showToast('Failed to load appointments', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      await confirmAppointment(appointmentId);
      showToast('Appointment confirmed successfully', 'success');
      loadAppointments();
    } catch (error) {
      console.error('Error confirming appointment:', error);
      showToast('Failed to confirm appointment', 'error');
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'cancelled');
      showToast('Appointment cancelled', 'warning');
      loadAppointments();
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      showToast('Failed to cancel appointment', 'error');
    }
  };

  const handleCompleteDonation = (appointment: any) => {
    setSelectedAppointment(appointment);
    const today = new Date();
    const expiryDate = new Date();
    expiryDate.setDate(today.getDate() + 35); // 35 days shelf life
    
    setDonationData({
      volume_ml: 450,
      bag_id: `BAG-${Date.now()}`,
      storage_location: 'A-1',
      expires_on: expiryDate.toISOString().split('T')[0],
    });
    setCompletionModalOpen(true);
  };

  const handleSubmitCompletion = async () => {
    if (!selectedAppointment || !user?.id) return;

    setCompleting(true);
    try {
      // Complete the donation
      const donation = await completeDonation(selectedAppointment.id, {
        volume_ml: donationData.volume_ml,
        bag_id: donationData.bag_id,
      });

      // Add to inventory
      await createInventoryItem({
        blood_group: selectedAppointment.donor.blood_group,
        bag_id: donationData.bag_id,
        volume_ml: donationData.volume_ml,
        storage_location: donationData.storage_location,
        collected_on: donation.donation_date,
        expires_on: donationData.expires_on,
        status: 'available',
        created_by: user.id,
      });

      showToast('Donation completed and added to inventory', 'success');
      setCompletionModalOpen(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error) {
      console.error('Error completing donation:', error);
      showToast('Failed to complete donation', 'error');
    } finally {
      setCompleting(false);
    }
  };

  const getStatusBadge = (status: Appointment['status']) => {
    const classes = {
      scheduled: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`px-2 py-1 text-xs rounded-full ${classes[status]}`}>
        {status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Confirmation</h1>
          <p className="text-gray-600 mt-2">
            Confirm appointments and complete donations.
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Upcoming Appointments</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Center
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
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <UserIcon className="w-5 h-5 text-gray-400 mr-3" />
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {appointment.donor.full_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.donor.phone}
                          </div>
                          <span className="inline-flex px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                            {appointment.donor.blood_group}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <CalendarIcon className="w-5 h-5 text-gray-400 mr-2" />
                        <div>
                          <div className="text-sm text-gray-900">
                            {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-gray-500">
                            {appointment.appointment_time}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {appointment.donation_center}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(appointment.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        {appointment.status === 'scheduled' && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              icon={CheckIcon}
                              onClick={() => handleConfirmAppointment(appointment.id)}
                            >
                              Confirm
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              icon={XMarkIcon}
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              Cancel
                            </Button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <Button
                            variant="primary"
                            size="sm"
                            onClick={() => handleCompleteDonation(appointment)}
                          >
                            Complete Donation
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {appointments.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>No upcoming appointments found.</p>
            </div>
          )}
        </div>

        {/* Completion Modal */}
        <Modal
          isOpen={completionModalOpen}
          onClose={() => setCompletionModalOpen(false)}
          title="Complete Donation"
          size="lg"
        >
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2">Donor Information</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Name:</span>
                  <span className="ml-2 font-medium">{selectedAppointment?.donor.full_name}</span>
                </div>
                <div>
                  <span className="text-gray-500">Blood Group:</span>
                  <span className="ml-2 px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                    {selectedAppointment?.donor.blood_group}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Volume (ml)"
                type="number"
                value={donationData.volume_ml}
                onChange={(e) => setDonationData(prev => ({ ...prev, volume_ml: parseInt(e.target.value) }))}
                min="100"
                max="500"
              />
              
              <Input
                label="Bag ID"
                value={donationData.bag_id}
                onChange={(e) => setDonationData(prev => ({ ...prev, bag_id: e.target.value }))}
              />
              
              <Input
                label="Storage Location"
                value={donationData.storage_location}
                onChange={(e) => setDonationData(prev => ({ ...prev, storage_location: e.target.value }))}
              />
              
              <Input
                label="Expiry Date"
                type="date"
                value={donationData.expires_on}
                onChange={(e) => setDonationData(prev => ({ ...prev, expires_on: e.target.value }))}
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
              >
                Complete & Add to Inventory
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};