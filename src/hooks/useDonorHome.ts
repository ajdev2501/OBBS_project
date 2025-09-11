import { useState, useEffect, useCallback, useMemo } from 'react';
import { addDays } from 'date-fns';
import { getActiveNotices } from '../lib/api/notices';
import { getRequests } from '../lib/api/requests';
import { getAppointments } from '../lib/api/appointments';
import { checkDonorEligibility } from '../lib/auth';
import type { Notice, BloodRequest, Appointment } from '../types/database';

interface DonorHomeData {
  notices: (Notice & { created_by_profile: { full_name: string } })[];
  requests: BloodRequest[];
  appointments: Appointment[];
  isEligible: boolean;
  nextEligibleDate: Date | null;
  stats: {
    totalRequests: number;
    pendingRequests: number;
    fulfilledRequests: number;
    totalAppointments: number;
    completedDonations: number;
    upcomingAppointments: number;
  };
}

export const useDonorHome = (userId: string | undefined, lastDonationDate: string | null) => {
  const [data, setData] = useState<DonorHomeData>({
    notices: [],
    requests: [],
    appointments: [],
    isEligible: false,
    nextEligibleDate: null,
    stats: {
      totalRequests: 0,
      pendingRequests: 0,
      fulfilledRequests: 0,
      totalAppointments: 0,
      completedDonations: 0,
      upcomingAppointments: 0,
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Memoized eligibility check
  const eligibilityInfo = useMemo(() => {
    if (!lastDonationDate) {
      return { isEligible: true, nextEligibleDate: null };
    }

    const isEligible = checkDonorEligibility(lastDonationDate);
    const nextEligibleDate = isEligible 
      ? null 
      : addDays(new Date(lastDonationDate), 90);

    return { isEligible, nextEligibleDate };
  }, [lastDonationDate]);

  const loadData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const [noticesData, requestsData, appointmentsData] = await Promise.all([
        getActiveNotices(),
        getRequests(userId),
        getAppointments(userId),
      ]);

      // Calculate stats
      const totalRequests = requestsData?.length || 0;
      const pendingRequests = requestsData?.filter((r: BloodRequest) => r.status === 'pending').length || 0;
      const fulfilledRequests = requestsData?.filter((r: BloodRequest) => r.status === 'fulfilled').length || 0;
      const totalAppointments = appointmentsData?.length || 0;
      const completedDonations = appointmentsData?.filter((a: Appointment) => a.status === 'completed').length || 0;
      const upcomingAppointments = appointmentsData?.filter((a: Appointment) => 
        a.status === 'scheduled' || a.status === 'confirmed'
      ).length || 0;

      setData({
        notices: (noticesData as (Notice & { created_by_profile: { full_name: string } })[]) || [],
        requests: requestsData || [],
        appointments: appointmentsData || [],
        isEligible: eligibilityInfo.isEligible,
        nextEligibleDate: eligibilityInfo.nextEligibleDate,
        stats: {
          totalRequests,
          pendingRequests,
          fulfilledRequests,
          totalAppointments,
          completedDonations,
          upcomingAppointments,
        }
      });
    } catch (err) {
      console.error('Error loading donor home data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [userId, eligibilityInfo]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshData = useCallback(() => {
    loadData();
  }, [loadData]);

  // Memoized derived data
  const recentRequests = useMemo(() => 
    data.requests.slice(0, 3), 
    [data.requests]
  );

  const recentNotices = useMemo(() => 
    data.notices.slice(0, 5), 
    [data.notices]
  );

  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    return data.appointments
      .filter(apt => {
        const appointmentDate = new Date(apt.appointment_date);
        return appointmentDate >= today && (apt.status === 'scheduled' || apt.status === 'confirmed');
      })
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
      .slice(0, 3);
  }, [data.appointments]);

  return {
    ...data,
    recentRequests,
    recentNotices,
    upcomingAppointments,
    loading,
    error,
    refreshData,
  };
};
