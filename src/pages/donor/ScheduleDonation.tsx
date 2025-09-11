import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  CalendarIcon, 
  ClockIcon, 
  MapPinIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useAppointments } from '../../hooks/useAppointments';
import { createAppointment } from '../../lib/api/appointments';
import { checkDonorEligibility } from '../../lib/auth';
import { AppointmentSchema } from '../../lib/validation';
import { format, addDays } from 'date-fns';
import type { Appointment } from '../../types/database';

// Enhanced donation centers with more details
const DONATION_CENTERS = [
  { 
    value: 'Central Blood Bank', 
    label: 'Central Blood Bank',
    address: '123 Medical St, Downtown',
    hours: '9:00 AM - 5:00 PM'
  },
  { 
    value: 'City Hospital Blood Center', 
    label: 'City Hospital Blood Center',
    address: '456 Hospital Ave, Midtown',
    hours: '8:00 AM - 6:00 PM'
  },
  { 
    value: 'Community Health Center', 
    label: 'Community Health Center',
    address: '789 Community Blvd, Suburb',
    hours: '10:00 AM - 4:00 PM'
  },
  { 
    value: 'Medical College Blood Bank', 
    label: 'Medical College Blood Bank',
    address: '321 College Rd, University District',
    hours: '9:00 AM - 3:00 PM'
  },
];

// Enhanced time slots with availability simulation
const TIME_SLOTS = [
  { value: '09:00', label: '9:00 AM', available: true },
  { value: '10:00', label: '10:00 AM', available: true },
  { value: '11:00', label: '11:00 AM', available: false },
  { value: '14:00', label: '2:00 PM', available: true },
  { value: '15:00', label: '3:00 PM', available: true },
  { value: '16:00', label: '4:00 PM', available: false },
];

export const ScheduleDonation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  
  const {
    appointments,
    upcomingAppointments,
    appointmentStats,
    loading: appointmentsLoading,
    error: appointmentsError,
    loadAppointments,
    cancelAppointment
  } = useAppointments(user?.id);

  const { register, handleSubmit, formState: { errors }, reset, watch } = useForm({
    resolver: zodResolver(AppointmentSchema),
    defaultValues: {
      appointment_date: '',
      appointment_time: '',
      donation_center: '',
      notes: ''
    }
  });

  const watchedCenter = watch('donation_center');

  const handleScheduleAppointment = async (data: {
    appointment_date: string;
    appointment_time: string;
    donation_center: string;
    notes?: string;
  }) => {
    if (!user?.id) return;

    setLoading(true);
    try {
      await createAppointment({
        donor_id: user.id,
        appointment_date: data.appointment_date,
        appointment_time: data.appointment_time,
        donation_center: data.donation_center,
        notes: data.notes || null,
        status: 'scheduled',
      });

      showToast('Appointment scheduled successfully!', 'success');
      reset();
      loadAppointments();
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      showToast('Failed to schedule appointment', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    const success = await cancelAppointment(appointmentId);
    if (success) {
      showToast('Appointment cancelled successfully', 'success');
    } else {
      showToast('Failed to cancel appointment', 'error');
    }
  };

  const isEligible = checkDonorEligibility(user?.profile?.last_donation_date || null);
  const nextEligibleDate = user?.profile?.last_donation_date 
    ? addDays(new Date(user.profile.last_donation_date), 90)
    : null;

  const donationCenters = DONATION_CENTERS.map(center => ({
    value: center.value,
    label: center.label
  }));

  const availableTimeSlots = TIME_SLOTS.filter(slot => slot.available).map(slot => ({
    value: slot.value,
    label: slot.label
  }));

  const getStatusBadge = (status: Appointment['status']) => {
    const statusConfig = {
      scheduled: { 
        bg: 'bg-yellow-100', 
        text: 'text-yellow-800', 
        icon: ClockIcon,
        label: 'Scheduled'
      },
      confirmed: { 
        bg: 'bg-blue-100', 
        text: 'text-blue-800', 
        icon: CheckCircleIcon,
        label: 'Confirmed'
      },
      completed: { 
        bg: 'bg-green-100', 
        text: 'text-green-800', 
        icon: CheckCircleIcon,
        label: 'Completed'
      },
      cancelled: { 
        bg: 'bg-red-100', 
        text: 'text-red-800', 
        icon: XMarkIcon,
        label: 'Cancelled'
      },
    };

    const config = statusConfig[status];
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full ${config.bg} ${config.text}`}>
        <IconComponent className="w-3 h-3" />
        {config.label}
      </span>
    );
  };

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

  // Loading state
  if (appointmentsLoading && !appointments.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading your appointments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Schedule Donation</h1>
          <p className="text-gray-600 mt-2">
            Book your next blood donation appointment.
          </p>
        </div>

        {/* Eligibility Status */}
        <div className={`mb-8 p-6 rounded-lg border ${
          isEligible 
            ? 'bg-green-50 border-green-200' 
            : 'bg-yellow-50 border-yellow-200'
        }`}>
          <div className="flex items-center space-x-3">
            <CalendarIcon className={`w-6 h-6 ${
              isEligible ? 'text-green-600' : 'text-yellow-600'
            }`} />
            <div>
              <h3 className={`font-semibold ${
                isEligible ? 'text-green-900' : 'text-yellow-900'
              }`}>
                {isEligible ? 'Eligible to Donate' : 'Not Currently Eligible'}
              </h3>
              <p className={`text-sm ${
                isEligible ? 'text-green-700' : 'text-yellow-700'
              }`}>
                {isEligible 
                  ? 'You can schedule a donation appointment.'
                  : `Next eligible date: ${nextEligibleDate ? format(nextEligibleDate, 'MMMM dd, yyyy') : 'Update your last donation date'}`
                }
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Eligibility Status Card */}
          <div className="lg:col-span-3">
            <div className={`p-6 rounded-xl border-2 transition-all duration-200 ${
              isEligible 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 shadow-green-100' 
                : 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200 shadow-yellow-100'
            } shadow-lg`}>
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full ${
                  isEligible ? 'bg-green-100' : 'bg-yellow-100'
                }`}>
                  {isEligible ? (
                    <CheckCircleIcon className="w-8 h-8 text-green-600" />
                  ) : (
                    <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className={`text-xl font-bold ${
                    isEligible ? 'text-green-900' : 'text-yellow-900'
                  }`}>
                    {isEligible ? '✓ Eligible to Donate' : '⚠ Not Currently Eligible'}
                  </h3>
                  <p className={`text-sm mt-1 ${
                    isEligible ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    {isEligible 
                      ? 'You can schedule a donation appointment. Thank you for your generosity!'
                      : `You'll be eligible to donate again on ${nextEligibleDate ? format(nextEligibleDate, 'MMMM dd, yyyy') : 'Update your last donation date'}`
                    }
                  </p>
                  {!isEligible && (
                    <p className="text-xs mt-1 text-yellow-600">
                      Regular donors must wait 90 days between donations for safety.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 text-white">
                <h2 className="text-2xl font-bold">Schedule New Appointment</h2>
                <p className="text-red-100 mt-1">Choose your preferred date, time, and location</p>
              </div>
              
              <div className="p-6">
                {appointmentsError && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-800 text-sm">{appointmentsError}</p>
                  </div>
                )}
                
                <form onSubmit={handleSubmit(handleScheduleAppointment)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      label="Appointment Date *"
                      type="date"
                      min={minDateString}
                      {...register('appointment_date')}
                      error={errors.appointment_date?.message}
                      disabled={!isEligible}
                      className="transition-all duration-200 focus:scale-105"
                    />
                    
                    <Select
                      label="Appointment Time *"
                      options={availableTimeSlots}
                      {...register('appointment_time')}
                      error={errors.appointment_time?.message}
                      disabled={!isEligible}
                      className="transition-all duration-200 focus:scale-105"
                    />
                  </div>
                  
                  <Select
                    label="Donation Center *"
                    options={donationCenters}
                    {...register('donation_center')}
                    error={errors.donation_center?.message}
                    disabled={!isEligible}
                    className="transition-all duration-200 focus:scale-105"
                  />
                  
                  {/* Show center details when selected */}
                  {watchedCenter && (
                    <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                      {(() => {
                        const center = DONATION_CENTERS.find(c => c.value === watchedCenter);
                        return center ? (
                          <div>
                            <h4 className="font-medium text-blue-900">{center.label}</h4>
                            <p className="text-sm text-blue-700 mt-1">
                              <MapPinIcon className="w-4 h-4 inline mr-1" />
                              {center.address}
                            </p>
                            <p className="text-sm text-blue-700">
                              <ClockIcon className="w-4 h-4 inline mr-1" />
                              Hours: {center.hours}
                            </p>
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all duration-200 resize-none"
                      placeholder="Any special requirements, medical conditions to note, or preferred staff member..."
                      disabled={!isEligible}
                    />
                  </div>

                  <Button 
                    type="submit" 
                    loading={loading} 
                    disabled={!isEligible}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transform transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {loading ? 'Scheduling...' : 'Schedule Appointment'}
                  </Button>
                  
                  {!isEligible && (
                    <p className="text-sm text-gray-500 text-center">
                      Complete your profile and wait for eligibility to schedule appointments
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>

          {/* Appointments List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">Your Appointments</h2>
                <p className="text-gray-600 text-sm mt-1">Manage your scheduled donations</p>
              </div>
              
              <div className="p-6">
                {appointmentsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <LoadingSpinner size="md" />
                    <span className="ml-2 text-gray-600">Loading...</span>
                  </div>
                ) : upcomingAppointments.length > 0 ? (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {upcomingAppointments.map((appointment) => (
                      <div key={appointment.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            <CalendarIcon className="w-5 h-5 text-gray-500" />
                            <span className="font-semibold text-gray-900">
                              {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                            </span>
                          </div>
                          {getStatusBadge(appointment.status)}
                        </div>
                        
                        <div className="space-y-2 text-sm text-gray-600">
                          <div className="flex items-center space-x-2">
                            <ClockIcon className="w-4 h-4" />
                            <span>{appointment.appointment_time}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <MapPinIcon className="w-4 h-4" />
                            <span className="truncate">{appointment.donation_center}</span>
                          </div>
                        </div>
                        
                        {appointment.notes && (
                          <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                            <strong>Notes:</strong> {appointment.notes}
                          </div>
                        )}
                        
                        {appointment.status === 'scheduled' && (
                          <div className="mt-3 flex space-x-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCancelAppointment(appointment.id)}
                              className="text-red-600 hover:bg-red-50 text-xs border border-red-200"
                            >
                              <XMarkIcon className="w-3 h-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <CalendarIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No Appointments Yet</h3>
                    <p className="text-gray-500 mb-4">Schedule your first donation appointment to get started.</p>
                    {isEligible && (
                      <p className="text-sm text-green-600 font-medium">
                        You're eligible to donate! Use the form to schedule.
                      </p>
                    )}
                  </div>
                )}
                
                {appointments.length > upcomingAppointments.length && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                      {appointments.length - upcomingAppointments.length} past appointment(s) not shown
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            {/* Quick Stats Card */}
            <div className="mt-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-xl p-6 border border-red-100">
              <h3 className="text-lg font-semibold text-red-900 mb-3">Donation Impact</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-red-700">Total Appointments:</span>
                  <span className="font-semibold text-red-900">{appointmentStats.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Completed Donations:</span>
                  <span className="font-semibold text-red-900">{appointmentStats.completed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Scheduled Appointments:</span>
                  <span className="font-semibold text-red-900">{appointmentStats.scheduled}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-red-700">Lives Potentially Saved:</span>
                  <span className="font-semibold text-red-900">{appointmentStats.livesSaved}</span>
                </div>
              </div>
              <div className="mt-3 text-xs text-red-600">
                💝 Each donation can help save up to 3 lives!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};