import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getDonations, getDonationStats } from '../lib/api/donations';
import { getAppointments } from '../lib/api/appointments';
import type { Donation, Appointment } from '../types/database';

interface DonationStats {
  totalDonations: number;
  totalVolume: number;
  lastDonation: string | null;
}

interface UseDonorHistoryReturn {
  donations: (Donation & { appointment?: Pick<Appointment, 'donation_center'> })[];
  appointments: Appointment[];
  stats: DonationStats;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  calculateLivesSaved: (totalVolume: number) => number;
  getUnitsFromVolume: (totalVolume: number) => number;
  getVolumeInLiters: (totalVolume: number) => string;
}

export const useDonorHistory = (): UseDonorHistoryReturn => {
  const [donations, setDonations] = useState<(Donation & { appointment?: Pick<Appointment, 'donation_center'> })[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [stats, setStats] = useState<DonationStats>({
    totalDonations: 0,
    totalVolume: 0,
    lastDonation: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Calculate lives saved based on volume (1 unit = 450ml can save up to 3 lives)
  const calculateLivesSaved = useCallback((totalVolume: number): number => {
    const units = Math.floor(totalVolume / 450);
    return units * 3;
  }, []);

  // Get number of units from volume
  const getUnitsFromVolume = useCallback((totalVolume: number): number => {
    return Math.floor(totalVolume / 450);
  }, []);

  // Convert volume to liters
  const getVolumeInLiters = useCallback((totalVolume: number): string => {
    return (totalVolume / 1000).toFixed(1);
  }, []);

  // Load all data
  const loadData = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [donationsData, appointmentsData, statsData] = await Promise.all([
        getDonations(user.id),
        getAppointments(user.id),
        getDonationStats(user.id),
      ]);

      setDonations(donationsData || []);
      setAppointments(appointmentsData || []);
      setStats(statsData || { totalDonations: 0, totalVolume: 0, lastDonation: null });
    } catch (err) {
      console.error('Error loading donor history:', err);
      setError(err instanceof Error ? err.message : 'Failed to load donor history');
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Effect to load data when user changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Memoized sorted data
  const sortedDonations = useMemo(() => {
    return [...donations].sort((a, b) => 
      new Date(b.donation_date).getTime() - new Date(a.donation_date).getTime()
    );
  }, [donations]);

  const sortedAppointments = useMemo(() => {
    return [...appointments].sort((a, b) => 
      new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime()
    );
  }, [appointments]);

  return {
    donations: sortedDonations,
    appointments: sortedAppointments,
    stats,
    loading,
    error,
    refetch: loadData,
    calculateLivesSaved,
    getUnitsFromVolume,
    getVolumeInLiters,
  };
};
