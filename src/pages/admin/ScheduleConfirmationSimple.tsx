import { useState, useEffect } from 'react';
import { Calendar, User } from 'lucide-react';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorDisplay } from '../../components/ui/ErrorDisplay';
import { getUpcomingAppointments } from '../../lib/api/appointments';
import type { AppointmentStatus } from '../../types/database';

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

export function ScheduleConfirmation() {
  const [appointments, setAppointments] = useState<ExtendedAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAppointments();
  }, []);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getUpcomingAppointments();
      
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
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <ErrorDisplay
            message={error}
            onRetry={() => setError(null)}
          />
        )}

        {/* Appointments List */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Appointments ({appointments.length})
            </h3>
          </div>
          
          {appointments.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No appointments found</h3>
              <p className="text-gray-600">Check back later for new appointments.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {appointments.map((appointment) => (
                <div key={appointment.id} className="p-6 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {appointment.donor.full_name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {appointment.donor.blood_group} • {appointment.donor.phone}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(appointment.appointment_time).toLocaleDateString()} at{' '}
                          {new Date(appointment.appointment_time).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                        appointment.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        appointment.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                        appointment.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ScheduleConfirmation;
