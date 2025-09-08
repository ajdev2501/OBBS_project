import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  HeartIcon, 
  CalendarIcon, 
  BeakerIcon, 
  MapPinIcon,
  TrophyIcon 
} from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import { getDonations, getDonationStats } from '../../lib/api/donations';
import { getAppointments } from '../../lib/api/appointments';
import type { Donation, Appointment } from '../../types/database';

export const DonorHistory: React.FC = () => {
  const [donations, setDonations] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalDonations: 0,
    totalVolume: 0,
    lastDonation: null as string | null,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user?.id) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    if (!user?.id) return;

    try {
      const [donationsData, appointmentsData, statsData] = await Promise.all([
        getDonations(user.id),
        getAppointments(user.id),
        getDonationStats(user.id),
      ]);

      setDonations(donationsData || []);
      setAppointments(appointmentsData || []);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading donor history:', error);
    } finally {
      setLoading(false);
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

  const calculateLivesSaved = (totalVolume: number) => {
    // Assuming 1 unit (450ml) can save up to 3 lives
    const units = Math.floor(totalVolume / 450);
    return units * 3;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your donation history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Donation History</h1>
          <p className="text-gray-600 mt-2">
            Track your donation journey and impact.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-red-50 text-red-600">
                <HeartIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Donations</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalDonations}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-blue-50 text-blue-600">
                <BeakerIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Volume</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.totalVolume}ml</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-green-50 text-green-600">
                <TrophyIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Lives Saved</p>
                <p className="text-2xl font-semibold text-gray-900">{calculateLivesSaved(stats.totalVolume)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="p-3 rounded-lg bg-yellow-50 text-yellow-600">
                <CalendarIcon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Last Donation</p>
                <p className="text-lg font-semibold text-gray-900">
                  {stats.lastDonation 
                    ? format(new Date(stats.lastDonation), 'MMM dd, yyyy')
                    : 'Never'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Donation History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Donation History</h3>
            </div>
            <div className="p-6">
              {donations.length > 0 ? (
                <div className="space-y-4">
                  {donations.map((donation) => (
                    <div key={donation.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <HeartIcon className="w-5 h-5 text-red-600" />
                          <span className="font-medium text-gray-900">
                            {format(new Date(donation.donation_date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        <span className="text-sm font-medium text-red-600">
                          {donation.volume_ml}ml
                        </span>
                      </div>
                      {donation.appointment && (
                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{donation.appointment.donation_center}</span>
                        </div>
                      )}
                      {donation.bag_id && (
                        <p className="text-xs text-gray-500 mt-1">
                          Bag ID: {donation.bag_id}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <HeartIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No donations recorded yet.</p>
                  <p className="text-sm">Your first donation will appear here.</p>
                </div>
              )}
            </div>
          </div>

          {/* Appointment History */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Appointment History</h3>
            </div>
            <div className="p-6">
              {appointments.length > 0 ? (
                <div className="space-y-4">
                  {appointments.map((appointment) => (
                    <div key={appointment.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <CalendarIcon className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-900">
                            {format(new Date(appointment.appointment_date), 'MMM dd, yyyy')}
                          </span>
                        </div>
                        {getStatusBadge(appointment.status)}
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span>{appointment.appointment_time}</span>
                        <div className="flex items-center space-x-1">
                          <MapPinIcon className="w-4 h-4" />
                          <span>{appointment.donation_center}</span>
                        </div>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-gray-600 mt-2">{appointment.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CalendarIcon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p>No appointments found.</p>
                  <p className="text-sm">Schedule your first appointment to get started.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Achievement Section */}
        {stats.totalDonations > 0 && (
          <div className="mt-8 bg-gradient-to-r from-red-50 to-pink-50 rounded-lg border border-red-200 p-6">
            <div className="text-center">
              <TrophyIcon className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Thank You, Hero!</h3>
              <p className="text-gray-700 mb-4">
                Your {stats.totalDonations} donation{stats.totalDonations > 1 ? 's' : ''} have potentially saved up to{' '}
                <span className="font-bold text-red-600">{calculateLivesSaved(stats.totalVolume)} lives</span>.
              </p>
              <div className="flex justify-center space-x-8 text-sm text-gray-600">
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{Math.floor(stats.totalVolume / 450)}</div>
                  <div>Units Donated</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{(stats.totalVolume / 1000).toFixed(1)}L</div>
                  <div>Total Volume</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-gray-900">{calculateLivesSaved(stats.totalVolume)}</div>
                  <div>Lives Impacted</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};