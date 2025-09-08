import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CalendarIcon, ClockIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { createAppointment, getAppointments } from '../../lib/api/appointments';
import { checkDonorEligibility } from '../../lib/auth';
import { AppointmentSchema } from '../../lib/validation';
import { format, addDays } from 'date-fns';
import type { Appointment } from '../../types/database';

export const ScheduleDonation: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const { user } = useAuth();
  const { showToast } = useToast();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(AppointmentSchema),
  });

  useEffect(() => {
    if (user?.id) {
      loadAppointments();
    }
  }, [user]);

  const loadAppointments = async () => {
    if (!user?.id) return;
    
    try {
      const data = await getAppointments(user.id);
      setAppointments(data || []);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  };

  const handleScheduleAppointment = async (data: any) => {
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

  const isEligible = checkDonorEligibility(user?.profile?.last_donation_date || null);
  const nextEligibleDate = user?.profile?.last_donation_date 
    ? addDays(new Date(user.profile.last_donation_date), 90)
    : null;

  const donationCenters = [
    { value: 'Central Blood Bank', label: 'Central Blood Bank' },
    { value: 'City Hospital Blood Center', label: 'City Hospital Blood Center' },
    { value: 'Community Health Center', label: 'Community Health Center' },
    { value: 'Medical College Blood Bank', label: 'Medical College Blood Bank' },
  ];

  const timeSlots = [
    { value: '09:00', label: '9:00 AM' },
    { value: '10:00', label: '10:00 AM' },
    { value: '11:00', label: '11:00 AM' },
    { value: '14:00', label: '2:00 PM' },
    { value: '15:00', label: '3:00 PM' },
    { value: '16:00', label: '4:00 PM' },
  ];

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

  // Get minimum date (tomorrow)
  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateString = minDate.toISOString().split('T')[0];

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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Schedule Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule New Appointment</h2>
            
            <form onSubmit={handleSubmit(handleScheduleAppointment)} className="space-y-4">
              <Input
                label="Appointment Date *"
                type="date"
                min={minDateString}
                {...register('appointment_date')}
                error={errors.appointment_date?.message}
                disabled={!isEligible}
              />
              
              <Select
                label="Appointment Time *"
                options={timeSlots}
                {...register('appointment_time')}
                error={errors.appointment_time?.message}
                disabled={!isEligible}
              />
              
              <Select
                label="Donation Center *"
                options={donationCenters}
                {...register('donation_center')}
                error={errors.donation_center?.message}
                disabled={!isEligible}
              />
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Additional Notes
                </label>
                <textarea
                  {...register('notes')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Any special requirements or notes..."
                  disabled={!isEligible}
                />
              </div>

              <Button 
                type="submit" 
                loading={loading} 
                disabled={!isEligible}
                className="w-full"
              >
                Schedule Appointment
              </Button>
            </form>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Appointments</h2>
            
            {appointments.length > 0 ? (
              <div className="space-y-4">
                {appointments.slice(0, 5).map((appointment) => (
                  <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <CalendarIcon className="w-4 h-4 text-gray-500" />
                        <span className="font-medium text-gray-900">
                          {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      {getStatusBadge(appointment.status)}
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <div className="flex items-center space-x-1">
                        <ClockIcon className="w-4 h-4" />
                        <span>{appointment.appointment_time}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPinIcon className="w-4 h-4" />
                        <span>{appointment.donation_center}</span>
                      </div>
                    </div>
                    {appointment.notes && (
                      <p className="mt-2 text-sm text-gray-600">{appointment.notes}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No appointments scheduled yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};