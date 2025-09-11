import { useState, useEffect, useCallback, useMemo } from 'react';
import { isAfter, isSameDay, parseISO } from 'date-fns';
import { getAppointments, updateAppointmentStatus } from '../lib/api/appointments';
import type { Appointment } from '../types/database';

export const useAppointments = (userId: string | undefined) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    if (!userId) {
      setAppointments([]);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await getAppointments(userId);
      setAppointments(data || []);
    } catch (err) {
      console.error('Error loading appointments:', err);
      setError('Failed to load appointments');
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const cancelAppointment = useCallback(async (appointmentId: string) => {
    try {
      await updateAppointmentStatus(appointmentId, 'cancelled');
      await loadAppointments(); // Refresh the list
      return true;
    } catch (err) {
      console.error('Error cancelling appointment:', err);
      return false;
    }
  }, [loadAppointments]);

  const upcomingAppointments = useMemo(() => {
    const today = new Date();
    return appointments
      .filter(apt => {
        const appointmentDate = parseISO(apt.appointment_date);
        return isAfter(appointmentDate, today) || isSameDay(appointmentDate, today);
      })
      .filter(apt => apt.status !== 'cancelled')
      .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime());
  }, [appointments]);

  const pastAppointments = useMemo(() => {
    const today = new Date();
    return appointments
      .filter(apt => {
        const appointmentDate = parseISO(apt.appointment_date);
        return !isAfter(appointmentDate, today) && !isSameDay(appointmentDate, today);
      })
      .sort((a, b) => new Date(b.appointment_date).getTime() - new Date(a.appointment_date).getTime());
  }, [appointments]);

  const appointmentStats = useMemo(() => {
    const completed = appointments.filter(a => a.status === 'completed').length;
    const scheduled = appointments.filter(a => a.status === 'scheduled').length;
    const cancelled = appointments.filter(a => a.status === 'cancelled').length;
    
    return {
      total: appointments.length,
      completed,
      scheduled,
      cancelled,
      livesSaved: completed * 3 // Each donation can potentially save 3 lives
    };
  }, [appointments]);

  return {
    appointments,
    upcomingAppointments,
    pastAppointments,
    appointmentStats,
    loading,
    error,
    loadAppointments,
    cancelAppointment
  };
};
